import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import '../css/app.css';

createInertiaApp({
  resolve: name => {
    const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
    return pages[`./Pages/${name}.jsx`]
  },
  setup({ el, App, props }) {
    // Make route function globally available
    if (props.initialPage.props.ziggy) {
      window.Ziggy = props.initialPage.props.ziggy;
    }
    
    createRoot(el).render(<App {...props} />)
  },
})