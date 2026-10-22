import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import App from '../App.vue'

describe('App', () => {
	it('renders the welcome heading', () => {
		render(App)
		expect(
			screen.getByRole('heading', { name: 'You did it!' }),
		).toBeInTheDocument()
	})
})
