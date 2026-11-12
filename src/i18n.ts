import { watch } from 'vue'
import { createI18n } from 'vue-i18n'

const STORAGE_KEY = 'locale'

const messages = {
	es: {
		language: { label: 'Idioma' },
		home: {
			heading: 'Crea tu fotolibro',
			subheading: 'Elige el formato que mejor cuenta tu historia.',
			create: 'Crear {name}',
		},
		editor: {
			uploadHint: 'Sube aquí tus fotos',
			upload: 'Subir fotos',
			trash: 'Papelera',
			pay: 'Pagar',
			editCover: 'Editar portada',
			cover: {
				defaultTitle: 'Mi destino favorito',
				colors: 'Colores',
				typefaces: 'Tipografías',
				illustrations: 'Ilustraciones',
				colorScheme: 'Color {number}',
				illustration: 'Ilustración {number}',
				selectText: 'Selecciona un texto',
				done: 'Listo',
				preview: 'Vista previa de la portada',
				selectionBox: 'Elemento seleccionado',
				delete: 'Borrar',
				editText: 'Texto de la portada',
				illustrationLabel: 'Ilustración de la portada',
			},
			previewPdf: 'Vista previa del PDF',
			quickPreview: {
				notice:
					'Vista previa en baja resolución. Tu álbum se imprimirá en máxima calidad.',
			},
			pdfPreview: {
				title: 'Previsualización rápida',
				building: 'Preparando la previsualización…',
				error: 'No se pudo preparar la previsualización',
				page: 'Página {number}',
				position: '{pages} / {total}',
				previous: 'Páginas anteriores',
				next: 'Páginas siguientes',
				download: 'Descargar PDF',
				close: 'Cerrar',
			},
			thumbnailPanel: {
				label: 'Páginas',
				page: 'Página {number}',
				emptyPage: 'Página {number}, vacía',
			},
			previousPage: 'Página anterior',
			nextPage: 'Página siguiente',
			photos: 'Fotos',
			sort: {
				vertical: 'Verticales primero',
				horizontal: 'Horizontales primero',
			},
			worksheet: 'Hoja de trabajo',
			lowResolution: 'Baja resolución: {ppp} ppp',
			slotEditing: {
				zoomOut: 'Alejar',
				zoomIn: 'Acercar',
				reset: 'Restablecer posición y zoom',
			},
			margins: {
				label: 'Márgenes',
				framed: 'Con margen',
				'full-bleed': 'A sangre completa',
			},
			templates: {
				label: 'Plantillas',
				single: 'Individual',
				stacked: 'Apiladas',
				'side-by-side': 'Lado a lado',
				'large-and-two-small': 'Una grande y dos pequeñas',
				'grid-of-four': 'Cuadrícula de cuatro',
			},
			changeProduct: {
				title: '¿Cambiar de producto?',
				message:
					'Tus fotos están a salvo, pero tendrás que volver a diseñar las páginas.',
				cancel: 'Cancelar',
				confirm: 'Cambiar de producto',
			},
		},
		specs: {
			size: '{width} × {height} cm',
			cover: { hard: 'Tapa dura', soft: 'Tapa blanda' },
			pages: '{count} páginas',
		},
		products: {
			route: {
				name: 'Wiski Ruta',
				description:
					'Un formato cuadrado pensado para álbumes de viaje. Cuenta tu ruta página a página.',
			},
			moment: {
				name: 'Wiski Momento',
				description:
					'Tamaño revista, ideal para regalar o guardar las fotos de la familia y los amigos, el Día de la Madre o del Padre.',
			},
		},
	},
	en: {
		language: { label: 'Language' },
		home: {
			heading: 'Create your photobook',
			subheading: 'Choose the format that best tells your story.',
			create: 'Create {name}',
		},
		editor: {
			uploadHint: 'Upload your photos here',
			upload: 'Upload photos',
			trash: 'Trash',
			pay: 'Pay',
			editCover: 'Edit cover',
			cover: {
				defaultTitle: 'My favorite destination',
				colors: 'Colors',
				typefaces: 'Typefaces',
				illustrations: 'Illustrations',
				colorScheme: 'Color {number}',
				illustration: 'Illustration {number}',
				selectText: 'Select a text',
				done: 'Done',
				preview: 'Cover preview',
				selectionBox: 'Selected element',
				delete: 'Delete',
				editText: 'Cover text',
				illustrationLabel: 'Cover illustration',
			},
			previewPdf: 'Preview PDF',
			quickPreview: {
				notice:
					'Low-resolution preview. Your album will be printed in full quality.',
			},
			pdfPreview: {
				title: 'Quick preview',
				building: 'Preparing the preview…',
				error: 'The preview could not be prepared',
				page: 'Page {number}',
				position: '{pages} / {total}',
				previous: 'Previous pages',
				next: 'Next pages',
				download: 'Download PDF',
				close: 'Close',
			},
			thumbnailPanel: {
				label: 'Pages',
				page: 'Page {number}',
				emptyPage: 'Page {number}, empty',
			},
			previousPage: 'Previous page',
			nextPage: 'Next page',
			photos: 'Photos',
			sort: { vertical: 'Vertical first', horizontal: 'Horizontal first' },
			worksheet: 'Worksheet',
			lowResolution: 'Low resolution: {ppp} ppp',
			slotEditing: {
				zoomOut: 'Zoom out',
				zoomIn: 'Zoom in',
				reset: 'Reset position and zoom',
			},
			margins: {
				label: 'Margins',
				framed: 'Framed',
				'full-bleed': 'Full bleed',
			},
			templates: {
				label: 'Templates',
				single: 'Single',
				stacked: 'Stacked',
				'side-by-side': 'Side by side',
				'large-and-two-small': 'One large and two small',
				'grid-of-four': 'Grid of four',
			},
			changeProduct: {
				title: 'Change product?',
				message:
					'Your photos are safe, but you will need to redesign your pages.',
				cancel: 'Cancel',
				confirm: 'Change product',
			},
		},
		specs: {
			size: '{width} × {height} cm',
			cover: { hard: 'Hard cover', soft: 'Soft cover' },
			pages: '{count} pages',
		},
		products: {
			route: {
				name: 'Wiski Route',
				description:
					'A square format made for travel albums. Tell your route page by page.',
			},
			moment: {
				name: 'Wiski Moment',
				description:
					"Magazine size, ideal as a gift or to keep your family's and friends' photos, on Mother's or Father's Day.",
			},
		},
	},
}

export function createWikiI18n() {
	const i18n = createI18n({
		legacy: false,
		locale: localStorage.getItem(STORAGE_KEY) ?? 'es',
		messages,
	})
	watch(i18n.global.locale, (locale) => {
		localStorage.setItem(STORAGE_KEY, locale)
	})
	return i18n
}
