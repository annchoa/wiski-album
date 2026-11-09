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
			previewPdf: 'Vista previa del PDF',
			quickPreview: {
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
				title: 'Cambiar de producto',
				message:
					'Cambiar de producto reiniciará tus páginas. Tus fotos se conservan.',
				cancel: 'Cancelar',
				confirm: 'Cambiar',
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
			previewPdf: 'Preview PDF',
			quickPreview: {
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
				title: 'Change product',
				message:
					'Changing product will reset your pages. Your photos are kept.',
				cancel: 'Cancel',
				confirm: 'Change',
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
