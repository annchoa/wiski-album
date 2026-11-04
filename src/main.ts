import './assets/main.css'

import { createApp } from 'vue'
import { createWebHistory } from 'vue-router'
import App from './App.vue'
import { createWikiI18n } from './i18n'
import { createWikiRouter } from './router'

createApp(App)
	.use(createWikiI18n())
	.use(createWikiRouter(createWebHistory()))
	.mount('#app')
