import { fireEvent, render, screen } from '@testing-library/vue'
import { DnDProvider } from '@vue-dnd-kit/core'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import SlotCell from '../components/worksheet/SlotCell.vue'
import { createWikiI18n } from '../i18n'
import type { Photo, SlotView } from '../lib/worksheet'

const photo: Photo = {
	id: 1,
	name: 'beach.jpg',
	url: 'blob:beach.jpg',
	width: 4000,
	height: 3000,
}

function renderSlot(
	view: SlotView,
	handlers: { onZoom?: (zoom: number) => void; onReset?: () => void } = {},
) {
	const Host = defineComponent(
		() => () =>
			h(DnDProvider, null, () =>
				h(SlotCell, {
					photo,
					address: { page: 0, slot: 0 },
					view,
					...handlers,
				}),
			),
	)
	render(Host, { global: { plugins: [createWikiI18n()] } })
}

describe('Slot cell', () => {
	it('shows its photo at the position and zoom of its view', () => {
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
})
