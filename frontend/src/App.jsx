import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { RequireAuth, RequireModule } from './components/RequireAuth'
import Catalog from './pages/Catalog'
import Inventory from './pages/Inventory'
import Login from './pages/Login'
import Pos from './pages/Pos'
import Profile from './pages/Profile'
import Reports from './pages/Reports'
import Users from './pages/Users'

// Solo las rutas de la aplicación. Cada pantalla vive en pages/ y sus piezas en components/.
//  - RequireAuth: con la extensión del backend exige sesión iniciada (si no, manda al login).
//  - RequireModule: además revise que el rol tenga permiso para ese módulo.
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/catalogo" replace />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/inventario" element={<RequireModule modulo="inventario"><Inventory /></RequireModule>} />
          <Route path="/ventas" element={<RequireModule modulo="ventas"><Pos /></RequireModule>} />
          <Route path="/reportes" element={<RequireModule modulo="reportes"><Reports /></RequireModule>} />
          <Route path="/usuarios" element={<RequireModule modulo="usuarios"><Users /></RequireModule>} />
          <Route path="/perfil" element={<RequireModule modulo="perfil"><Profile /></RequireModule>} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/catalogo" replace />} />
    </Routes>
  )
}
