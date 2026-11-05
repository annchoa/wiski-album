import { describe, expect, it } from 'vitest'
import { effectiveResolution, isLowResolution } from '../lib/resolution'

describe('Effective resolution', () => {
	it('is set by the photo side that just covers the slot', () => {
		const photo = { width: 3000, height: 2000 }
		const slotCm = { width: 25.4, height: 25.4 }

		expect(effectiveResolution({ photo, slotCm, zoom: 1 })).toBe(200)
	})

	it('drops as the photo is zoomed in because fewer pixels fill the same slot', () => {
		const photo = { width: 3000, height: 2000 }
		const slotCm = { width: 25.4, height: 25.4 }

		expect(effectiveResolution({ photo, slotCm, zoom: 2 })).toBe(100)
	})
})

describe('Effective resolution of a slot without size', () => {
	it('is unknown while the slot has not been measured', () => {
		const photo = { width: 3000, height: 2000 }

		expect(
			effectiveResolution({ photo, slotCm: { width: 0, height: 0 }, zoom: 1 }),
		).toBeNull()
	})
})

describe('Low resolution', () => {
	it('starts below 150 ppp', () => {
		expect(isLowResolution(149.9)).toBe(true)
		expect(isLowResolution(150)).toBe(false)
	})

	it('does not warn when the resolution is unknown', () => {
		expect(isLowResolution(null)).toBe(false)
	})
})
