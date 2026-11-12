import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import ToolPanel from '../components/cover/ToolPanel.vue'
import { createWikiI18n } from '../i18n'
import { colorSchemes, defaultColorScheme } from '../lib/colorSchemes'
import type { CoverElementId } from '../lib/cover'
import { illustrations } from '../lib/illustrations'
import { defaultTypeface, typefaces } from '../lib/typefaces'

function renderToolPanel(
	selected: CoverElementId | null,
	selectedText = 'Mi destino favorito',
) {
	return render(ToolPanel, {
		props: {
			selected,
			selectedText,
			colorScheme: defaultColorScheme,
			typefaceName: defaultTypeface.name,
		},
		global: { plugins: [createWikiI18n()] },
	})
}

describe('Tool panel', () => {
	it('opens on the Colors item of the Tool menu, with no heading above the list', () => {
		renderToolPanel(null)

		const items = screen.getAllByRole('tab')
		expect(items.map((item) => item.textContent?.trim())).toEqual([
			'Colores',
			'Tipografías',
			'Ilustraciones',
		])
		expect(screen.getByRole('tab', { name: 'Colores' })).toHaveAttribute(
			'aria-selected',
			'true',
		)
		expect(screen.queryByRole('heading')).toBeNull()
	})

	it('shows the list of the chosen Tool menu item', async () => {
		renderToolPanel(null)

		await fireEvent.click(screen.getByRole('tab', { name: 'Ilustraciones' }))
		expect(
			screen.getAllByRole('button', { name: /^Ilustración \d+$/ }),
		).toHaveLength(illustrations.length)
		expect(screen.queryByRole('button', { name: 'Color 1' })).toBeNull()

		await fireEvent.click(screen.getByRole('tab', { name: 'Colores' }))
		expect(screen.getAllByRole('button', { name: /^Color \d+$/ })).toHaveLength(
			colorSchemes.length,
		)
	})

	it('lists the Color schemes while nothing is selected and marks the current one', () => {
		renderToolPanel(null)

		const tiles = screen.getAllByRole('button', { name: /^Color \d+$/ })
		expect(tiles).toHaveLength(colorSchemes.length)
		expect(tiles[0]).toHaveAttribute('aria-pressed', 'true')
		expect(tiles[1]).toHaveAttribute('aria-pressed', 'false')
	})

	it('lists the Typefaces while a text is selected and marks the current one', () => {
		renderToolPanel('title')

		const rows = typefaces.map(({ name }) =>
			screen.getByRole('button', { name }),
		)
		expect(rows[0]).toHaveAttribute('aria-pressed', 'true')
		expect(rows[1]).toHaveAttribute('aria-pressed', 'false')
	})

	it('lists the Illustrations while an Illustration is selected', () => {
		renderToolPanel('illustration-0')

		const tiles = screen.getAllByRole('button', { name: /^Ilustración \d+$/ })
		expect(tiles).toHaveLength(illustrations.length)
	})

	it('shows the picture of each Illustration', () => {
		renderToolPanel('illustration-0')

		const tile = screen.getByRole('button', { name: 'Ilustración 1' })
		expect(tile.querySelector('img')).toHaveAttribute(
			'src',
			expect.stringContaining('illustrations/lemon-blue.png'),
		)
	})

	it('switches to the Typefaces or the Illustrations when the user selects that element, and keeps the item when the selection clears', async () => {
		const { rerender } = renderToolPanel(null)

		await rerender({ selected: 'title' })
		expect(screen.getByRole('tab', { name: 'Tipografías' })).toHaveAttribute(
			'aria-selected',
			'true',
		)

		await rerender({ selected: 'illustration-0' })
		expect(screen.getByRole('tab', { name: 'Ilustraciones' })).toHaveAttribute(
			'aria-selected',
			'true',
		)

		await rerender({ selected: null })
		expect(screen.getByRole('tab', { name: 'Ilustraciones' })).toHaveAttribute(
			'aria-selected',
			'true',
		)
	})

	it('shows the selected text in each Typeface', () => {
		renderToolPanel('dateLine', 'noviembre 2026')

		const row = screen.getByRole('button', { name: 'Chicle' })
		expect(row).toBeEnabled()
		expect(row).toHaveTextContent('noviembre 2026')
	})

	it('asks for a text when the selected text is empty, and keeps the Typefaces usable', () => {
		renderToolPanel('title', '  ')

		const row = screen.getByRole('button', { name: 'Chicle' })
		expect(row).toBeEnabled()
		expect(row).toHaveTextContent('Selecciona un texto')
	})

	it('cuts a long selected text after 19 characters, as long as "Mi destino favorito"', () => {
		renderToolPanel('title', 'Mi destino favorito y más')
		expect(screen.getByRole('button', { name: 'Chicle' })).toHaveTextContent(
			/^Mi destino favorito…$/,
		)
	})

	it('keeps a selected text of exactly 19 characters whole', () => {
		renderToolPanel('title', 'Mi destino favorito')
		expect(screen.getByRole('button', { name: 'Chicle' })).toHaveTextContent(
			/^Mi destino favorito$/,
		)
	})

	it('dims the Typefaces and asks for a text while no text is selected', async () => {
		const { emitted } = renderToolPanel(null)

		await fireEvent.click(screen.getByRole('tab', { name: 'Tipografías' }))

		const row = screen.getByRole('button', { name: 'Chicle' })
		expect(row).toBeDisabled()
		expect(row).toHaveTextContent('Selecciona un texto')
		await fireEvent.click(row)
		expect(emitted().selectTypeface).toBeUndefined()
	})

	it('asks for the picked Color scheme, Typeface and Illustration', async () => {
		const colors = renderToolPanel(null)
		await fireEvent.click(screen.getByRole('button', { name: 'Color 3' }))
		expect(colors.emitted().selectColorScheme).toEqual([[colorSchemes[2]]])
		colors.unmount()

		const letters = renderToolPanel('dateLine')
		await fireEvent.click(screen.getByRole('button', { name: 'Chicle' }))
		expect(letters.emitted().selectTypeface).toEqual([['Chicle']])
		letters.unmount()

		const pictures = renderToolPanel('illustration-0')
		await fireEvent.click(screen.getByRole('button', { name: 'Ilustración 2' }))
		expect(pictures.emitted().selectIllustration).toEqual([[illustrations[1]]])
	})

	it('asks to finish Cover editing', async () => {
		const { emitted } = renderToolPanel(null)

		await fireEvent.click(screen.getByRole('button', { name: 'Listo' }))

		expect(emitted().done).toHaveLength(1)
	})
})
