import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const [token, setToken] = useState(
    localStorage.getItem('token')
  );

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || 'null')
  );

  const egaImage =
    'https://pcs-playbook.s3.us-east-2.amazonaws.com/EGA_Header.png';

  const defaultProfileImage =
    'https://pcs-playbook.s3.us-east-2.amazonaws.com/profile-images/default-profile.png';

  useEffect(() => {
    function refreshNavbarUser() {
      setToken(localStorage.getItem('token'));

      setUser(
        JSON.parse(localStorage.getItem('user') || 'null')
      );
    }

    window.addEventListener(
      'storage',
      refreshNavbarUser
    );

    window.addEventListener(
      'profileUpdated',
      refreshNavbarUser
    );

    return () => {
      window.removeEventListener(
        'storage',
        refreshNavbarUser
      );

      window.removeEventListener(
        'profileUpdated',
        refreshNavbarUser
      );
    };
  }, []);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    window.dispatchEvent(new Event('profileUpdated'));

    navigate('/login');
  }

  function getDashboardLink() {
    if (user?.role === 'admin') {
      return '/admin';
    }

    if (user?.role === 'mentor') {
      return '/mentor-dashboard';
    }

    if (user?.role === 'mentee') {
      return '/mentee-dashboard';
    }

    return '/login';
  }

  function getDashboardLabel() {
    if (user?.role === 'admin') {
      return 'Admin Dashboard';
    }

    if (user?.role === 'mentor') {
      return 'Mentor Dashboard';
    }

    if (user?.role === 'mentee') {
      return 'Mentee Dashboard';
    }

    return 'Dashboard';
  }

  function getProfileLabel() {
    if (!user) {
      return 'Profile';
    }

    const rank = user.rank || '';
    const lastName = user.last_name || '';
    const firstName = user.first_name || '';

    return `${rank} ${lastName}, ${firstName}'s Profile`;
  }

  function getProfileImage() {
    if (
      user?.profile_image_url &&
      user.profile_image_url.startsWith('http')
    ) {
      return user.profile_image_url;
    }

    return defaultProfileImage;
  }

  function getNavClass({ isActive }) {
    return isActive
      ? 'nav-link active-nav-link'
      : 'nav-link';
  }

  function getProfileNavClass({ isActive }) {
    return isActive
      ? 'nav-link nav-profile-link active-nav-link'
      : 'nav-link nav-profile-link';
  }

  return (
    <header className="site-header">
      <div className="header-row">
        <Link to="/" className="brand">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <img
              src={egaImage}
              alt="EGA"
              style={{
                width: '40px',
                height: '40px',
                objectFit: 'contain'
              }}
            />

            <div>
              <div className="brand-title">
                PCS Playbook
              </div>

              <div className="brand-subtitle">
                Your Marine Corps Installation Guide
              </div>
            </div>
          </div>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" className={getNavClass}>
            Home
          </NavLink>

          <NavLink
            to="/installations"
            className={getNavClass}
          >
            Installations
          </NavLink>

          <NavLink to="/units" className={getNavClass}>
            Units
          </NavLink>

          <NavLink to="/resources" className={getNavClass}>
            Resources
          </NavLink>

          {(!token || user?.role === 'mentee') && (
            <NavLink
              to="/mentor-request"
              className={getNavClass}
            >
              Request Mentor
            </NavLink>
          )}

          {token && (
            <NavLink
              to={getDashboardLink()}
              className={getNavClass}
            >
              {getDashboardLabel()}
            </NavLink>
          )}

          {token ? (
            <>
              <NavLink
                to="/profile"
                className={getProfileNavClass}
              >
                <img
                  className="nav-profile-img"
                  src={getProfileImage()}
                  alt="Profile"
                  onError={(e) => {
                    e.currentTarget.src = defaultProfileImage;
                  }}
                />

                <span>
                  {getProfileLabel()}
                </span>
              </NavLink>

              <button
                className="nav-button"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={getNavClass}>
                Login
              </NavLink>

              <NavLink to="/register" className={getNavClass}>
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;