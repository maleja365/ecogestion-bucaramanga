import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { InstalarAppProvider } from './context/InstalarAppContext'
import RutaProtegida from './components/RutaProtegida'
import Layout from './components/Layout'
import Login from './pages/Login'
import Registro from './pages/Registro'
import RecuperarContrasena from './pages/RecuperarContrasena'
import RestablecerContrasena from './pages/RestablecerContrasena'
import Inicio from './pages/Inicio'
import Incidentes from './pages/Incidentes'
import Campanas from './pages/Campanas'
import PanelSuperAdmin from './pages/PanelSuperAdmin'
import Residentes from './pages/Residentes'
import Indicadores from './pages/Indicadores'

export default function App() {
  return (
    <InstalarAppProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/recuperar" element={<RecuperarContrasena />} />
          <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />
          <Route
            path="/"
            element={
              <RutaProtegida>
                <Layout><Inicio /></Layout>
              </RutaProtegida>
            }
          />
          <Route
            path="/incidentes"
            element={
              <RutaProtegida>
                <Layout><Incidentes /></Layout>
              </RutaProtegida>
            }
          />
          <Route
            path="/campanas"
            element={
              <RutaProtegida>
                <Layout><Campanas /></Layout>
              </RutaProtegida>
            }
          />
          <Route
            path="/admin"
            element={
              <RutaProtegida>
                <Layout><PanelSuperAdmin /></Layout>
              </RutaProtegida>
            }
          />
          <Route
            path="/residentes"
            element={
              <RutaProtegida>
                <Layout><Residentes /></Layout>
              </RutaProtegida>
            }
          />
          <Route
            path="/indicadores"
            element={
              <RutaProtegida>
                <Layout><Indicadores /></Layout>
              </RutaProtegida>
            }
          />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </InstalarAppProvider>
  )
}