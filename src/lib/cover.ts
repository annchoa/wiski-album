import { reactive } from 'vue'
import { type ColorScheme, defaultColorScheme } from './colorSchemes'
import type { Point } from './geometry'
import { defaultIllustration, type Illustration } from './illustrations'
import { cmPerInch, lowResolutionBelow } from './resolution'
import { defaultTypeface } from './typefaces'

export type CoverElementId = 'title' | 'dateLine' | `illustration-${number}`

export function illustrationElementId(key: number): CoverElementId {
	return `illustration-${key}`
}

export function illustrationKeyOf(id: CoverElementId): number | null {
	const match = id.match(/^illustration-(\d+)$/)
	return match?.[1] === undefined ? null : Number(match[1])
}

// Every position and size is a fraction of the sheet width, so the Cover
// looks the same at any size. The defaults come from the Penpot design, where
// the sheet is 540 px wide.
const designSheetPx = 540

function fraction(designPx: number) {
	return designPx / designSheetPx
}

export interface CoverText {
	text: string
	typeface: string
	x: number
	y: number
	width: number
	// The browser decides the height, so the view reports it.
	height: number
	fontSize: number
}

export interface CoverIllustration {
	// Tells apart two Illustrations that show the same picture.
	key: number
	id: string
	x: number
	y: number
	width: number
	height: number
	// The widest the Illustration can be, as a fraction of the sheet width.
	maxWidth: number
}

// The narrowest an element can be, as a fraction of the sheet width.
const minWidth = fraction(54)

// An SVG starts as a picture (large) or as an icon of about 30 px (small).
function startWidth(illustration: Illustration) {
	const proportion = illustration.width / illustration.height
	if (illustration.size === 'large') return fraction(300)
	return Math.min(fraction(30), fraction(30) * proportion)
}

function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(value, max))
}

export function createCover(initial: {
	title: string
	dateLine: string
	sheetHeight: number
	sheetWidthCm: number
}) {
	let nextIllustrationKey = 0

	// A PNG has a fixed number of pixels: wider than this it prints below the
	// Low resolution limit. An SVG has no limit. Its width is in pixels only for a PNG.
	function maxWidthOf(illustration: Illustration) {
		if (illustration.extension !== 'png') return 1
		const sharpWidthCm = (illustration.width / lowResolutionBelow) * cmPerInch
		return Math.min(1, sharpWidthCm / initial.sheetWidthCm)
	}

	// The widest start: the most the Illustration allows, inside the sheet.
	function widestStart(illustration: Illustration) {
		const proportion = illustration.width / illustration.height
		return Math.min(maxWidthOf(illustration), initial.sheetHeight * proportion)
	}

	function newIllustration(
		illustration: Illustration,
		x: number,
		y: number,
		width: number,
	) {
		const placed: CoverIllustration = {
			key: nextIllustrationKey++,
			id: illustration.id,
			x,
			y,
			width,
			height: width * (illustration.height / illustration.width),
			maxWidth: maxWidthOf(illustration),
		}
		return placed
	}

	function placeIllustration(
		illustration: CoverIllustration,
		box: { x: number; y: number; width: number },
		proportion: number,
	) {
		const widestInSheet = Math.min(
			illustration.maxWidth,
			initial.sheetHeight * proportion,
		)
		illustration.width = clamp(box.width, minWidth, widestInSheet)
		illustration.height = illustration.width / proportion
		illustration.x = clamp(box.x, 0, 1 - illustration.width)
		illustration.y = clamp(box.y, 0, initial.sheetHeight - illustration.height)
	}

	function elementOf(id: CoverElementId) {
		if (id === 'title' || id === 'dateLine') return cover[id]
		return cover.illustrations.find(
			({ key }) => illustrationElementId(key) === id,
		)
	}

	const cover = reactive({
		title: {
			text: initial.title,
			typeface: defaultTypeface.name,
			x: fraction(48),
			y: fraction(44),
			width: fraction(444),
			height: fraction(53),
			fontSize: fraction(44),
		} as CoverText | null,
		dateLine: {
			text: initial.dateLine,
			typeface: defaultTypeface.name,
			x: fraction(48),
			y: fraction(148),
			width: fraction(444),
			height: fraction(24),
			fontSize: fraction(20),
		} as CoverText | null,
		illustrations: [
			newIllustration(
				defaultIllustration,
				fraction(120),
				fraction(220),
				fraction(300),
			),
		] as CoverIllustration[],
		colorScheme: defaultColorScheme as ColorScheme,
		selected: null as CoverElementId | null,

		elementOf,

		select(id: CoverElementId | null) {
			cover.selected = id
		},

		setColorScheme(colorScheme: ColorScheme) {
			cover.colorScheme = colorScheme
		},

		setTypeface(typefaceName: string) {
			if (cover.selected === 'title' && cover.title) {
				cover.title.typeface = typefaceName
			}
			if (cover.selected === 'dateLine' && cover.dateLine) {
				cover.dateLine.typeface = typefaceName
			}
		},

		// The new Illustration goes to the center, on top of the others.
		addIllustration(illustration: Illustration) {
			const width =
				illustration.extension === 'png'
					? widestStart(illustration)
					: startWidth(illustration)
			const height = width * (illustration.height / illustration.width)
			const added = newIllustration(
				illustration,
				(1 - width) / 2,
				(initial.sheetHeight - height) / 2,
				width,
			)
			cover.illustrations.push(added)
			cover.selected = illustrationElementId(added.key)
		},

		setText(id: 'title' | 'dateLine', text: string) {
			// An empty text would collapse to no height and could not be selected again.
			const element = cover[id]
			if (element && text.trim() !== '') element.text = text
		},

		setTextHeight(id: 'title' | 'dateLine', height: number) {
			const text = cover[id]
			if (text) text.height = height
		},

		moveTo(id: CoverElementId, position: Point) {
			const element = elementOf(id)
			if (!element) return
			element.x = clamp(position.x, 0, 1 - element.width)
			element.y = clamp(position.y, 0, initial.sheetHeight - element.height)
		},

		// The height follows the width: the Illustration keeps its proportion.
		scaleIllustration(
			key: number,
			box: { x: number; y: number; width: number },
		) {
			const illustration = cover.illustrations.find(
				(candidate) => candidate.key === key,
			)
			if (!illustration) return
			placeIllustration(
				illustration,
				box,
				illustration.width / illustration.height,
			)
		},

		// A corner Handle: the letters grow with the width and so does the height,
		// until the view measures it again.
		scaleText(
			id: 'title' | 'dateLine',
			box: { x: number; y: number; width: number },
		) {
			const text = cover[id]
			if (!text) return
			const width = clamp(box.width, minWidth, 1)
			const ratio = width / text.width
			text.fontSize *= ratio
			text.height *= ratio
			text.width = width
			text.x = clamp(box.x, 0, 1 - width)
			text.y = clamp(box.y, 0, initial.sheetHeight - text.height)
		},

		// A side Handle: the text wraps again, so the view measures the height.
		resizeTextWidth(
			id: 'title' | 'dateLine',
			box: { x: number; width: number },
		) {
			const text = cover[id]
			if (!text) return
			text.width = clamp(box.width, minWidth, 1)
			text.x = clamp(box.x, 0, 1 - text.width)
		},

		deleteSelected() {
			const { selected } = cover
			if (selected === 'title' || selected === 'dateLine') {
				cover[selected] = null
				cover.selected = null
			} else if (selected !== null) {
				cover.illustrations = cover.illustrations.filter(
					({ key }) => illustrationElementId(key) !== selected,
				)
				cover.selected = null
			}
		},
	})
	return cover
}
