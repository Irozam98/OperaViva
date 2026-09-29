import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './i18n'

// Rileva ambiente Android / Tablet / Smartphone per compensare la status bar di sistema
if (typeof navigator !== 'undefined' && (/android/i.test(navigator.userAgent) || (window as any).Capacitor?.isNativePlatform?.())) {
  document.documentElement.classList.add('is-android');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)

