import { describe, expect, it } from 'vitest'
import { dateLine } from '../lib/dateLine'

describe('Date line', () => {
	const november2026 = new Date(2026, 10, 11)

	it('writes the month and the year in Spanish, with the month in lowercase', () => {
		expect(dateLine(november2026, 'es')).toBe('noviembre 2026')
	})

	it('writes the month and the year in English', () => {
		expect(dateLine(november2026, 'en')).toBe('November 2026')
	})
})
