import { Routes, Route } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { ApplicationsListPage } from './pages/ApplicationsListPage'
import { ApplicationDetailPage } from './pages/ApplicationDetailPage'
import { CompanyDetailPage } from './pages/CompanyDetailPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<ApplicationsListPage />} />
        <Route path="/applications/:id" element={<ApplicationDetailPage />} />
        <Route path="/companies/:id" element={<CompanyDetailPage />} />
      </Route>
    </Routes>
  )
}

export default App