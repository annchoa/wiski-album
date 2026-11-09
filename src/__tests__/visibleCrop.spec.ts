import { describe, expect, it } from 'vitest'
import { visibleCrop } from '@/lib/visibleCrop'

const centered = { position: { x: 0.5, y: 0.5 }, zoom: 1 }
const squareSlot = { width: 10, height: 10 }

describe('visibleCrop', () => {
	it('shows a whole square photo in a square slot', () => {
		expect(
			visibleCrop({ width: 1000, height: 1000 }, squareSlot, centered),
		).toEqual({ x: 0, y: 0, width: 1000, height: 1000 })
	})

	// object-cover scales 2000x1000 by 0.01 to 20x10, so the slot shows the
	// middle 1000 px.
	it('crops the sides of a wide photo, centered', () => {
		expect(
			visibleCrop({ width: 2000, height: 1000 }, squareSlot, centered),
		).toEqual({ x: 500, y: 0, width: 1000, height: 1000 })
	})

	it('moves the crop to the left edge of the photo at position 0', () => {
		const view = { position: { x: 0, y: 0.5 }, zoom: 1 }

		expect(
			visibleCrop({ width: 2000, height: 1000 }, squareSlot, view),
		).toEqual({
			x: 0,
			y: 0,
			width: 1000,
			height: 1000,
		})
	})

	it('moves the crop to the right edge of the photo at position 1', () => {
		const view = { position: { x: 1, y: 0.5 }, zoom: 1 }

		expect(
			visibleCrop({ width: 2000, height: 1000 }, squareSlot, view),
		).toEqual({
			x: 1000,
			y: 0,
			width: 1000,
			height: 1000,
		})
	})

	it('shows the middle half of a square photo at zoom 2', () => {
		const view = { position: { x: 0.5, y: 0.5 }, zoom: 2 }

		expect(
			visibleCrop({ width: 1000, height: 1000 }, squareSlot, view),
		).toEqual({
			x: 250,
			y: 250,
			width: 500,
			height: 500,
		})
	})

	// The zoom grows from the focus point, so position 0 keeps the top-left
	// corner and position 1 keeps the bottom-right corner.
	it('keeps the corner of the focus point when zoomed', () => {
		const photo = { width: 1000, height: 1000 }

		expect(
			visibleCrop(photo, squareSlot, { position: { x: 0, y: 0 }, zoom: 2 }),
		).toEqual({
			x: 0,
			y: 0,
			width: 500,
			height: 500,
		})
		expect(
			visibleCrop(photo, squareSlot, { position: { x: 1, y: 1 }, zoom: 2 }),
		).toEqual({
			x: 500,
			y: 500,
			width: 500,
			height: 500,
		})
	})

	it('zooms a wide photo up to its right edge', () => {
		const view = { position: { x: 1, y: 0.5 }, zoom: 2 }

		expect(
			visibleCrop({ width: 2000, height: 1000 }, squareSlot, view),
		).toEqual({
			x: 1500,
			y: 250,
			width: 500,
			height: 500,
		})
	})
})
