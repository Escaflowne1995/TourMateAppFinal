/**
 * Main Admin Application Component
 * Handles routing, authentication, and overall app state
 */

const { useState, useEffect } = React;

const AdminApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      
      // Try to restore session
      const sessionRestored = window.AdminService.restoreSession();
      
      if (sessionRestored) {
        const admin = window.AdminService.getCurrentAdmin();
        setCurrentAdmin(admin);
        setIsLoggedIn(true);
      }
      
      setLoading(false);
    };

    initializeApp();
  }, []);

  // Handle login
  const handleLogin = async (credentials) => {
    const result = await window.AdminService.login(credentials.email, credentials.password);
    
    if (result.success) {
      setCurrentAdmin(result.admin);
      setIsLoggedIn(true);
      setCurrentView('dashboard');
    }
    
    return result;
  };

  // Handle logout
  const handleLogout = () => {
    window.AdminService.logout();
    setCurrentAdmin(null);
    setIsLoggedIn(false);
    setCurrentView('dashboard');
  };

  // Handle view change
  const handleViewChange = (view) => {
    setCurrentView(view);
    window.AdminService.logActivity('navigate', { view });
  };

  // Loading screen
  if (loading) {
    return React.createElement('div', { className: 'admin-app' },
      React.createElement('div', { className: 'loading' },
        React.createElement('div', { className: 'spinner' }),
        React.createElement('span', null, 'Loading Admin Panel...')
      )
    );
  }

  // Login screen
  if (!isLoggedIn) {
    return React.createElement(AdminLogin, { onLogin: handleLogin });
  }

  // Main admin interface
  return React.createElement('div', { className: 'admin-app' },
    React.createElement(AdminHeader, {
      currentAdmin: currentAdmin,
      currentView: currentView,
      onViewChange: handleViewChange,
      onLogout: handleLogout
    }),
    React.createElement('main', { className: 'admin-main' },
      React.createElement(AdminContent, {
        currentView: currentView,
        currentAdmin: currentAdmin
      })
    )
  );
};

// Admin Header Component
const AdminHeader = ({ currentAdmin, currentView, onViewChange, onLogout }) => {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
    { key: 'users', label: 'Users', icon: 'fa-users' },
    { key: 'destinations', label: 'Destinations', icon: 'fa-map-marker-alt' },
    { key: 'delicacies', label: 'Delicacies', icon: 'fa-utensils' },
  ];

  return React.createElement('header', { className: 'admin-header' },
    React.createElement('div', { className: 'admin-logo' },
      React.createElement('i', { className: 'fas fa-crown' }),
      React.createElement('span', null, 'Cebu Tourist Admin')
    ),
    React.createElement('nav', { className: 'admin-nav' },
      React.createElement('div', { className: 'nav-tabs' },
        navItems.map(item => 
          React.createElement('button', {
            key: item.key,
            className: `nav-tab ${currentView === item.key ? 'active' : ''}`,
            onClick: () => onViewChange(item.key)
          },
            React.createElement('i', { className: `fas ${item.icon}` }),
            React.createElement('span', null, item.label)
          )
        )
      ),
      React.createElement('div', { className: 'admin-user' },
        React.createElement('div', { className: 'user-info' },
          React.createElement('div', { className: 'user-name' }, currentAdmin.name),
          React.createElement('div', { className: 'user-role' }, currentAdmin.role)
        ),
        React.createElement('button', { className: 'logout-btn', onClick: onLogout },
          React.createElement('i', { className: 'fas fa-sign-out-alt' }),
          'Logout'
        )
      )
    )
  );
};

// Admin Content Router
const AdminContent = ({ currentView, currentAdmin }) => {
  switch (currentView) {
    case 'dashboard':
      return React.createElement(AdminDashboard, { currentAdmin });
    case 'users':
      return React.createElement(UserManagement, { currentAdmin });
    case 'destinations':
      return React.createElement(DestinationManagement, { currentAdmin });
    case 'delicacies':
      return React.createElement(DelicaciesManagement, { currentAdmin });
    default:
      return React.createElement('div', { className: 'empty-state' },
        React.createElement('i', { className: 'fas fa-exclamation-triangle' }),
        React.createElement('h3', null, 'Page Not Found'),
        React.createElement('p', null, 'The requested page could not be found.')
      );
  }
};

// Export for use in other files
window.AdminApp = AdminApp;
