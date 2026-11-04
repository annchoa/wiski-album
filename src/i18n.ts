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
