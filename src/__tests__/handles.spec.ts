import { describe, expect, it } from 'vitest'
import { dragHandle } from '../lib/handles'

// Every number is a fraction of the sheet width.
const box = { x: 0.1, y: 0.1, width: 0.4, height: 0.2 }

describe('Dragging a Handle', () => {
	it('grows the box from a corner, keeps its proportion and fixes the opposite corner', () => {
		const grown = dragHandle(box, 'se', { x: 0.1, y: 0.1 })

		// The vertical drag is the bigger one: 0.2 → 0.3 is 1.5 times.
		expect(grown.width).toBeCloseTo(0.6)
		expect(grown.height).toBeCloseTo(0.3)
		expect(grown.x).toBeCloseTo(0.1)
		expect(grown.y).toBeCloseTo(0.1)

		const grownFromNorthWest = dragHandle(box, 'nw', { x: -0.1, y: -0.1 })

		expect(grownFromNorthWest.width).toBeCloseTo(0.6)
		expect(grownFromNorthWest.height).toBeCloseTo(0.3)
		// The south-east corner stays at (0.5, 0.3).
		expect(grownFromNorthWest.x).toBeCloseTo(-0.1)
		expect(grownFromNorthWest.y).toBeCloseTo(0)
	})

	it('shrinks the box from a corner', () => {
		const shrunk = dragHandle(box, 'se', { x: -0.2, y: -0.05 })

		// The horizontal drag is the bigger one: 0.4 → 0.2 is half.
		expect(shrunk.width).toBeCloseTo(0.2)
		expect(shrunk.height).toBeCloseTo(0.1)
	})

	it('changes only the width from a side Handle and fixes the opposite side', () => {
		const wider = dragHandle(box, 'e', { x: 0.1, y: 0.3 })

		expect(wider).toEqual({ x: 0.1, y: 0.1, width: 0.5, height: 0.2 })

		const narrower = dragHandle(box, 'w', { x: 0.1, y: 0.3 })

		// The right edge stays at 0.5.
		expect(narrower.x).toBeCloseTo(0.2)
		expect(narrower.width).toBeCloseTo(0.3)
		expect(narrower.height).toBe(0.2)
	})

	it('leaves the box as it is when a text is dragged from the top or bottom side', () => {
		expect(dragHandle(box, 'n', { x: 0.3, y: 0.3 })).toEqual(box)
		expect(dragHandle(box, 's', { x: 0.3, y: 0.3 })).toEqual(box)
	})

	it('keeps the proportion from a side Handle when the proportion is locked', () => {
		const scaled = dragHandle(
			box,
			'e',
			{ x: 0.1, y: 0 },
			{ lockProportion: true },
		)

		expect(scaled.width).toBeCloseTo(0.5)
		expect(scaled.height).toBeCloseTo(0.25)
		expect(scaled.x).toBeCloseTo(0.1)
		// The box grows the same above and below.
		expect(scaled.y).toBeCloseTo(0.075)
	})
})
