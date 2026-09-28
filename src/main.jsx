import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const AdminPanel = lazy(() => import('./admin/AdminPanel.jsx'))
const isAdmin = window.location.pathname.replace(/\/+$/, '') === '/admin'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <AdminPanel />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
