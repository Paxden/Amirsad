// components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    const badges = {
      admin: 'bg-danger',
      staff: 'bg-info',
      supplier: 'bg-success',
      buyer: 'bg-primary',
    };
    return badges[user?.role] || 'bg-secondary';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
      <div className="container">
        <Link className="navbar-brand" to="/dashboard">
          <strong>AMIRSAD Gold</strong>
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                <i className="bi bi-speedometer2"></i> Dashboard
              </Link>
            </li>
            
            {user?.role === 'supplier' && (
              <li className="nav-item">
                <Link className="nav-link" to="/supplier/opportunities">
                  <i className="bi bi-gem"></i> My Opportunities
                </Link>
              </li>
            )}
            
            {user?.role === 'buyer' && (
              <li className="nav-item">
                <Link className="nav-link" to="/buyer/inventory">
                  <i className="bi bi-box-seam"></i> Inventory
                </Link>
              </li>
            )}
            
            {(user?.role === 'admin' || user?.role === 'staff') && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin/users">
                  <i className="bi bi-people"></i> Users
                </Link>
              </li>
            )}
            
            <li className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle btn btn-link"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-person-circle"></i> {user?.fullName}
                <span className={`badge ${getRoleBadge()} ms-2`}>
                  {user?.role}
                </span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/profile">
                    <i className="bi bi-person"></i> Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/settings">
                    <i className="bi bi-gear"></i> Settings
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i> Logout
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;