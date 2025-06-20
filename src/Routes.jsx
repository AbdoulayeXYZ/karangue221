import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import Header from "components/ui/Header";
import FleetDashboard from "pages/fleet-dashboard";
import LiveVehicleTracking from "pages/live-vehicle-tracking";
import DriverBehaviorAnalytics from "pages/driver-behavior-analytics";
import CameraFeedViewer from "pages/camera-feed-viewer";
import VehicleManagement from "pages/vehicle-management";
import Login from "pages/Login";

const ActivityManagement = lazy(() => import('pages/activity-management/ActivityManagement'));
const DeviceManagement = lazy(() => import('pages/device-management/DeviceManagement'));
const FleetManagement = lazy(() => import('pages/fleet-management/FleetManagement'));
const NotificationManagement = lazy(() => import('pages/notification-management/NotificationManagement'));
const TelemetryManagement = lazy(() => import('pages/telemetry-management/TelemetryManagement'));
const AssignmentManagement = lazy(() => import('pages/assignment-management/AssignmentManagement'));
const ViolationManagement = lazy(() => import('pages/violation-management/ViolationManagement'));
const UserManagement = lazy(() => import('pages/user-management/UserManagement'));

function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Header />
        <div className="pt-16 min-h-screen bg-background">
          <RouterRoutes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <RouterRoutes>
                    <Route path="/" element={<Navigate to="/fleet-dashboard" replace />} />
                    <Route path="/fleet-dashboard" element={<FleetDashboard />} />
                    <Route path="/live-vehicle-tracking" element={<LiveVehicleTracking />} />
                    <Route path="/driver-behavior-analytics" element={<DriverBehaviorAnalytics />} />
                    <Route path="/camera-feed-viewer" element={<CameraFeedViewer />} />
                    <Route path="/vehicle-management" element={<VehicleManagement />} />
                    <Route path="/activity-management" element={<Suspense fallback={<div>Chargement...</div>}><ActivityManagement /></Suspense>} />
                    <Route path="/device-management" element={<Suspense fallback={<div>Chargement...</div>}><DeviceManagement /></Suspense>} />
                    <Route path="/fleet-management" element={<Suspense fallback={<div>Chargement...</div>}><FleetManagement /></Suspense>} />
                    <Route path="/notification-management" element={<Suspense fallback={<div>Chargement...</div>}><NotificationManagement /></Suspense>} />
                    <Route path="/telemetry-management" element={<Suspense fallback={<div>Chargement...</div>}><TelemetryManagement /></Suspense>} />
                    <Route path="/assignment-management" element={<Suspense fallback={<div>Chargement...</div>}><AssignmentManagement /></Suspense>} />
                    <Route path="/violation-management" element={<Suspense fallback={<div>Chargement...</div>}><ViolationManagement /></Suspense>} />
                    <Route path="/user-management" element={<Suspense fallback={<div>Chargement...</div>}><UserManagement /></Suspense>} />
                    {/* Ajoute ici la route admin-dashboard plus tard */}
                  </RouterRoutes>
                </PrivateRoute>
              }
            />
          </RouterRoutes>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;