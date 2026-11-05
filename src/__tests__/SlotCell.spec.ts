import { fireEvent, render, screen } from '@testing-library/vue'
import { DnDProvider } from '@vue-dnd-kit/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import SlotCell from '../components/worksheet/SlotCell.vue'
import { createWikiI18n } from '../i18n'
import type { Point } from '../lib/geometry'
import type { Photo, PositionAndZoom } from '../lib/worksheet'

const photo: Photo = {
	id: 1,
	name: 'beach.jpg',
	url: 'blob:beach.jpg',
	width: 4000,
	height: 3000,
}

const realResizeObserver = window.ResizeObserver

// happy-dom has no layout, so a test says what the browser's ResizeObserver would report.
function slotSizedInPixels(size: number) {
	class SizedResizeObserver {
		constructor(private callback: ResizeObserverCallback) {}
		observe() {
			setTimeout(() => {
				const box = [{ inlineSize: size, blockSize: size }]
				this.callback(
					[
						{
							contentRect: { width: size, height: size },
							borderBoxSize: box,
							contentBoxSize: box,
						} as unknown as ResizeObserverEntry,
					],
					this as unknown as ResizeObserver,
				)
			})
		}
		unobserve() {}
		disconnect() {}
	}
	vi.stubGlobal('ResizeObserver', SizedResizeObserver)
	Object.assign(window, { ResizeObserver: SizedResizeObserver })
}

function renderSlot(
	positionAndZoom: PositionAndZoom,
	handlers: {
		onZoom?: (zoom: number) => void
		onReset?: () => void
		onPosition?: (position: Point) => void
		cmPerPixel?: number
	} = {},
) {
	// The slot's photo can change after mounting, as when a photo is dragged out of it.
	const shownPhoto = ref<Photo | null>(photo)
	const Host = defineComponent(
		() => () =>
			h(DnDProvider, null, () =>
				h(SlotCell, {
					photo: shownPhoto.value,
					address: { page: 0, slot: 0 },
					positionAndZoom,
					...handlers,
				}),
			),
	)
	render(Host, { global: { plugins: [createWikiI18n()] } })
	return {
		async showPhoto(next: Photo | null) {
			shownPhoto.value = next
			await nextTick()
		},
	}
}

