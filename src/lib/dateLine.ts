// Intl writes "noviembre de 2026" in Spanish: the Date line has no "de".
export function dateLine(date: Date, locale: string): string {
	const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date)
	return `${month} ${date.getFullYear()}`
}
