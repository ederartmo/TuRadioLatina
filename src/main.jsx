import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import PrivacyPage from './pages/PrivacyPage.jsx'
import TermsPage from './pages/TermsPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/programacion" element={<App />} />
        <Route path="/biblioteca" element={<App />} />
        <Route path="/locutores" element={<App />} />
        <Route path="/podcasts" element={<App />} />
        <Route path="/contacto" element={<App />} />
        <Route path="/como-funciona" element={<Navigate to="/programacion" replace />} />
        <Route path="/faqs" element={<Navigate to="/podcasts" replace />} />
        <Route path="/terminos" element={<TermsPage />} />
        <Route path="/privacidad" element={<PrivacyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
