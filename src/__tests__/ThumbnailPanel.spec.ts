import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import ThumbnailPanel from '../components/worksheet/ThumbnailPanel.vue'
import { createWikiI18n } from '../i18n'
import type { Page, Photo } from '../lib/worksheet'

const photo: Photo = {
	id: 1,
	name: 'beach.jpg',
	url: 'blob:beach.jpg',
	width: 4000,
	height: 3000,
}

function aPage(slots: (Photo | null)[]): Page {
	return { templateId: 'single', margins: 'full-bleed', slots }
}

function renderThumbnailPanel(pages: Page[], current = 0) {
	return render(ThumbnailPanel, {
		props: {
			pages,
			current,
			aspectRatio: '20 / 20',
			positionAndZoom: () => ({ position: { x: 0.5, y: 0.5 }, zoom: 1 }),
		},
		global: { plugins: [createWikiI18n()] },
	})
}

describe('Thumbnail panel', () => {
	it('tells a page with photos from an empty one and shows the photo only on the first', () => {
		const { container } = renderThumbnailPanel([aPage([photo]), aPage([null])])

		const withPhotos = screen.getByRole('button', { name: 'Página 1' })
		const empty = screen.getByRole('button', { name: 'Página 2, vacía' })
		expect(withPhotos.querySelector('img')).toHaveAttribute(
			'src',
			'blob:beach.jpg',
		)
		expect(empty.querySelector('img')).toBeNull()
		expect(container.querySelectorAll('img')).toHaveLength(1)
	})

	it('asks for the page of the clicked thumbnail', async () => {
		const { emitted } = renderThumbnailPanel([aPage([null]), aPage([null])])

		await fireEvent.click(
			screen.getByRole('button', { name: 'Página 2, vacía' }),
		)

		expect(emitted().select).toEqual([[1]])
	})
})
