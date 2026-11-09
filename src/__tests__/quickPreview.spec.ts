import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { buildQuickPreview, type QuickPreviewPage } from '@/lib/quickPreview'
import {
	drawnImageCount,
	drawnImageRects,
	drawnTexts,
	tinyJpeg,
} from './pdfContent'

const pageCm = { width: 20, height: 28 }
const pointsPerCm = 72 / 2.54
const notice = 'Quick preview, not for printing'

function emptyPage(): QuickPreviewPage {
	return {
		templateId: 'single',
		margins: 'full-bleed' as const,
		photos: [null],
	}
}

async function build(
	pages: QuickPreviewPage[] = [emptyPage(), emptyPage(), emptyPage()],
) {
	const bytes = await buildQuickPreview({ pageCm, pages, notice })
	return PDFDocument.load(bytes)
}

describe('buildQuickPreview', () => {
	it('makes one PDF page per page, at the size of the product', async () => {
		const pdf = await build()

		expect(pdf.getPageCount()).toBe(3)
		const { width, height } = pdf.getPage(0).getSize()
		expect(width).toBeCloseTo(20 * pointsPerCm, 1)
		expect(height).toBeCloseTo(28 * pointsPerCm, 1)
	})

	it('prints the notice on every page, empty pages included', async () => {
		const pdf = await build()

		for (const page of pdf.getPages()) {
			expect(drawnTexts(page)).toContain(notice)
		}
	})

	it('draws one image for each filled slot', async () => {
		const sideBySide = {
			templateId: 'side-by-side',
			margins: 'full-bleed' as const,
			photos: [tinyJpeg, null],
		}
		const pdf = await build([sideBySide, emptyPage()])

		expect(drawnImageCount(pdf.getPage(0))).toBe(1)
		expect(drawnImageCount(pdf.getPage(1))).toBe(0)
	})

	// The top slot is 20 x 14 cm. PDF coordinates start at the bottom, so its
	// lower edge is 14 cm above the bottom of the page.
	it('puts the image of a top slot at the top of the page', async () => {
		const stacked = {
			templateId: 'stacked',
			margins: 'full-bleed' as const,
			photos: [tinyJpeg, null],
		}
		const pdf = await build([stacked])

		const [rect] = drawnImageRects(pdf.getPage(0))
		expect(rect?.x).toBeCloseTo(0, 1)
		expect(rect?.y).toBeCloseTo(14 * pointsPerCm, 1)
		expect(rect?.width).toBeCloseTo(20 * pointsPerCm, 1)
		expect(rect?.height).toBeCloseTo(14 * pointsPerCm, 1)
	})

	it('prints the watermark once on each page that has a photo', async () => {
		const sideBySide = {
			templateId: 'side-by-side',
			margins: 'full-bleed' as const,
			photos: [tinyJpeg, tinyJpeg],
		}
		const half = {
			templateId: 'side-by-side',
			margins: 'full-bleed' as const,
			photos: [tinyJpeg, null],
		}
		const pdf = await build([sideBySide, half, emptyPage()])

		const wiskiOn = (index: number) =>
			drawnTexts(pdf.getPage(index)).filter((text) => text === 'WISKI').length
		const photobookOn = (index: number) =>
			drawnTexts(pdf.getPage(index)).filter((text) => text === 'photobook')
				.length
		expect([wiskiOn(0), wiskiOn(1), wiskiOn(2)]).toEqual([1, 1, 0])
		expect([photobookOn(0), photobookOn(1), photobookOn(2)]).toEqual([1, 1, 0])
	})
})
