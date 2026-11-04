import { describe, expect, it } from 'vitest'
import { distributeInColumns } from '../lib/masonry'
import type { Photo } from '../lib/worksheet'

function aPhoto(id: number, width: number, height: number): Photo {
	return { id, name: `photo-${id}.jpg`, url: `blob:photo-${id}`, width, height }
}

function ids(columns: Photo[][]) {
	return columns.map((column) => column.map(({ id }) => id))
}

describe('distributeInColumns', () => {
	it('fills the columns from left to right when the photos are the same height', () => {
		const photos = [1, 2, 3].map((id) => aPhoto(id, 300, 400))

		expect(ids(distributeInColumns(photos, 3))).toEqual([[1], [2], [3]])
	})

	it('puts the next photo in the shortest column', () => {
		const tall = aPhoto(1, 300, 600)
		const square = (id: number) => aPhoto(id, 300, 300)

		const columns = distributeInColumns(
			[tall, square(2), square(3), square(4)],
			3,
		)

		expect(ids(columns)).toEqual([[1], [2, 4], [3]])
	})

	it('keeps the upload order inside each column', () => {
		const photos = [1, 2, 3, 4, 5, 6].map((id) => aPhoto(id, 300, 400))

		expect(ids(distributeInColumns(photos, 3))).toEqual([
			[1, 4],
			[2, 5],
			[3, 6],
		])
	})

	it('returns empty columns when there are no photos', () => {
		expect(distributeInColumns([], 3)).toEqual([[], [], []])
	})
})
