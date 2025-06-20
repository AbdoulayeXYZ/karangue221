import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeMap = {
    '/fleet-dashboard': {
      label: 'Tableau de Bord',
      icon: 'LayoutDashboard'
    },
    '/live-vehicle-tracking': {
      label: 'Suivi en Temps Réel',
      icon: 'MapPin'
    },
    '/driver-behavior-analytics': {
      label: 'Conducteurs',
      icon: 'UserCheck'
    },
    '/camera-feed-viewer': {
      label: 'Caméras',
      icon: 'Video'
    },
    '/vehicle-management': {
      label: 'Véhicules',
      icon: 'Truck'
    }
  };

  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbs = [
      {
        label: 'Accueil',
        path: '/fleet-dashboard',
        icon: 'Home'
      }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const route = routeMap[currentPath];
      
      if (route && currentPath !== '/fleet-dashboard') {
        breadcrumbs.push({
          label: route.label,
          path: currentPath,
          icon: route.icon,
          isLast: index === pathSegments.length - 1
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleBreadcrumbClick = (path) => {
    navigate(path);
  };

  const handleKeyDown = (event, path) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate(path);
    }
  };

  // Don't render breadcrumbs on the main dashboard
  if (location.pathname === '/fleet-dashboard') {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6" aria-label="Fil d'ariane">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          {index > 0 && (
            <Icon 
              name="ChevronRight" 
              size={14} 
              className="text-text-tertiary" 
              aria-hidden="true"
            />
          )}
          
          {crumb.isLast ? (
            <span className="flex items-center space-x-1.5 text-text-primary font-medium">
              <Icon name={crumb.icon} size={14} />
              <span>{crumb.label}</span>
            </span>
          ) : (
            <button
              onClick={() => handleBreadcrumbClick(crumb.path)}
              onKeyDown={(e) => handleKeyDown(e, crumb.path)}
              className="flex items-center space-x-1.5 text-text-secondary hover:text-secondary transition-colors duration-150 rounded-sm px-1 py-0.5 hover:bg-secondary-50"
              aria-label={`Aller à ${crumb.label}`}
            >
              <Icon name={crumb.icon} size={14} />
              <span>{crumb.label}</span>
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;