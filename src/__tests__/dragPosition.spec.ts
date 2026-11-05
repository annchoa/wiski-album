import { describe, expect, it } from 'vitest'
import { positionAfterDrag } from '../lib/dragPosition'

const photo = { width: 4000, height: 3000 }
const slotPx = { width: 100, height: 100 }

describe('Position after a drag', () => {
	it('follows the cursor so the photo moves as many pixels as the drag', () => {
		const position = positionAfterDrag({
			position: { x: 0.5, y: 0.5 },
			zoom: 1,
			photo,
			slotPx,
			drag: { x: 10, y: 0 },
		})

		expect(position.x).toBeCloseTo(0.2)
	})

	it('keeps the position on an axis where the photo has no room to move', () => {
		const position = positionAfterDrag({
			position: { x: 0.5, y: 0.5 },
			zoom: 1,
			photo,
			slotPx,
			drag: { x: 0, y: 10 },
		})

		expect(position.y).toBe(0.5)
	})

	it('treats a fraction of a pixel of room as no room', () => {
		const position = positionAfterDrag({
			position: { x: 0.5, y: 0.5 },
			zoom: 1,
			photo,
			slotPx: { width: 133.3, height: 100 },
			drag: { x: 10, y: 0 },
		})

		expect(position.x).toBe(0.5)
	})
})
