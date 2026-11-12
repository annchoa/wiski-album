export interface ColorScheme {
	background: string
	textColor: string
}

// The Color scheme a Cover starts with.
export const defaultColorScheme: ColorScheme = {
	background: '#F5C5C6',
	textColor: '#F4587D',
}

export const colorSchemes: ColorScheme[] = [
	defaultColorScheme,
	{ background: '#1517F4', textColor: '#FF8242' },
	{ background: '#F55300', textColor: '#F2E8CF' },
	{ background: '#4747DF', textColor: '#D2E942' },
	{ background: '#F5B20D', textColor: '#192179' },
	{ background: '#D2E942', textColor: '#4747DF' },
	{ background: '#F48A4C', textColor: '#6D2DA9' },
	{ background: '#486EBC', textColor: '#BCE391' },
	{ background: '#C5E983', textColor: '#8B78EF' },
	{ background: '#8555D1', textColor: '#D2E942' },
	{ background: '#F42FA5', textColor: '#B0EB42' },
	{ background: '#028D76', textColor: '#B0EB42' },
	{ background: '#FEA1DD', textColor: '#E94C18' },
	{ background: '#EB4C18', textColor: '#DAF48B' },
	{ background: '#A0BBF5', textColor: '#2E875D' },
	{ background: '#F5006A', textColor: '#F5CD11' },
	{ background: '#EDBF1A', textColor: '#B4253F' },
	{ background: '#B4253F', textColor: '#DCDA93' },
	{ background: '#873F6E', textColor: '#FFDBB9' },
	{ background: '#DBE090', textColor: '#1A5C47' },
	{ background: '#1A5C47', textColor: '#A5C742' },
	{ background: '#FAD060', textColor: '#DAF48B' },
]
