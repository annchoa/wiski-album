export interface Typeface {
	name: string
}

// The Typeface a Cover text starts with.
export const defaultTypeface: Typeface = { name: 'Inter' }

// The files are in src/assets/fonts: scripts/download-fonts.mjs fetches them.
export const typefaces: Typeface[] = [
	defaultTypeface,
	{ name: 'Bebas Neue' },
	{ name: 'Shantell Sans' },
	{ name: 'Chicle' },
	{ name: 'Molle' },
	// Examples, until the user sends the final list.
	{ name: 'Playfair Display' },
	{ name: 'Lobster' },
	{ name: 'Pacifico' },
	{ name: 'Merriweather' },
	{ name: 'Montserrat' },
	{ name: 'Dancing Script' },
	{ name: 'Oswald' },
	{ name: 'Caveat' },
	{ name: 'Poppins' },
]
