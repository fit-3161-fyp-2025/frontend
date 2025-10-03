import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router";
import { LandingPage } from "@/LandingPage";
import { ProgressLoading } from "@/components/ProgressLoading";

export function SmartLanding() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <ProgressLoading message="Loading..." />;
  }

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is not authenticated, show landing page
  return <LandingPage />;
}
