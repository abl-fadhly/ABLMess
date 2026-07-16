import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { RequestsPage } from './pages/RequestsPage'
import { BookingsPage } from './pages/BookingsPage'
import { MyRequestsPage } from './pages/MyRequestsPage'
import { RoomsPage } from './pages/RoomsPage'
import { UsersPage } from './pages/UsersPage'
import { ReferenceDataPage } from './pages/ReferenceDataPage'
import { LogsPage } from './pages/LogsPage'

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.userType === 'Crew') return <Navigate to="/my-requests" replace />
  return <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomeRedirect />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['Admin', 'GS']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute roles={['Admin', 'GS']}>
              <RequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute roles={['Admin', 'GS']}>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms"
          element={
            <ProtectedRoute roles={['Admin', 'GS']}>
              <RoomsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['Admin', 'GS']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reference-data"
          element={
            <ProtectedRoute roles={['Admin', 'GS']}>
              <ReferenceDataPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute roles={['Admin', 'GS']}>
              <LogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-requests"
          element={
            <ProtectedRoute roles={['Crew']}>
              <MyRequestsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
