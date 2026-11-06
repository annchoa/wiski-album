export interface Template {
	id: string
	slotCount: number
}

export const templates: Template[] = [
	{ id: 'single', slotCount: 1 },
	{ id: 'stacked', slotCount: 2 },
	{ id: 'side-by-side', slotCount: 2 },
	{ id: 'large-and-two-small', slotCount: 3 },
	{ id: 'grid-of-four', slotCount: 4 },
]

export const defaultTemplateId = 'single'
