import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.js';

import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';

import Installations from './pages/Installations.js';
import InstallationDetails from './pages/InstallationDetails.js';

import Units from './pages/Units.js';
import UnitDetails from './pages/UnitDetails.js';

import Profile from './pages/Profile.js';

import MenteeDashboard from './pages/MenteeDashboard.js';
import MentorRequest from './pages/MentorRequest.js';
import MentorDashboard from './pages/MentorDashboard.js';

import AdminDashboard from './pages/AdminDashboard.js';
import AdminUsers from './pages/AdminUsers.js';

import Unauthorized from './pages/Unauthorized.js';

import ProtectedRoute from './components/ProtectedRoute.js';

import AddRemoveInstallations from './pages/AddRemoveInstallations.js';

import AddRemoveUnits from './pages/AddRemoveUnits.js';
import ModifyInstallations from './pages/ModifyInstallations.js';
import ModifyUnits from './pages/ModifyUnits.js';

import ManageCityInfo from './pages/ManageCityInfo.js';
import Resources from './pages/Resources.js';
import ManageResources from './pages/ManageResources.js';
import ChangePassword from './pages/ChangePassword.js';

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
  element={<MentorRequest />}
/>
          <Route
  path="/admin/installations"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AddRemoveInstallations />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/units"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AddRemoveUnits />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/modify-installations"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <ModifyInstallations />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/modify-units"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <ModifyUnits />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/city-info"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <ManageCityInfo />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/resources"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <ManageResources />
    </ProtectedRoute>
  }
/><Route
  path="/admin/resources"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <ManageResources />
    </ProtectedRoute>
  }
/>
<Route
  path="/resources"
  element={<Resources />}
/>
<Route
  path="/change-password"
  element={<ChangePassword />}
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