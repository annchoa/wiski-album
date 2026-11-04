import { fireEvent, render, screen, within } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import App from '../App.vue'
import { createWikiI18n } from '../i18n'
import { createWikiRouter } from '../router'

vi.mock('../lib/readPhoto', () => ({
	readPhoto: async (file: File) => {
		if (file.name.startsWith('broken')) throw new Error('not an image')
		return {
			url: `blob:${file.name}`,
			width: file.name.startsWith('portrait') ? 3000 : 4000,
			height: file.name.startsWith('portrait') ? 4000 : 3000,
		}
	},
}))

async function renderWorksheet(path: string) {
	const router = createWikiRouter(createMemoryHistory())
	await router.push(path)
	render(App, { global: { plugins: [createWikiI18n(), router] } })
	return router
}

describe('Worksheet screen', () => {
	it('opens on the first page of the chosen product', async () => {
		await renderWorksheet('/worksheet/wiski-moment')

		expect(
			screen.getByRole('button', { name: /Wiski Momento/ }),
		).toBeInTheDocument()
		expect(screen.getByText('1/25')).toBeInTheDocument()
	})

	it('offers six templates with the first one selected', async () => {
		await renderWorksheet('/worksheet/wiski-moment')

		const templates = within(
			screen.getByRole('radiogroup', { name: 'Plantillas' }),
		).getAllByRole('radio')

		expect(templates).toHaveLength(6)
		expect(templates[0]).toBeChecked()
	})

	it('shows uploaded photos in the asset panel', async () => {
		await renderWorksheet('/worksheet/wiski-moment')

		await fireEvent.change(screen.getByLabelText('Subir fotos'), {
			target: {
				files: [
					new File(['a'], 'beach.jpg', { type: 'image/jpeg' }),
					new File(['b'], 'mountain.jpg', { type: 'image/jpeg' }),
				],
			},
		})

		const assetPanel = screen.getByRole('list', { name: 'Fotos' })
		expect(
			await within(assetPanel).findByRole('img', { name: 'beach.jpg' }),
		).toBeInTheDocument()
		expect(
			within(assetPanel).getByRole('img', { name: 'mountain.jpg' }),
		).toBeInTheDocument()
	})

	it('keeps uploading the remaining files when one of them cannot be read', async () => {
		await renderWorksheet('/worksheet/wiski-moment')

		await fireEvent.change(screen.getByLabelText('Subir fotos'), {
			target: {
				files: [
					new File(['x'], 'broken.jpg', { type: 'image/jpeg' }),
					new File(['a'], 'beach.jpg', { type: 'image/jpeg' }),
				],
			},
		})

		const assetPanel = await screen.findByRole('list', { name: 'Fotos' })
		expect(
			await within(assetPanel).findByRole('img', { name: 'beach.jpg' }),
		).toBeInTheDocument()
	})

	it('releases the uploaded photos when the screen is left', async () => {
		const router = createWikiRouter(createMemoryHistory())
		await router.push('/worksheet/wiski-moment')
		const { unmount } = render(App, {
			global: { plugins: [createWikiI18n(), router] },
		})
		await fireEvent.change(screen.getByLabelText('Subir fotos'), {
			target: {
				files: [new File(['a'], 'beach.jpg', { type: 'image/jpeg' })],
			},
		})
		await screen.findByRole('img', { name: 'beach.jpg' })
		const release = vi.spyOn(URL, 'revokeObjectURL')

		unmount()

		expect(release).toHaveBeenCalledWith('blob:beach.jpg')
		release.mockRestore()
	})

	it('opens the file picker from the hint shown while the asset panel is empty', async () => {
		await renderWorksheet('/worksheet/wiski-moment')
		const openPicker = vi
			.spyOn(HTMLInputElement.prototype, 'click')
			.mockImplementation(() => {})

		await fireEvent.click(
			screen.getByRole('button', { name: 'Sube aquí tus fotos' }),
		)

		expect(openPicker).toHaveBeenCalledOnce()
		openPicker.mockRestore()
	})

	it('closes the product menu when clicking outside of it', async () => {
		await renderWorksheet('/worksheet/wiski-moment')
		await fireEvent.click(screen.getByRole('button', { name: /Wiski Momento/ }))
		expect(screen.getByRole('menu')).toBeInTheDocument()

		// onClickOutside ignores a second click in the same macrotask; real clicks never share one.
		await new Promise((resolve) => setTimeout(resolve, 0))
		const worksheet = screen.getByRole('region', { name: 'Hoja de trabajo' })
		await fireEvent.pointerDown(worksheet)
		await fireEvent.click(worksheet)

		expect(screen.queryByRole('menu')).not.toBeInTheDocument()
	})

	it('closes the product menu with Escape', async () => {
		await renderWorksheet('/worksheet/wiski-moment')
		await fireEvent.click(screen.getByRole('button', { name: /Wiski Momento/ }))

		await fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })

		expect(screen.queryByRole('menu')).not.toBeInTheDocument()
	})

	it('moves between pages with the arrows and disables them at the ends', async () => {
		await renderWorksheet('/worksheet/wiski-route')
		const previous = screen.getByRole('button', { name: 'Página anterior' })
		const next = screen.getByRole('button', { name: 'Página siguiente' })
		expect(previous).toBeDisabled()

		await fireEvent.click(next)
		expect(screen.getByText('2/20')).toBeInTheDocument()
		expect(previous).toBeEnabled()

		for (let step = 0; step < 18; step++) await fireEvent.click(next)
		expect(screen.getByText('20/20')).toBeInTheDocument()
		expect(next).toBeDisabled()
	})

	it('shows as many slots on the worksheet as the chosen template has', async () => {
		await renderWorksheet('/worksheet/wiski-moment')
		const slots = () =>
			within(
				screen.getByRole('region', { name: 'Hoja de trabajo' }),
			).getAllByRole('listitem')
		expect(slots()).toHaveLength(1)

		await fireEvent.click(
			screen.getByRole('radio', { name: 'Una grande y dos pequeñas' }),
		)

		expect(slots()).toHaveLength(3)
	})

	it('asks for confirmation before switching product and then resets to the first page of the other one', async () => {
		await renderWorksheet('/worksheet/wiski-moment')
		await fireEvent.click(screen.getByRole('button', { name: /Wiski Momento/ }))
		await fireEvent.click(screen.getByRole('menuitem', { name: /Wiski Ruta/ }))

		const dialog = screen.getByRole('alertdialog', {
			name: 'Cambiar de producto',
		})
		expect(
			within(dialog).getByText(
				'Cambiar de producto reiniciará tus páginas. Tus fotos se conservan.',
			),
		).toBeInTheDocument()
		await fireEvent.click(
			within(dialog).getByRole('button', { name: 'Cambiar' }),
		)

		expect(
			await screen.findByRole('button', { name: /Wiski Ruta/ }),
		).toBeInTheDocument()
		expect(screen.getByText('1/20')).toBeInTheDocument()
		await vi.waitFor(() =>
			expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
		)
	})

	it('cancels the product switch with Escape and moves the focus into the dialog', async () => {
		await renderWorksheet('/worksheet/wiski-moment')
		await fireEvent.click(screen.getByRole('button', { name: /Wiski Momento/ }))
		await fireEvent.click(screen.getByRole('menuitem', { name: /Wiski Ruta/ }))

		const dialog = screen.getByRole('alertdialog')
		await vi.waitFor(() =>
			expect(dialog).toContainElement(document.activeElement as HTMLElement),
		)

		await fireEvent.keyDown(dialog, { key: 'Escape' })

		await vi.waitFor(() =>
			expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
		)
		expect(screen.getByText('1/25')).toBeInTheDocument()
	})

	it('does nothing when the chosen product is already the current one', async () => {
		await renderWorksheet('/worksheet/wiski-moment')
		await fireEvent.click(screen.getByRole('button', { name: /Wiski Momento/ }))

		await fireEvent.click(
			screen.getByRole('menuitem', { name: /Wiski Momento/ }),
		)

		expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()
	})

	it('keeps the address in sync with the product after switching', async () => {
		const router = await renderWorksheet('/worksheet/wiski-moment')
		await fireEvent.click(screen.getByRole('button', { name: /Wiski Momento/ }))
		await fireEvent.click(screen.getByRole('menuitem', { name: /Wiski Ruta/ }))

		await fireEvent.click(
			within(screen.getByRole('alertdialog')).getByRole('button', {
				name: 'Cambiar',
			}),
		)

		await vi.waitFor(() =>
			expect(router.currentRoute.value.path).toBe('/worksheet/wiski-route'),
		)
	})

	it('shows the product of the address when the history moves between products', async () => {
		const router = await renderWorksheet('/worksheet/wiski-moment')

		await router.push('/worksheet/wiski-route')

		expect(
			await screen.findByRole('button', { name: /Wiski Ruta/ }),
		).toBeInTheDocument()
		expect(screen.getByText('1/20')).toBeInTheDocument()
	})

	it('keeps the current product when the switch is cancelled', async () => {
		await renderWorksheet('/worksheet/wiski-moment')
		await fireEvent.click(screen.getByRole('button', { name: /Wiski Momento/ }))
		await fireEvent.click(screen.getByRole('menuitem', { name: /Wiski Ruta/ }))

		await fireEvent.click(
			within(screen.getByRole('alertdialog')).getByRole('button', {
				name: 'Cancelar',
			}),
		)

		expect(
			await screen.findByRole('button', { name: /Wiski Momento/ }),
		).toBeInTheDocument()
		expect(screen.getByText('1/25')).toBeInTheDocument()
		await vi.waitFor(() =>
			expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
		)
	})

	it('lists vertical photos first when the vertical sort is on and goes back to upload order when it is turned off', async () => {
		await renderWorksheet('/worksheet/wiski-moment')
		await fireEvent.change(screen.getByLabelText('Subir fotos'), {
			target: {
				files: [
					new File(['a'], 'landscape.jpg', { type: 'image/jpeg' }),
					new File(['b'], 'portrait.jpg', { type: 'image/jpeg' }),
				],
			},
		})
		const assetPanel = screen.getByRole('list', { name: 'Fotos' })
		const names = () =>
			within(assetPanel)
				.getAllByRole('img')
				.map((photo) => photo.getAttribute('alt'))
		await within(assetPanel).findByRole('img', { name: 'portrait.jpg' })
		expect(names()).toEqual(['landscape.jpg', 'portrait.jpg'])

		const verticalFirst = screen.getByRole('button', {
			name: 'Verticales primero',
		})
		await fireEvent.click(verticalFirst)
		expect(verticalFirst).toHaveAttribute('aria-pressed', 'true')
		expect(names()).toEqual(['portrait.jpg', 'landscape.jpg'])

		await fireEvent.click(verticalFirst)
		expect(verticalFirst).toHaveAttribute('aria-pressed', 'false')
		expect(names()).toEqual(['landscape.jpg', 'portrait.jpg'])
	})
})
