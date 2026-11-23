import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/index.css'
import App from '@/App.jsx'
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SmoothScrollProvider>
      <App />
    </SmoothScrollProvider>
  </StrictMode>,
)
