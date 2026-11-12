export interface Typeface {
	name: string
	// `false` when the font file has no bold weight: the browser would fake one.
	hasBold?: false
}

// The Typeface a Cover text starts with.
export const defaultTypeface: Typeface = { name: 'Inter' }

// The files are in src/assets/fonts: scripts/download-fonts.mjs fetches them.
export const typefaces: Typeface[] = [
	defaultTypeface,
	{ name: 'Bebas Neue', hasBold: false },
	{ name: 'Shantell Sans' },
	{ name: 'Chicle', hasBold: false },
	{ name: 'Molle', hasBold: false },
	// Examples, until the user sends the final list.
	{ name: 'Playfair Display' },
	{ name: 'Lobster', hasBold: false },
	{ name: 'Pacifico', hasBold: false },
	{ name: 'Merriweather' },
	{ name: 'Montserrat' },
	{ name: 'Dancing Script' },
	{ name: 'Oswald' },
	{ name: 'Caveat' },
	{ name: 'Poppins' },
]

// The Title is bold in the design, but only where the Typeface has a bold weight.
export function titleWeight(typefaceName: string) {
	const typeface = typefaces.find(({ name }) => name === typefaceName)
	return typeface?.hasBold === false ? 400 : 700
}
