// Downloads the Cover Typefaces from Google Fonts into src/assets/fonts/ and
// writes src/assets/fonts/fonts.css. The fonts are open (OFL), so the app can serve them itself.
// Add a Typeface to `families` and run: node scripts/download-fonts.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const families = [
	{ name: 'Bebas Neue', weights: [400] },
	{ name: 'Shantell Sans', weights: [400, 700] },
	{ name: 'Chicle', weights: [400] },
	// Molle exists only in italic.
	{ name: 'Molle', weights: [400], italic: true },
	// Examples, until the user sends the final list.
	{ name: 'Playfair Display', weights: [400, 700] },
	{ name: 'Lobster', weights: [400] },
	{ name: 'Pacifico', weights: [400] },
	{ name: 'Merriweather', weights: [400, 700] },
	{ name: 'Montserrat', weights: [400, 700] },
	{ name: 'Dancing Script', weights: [400, 700] },
	{ name: 'Oswald', weights: [400, 700] },
	{ name: 'Caveat', weights: [400, 700] },
	{ name: 'Poppins', weights: [400, 700] },
]

const folder = new URL('../src/assets/fonts/', import.meta.url).pathname
mkdirSync(folder, { recursive: true })

// A modern browser name makes Google answer with woff2 files.
const userAgent =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function slug(text) {
	return text.toLowerCase().replaceAll(' ', '-')
}

// Keeps the Latin block of the answer: the other blocks are other alphabets.
function latinBlocks(css) {
	return [...css.matchAll(/\/\* latin \*\/\s*@font-face \{([^}]*)\}/g)].map(
		(match) => match[1],
	)
}

function property(block, name) {
	const found = block.match(new RegExp(`${name}:\\s*([^;]+);`))
	if (!found) throw new Error(`no ${name} in ${block}`)
	return found[1].trim()
}

const rules = []
const downloaded = new Map()

for (const { name, weights, italic = false } of families) {
	const axis = italic ? `ital,wght@${weights.map((w) => `1,${w}`).join(';')}` : `wght@${weights.join(';')}`
	const url = `https://fonts.googleapis.com/css2?family=${name.replaceAll(' ', '+')}:${axis}&display=swap`
	const reply = await fetch(url, { headers: { 'User-Agent': userAgent } })
	if (!reply.ok) throw new Error(`${name}: Google answered ${reply.status}`)
	const blocks = latinBlocks(await reply.text())
	if (blocks.length === 0) throw new Error(`${name}: no latin block`)

	for (const block of blocks) {
		const source = property(block, 'src').match(/url\(([^)]+)\)/)?.[1]
		if (!source) throw new Error(`${name}: no url`)
		const weight = property(block, 'font-weight')
		const style = property(block, 'font-style')
		const file = `${slug(name)}-${weight.replaceAll(' ', '-')}${style === 'italic' ? '-italic' : ''}.woff2`
		if (!downloaded.has(source)) {
			const font = await fetch(source)
			if (!font.ok) throw new Error(`${name}: ${source} answered ${font.status}`)
			writeFileSync(join(folder, file), Buffer.from(await font.arrayBuffer()))
			downloaded.set(source, file)
			console.log('saved', file)
		}
		rules.push(`@font-face {
	font-family: '${name}';
	font-style: ${style};
	font-weight: ${weight};
	font-display: swap;
	src: url('./${downloaded.get(source)}') format('woff2');
	unicode-range: ${property(block, 'unicode-range')};
}`)
	}
}

writeFileSync(
	join(folder, 'fonts.css'),
	`/* Written by scripts/download-fonts.mjs: do not edit by hand. */\n${rules.join('\n\n')}\n`,
)
console.log('wrote fonts.css with', rules.length, 'rules')
