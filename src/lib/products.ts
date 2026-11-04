export type Cover = 'hard' | 'soft'

export interface Product {
	id: 'route' | 'moment'
	widthCm: number
	heightCm: number
	cover: Cover
	pages: number
	price: number
	discountPercent: number
}

export const products: Product[] = [
	{
		id: 'route',
		widthCm: 20,
		heightCm: 20,
		cover: 'hard',
		pages: 20,
		price: 60,
		discountPercent: 30,
	},
	{
		id: 'moment',
		widthCm: 20,
		heightCm: 28,
		cover: 'soft',
		pages: 25,
		price: 55,
		discountPercent: 40,
	},
]

export function getProduct(id: string): Product {
	const product = products.find((candidate) => candidate.id === id)
	if (!product) throw new Error(`Unknown product: ${id}`)
	return product
}
