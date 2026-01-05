# GitHub Copilot Instructions for controle-de-investimentos

## Overview
This is a Vue.js SPA for investment control, using Vuex for state management, Vuetify for UI, and Axios for backend communication. The project is structured for modularity and maintainability, with clear separation of views, components, plugins, services, and store modules.

## Architecture & Key Patterns
- **Entry Point:** `src/main.js` wires up plugins, router, store, and Vuetify.
- **Global Methods:** `src/plugins/globalmethods.js` and `src/plugins/globals.js` register global properties (e.g., `$formatDate`, enums for types/status/tickers).
- **State Management:** Vuex store in `src/store/index.js` with modules (e.g., `filters.js` for page-specific filters).
- **UI:** Vuetify is used for all UI components. Custom icons and assets are in `public/img/icons/` and `src/assets/`.
- **Routing:** Managed in `src/router/index.js`.
- **Services:** API calls are abstracted in `src/services/api.js` and `src/services/stockService.js`. Use environment variables for backend URLs (`.env`).
- **Views:** Each major feature/page is a separate file in `src/views/` (e.g., `CarteirasView.vue`, `OperacoesView.vue`).

## Developer Workflows
- **Install dependencies:** `npm install`
- **Run development server:** `npm run serve`
- **Build for production:** `npm run build`
- **Environment config:** Backend URLs set via `.env` and referenced in services.
- **Hot reload:** Supported via Vue CLI.

## Project-Specific Conventions
- **Date Handling:** Use `$formatDate` and `$formatDateToISO` for all date formatting/parsing. Dates are stored as ISO strings and displayed as `dd/MM/yyyy`.
- **Enums/Constants:** Use global properties from `globals.js` for types, statuses, tickers, etc. Example: `this.$TIPO_OPCAO_STATUS.ENCERRADA`.
- **Filters:** Page-specific filters are managed via Vuex module `filters.js`.
- **API Usage:** Always use the `api.js` or `stockService.js` abstraction for HTTP requests.
- **Component Communication:** Props and events for child-parent communication; global methods for cross-cutting concerns.

## Integration Points
- **Backend:** Communicate via Axios, using URLs from `.env`.
- **Vuetify:** All UI should use Vuetify components and theming.
- **Global Methods:** Use `$formatDate`, `$formatDateToISO`, and global enums for consistency.

## Examples
- **Formatting a date:** `this.$formatDate(item.data_abertura)`
- **Accessing a global enum:** `this.$TIPO_ATIVO.ACAO`
- **API call:** `api.get('/endpoint')`
- **Using a filter:** `this.$store.getters['filters/getFiltros']('dashboard')`

## Key Files & Directories
- `src/main.js` (app setup)
- `src/plugins/globalmethods.js`, `src/plugins/globals.js` (global properties)
- `src/services/api.js`, `src/services/stockService.js` (API abstraction)
- `src/store/index.js`, `src/store/modules/filters.js` (state management)
- `src/views/` (feature pages)
- `vue.config.js` (dev server config)

---
_If any section is unclear or missing, please provide feedback to improve these instructions._
