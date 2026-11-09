import type { Size } from './geometry'
import type { Margins } from './worksheet'

export interface Rect {
	x: number
	y: number
	width: number
	height: number
}

// The editor draws a 540 px high page with a 32 px margin and a 16 px gap
// between slots; the PDF keeps the same proportions at the product's size.
const editorPageHeightPx = 540
const editorMarginPx = 32
const editorGapPx = 16

function marginCm(margins: Margins, pageCm: Size) {
	if (margins === 'full-bleed') return 0
	return (editorMarginPx * pageCm.height) / editorPageHeightPx
}

// Tracks are fractions of the free space, like CSS `fr`.
interface Grid {
	columns: number[]
	rows: number[]
	// The first slot covers every column of the first row.
	firstSlotSpansColumns?: boolean
}

const grids: Record<string, Grid> = {
	single: { columns: [1], rows: [1] },
	stacked: { columns: [1], rows: [1, 1] },
	'side-by-side': { columns: [1, 1], rows: [1] },
	'large-and-two-small': {
		columns: [1, 1],
		rows: [24, 14],
		firstSlotSpansColumns: true,
	},
	'grid-of-four': { columns: [1, 1], rows: [1, 1] },
}

function gapCm(margins: Margins, pageCm: Size) {
	if (margins === 'full-bleed') return 0
	return (editorGapPx * pageCm.height) / editorPageHeightPx
}

function trackStarts(tracks: number[], total: number, gap: number) {
	const frTotal = tracks.reduce((sum, fr) => sum + fr, 0)
	const free = total - gap * (tracks.length - 1)
	let start = 0
	return tracks.map((fr) => {
		const size = (free * fr) / frTotal
		const track = { start, size }
		start += size + gap
		return track
	})
}

export function slotRects(
	templateId: string,
	margins: Margins,
	pageCm: Size,
): Rect[] {
	const margin = marginCm(margins, pageCm)
	const grid = grids[templateId]
	if (!grid) throw new Error(`Unknown template: ${templateId}`)
	const gap = gapCm(margins, pageCm)
	const columns = trackStarts(grid.columns, pageCm.width - 2 * margin, gap)
	const rows = trackStarts(grid.rows, pageCm.height - 2 * margin, gap)
	return rows.flatMap((row, rowIndex) => {
		const cells = columns.map((column) => ({
			x: margin + column.start,
			y: margin + row.start,
			width: column.size,
			height: row.size,
		}))
		if (!grid.firstSlotSpansColumns || rowIndex > 0) return cells
		return [
			{
				x: margin,
				y: margin + row.start,
				width: pageCm.width - 2 * margin,
				height: row.size,
			},
		]
	})
}
