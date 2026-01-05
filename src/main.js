import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import GlobalMethods from '@/plugins/globalmethods'
import globals from './plugins/globals'

loadFonts()

createApp(App)
  .use(globals)
  .use(GlobalMethods)
  .use(router)
  .use(store)
  .use(vuetify)
  .mount('#app')
