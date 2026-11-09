import {
	degrees,
	PDFDocument,
	type PDFFont,
	type PDFPage,
	rgb,
	StandardFonts,
} from 'pdf-lib'
import type { Size } from './geometry'
import { type Rect, slotRects } from './slotRects'
import type { Margins } from './worksheet'

export interface QuickPreviewPage {
	templateId: string
	margins: Margins
	// One JPEG per slot, already cropped to the slot and reduced; null for an empty slot.
	photos: (Uint8Array | null)[]
}

export interface QuickPreviewInput {
	pageCm: Size
	pages: QuickPreviewPage[]
	notice: string
}

const pointsPerCm = 72 / 2.54
// The notice sits on a white band along the foot of the page, so it reads over any photo.
const noticeBandPt = 22
const noticeInsetPt = 12
const noticeBaselinePt = 7
const noticeSizePt = 8

// The watermark text is half as wide as the page, rising to the right.
const watermarkWidthShare = 0.5
const watermarkAngleDegrees = 30
const watermarkOpacity = 0.4
const watermarkLineGap = 1.2

interface Fonts {
	regular: PDFFont
	bold: PDFFont
}

function toPoints(rect: Rect, pageHeightPt: number): Rect {
	// PDF coordinates start at the bottom-left corner of the page.
	return {
		x: rect.x * pointsPerCm,
		y: pageHeightPt - (rect.y + rect.height) * pointsPerCm,
		width: rect.width * pointsPerCm,
		height: rect.height * pointsPerCm,
	}
}

function drawWatermark(page: PDFPage, area: Rect, { regular, bold }: Fonts) {
	const wiski = 'WISKI'
	const photobook = 'photobook'
	const wiskiSize =
		(area.width * watermarkWidthShare) / bold.widthOfTextAtSize(wiski, 1)
	const photobookSize = wiskiSize * 0.35
	const angle = (watermarkAngleDegrees * Math.PI) / 180
	const centerX = area.x + area.width / 2
	const centerY = area.y + area.height / 2

	// A point (along, up) in the text's own frame, moved onto the page around its center.
	const onPage = (along: number, up: number) => ({
		x: centerX + along * Math.cos(angle) - up * Math.sin(angle),
		y: centerY + along * Math.sin(angle) + up * Math.cos(angle),
	})
	const lines = [
		{ text: wiski, font: bold, size: wiskiSize, up: 0 },
		{
			text: photobook,
			font: regular,
			size: photobookSize,
			up: -photobookSize * watermarkLineGap,
		},
	]

	for (const { text, font, size, up } of lines) {
		const start = onPage(-font.widthOfTextAtSize(text, size) / 2, up)
		page.drawText(text, {
			...start,
			size,
			font,
			color: rgb(1, 1, 1),
			opacity: watermarkOpacity,
			rotate: degrees(watermarkAngleDegrees),
		})
	}
}

export async function buildQuickPreview({
	pageCm,
	pages,
	notice,
}: QuickPreviewInput): Promise<Uint8Array> {
	const pdf = await PDFDocument.create()
	const fonts = {
		regular: await pdf.embedFont(StandardFonts.Helvetica),
		bold: await pdf.embedFont(StandardFonts.HelveticaBold),
	}
	const pageWidthPt = pageCm.width * pointsPerCm
	const pageHeightPt = pageCm.height * pointsPerCm
	for (const { templateId, margins, photos } of pages) {
		const page = pdf.addPage([pageWidthPt, pageHeightPt])
		const rects = slotRects(templateId, margins, pageCm)
		for (const [index, jpeg] of photos.entries()) {
			const rect = rects[index]
			if (!jpeg || !rect) continue
			const slot = toPoints(rect, pageHeightPt)
			page.drawImage(await pdf.embedJpg(jpeg), slot)
		}
		// One watermark for the whole page, and none on a page without photos.
		if (photos.some((jpeg) => jpeg !== null)) {
			drawWatermark(
				page,
				{ x: 0, y: 0, width: pageWidthPt, height: pageHeightPt },
				fonts,
			)
		}
		page.drawRectangle({
			x: 0,
			y: 0,
			width: pageWidthPt,
			height: noticeBandPt,
			color: rgb(1, 1, 1),
		})
		page.drawText(notice, {
			x: noticeInsetPt,
			y: noticeBaselinePt,
			size: noticeSizePt,
			font: fonts.regular,
			color: rgb(0.4, 0.4, 0.4),
		})
	}
	return pdf.save()
}
