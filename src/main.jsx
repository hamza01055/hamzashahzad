import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { currentRoute } from './paths'

const AdminPanel = lazy(() => import('./admin/AdminPanel.jsx'))
const isAdmin = currentRoute() === '/admin'

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
