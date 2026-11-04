import { createRouter, type RouterHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import WorksheetView from './views/WorksheetView.vue'

export function createWikiRouter(history: RouterHistory) {
	return createRouter({
		history,
		routes: [
			{ path: '/', component: HomeView },
			{
				path: '/worksheet/wiski-:productId(route|moment)',
				component: WorksheetView,
				props: true,
			},
		],
	})
}
