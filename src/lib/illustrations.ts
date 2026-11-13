export interface Illustration {
	id: string
	// A small Illustration starts as an icon on the Cover; a large one starts as a picture.
	size: 'small' | 'large'
	// The size of the picture, in any unit: only their proportion matters.
	width: number
	height: number
	// The file type; most Illustrations are SVG.
	extension?: 'svg' | 'png'
}

// The files are in public/illustrations. The first one is the Illustration a Cover starts with.
export const illustrations: Illustration[] = [
	{
		id: 'lemon-blue',
		size: 'large',
		width: 860,
		height: 751,
		extension: 'png',
	},
	{
		id: 'arl_dlt-summer-7200676_640',
		size: 'large',
		width: 416,
		height: 640,
		extension: 'png',
	},
	{
		id: 'pastelila_id-flower-7875159_1280',
		size: 'large',
		width: 1280,
		height: 1280,
		extension: 'png',
	},
	{ id: 'undraw_asterisk', size: 'small', width: 29.64371, height: 39.7404 },
	{ id: 'undraw_balloon', size: 'small', width: 29.76171, height: 62.40695 },
	{ id: 'undraw_bike', size: 'small', width: 70.44136, height: 48.259 },
	{ id: 'undraw_bird', size: 'small', width: 53.43132, height: 56.83095 },
	{ id: 'undraw_camera', size: 'small', width: 62.90714, height: 54.94274 },
	{ id: 'undraw_chat-text', size: 'small', width: 55.59259, height: 56.25544 },
	{ id: 'undraw_chat', size: 'small', width: 55.59259, height: 56.25544 },
	{
		id: 'undraw_escape-button',
		size: 'small',
		width: 66.8879,
		height: 37.07522,
	},
	{ id: 'undraw_fun-arrow', size: 'small', width: 62.63443, height: 48.83955 },
	{ id: 'undraw_fun-star', size: 'small', width: 36.02704, height: 54.88953 },
	{ id: 'undraw_ghost', size: 'small', width: 40.96668, height: 49.16565 },
	{ id: 'undraw_heart-fun', size: 'small', width: 52.18113, height: 54.16432 },
	{
		id: 'undraw_smiley-face',
		size: 'small',
		width: 54.24162,
		height: 54.25067,
	},
	{ id: 'undraw_spiral', size: 'small', width: 47.39725, height: 61.34826 },
	{ id: 'undraw_star', size: 'small', width: 40.36113, height: 38.9054 },
]

export const defaultIllustration: Illustration =
	illustrations[0] as Illustration

export function illustrationUrl(id: string) {
	const extension =
		illustrations.find((illustration) => illustration.id === id)?.extension ??
		'svg'
	return `${import.meta.env.BASE_URL}illustrations/${id}.${extension}`
}
