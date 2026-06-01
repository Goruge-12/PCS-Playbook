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

import Unauthorized from './pages/Unauthorized.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';

import AddRemoveInstallations from './pages/AddRemoveInstallations.jsx';

import AddRemoveUnits from './pages/AddRemoveUnits.jsx';
import ModifyInstallations from './pages/ModifyInstallations.jsx';
import ModifyUnits from './pages/ModifyUnits.jsx';

import ManageCityInfo from './pages/ManageCityInfo.jsx';
import Resources from './pages/Resources.jsx';
import ManageResources from './pages/ManageResources.jsx';
import ChangePassword from './pages/ChangePassword.jsx';

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