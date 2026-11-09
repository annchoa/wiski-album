import { describe, expect, it } from 'vitest'
import { facingPages } from '@/lib/facingPages'

describe('facingPages', () => {
	it('shows nothing when there are no pages', () => {
		expect(facingPages(0)).toEqual([])
	})

	it('shows the first page alone on the right', () => {
		expect(facingPages(1)).toEqual([{ left: null, right: 0 }])
	})

	it('pairs the pages after the first one: 2 and 3, 4 and 5', () => {
		expect(facingPages(5)).toEqual([
			{ left: null, right: 0 },
			{ left: 1, right: 2 },
			{ left: 3, right: 4 },
		])
	})

	it('shows an even last page alone on the left', () => {
		expect(facingPages(4)).toEqual([
			{ left: null, right: 0 },
			{ left: 1, right: 2 },
			{ left: 3, right: null },
		])
	})
})
