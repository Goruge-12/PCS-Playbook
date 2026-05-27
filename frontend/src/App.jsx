import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

import Installations from './pages/Installations.jsx';
import InstallationDetails from './pages/InstallationDetails.jsx';

import Units from './pages/Units.jsx';
import UnitDetails from './pages/UnitDetails.jsx';

import Profile from './pages/Profile.jsx';

import MenteeDashboard from './pages/MenteeDashboard.jsx';
import MentorRequest from './pages/MentorRequest.jsx';
import MentorDashboard from './pages/MentorDashboard.jsx';

import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminContent from './pages/AdminContent.jsx';

import Unauthorized from './pages/Unauthorized.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';

import AddRemoveInstallations from './pages/AddRemoveInstallations.jsx';

function App() {
  return (
    <>
      <Navbar />

      <main className="container">
        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route
            path="/installations"
            element={<Installations />}
          />

          <Route
            path="/installations/:id"
            element={<InstallationDetails />}
          />

          <Route
            path="/units"
            element={<Units />}
          />

          <Route
            path="/units/:unitId"
            element={<UnitDetails />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/unauthorized"
            element={<Unauthorized />}
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/content"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminContent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor-dashboard"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentee-dashboard"
            element={
              <ProtectedRoute allowedRoles={['mentee']}>
                <MenteeDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor-request"
            element={
              <ProtectedRoute allowedRoles={['mentee']}>
                <MentorRequest />
              </ProtectedRoute>
            }
          />
          <Route
  path="/admin/installations"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AddRemoveInstallations />
    </ProtectedRoute>
  }
/>

        </Routes>
      </main>

      <footer>
        © 2026 PCS Playbook | U.S. Marine Corps Installations Only
      </footer>
    </>
  );
}

export default App;