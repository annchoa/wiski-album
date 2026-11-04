import { describe, expect, it } from 'vitest'
import { applyDiscount } from '@/lib/pricing'

describe('applyDiscount', () => {
	it('takes the discount percentage off the price', () => {
		expect(applyDiscount(60, 30)).toBe(42)
	})

	it('rounds the result to cents', () => {
		expect(applyDiscount(19.99, 10)).toBe(17.99)
	})
})
