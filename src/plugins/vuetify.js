// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'
import { pt } from 'vuetify/locale'

export default createVuetify({
  locale: {
    locale: 'pt',
    fallback: 'pt',
    messages: { pt },
  },
})
