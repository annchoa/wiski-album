import { fireEvent, render, screen, within } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import App from '../App.vue'
import { createWikiI18n } from '../i18n'
import { makeQuickPreview } from '../lib/makeQuickPreview'
import { createWikiRouter } from '../router'

// The two edges of the system: the canvas that cuts the photos, and pdf.js.
vi.mock('../lib/makeQuickPreview', () => ({
	makeQuickPreview: vi.fn(async () => new Uint8Array([1, 2, 3])),
}))
vi.mock('../lib/renderPdf', () => ({
	loadPdf: async () => ({
		renderPage: async () => {},
		destroy() {},
	}),
}))

async function openPdfPreview(path = '/worksheet/wiski-moment') {
	const router = createWikiRouter(createMemoryHistory())
	await router.push(path)
	render(App, { global: { plugins: [createWikiI18n(), router] } })
	await fireEvent.click(
		screen.getByRole('button', { name: 'Vista previa del PDF' }),
	)
	return screen.findByRole('dialog', { name: 'Previsualización rápida' })
}

function shownPages(dialog: HTMLElement) {
	return within(dialog)
		.queryAllByRole('img', { name: /^Página \d+$/ })
		.map((canvas) => canvas.getAttribute('aria-label'))
}

describe('PDF preview', () => {
	it('opens from the eye button and shows the first page alone', async () => {
		const dialog = await openPdfPreview()

		expect(await within(dialog).findByText('1 / 25')).toBeInTheDocument()
		expect(shownPages(dialog)).toEqual(['Página 1'])
	})

	it('moves between facing pages with the arrows', async () => {
		const dialog = await openPdfPreview()
		await within(dialog).findByText('1 / 25')

		await fireEvent.click(
			within(dialog).getByRole('button', { name: 'Páginas siguientes' }),
		)
		expect(within(dialog).getByText('2-3 / 25')).toBeInTheDocument()
		expect(shownPages(dialog)).toEqual(['Página 2', 'Página 3'])

		await fireEvent.click(
			within(dialog).getByRole('button', { name: 'Páginas anteriores' }),
		)
		expect(within(dialog).getByText('1 / 25')).toBeInTheDocument()
		expect(shownPages(dialog)).toEqual(['Página 1'])
	})

	it('moves between facing pages with the arrow keys', async () => {
		const dialog = await openPdfPreview()
		await within(dialog).findByText('1 / 25')

		await fireEvent.keyDown(document.body, { key: 'ArrowRight' })
		expect(within(dialog).getByText('2-3 / 25')).toBeInTheDocument()

		await fireEvent.keyDown(document.body, { key: 'ArrowLeft' })
		expect(within(dialog).getByText('1 / 25')).toBeInTheDocument()
	})

	it('cannot go before the first page or past the last one', async () => {
		const dialog = await openPdfPreview()
		await within(dialog).findByText('1 / 25')

		expect(
			within(dialog).getByRole('button', { name: 'Páginas anteriores' }),
		).toBeDisabled()
		for (let step = 0; step < 12; step++) {
			await fireEvent.click(
				within(dialog).getByRole('button', { name: 'Páginas siguientes' }),
			)
		}
		expect(within(dialog).getByText('24-25 / 25')).toBeInTheDocument()
		expect(
			within(dialog).getByRole('button', { name: 'Páginas siguientes' }),
		).toBeDisabled()
	})

	it('shows an even last page alone', async () => {
		const dialog = await openPdfPreview('/worksheet/wiski-route')
		await within(dialog).findByText('1 / 20')

		for (let step = 0; step < 10; step++) {
			await fireEvent.click(
				within(dialog).getByRole('button', { name: 'Páginas siguientes' }),
			)
		}
		expect(within(dialog).getByText('20 / 20')).toBeInTheDocument()
		expect(shownPages(dialog)).toEqual(['Página 20'])
	})

	it('downloads the quick preview with a name that says it is not for printing', async () => {
		const downloads: string[] = []
		URL.createObjectURL = vi.fn(() => 'blob:quick-preview')
		URL.revokeObjectURL = vi.fn()
		vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
			this: HTMLAnchorElement,
		) {
			downloads.push(this.download)
		})
		const dialog = await openPdfPreview()
		await within(dialog).findByText('1 / 25')

		await fireEvent.click(
			within(dialog).getByRole('button', { name: 'Descargar PDF' }),
		)

		expect(downloads).toEqual(['wiski-moment-quick-preview.pdf'])
	})

	it('closes with the close button', async () => {
		const dialog = await openPdfPreview()
		await within(dialog).findByText('1 / 25')

		await fireEvent.click(
			within(dialog).getByRole('button', { name: 'Cerrar' }),
		)

		await vi.waitFor(() =>
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
		)
	})

	it('tells the user when the preview cannot be prepared', async () => {
		vi.mocked(makeQuickPreview).mockRejectedValueOnce(new Error('no canvas'))
		const dialog = await openPdfPreview()

		expect(await within(dialog).findByRole('alert')).toHaveTextContent(
			'No se pudo preparar la previsualización',
		)
	})
})
