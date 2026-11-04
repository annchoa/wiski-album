import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createWikiI18n } from './i18n'

createApp(App).use(createWikiI18n()).mount('#app')
