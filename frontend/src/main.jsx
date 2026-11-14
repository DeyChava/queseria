import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import AuthProvider from './context/AuthProvider'
import CapabilitiesProvider from './context/CapabilitiesProvider'
import ProductsProvider from './context/ProductsProvider'
import TicketProvider from './context/TicketProvider'
import ToastProvider from './context/ToastProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <CapabilitiesProvider>
          <AuthProvider>
            <ProductsProvider>
              <TicketProvider>
                <App />
              </TicketProvider>
            </ProductsProvider>
          </AuthProvider>
        </CapabilitiesProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
