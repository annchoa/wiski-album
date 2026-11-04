import { reactive } from 'vue'
import type { Product } from './products'
import { defaultTemplateId, templates } from './templates'

export interface Photo {
	id: number
	name: string
	url: string
	width: number
	height: number
}

export interface Page {
	templateId: string
	slots: (Photo | null)[]
}

export type Orientation = 'vertical' | 'horizontal'

function orientationOf(photo: Photo): Orientation {
	return photo.height > photo.width ? 'vertical' : 'horizontal'
}

export interface SlotAddress {
	page: number
	slot: number
}

export type DragSource =
	| { kind: 'asset-panel'; photoId: number }
	| { kind: 'slot'; address: SlotAddress }

export type DropTarget =
	| { kind: 'slot'; address: SlotAddress }
	| { kind: 'asset-panel' }
	| { kind: 'trash' }

function emptyPage(): Page {
	const template = templates.find(({ id }) => id === defaultTemplateId)
	const slotCount = template?.slotCount ?? 1
	return { templateId: defaultTemplateId, slots: Array(slotCount).fill(null) }
}

function emptyPages(product: Product): Page[] {
	return Array.from({ length: product.pages }, emptyPage)
}

export function createWorksheet(initialProduct: Product) {
	const state = reactive({
		product: initialProduct,
		currentPage: 0,
		sort: null as Orientation | null,
		assetPanel: [] as Photo[],
		pages: emptyPages(initialProduct),
	})

	return Object.assign(state, {
		upload(photo: Photo) {
			state.assetPanel.push(photo)
		},
		previousPage() {
			state.currentPage = Math.max(0, state.currentPage - 1)
		},
		nextPage() {
			state.currentPage = Math.min(
				state.pages.length - 1,
				state.currentPage + 1,
			)
		},
		toggleSort(orientation: Orientation) {
			state.sort = state.sort === orientation ? null : orientation
		},
		sortedAssetPanel() {
			const first = state.sort
			if (!first) return [...state.assetPanel]
			return [
				...state.assetPanel.filter((photo) => orientationOf(photo) === first),
				...state.assetPanel.filter((photo) => orientationOf(photo) !== first),
			]
		},
		changeProduct(product: Product) {
			const placed = state.pages.flatMap(({ slots }) =>
				slots.filter((photo) => photo !== null),
			)
			state.assetPanel.push(...placed)
			state.pages.splice(0, state.pages.length, ...emptyPages(product))
			state.product = product
			state.currentPage = 0
		},
		changeTemplate(pageIndex: number, templateId: string) {
			const page = state.pages[pageIndex]
			const template = templates.find(({ id }) => id === templateId)
			if (!page || !template) return
			const photos = page.slots.filter((photo) => photo !== null)
			const kept = photos.slice(0, template.slotCount)
			state.assetPanel.push(...photos.slice(template.slotCount))
			page.templateId = templateId
			page.slots = Array.from(
				{ length: template.slotCount },
				(_, index) => kept[index] ?? null,
			)
		},
		move(from: SlotAddress, to: SlotAddress) {
			const fromPage = state.pages[from.page]
			const toPage = state.pages[to.page]
			if (!fromPage || !toPage) return
			const moved = fromPage.slots[from.slot] ?? null
			fromPage.slots[from.slot] = toPage.slots[to.slot] ?? null
			toPage.slots[to.slot] = moved
		},
		returnToAssetPanel(address: SlotAddress) {
			const page = state.pages[address.page]
			const photo = page?.slots[address.slot]
			if (!page || !photo) return
			state.assetPanel.push(photo)
			page.slots[address.slot] = null
		},
		trash(photoId: number) {
			const photoIndex = state.assetPanel.findIndex(({ id }) => id === photoId)
			if (photoIndex >= 0) state.assetPanel.splice(photoIndex, 1)
		},
		drop(source: DragSource, target: DropTarget) {
			if (source.kind === 'asset-panel' && target.kind === 'slot') {
				this.place(source.photoId, target.address)
			}
			if (source.kind === 'slot' && target.kind === 'slot') {
				this.move(source.address, target.address)
			}
			if (source.kind === 'slot' && target.kind !== 'slot') {
				this.returnToAssetPanel(source.address)
			}
			if (source.kind === 'asset-panel' && target.kind === 'trash') {
				this.trash(source.photoId)
			}
		},
		place(photoId: number, address: SlotAddress) {
			const photoIndex = state.assetPanel.findIndex(({ id }) => id === photoId)
			const photo = state.assetPanel[photoIndex]
			const page = state.pages[address.page]
			if (!photo || !page) return
			state.assetPanel.splice(photoIndex, 1)
			const replaced = page.slots[address.slot]
			if (replaced) state.assetPanel.push(replaced)
			page.slots[address.slot] = photo
		},
	})
}
