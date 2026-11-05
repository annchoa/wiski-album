import { describe, expect, it } from 'vitest'
import { products } from '../lib/products'
import { createWorksheet, type Photo } from '../lib/worksheet'

function momentProduct() {
	const product = products.find(({ id }) => id === 'moment')
	if (!product) throw new Error('moment product is missing')
	return product
}

function routeProduct() {
	const product = products.find(({ id }) => id === 'route')
	if (!product) throw new Error('route product is missing')
	return product
}

function aPhoto(id: number): Photo {
	return {
		id,
		name: `photo-${id}.jpg`,
		url: `blob:photo-${id}`,
		width: 4000,
		height: 3000,
	}
}

describe('Worksheet model', () => {
	it('puts a zoomed and moved photo back in the center without zoom and keeps it in its slot', () => {
		const worksheet = createWorksheet(momentProduct())
		const photo = aPhoto(1)
		worksheet.upload(photo)
		worksheet.place(photo.id, { page: 0, slot: 0 })
		worksheet.setZoom({ page: 0, slot: 0 }, 2)
		worksheet.setPosition({ page: 0, slot: 0 }, { x: 0.1, y: 0.9 })

		worksheet.resetSlotView({ page: 0, slot: 0 })

		expect(worksheet.slotView({ page: 0, slot: 0 })).toEqual({
			position: { x: 0.5, y: 0.5 },
			zoom: 1,
		})
		expect(worksheet.pages[0]?.slots[0]).toEqual(photo)
	})

	it('starts centered and without zoom when a photo is placed again after the product changes', () => {
		const worksheet = createWorksheet(momentProduct())
		const photo = aPhoto(1)
		worksheet.upload(photo)
		worksheet.place(photo.id, { page: 0, slot: 0 })
		worksheet.setZoom({ page: 0, slot: 0 }, 2)

		worksheet.changeProduct(routeProduct())
		worksheet.place(photo.id, { page: 0, slot: 0 })

		expect(worksheet.slotView({ page: 0, slot: 0 })).toEqual({
			position: { x: 0.5, y: 0.5 },
			zoom: 1,
		})
	})

	it('recenters and removes the zoom of every photo on the page when its template changes', () => {
		const worksheet = createWorksheet(momentProduct())
		const photo = aPhoto(1)
		worksheet.upload(photo)
		worksheet.place(photo.id, { page: 0, slot: 0 })
		worksheet.setZoom({ page: 0, slot: 0 }, 2)
		worksheet.setPosition({ page: 0, slot: 0 }, { x: 0.1, y: 0.9 })

		worksheet.changeTemplate(0, 'side-by-side')

		expect(worksheet.slotView({ page: 0, slot: 0 })).toEqual({
			position: { x: 0.5, y: 0.5 },
			zoom: 1,
		})
	})

	it('starts centered and without zoom when a photo replaced by another is placed again', () => {
		const worksheet = createWorksheet(momentProduct())
		const replaced = aPhoto(1)
		const replacing = aPhoto(2)
		worksheet.upload(replaced)
		worksheet.upload(replacing)
		worksheet.place(replaced.id, { page: 0, slot: 0 })
		worksheet.setZoom({ page: 0, slot: 0 }, 2)
		worksheet.place(replacing.id, { page: 0, slot: 0 })

		worksheet.place(replaced.id, { page: 0, slot: 1 })

		expect(worksheet.slotView({ page: 0, slot: 1 })).toEqual({
			position: { x: 0.5, y: 0.5 },
			zoom: 1,
		})
	})

	it('starts centered and without zoom when a photo returned to the asset panel is placed again', () => {
		const worksheet = createWorksheet(momentProduct())
		const photo = aPhoto(1)
		worksheet.upload(photo)
		worksheet.place(photo.id, { page: 0, slot: 0 })
		worksheet.setZoom({ page: 0, slot: 0 }, 2)
		worksheet.setPosition({ page: 0, slot: 0 }, { x: 0.1, y: 0.9 })

		worksheet.returnToAssetPanel({ page: 0, slot: 0 })
		worksheet.place(photo.id, { page: 0, slot: 0 })

		expect(worksheet.slotView({ page: 0, slot: 0 })).toEqual({
			position: { x: 0.5, y: 0.5 },
			zoom: 1,
		})
	})

	it('keeps each photo position and zoom when two slots swap their photos', () => {
		const worksheet = createWorksheet(momentProduct())
		const first = aPhoto(1)
		const second = aPhoto(2)
		worksheet.upload(first)
		worksheet.upload(second)
		worksheet.place(first.id, { page: 0, slot: 0 })
		worksheet.place(second.id, { page: 0, slot: 1 })
		worksheet.setZoom({ page: 0, slot: 0 }, 2)
		worksheet.setPosition({ page: 0, slot: 1 }, { x: 0.1, y: 0.9 })

		worksheet.move({ page: 0, slot: 0 }, { page: 0, slot: 1 })

		expect(worksheet.slotView({ page: 0, slot: 1 })).toEqual({
			position: { x: 0.5, y: 0.5 },
			zoom: 2,
		})
		expect(worksheet.slotView({ page: 0, slot: 0 })).toEqual({
			position: { x: 0.1, y: 0.9 },
			zoom: 1,
		})
	})

	it('stops the photo at the edges of the slot so no empty strip shows', () => {
		const worksheet = createWorksheet(momentProduct())
		const photo = aPhoto(1)
		worksheet.upload(photo)
		worksheet.place(photo.id, { page: 0, slot: 0 })

		worksheet.setPosition({ page: 0, slot: 0 }, { x: -0.3, y: 1.4 })

		expect(worksheet.slotView({ page: 0, slot: 0 }).position).toEqual({
			x: 0,
			y: 1,
		})
	})

	it('moves the photo in a slot without changing its zoom', () => {
		const worksheet = createWorksheet(momentProduct())
		const photo = aPhoto(1)
		worksheet.upload(photo)
		worksheet.place(photo.id, { page: 0, slot: 0 })
		worksheet.setZoom({ page: 0, slot: 0 }, 2)

		worksheet.setPosition({ page: 0, slot: 0 }, { x: 0.2, y: 0.8 })

		expect(worksheet.slotView({ page: 0, slot: 0 })).toEqual({
			position: { x: 0.2, y: 0.8 },
			zoom: 2,
		})
	})

	it('keeps the photo covering the slot by never zooming out below the minimum', () => {
		const worksheet = createWorksheet(momentProduct())
		const photo = aPhoto(1)
		worksheet.upload(photo)
		worksheet.place(photo.id, { page: 0, slot: 0 })

		worksheet.setZoom({ page: 0, slot: 0 }, 0.5)

		expect(worksheet.slotView({ page: 0, slot: 0 }).zoom).toBe(1)
	})

	it('caps the zoom at three times the minimum', () => {
		const worksheet = createWorksheet(momentProduct())
		const photo = aPhoto(1)
		worksheet.upload(photo)
		worksheet.place(photo.id, { page: 0, slot: 0 })

		worksheet.setZoom({ page: 0, slot: 0 }, 5)

		expect(worksheet.slotView({ page: 0, slot: 0 }).zoom).toBe(3)
	})

	it('zooms the photo in a slot without moving it', () => {
		const worksheet = createWorksheet(momentProduct())
		const photo = aPhoto(1)
		worksheet.upload(photo)
		worksheet.place(photo.id, { page: 0, slot: 0 })

		worksheet.setZoom({ page: 0, slot: 0 }, 2)

		expect(worksheet.slotView({ page: 0, slot: 0 })).toEqual({
			position: { x: 0.5, y: 0.5 },
			zoom: 2,
		})
	})

	it('centers a photo and shows it without zoom when it lands on a slot', () => {
		const worksheet = createWorksheet(momentProduct())
		const photo = aPhoto(1)
		worksheet.upload(photo)

		worksheet.place(photo.id, { page: 0, slot: 0 })

		expect(worksheet.slotView({ page: 0, slot: 0 })).toEqual({
			position: { x: 0.5, y: 0.5 },
			zoom: 1,
		})
	})

	it('leaves everything as it was when the photo to place is not in the asset panel', () => {
		const worksheet = createWorksheet(momentProduct())
		const photo = aPhoto(1)
		worksheet.upload(photo)

		worksheet.place(99, { page: 0, slot: 0 })

		expect(worksheet.assetPanel).toEqual([photo])
		expect(worksheet.pages[0]?.slots[0]).toBeNull()
	})

	it('sends the previous photo back to the asset panel when a photo lands on a filled slot', () => {
		const worksheet = createWorksheet(momentProduct())
		const previous = aPhoto(1)
		const next = aPhoto(2)
		worksheet.upload(previous)
		worksheet.upload(next)
		worksheet.place(previous.id, { page: 0, slot: 0 })

		worksheet.place(next.id, { page: 0, slot: 0 })

		expect(worksheet.pages[0]?.slots[0]).toEqual(next)
		expect(worksheet.assetPanel).toEqual([previous])
	})

	it('keeps photos already placed on pages when the same photo is trashed from the asset panel', () => {
		const worksheet = createWorksheet(momentProduct())
		const placed = aPhoto(1)
		const sameFileUploadedAgain = aPhoto(2)
		worksheet.upload(placed)
		worksheet.place(placed.id, { page: 0, slot: 0 })
		worksheet.upload(sameFileUploadedAgain)

		worksheet.trash(sameFileUploadedAgain.id)

		expect(worksheet.pages[0]?.slots[0]).toEqual(placed)
		expect(worksheet.assetPanel).toEqual([])
	})

	it('keeps photo order and returns the extra photos to the asset panel when the new template has fewer slots', () => {
		const worksheet = createWorksheet(momentProduct())
		const first = aPhoto(1)
		const second = aPhoto(2)
		worksheet.changeTemplate(0, 'stacked')
		worksheet.upload(first)
		worksheet.upload(second)
		worksheet.place(first.id, { page: 0, slot: 0 })
		worksheet.place(second.id, { page: 0, slot: 1 })

		worksheet.changeTemplate(0, 'full-bleed')

		expect(worksheet.pages[0]?.slots).toEqual([first])
		expect(worksheet.assetPanel).toEqual([second])
	})

	it('keeps photo order and leaves new slots empty when the new template has more slots', () => {
		const worksheet = createWorksheet(momentProduct())
		const first = aPhoto(1)
		const second = aPhoto(2)
		worksheet.changeTemplate(0, 'stacked')
		worksheet.upload(first)
		worksheet.upload(second)
		worksheet.place(first.id, { page: 0, slot: 0 })
		worksheet.place(second.id, { page: 0, slot: 1 })

		worksheet.changeTemplate(0, 'grid-of-four')

		expect(worksheet.pages[0]?.slots).toEqual([first, second, null, null])
	})

	it('resets the pages and keeps every uploaded photo when the product changes', () => {
		const worksheet = createWorksheet(momentProduct())
		const placed = aPhoto(1)
		const waiting = aPhoto(2)
		worksheet.upload(placed)
		worksheet.upload(waiting)
		worksheet.place(placed.id, { page: 0, slot: 0 })

		worksheet.changeProduct(routeProduct())

		expect(worksheet.product.id).toBe('route')
		expect(worksheet.pages).toHaveLength(20)
		expect(
			worksheet.pages.every(({ slots }) =>
				slots.every((slot) => slot === null),
			),
		).toBe(true)
		expect(worksheet.assetPanel).toEqual([waiting, placed])
	})

	it('lists vertical photos first, or horizontal ones first, and goes back to upload order when the active sort is toggled off', () => {
		const worksheet = createWorksheet(momentProduct())
		const horizontal = { ...aPhoto(1), width: 4000, height: 3000 }
		const vertical = { ...aPhoto(2), width: 3000, height: 4000 }
		const anotherHorizontal = { ...aPhoto(3), width: 5000, height: 2000 }
		worksheet.upload(horizontal)
		worksheet.upload(vertical)
		worksheet.upload(anotherHorizontal)

		worksheet.toggleSort('vertical')
		expect(worksheet.sortedAssetPanel()).toEqual([
			vertical,
			horizontal,
			anotherHorizontal,
		])

		worksheet.toggleSort('horizontal')
		expect(worksheet.sortedAssetPanel()).toEqual([
			horizontal,
			anotherHorizontal,
			vertical,
		])

		worksheet.toggleSort('horizontal')
		expect(worksheet.sortedAssetPanel()).toEqual([
			horizontal,
			vertical,
			anotherHorizontal,
		])
	})

	it('moves between pages and stops at the first and last one', () => {
		const worksheet = createWorksheet(routeProduct())

		worksheet.previousPage()
		expect(worksheet.currentPage).toBe(0)

		worksheet.nextPage()
		expect(worksheet.currentPage).toBe(1)

		for (let step = 0; step < 30; step++) worksheet.nextPage()
		expect(worksheet.currentPage).toBe(19)
	})

	it('goes back to the first page when the product changes', () => {
		const worksheet = createWorksheet(momentProduct())
		worksheet.nextPage()

		worksheet.changeProduct(routeProduct())

		expect(worksheet.currentPage).toBe(0)
	})

	it('lists every uploaded photo it still holds, in the asset panel or placed on a page', () => {
		const worksheet = createWorksheet(momentProduct())
		const inPanel = aPhoto(1)
		const placed = aPhoto(2)
		const deleted = aPhoto(3)
		worksheet.upload(inPanel)
		worksheet.upload(placed)
		worksheet.upload(deleted)
		worksheet.place(placed.id, { page: 0, slot: 0 })
		worksheet.trash(deleted.id)

		expect(worksheet.photos()).toEqual([inPanel, placed])
	})

	describe('drop', () => {
		it('places a photo dragged from the asset panel onto a slot', () => {
			const worksheet = createWorksheet(momentProduct())
			const photo = aPhoto(1)
			worksheet.upload(photo)

			worksheet.drop(
				{ kind: 'asset-panel', photoId: 1 },
				{ kind: 'slot', address: { page: 0, slot: 0 } },
			)

			expect(worksheet.assetPanel).toEqual([])
			expect(worksheet.pages[0]?.slots[0]).toEqual(photo)
		})

		it('moves a photo between slots, swapping with the one already there', () => {
			const worksheet = createWorksheet(momentProduct())
			worksheet.upload(aPhoto(1))
			worksheet.upload(aPhoto(2))
			worksheet.place(1, { page: 0, slot: 0 })
			worksheet.place(2, { page: 0, slot: 1 })

			worksheet.drop(
				{ kind: 'slot', address: { page: 0, slot: 0 } },
				{ kind: 'slot', address: { page: 0, slot: 1 } },
			)

			expect(worksheet.pages[0]?.slots[0]?.id).toBe(2)
			expect(worksheet.pages[0]?.slots[1]?.id).toBe(1)
		})

		it('returns a slot photo to the asset panel when dropped on it', () => {
			const worksheet = createWorksheet(momentProduct())
			worksheet.upload(aPhoto(1))
			worksheet.place(1, { page: 0, slot: 0 })

			worksheet.drop(
				{ kind: 'slot', address: { page: 0, slot: 0 } },
				{ kind: 'asset-panel' },
			)

			expect(worksheet.assetPanel.map(({ id }) => id)).toEqual([1])
			expect(worksheet.pages[0]?.slots[0]).toBeNull()
		})

		it('deletes a photo dropped on the trash from the asset panel', () => {
			const worksheet = createWorksheet(momentProduct())
			const kept = aPhoto(1)
			worksheet.upload(kept)
			worksheet.upload(aPhoto(2))

			worksheet.drop({ kind: 'asset-panel', photoId: 2 }, { kind: 'trash' })

			expect(worksheet.assetPanel).toEqual([kept])
		})

		it('hands back the photo it deleted so the caller can release it', () => {
			const worksheet = createWorksheet(momentProduct())
			const photo = aPhoto(1)
			worksheet.upload(photo)

			const deleted = worksheet.drop(
				{ kind: 'asset-panel', photoId: 1 },
				{ kind: 'trash' },
			)

			expect(deleted).toEqual(photo)
		})

		it('hands back nothing when the drop deletes no photo', () => {
			const worksheet = createWorksheet(momentProduct())
			worksheet.upload(aPhoto(1))

			const deleted = worksheet.drop(
				{ kind: 'asset-panel', photoId: 1 },
				{ kind: 'slot', address: { page: 0, slot: 0 } },
			)

			expect(deleted).toBeUndefined()
		})

		it('keeps a slot photo in the asset panel when dropped on the trash', () => {
			const worksheet = createWorksheet(momentProduct())
			worksheet.upload(aPhoto(1))
			worksheet.place(1, { page: 0, slot: 0 })

			worksheet.drop(
				{ kind: 'slot', address: { page: 0, slot: 0 } },
				{ kind: 'trash' },
			)

			expect(worksheet.assetPanel.map(({ id }) => id)).toEqual([1])
			expect(worksheet.pages[0]?.slots[0]).toBeNull()
		})
	})
})
