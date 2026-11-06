import type { Margins } from '@/lib/worksheet'

// Tailwind scans this file, so every class is written out in full.
const grids: Record<string, string> = {
	single: 'grid-cols-1 grid-rows-1',
	stacked: 'grid-cols-1 grid-rows-2',
	'side-by-side': 'grid-cols-2 grid-rows-1',
	'large-and-two-small':
		'grid-cols-2 grid-rows-[24fr_14fr] [&>:first-child]:col-span-2',
	'grid-of-four': 'grid-cols-2 grid-rows-2',
}

const pageSpacing = 'gap-4 p-8'
const thumbSpacing = 'gap-0.5 p-[5px]'
const quickPreviewSpacing = 'gap-0.5 p-[3px]'

function spacing(margins: Margins, framed: string) {
	return margins === 'full-bleed' ? 'gap-0 p-0' : framed
}

export function slotsOnPage(templateId: string, margins: Margins) {
	return `${grids[templateId]} ${spacing(margins, pageSpacing)}`
}

export function slotsInQuickPreview(templateId: string, margins: Margins) {
	return `${grids[templateId]} ${spacing(margins, quickPreviewSpacing)}`
}

export function slotsInThumbnail(templateId: string, margins: Margins) {
	return `${grids[templateId]} ${spacing(margins, thumbSpacing)}`
}
