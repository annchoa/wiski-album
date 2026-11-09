import { describe, expect, it } from 'vitest'
import { slotRects } from '@/lib/slotRects'

const square = { width: 20, height: 20 }

describe('slotRects', () => {
	it('gives a single full-bleed slot the whole page', () => {
		expect(slotRects('single', 'full-bleed', square)).toEqual([
			{ x: 0, y: 0, width: 20, height: 20 },
		])
	})

	// Framed: the editor draws a 32 px margin on a 540 px high page, so 20 cm
	// high is 32 * 20 / 540 = 1.185 cm.
	it('leaves a margin around a single framed slot, in proportion to the page height', () => {
		const [slot] = slotRects('single', 'framed', square)

		expect(slot?.x).toBeCloseTo(1.185, 3)
		expect(slot?.y).toBeCloseTo(1.185, 3)
		expect(slot?.width).toBeCloseTo(17.63, 2)
		expect(slot?.height).toBeCloseTo(17.63, 2)
	})

	it('splits a stacked full-bleed page into a top and a bottom slot', () => {
		expect(slotRects('stacked', 'full-bleed', square)).toEqual([
			{ x: 0, y: 0, width: 20, height: 10 },
			{ x: 0, y: 10, width: 20, height: 10 },
		])
	})

	it('splits a side-by-side full-bleed page into a left and a right slot', () => {
		expect(slotRects('side-by-side', 'full-bleed', square)).toEqual([
			{ x: 0, y: 0, width: 10, height: 20 },
			{ x: 10, y: 0, width: 10, height: 20 },
		])
	})

	// Gap: 16 * 20 / 540 = 0.593 cm. Free height: 20 - 2 * 1.185 = 17.63 cm,
	// minus the gap and halved: 8.519 cm for each slot.
	it('puts a gap between framed slots', () => {
		const [top, bottom] = slotRects('stacked', 'framed', square)

		expect(top?.height).toBeCloseTo(8.519, 3)
		expect(bottom?.y).toBeCloseTo(10.296, 3)
		expect(bottom?.height).toBeCloseTo(8.519, 3)
	})

	it('splits a grid-of-four full-bleed page into four equal slots', () => {
		expect(slotRects('grid-of-four', 'full-bleed', square)).toEqual([
			{ x: 0, y: 0, width: 10, height: 10 },
			{ x: 10, y: 0, width: 10, height: 10 },
			{ x: 0, y: 10, width: 10, height: 10 },
			{ x: 10, y: 10, width: 10, height: 10 },
		])
	})

	// Rows are 24fr and 14fr of 20 cm: 12.632 cm and 7.368 cm.
	it('lets the large slot span both columns above two small slots', () => {
		const [large, left, right] = slotRects(
			'large-and-two-small',
			'full-bleed',
			square,
		)

		expect(large).toEqual({
			x: 0,
			y: 0,
			width: 20,
			height: expect.closeTo(12.632, 3),
		})
		expect(left?.y).toBeCloseTo(12.632, 3)
		expect(left?.width).toBe(10)
		expect(left?.height).toBeCloseTo(7.368, 3)
		expect(right?.x).toBe(10)
		expect(right?.y).toBeCloseTo(12.632, 3)
	})
})
