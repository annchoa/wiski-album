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
	it('moves a photo from the asset panel to an empty slot', () => {
		const worksheet = createWorksheet(momentProduct())
		const photo = aPhoto(1)
		worksheet.upload(photo)

		worksheet.place(photo.id, { page: 0, slot: 0 })

		expect(worksheet.assetPanel).toEqual([])
		expect(worksheet.pages[0]?.slots[0]).toEqual(photo)
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

	it('swaps two photos dragged between filled slots', () => {
		const worksheet = createWorksheet(momentProduct())
		const first = aPhoto(1)
		const second = aPhoto(2)
		worksheet.changeTemplate(0, 'stacked')
		worksheet.upload(first)
		worksheet.upload(second)
		worksheet.place(first.id, { page: 0, slot: 0 })
		worksheet.place(second.id, { page: 0, slot: 1 })

		worksheet.move({ page: 0, slot: 0 }, { page: 0, slot: 1 })

		expect(worksheet.pages[0]?.slots).toEqual([second, first])
	})

	it('returns a placed photo to the asset panel', () => {
		const worksheet = createWorksheet(momentProduct())
		const photo = aPhoto(1)
		worksheet.upload(photo)
		worksheet.place(photo.id, { page: 0, slot: 0 })

		worksheet.returnToAssetPanel({ page: 0, slot: 0 })

		expect(worksheet.pages[0]?.slots[0]).toBeNull()
		expect(worksheet.assetPanel).toEqual([photo])
	})

	it('deletes a photo dropped on the trash', () => {
		const worksheet = createWorksheet(momentProduct())
		const kept = aPhoto(1)
		const deleted = aPhoto(2)
		worksheet.upload(kept)
		worksheet.upload(deleted)

		worksheet.trash(deleted.id)

		expect(worksheet.assetPanel).toEqual([kept])
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
			worksheet.upload(aPhoto(1))

			worksheet.drop({ kind: 'asset-panel', photoId: 1 }, { kind: 'trash' })

			expect(worksheet.assetPanel).toEqual([])
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
