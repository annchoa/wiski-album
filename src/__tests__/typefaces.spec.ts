import { describe, expect, it } from 'vitest'
import { titleWeight } from '../lib/typefaces'

describe('Typefaces', () => {
	it('gives the Title a bold weight only to a Typeface that has one', () => {
		expect(titleWeight('Inter')).toBe(700)
		expect(titleWeight('Chicle')).toBe(400)
		expect(titleWeight('Bebas Neue')).toBe(400)
	})
})
