import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import CoverPreview from '../components/cover/CoverPreview.vue'
import { createWikiI18n } from '../i18n'
import { createCover } from '../lib/cover'
import { defaultIllustration } from '../lib/illustrations'

function renderCoverPreview() {
	const cover = createCover({
		title: 'Mi destino favorito',
		dateLine: 'noviembre 2026',
		sheetHeight: 1,
		sheetWidthCm: 20,
	})
	render(CoverPreview, {
		props: { cover, sheetHeight: 1 },
		global: { plugins: [createWikiI18n()] },
	})
	return cover
}

function sheet() {
	return screen.getByRole('group', { name: 'Vista previa de la portada' })
}

describe('Cover preview', () => {
	it('shows the texts in the colors of the Color scheme', () => {
		const cover = renderCoverPreview()

		expect(sheet()).toHaveStyle({
			backgroundColor: cover.colorScheme.background,
		})
		expect(screen.getByText('Mi destino favorito')).toHaveStyle({
			color: cover.colorScheme.textColor,
		})
	})

	it('shows the picture of the current Illustration', () => {
		renderCoverPreview()

		expect(
			screen.getByRole('img', { name: 'Ilustración de la portada' }),
		).toHaveAttribute(
			'src',
			expect.stringContaining('illustrations/lemon-blue.png'),
		)
	})

	it('selects the clicked text, boxes it, and deselects on a click on the sheet', async () => {
		const cover = renderCoverPreview()

		await fireEvent.click(screen.getByText('noviembre 2026'))

		expect(cover.selected).toBe('dateLine')
		expect(
			screen.getByRole('group', { name: 'Elemento seleccionado' }),
		).toBeInTheDocument()

		await fireEvent.click(sheet())

		expect(cover.selected).toBeNull()
		expect(
			screen.queryByRole('group', { name: 'Elemento seleccionado' }),
		).toBeNull()
	})

	it('edits a text with a double click', async () => {
		const cover = renderCoverPreview()

		await fireEvent.dblClick(screen.getByText('Mi destino favorito'))
		const field = screen.getByRole('textbox', { name: 'Texto de la portada' })
		expect(field).toHaveValue('Mi destino favorito')
		await fireEvent.update(field, 'Nuestro viaje a Cuenca')
		await fireEvent.blur(field)

		expect(cover.title?.text).toBe('Nuestro viaje a Cuenca')
		expect(screen.queryByRole('textbox')).toBeNull()
	})

	it('removes the selected text with the Delete key and with the trash button', async () => {
		const cover = renderCoverPreview()

		await fireEvent.click(screen.getByText('Mi destino favorito'))
		await fireEvent.keyDown(sheet(), { key: 'Delete' })
		expect(cover.title).toBeNull()

		await fireEvent.click(screen.getByText('noviembre 2026'))
		await fireEvent.click(screen.getByRole('button', { name: 'Borrar' }))
		expect(cover.dateLine).toBeNull()
	})

	it('takes the focus when the user presses on an element, so the Delete key reaches the sheet', async () => {
		const cover = renderCoverPreview()

		await fireEvent.pointerDown(screen.getByText('Mi destino favorito'))
		await fireEvent.pointerUp(window)
		expect(sheet()).toHaveFocus()

		await fireEvent.keyDown(document.activeElement as Element, {
			key: 'Delete',
		})
		expect(cover.title).toBeNull()
	})

	it('removes the selected Illustration with the Delete key and with the trash button', async () => {
		const cover = renderCoverPreview()

		await fireEvent.click(
			screen.getByRole('img', { name: 'Ilustración de la portada' }),
		)
		await fireEvent.keyDown(sheet(), { key: 'Delete' })
		expect(cover.illustrations).toEqual([])

		cover.addIllustration(defaultIllustration)
		await fireEvent.click(await screen.findByRole('button', { name: 'Borrar' }))
		expect(cover.illustrations).toEqual([])
	})
})
