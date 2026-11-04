const photoSizes = [
	[300, 400],
	[400, 300],
	[300, 400],
	[300, 300],
	[400, 300],
]

// Page expression that uploads `count` canvas-made photos through the file input.
export function uploadPhotos(count) {
	return `(async () => {
		const sizes = ${JSON.stringify(photoSizes)}
		const files = new DataTransfer()
		for (let index = 0; index < ${count}; index++) {
			const [width, height] = sizes[index % sizes.length]
			const canvas = document.createElement('canvas')
			canvas.width = width
			canvas.height = height
			const context = canvas.getContext('2d')
			context.fillStyle = 'hsl(' + index * 47 + ' 60% 60%)'
			context.fillRect(0, 0, width, height)
			const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
			files.items.add(new File([blob], 'photo-' + (index + 1) + '.png', { type: 'image/png' }))
		}
		const input = document.querySelector('input[type=file]')
		input.files = files.files
		input.dispatchEvent(new Event('change', { bubbles: true }))
	})()`
}