describe('Slot cell', () => {
	afterEach(() => {
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
		Object.assign(window, { ResizeObserver: realResizeObserver })
	})

	it('shows its photo at its position and zoom', () => {
		renderSlot({ position: { x: 0.2, y: 0.8 }, zoom: 2 })

		const image = screen.getByRole('img', { name: 'beach.jpg' })
		expect(image).toHaveStyle({
			objectPosition: '20% 80%',
			transformOrigin: '20% 80%',
			transform: 'scale(2)',
		})
	})

	it('shows the zoom controls when the slot is double-clicked', async () => {
		renderSlot({ position: { x: 0.5, y: 0.5 }, zoom: 1 })
		expect(screen.queryByRole('button', { name: 'Acercar' })).toBeNull()

		await fireEvent.dblClick(screen.getByRole('img', { name: 'beach.jpg' }))

		expect(screen.getByRole('button', { name: 'Alejar' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Acercar' })).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: 'Restablecer posición y zoom' }),
		).toBeInTheDocument()
	})

	it('hides the zoom controls when Escape is pressed', async () => {
		renderSlot({ position: { x: 0.5, y: 0.5 }, zoom: 1 })
		await fireEvent.dblClick(screen.getByRole('img', { name: 'beach.jpg' }))

		await fireEvent.keyDown(document.body, { key: 'Escape' })

		expect(screen.queryByRole('button', { name: 'Acercar' })).toBeNull()
	})

	it('hides the zoom controls when clicking outside the slot', async () => {
		renderSlot({ position: { x: 0.5, y: 0.5 }, zoom: 1 })
		await fireEvent.dblClick(screen.getByRole('img', { name: 'beach.jpg' }))
		await new Promise((resolve) => setTimeout(resolve))

		await fireEvent.pointerDown(document.body)
		await fireEvent.click(document.body)

		expect(screen.queryByRole('button', { name: 'Acercar' })).toBeNull()
	})

	it('asks for a quarter more zoom when zooming in', async () => {
		const onZoom = vi.fn()
		renderSlot({ position: { x: 0.5, y: 0.5 }, zoom: 1 }, { onZoom })
		await fireEvent.dblClick(screen.getByRole('img', { name: 'beach.jpg' }))

		await fireEvent.click(screen.getByRole('button', { name: 'Acercar' }))

		expect(onZoom).toHaveBeenCalledWith(1.25)
	})

	it('asks for a quarter less zoom when zooming out', async () => {
		const onZoom = vi.fn()
		renderSlot({ position: { x: 0.5, y: 0.5 }, zoom: 2 }, { onZoom })
		await fireEvent.dblClick(screen.getByRole('img', { name: 'beach.jpg' }))

		await fireEvent.click(screen.getByRole('button', { name: 'Alejar' }))

		expect(onZoom).toHaveBeenCalledWith(1.75)
	})

	it('asks to put the photo back in the center without zoom when reset is pressed', async () => {
		const onReset = vi.fn()
		renderSlot({ position: { x: 0.2, y: 0.8 }, zoom: 2 }, { onReset })
		await fireEvent.dblClick(screen.getByRole('img', { name: 'beach.jpg' }))

		await fireEvent.click(
			screen.getByRole('button', { name: 'Restablecer posición y zoom' }),
		)

		expect(onReset).toHaveBeenCalledOnce()
	})

	it('moves the photo to the right with the right arrow', async () => {
		const onPosition = vi.fn()
		renderSlot({ position: { x: 0.5, y: 0.5 }, zoom: 2 }, { onPosition })
		await fireEvent.dblClick(screen.getByRole('img', { name: 'beach.jpg' }))

		await fireEvent.keyDown(document.body, { key: 'ArrowRight' })

		expect(onPosition).toHaveBeenCalledWith({ x: 0.45, y: 0.5 })
	})

	it('ignores the arrows while the slot is not being edited', async () => {
		const onPosition = vi.fn()
		renderSlot({ position: { x: 0.5, y: 0.5 }, zoom: 2 }, { onPosition })

		await fireEvent.keyDown(document.body, { key: 'ArrowRight' })

		expect(onPosition).not.toHaveBeenCalled()
	})

	it.each([
		['ArrowLeft', { x: 0.55, y: 0.5 }],
		['ArrowUp', { x: 0.5, y: 0.55 }],
		['ArrowDown', { x: 0.5, y: 0.45 }],
	])('moves the photo in the direction of %s', async (key, expected) => {
		const onPosition = vi.fn()
		renderSlot({ position: { x: 0.5, y: 0.5 }, zoom: 2 }, { onPosition })
		await fireEvent.dblClick(screen.getByRole('img', { name: 'beach.jpg' }))

		await fireEvent.keyDown(document.body, { key })

		expect(onPosition).toHaveBeenCalledWith(expected)
	})

	it.each([
		['+', 1.25],
		['-', 1.75],
	])('changes the zoom a quarter with %s', async (key, expected) => {
		const onZoom = vi.fn()
		renderSlot(
			{ position: { x: 0.5, y: 0.5 }, zoom: key === '+' ? 1 : 2 },
			{ onZoom },
		)
		await fireEvent.dblClick(screen.getByRole('img', { name: 'beach.jpg' }))

		await fireEvent.keyDown(document.body, { key })

		expect(onZoom).toHaveBeenCalledWith(expected)
	})

	it('ignores the zoom keys while the slot is not being edited', async () => {
		const onZoom = vi.fn()
		renderSlot({ position: { x: 0.5, y: 0.5 }, zoom: 1 }, { onZoom })

		await fireEvent.keyDown(document.body, { key: '+' })

		expect(onZoom).not.toHaveBeenCalled()
	})

	it('warns about low resolution when the photo is too small for the slot', async () => {
		slotSizedInPixels(100)
		renderSlot({ position: { x: 0.5, y: 0.5 }, zoom: 1 }, { cmPerPixel: 0.6 })

		expect(
			await screen.findByRole('img', { name: 'Baja resolución: 127 ppp' }),
		).toBeInTheDocument()
	})

	it('zooms in a quarter per wheel notch turned away from the user', async () => {
		const onZoom = vi.fn()
		renderSlot({ position: { x: 0.5, y: 0.5 }, zoom: 1 }, { onZoom })
		const image = screen.getByRole('img', { name: 'beach.jpg' })
		await fireEvent.dblClick(image)

		await fireEvent.wheel(image, { deltaY: -100 })

		expect(onZoom).toHaveBeenCalledWith(1.25)
	})

	it('ignores the wheel while the slot is not being edited', async () => {
		const onZoom = vi.fn()
		renderSlot({ position: { x: 0.5, y: 0.5 }, zoom: 1 }, { onZoom })

		await fireEvent.wheel(screen.getByRole('img', { name: 'beach.jpg' }), {
			deltaY: -100,
		})

		expect(onZoom).not.toHaveBeenCalled()
	})

	it('moves the photo along with a drag while the slot is being edited', async () => {
		slotSizedInPixels(100)
		const onPosition = vi.fn()
		renderSlot({ position: { x: 0.5, y: 0.5 }, zoom: 1 }, { onPosition })
		const image = screen.getByRole('img', { name: 'beach.jpg' })
		await fireEvent.dblClick(image)
		await new Promise((resolve) => setTimeout(resolve))

		await fireEvent.pointerDown(image, {
			clientX: 50,
			clientY: 50,
			pointerId: 1,
		})
		await fireEvent.pointerMove(image, {
			clientX: 60,
			clientY: 50,
			pointerId: 1,
		})

		expect(onPosition.mock.calls[0]?.[0].x).toBeCloseTo(0.2)
	})

	it('leaves the position alone when the slot is dragged without being edited', async () => {
		slotSizedInPixels(100)
		const onPosition = vi.fn()
		renderSlot({ position: { x: 0.5, y: 0.5 }, zoom: 1 }, { onPosition })
		const image = screen.getByRole('img', { name: 'beach.jpg' })

		await fireEvent.pointerDown(image, {
			clientX: 50,
			clientY: 50,
			pointerId: 1,
		})
		await fireEvent.pointerMove(image, {
			clientX: 60,
			clientY: 50,
			pointerId: 1,
		})

		expect(onPosition).not.toHaveBeenCalled()
	})

	it('leaves slot editing when its photo leaves the slot', async () => {
		const slot = renderSlot({ position: { x: 0.5, y: 0.5 }, zoom: 1 })
		await fireEvent.dblClick(screen.getByRole('img', { name: 'beach.jpg' }))

		await slot.showPhoto(null)

		expect(screen.queryByRole('button', { name: 'Acercar' })).toBeNull()
	})

	it('leaves slot editing when another photo takes the slot', async () => {
		const slot = renderSlot({ position: { x: 0.5, y: 0.5 }, zoom: 1 })
		await fireEvent.dblClick(screen.getByRole('img', { name: 'beach.jpg' }))

		await slot.showPhoto({ ...photo, id: 2, name: 'mountain.jpg' })

		expect(screen.queryByRole('button', { name: 'Acercar' })).toBeNull()
	})

	it('stops dragging the slot photo to another slot while the slot is being edited', async () => {
		renderSlot({ position: { x: 0.5, y: 0.5 }, zoom: 1 })
		const draggable = () =>
			document.querySelector('[aria-roledescription="draggable"]')
		expect(draggable()).toHaveAttribute('aria-disabled', 'false')

		await fireEvent.dblClick(screen.getByRole('img', { name: 'beach.jpg' }))

		expect(draggable()).toHaveAttribute('aria-disabled', 'true')
	})

	it('does not warn about resolution while the page has no size yet', async () => {
		slotSizedInPixels(100)
		renderSlot({ position: { x: 0.5, y: 0.5 }, zoom: 1 }, { cmPerPixel: 0 })
		await new Promise((resolve) => setTimeout(resolve))

		expect(screen.queryByRole('img', { name: /Baja resolución/ })).toBeNull()
	})
})
