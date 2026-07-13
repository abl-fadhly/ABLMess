import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext'
import { ToastProvider } from './components/ToastContext'
import { ConfirmProvider } from './components/ConfirmContext'
import { ThemeProvider } from './components/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <ConfirmProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ConfirmProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
