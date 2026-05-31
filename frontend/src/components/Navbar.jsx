import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const user = JSON.parse(
    localStorage.getItem('user') || 'null'
  );

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/login');
  }

  return (
    <header className="site-header">
      <div className="header-row">
        <Link to="/" className="brand">
          <span className="brand-title">
            PCS Playbook
          </span>

          <span className="brand-subtitle">
            Your Marine Corps Installation Guide
          </span>
        </Link>

        <nav className="nav-links">
          <Link to="/">
            Home
          </Link>

          <Link to="/installations">
            Installations
          </Link>

          <Link to="/units">
            Units
          </Link>

          {(!token || user?.role === 'mentee') && (
            <Link to="/mentor-request">
              Request Mentor
            </Link>
          )}

          {token && user?.role === 'mentee' && (
            <Link to="/mentee-dashboard">
              Mentee Dashboard
            </Link>
          )}

          {token && user?.role === 'mentor' && (
            <Link to="/mentor-dashboard">
              Mentor Dashboard
            </Link>
          )}

          {token && user?.role === 'admin' && (
            <Link to="/admin">
              Admin
            </Link>
          )}

          {token ? (
            <>
              <Link to="/profile">
                Profile
              </Link>

              <button
                className="nav-button"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                Login
              </Link>

              <Link to="/register">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;