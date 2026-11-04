// Tailwind scans this file, so every class is written out in full.
const grids: Record<string, string> = {
	'full-bleed': 'grid-cols-1 grid-rows-1',
	framed: 'grid-cols-1 grid-rows-1',
	stacked: 'grid-cols-1 grid-rows-2',
	'side-by-side': 'grid-cols-2 grid-rows-1',
	'large-and-two-small':
		'grid-cols-2 grid-rows-[24fr_14fr] [&>:first-child]:col-span-2',
	'grid-of-four': 'grid-cols-2 grid-rows-2',
}

const pageSpacing = 'gap-4 p-8'
const thumbSpacing = 'gap-0.5 p-[5px]'

function spacing(templateId: string, framed: string) {
	return templateId === 'full-bleed' ? 'gap-0 p-0' : framed
}

export function slotsOnPage(templateId: string) {
	return `${grids[templateId]} ${spacing(templateId, pageSpacing)}`
}

export function slotsInThumbnail(templateId: string) {
	return `${grids[templateId]} ${spacing(templateId, thumbSpacing)}`
}
