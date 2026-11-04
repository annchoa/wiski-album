export interface PhotoFile {
	url: string
	width: number
	height: number
}

export async function readPhoto(file: File): Promise<PhotoFile> {
	const url = URL.createObjectURL(file)
	const image = new Image()
	image.src = url
	try {
		await image.decode()
	} catch (error) {
		URL.revokeObjectURL(url)
		throw error
	}
	return { url, width: image.naturalWidth, height: image.naturalHeight }
}
