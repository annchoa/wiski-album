import { fireEvent, render, screen, within } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import App from '../App.vue'
import { createWikiI18n } from '../i18n'
import { createWikiRouter } from '../router'
import HomeView from '../views/HomeView.vue'

function renderApp() {
	const router = createWikiRouter(createMemoryHistory())
	return render(HomeView, {
		global: { plugins: [createWikiI18n(), router] },
	})
}

describe('Home screen', () => {
	it('greets in Spanish by default', () => {
		renderApp()
		expect(
			screen.getByRole('heading', { name: 'Crea tu fotolibro' }),
		).toBeInTheDocument()
	})

	it('introduces the formats in Spanish', () => {
		renderApp()
		expect(
			screen.getByText('Elige el formato que mejor cuenta tu historia.'),
		).toBeInTheDocument()
		const route = within(screen.getByRole('article', { name: 'Wiski Ruta' }))
		expect(
			route.getByText(
				'Un formato cuadrado pensado para álbumes de viaje. Cuenta tu ruta página a página.',
			),
		).toBeInTheDocument()
		const moment = within(
			screen.getByRole('article', { name: 'Wiski Momento' }),
		)
		expect(
			moment.getByText(
				'Tamaño revista, ideal para regalar o guardar las fotos de la familia y los amigos, el Día de la Madre o del Padre.',
			),
		).toBeInTheDocument()
	})

	it('offers both photobooks', () => {
		renderApp()
		expect(
			screen.getByRole('heading', { name: 'Wiski Ruta' }),
		).toBeInTheDocument()
		expect(
			screen.getByRole('heading', { name: 'Wiski Momento' }),
		).toBeInTheDocument()
	})

	it('lists the size, cover and page count of each photobook', () => {
		renderApp()
		const route = within(screen.getByRole('article', { name: 'Wiski Ruta' }))
		expect(route.getByText('20 × 20 cm')).toBeInTheDocument()
		expect(route.getByText('Tapa dura')).toBeInTheDocument()
		expect(route.getByText('20 páginas')).toBeInTheDocument()

		const moment = within(
			screen.getByRole('article', { name: 'Wiski Momento' }),
		)
		expect(moment.getByText('20 × 28 cm')).toBeInTheDocument()
		expect(moment.getByText('Tapa blanda')).toBeInTheDocument()
		expect(moment.getByText('25 páginas')).toBeInTheDocument()
	})

	it('shows the original price, the discounted price and the discount', () => {
		renderApp()
		const route = within(screen.getByRole('article', { name: 'Wiski Ruta' }))
		expect(route.getByText('$60')).toBeInTheDocument()
		expect(route.getByText('$42')).toBeInTheDocument()
		expect(route.getByText('-30%')).toBeInTheDocument()

		const moment = within(
			screen.getByRole('article', { name: 'Wiski Momento' }),
		)
		expect(moment.getByText('$55')).toBeInTheDocument()
		expect(moment.getByText('$33')).toBeInTheDocument()
		expect(moment.getByText('-40%')).toBeInTheDocument()
	})

	it('links each photobook to its worksheet', () => {
		renderApp()
		expect(
			screen.getByRole('link', { name: 'Crear Wiski Ruta' }),
		).toHaveAttribute('href', '/worksheet/wiski-route')
		expect(
			screen.getByRole('link', { name: 'Crear Wiski Momento' }),
		).toHaveAttribute('href', '/worksheet/wiski-moment')
	})
})

describe('Navigation', () => {
	it('opens the worksheet through the router instead of reloading the page', async () => {
		const router = createWikiRouter(createMemoryHistory())
		await router.push('/')
		render(App, { global: { plugins: [createWikiI18n(), router] } })

		await fireEvent.click(
			screen.getByRole('link', { name: 'Crear Wiski Momento' }),
		)

		await vi.waitFor(() =>
			expect(router.currentRoute.value.path).toBe('/worksheet/wiski-moment'),
		)
	})
})

describe('Language selector', () => {
	it('switches the screen to English', async () => {
		renderApp()
		await fireEvent.update(
			screen.getByRole('combobox', { name: 'Idioma' }),
			'en',
		)
		expect(
			screen.getByRole('heading', { name: 'Create your photobook' }),
		).toBeInTheDocument()
	})

	it('translates the photobook details', async () => {
		renderApp()
		await fireEvent.update(
			screen.getByRole('combobox', { name: 'Idioma' }),
			'en',
		)
		const route = within(screen.getByRole('article', { name: 'Wiski Route' }))
		expect(route.getByText('Hard cover')).toBeInTheDocument()
		expect(route.getByText('20 pages')).toBeInTheDocument()
		expect(
			route.getByRole('link', { name: 'Create Wiski Route' }),
		).toHaveAttribute('href', '/worksheet/wiski-route')
	})

	it('translates the intro copy', async () => {
		renderApp()
		await fireEvent.update(
			screen.getByRole('combobox', { name: 'Idioma' }),
			'en',
		)
		expect(
			screen.getByText('Choose the format that best tells your story.'),
		).toBeInTheDocument()
		const route = within(screen.getByRole('article', { name: 'Wiski Route' }))
		expect(
			route.getByText(
				'A square format made for travel albums. Tell your route page by page.',
			),
		).toBeInTheDocument()
		const moment = within(screen.getByRole('article', { name: 'Wiski Moment' }))
		expect(
			moment.getByText(
				"Magazine size, ideal as a gift or to keep your family's and friends' photos, on Mother's or Father's Day.",
			),
		).toBeInTheDocument()
	})

	it('remembers the chosen language', async () => {
		const first = renderApp()
		await fireEvent.update(
			screen.getByRole('combobox', { name: 'Idioma' }),
			'en',
		)
		first.unmount()

		renderApp()
		expect(
			screen.getByRole('heading', { name: 'Create your photobook' }),
		).toBeInTheDocument()
	})
})
