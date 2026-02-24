import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App'
import { DarkModeProvider } from './context/DarkModeContext'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string, { verbose: true })

// Debug: log the URL hash on load to see if Convex Auth callback token is present
console.log('[KioskIA Auth Debug] URL:', window.location.href)
console.log('[KioskIA Auth Debug] Hash:', window.location.hash)
console.log('[KioskIA Auth Debug] localStorage keys:', Object.keys(localStorage).filter(k => k.includes('convex') || k.includes('auth')))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <BrowserRouter>
        <DarkModeProvider>
          <App />
        </DarkModeProvider>
      </BrowserRouter>
    </ConvexAuthProvider>
  </StrictMode>,
)
