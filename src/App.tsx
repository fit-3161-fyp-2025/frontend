import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Layout } from "@/layout";
import { Dashboard } from "@/dashboard";
import { Settings } from "@/settings";
import Projects from "@/projects";
import { Events } from "@/events";
import { LogIn } from "@/login";
import { SignUp } from "@/signup";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { JoinCreateTeam } from "./JoinCreateTeam";
import { ManageTeams } from "./ManageTeams";
import { EmailVerification } from "./EmailVerification";
import { TeamDetails } from "./pages/TeamDetails";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes - TODO: Redirect to dashboard if already logged in */}
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/email-verify" element={<EmailVerification />} />

          <Route
            path="/teams/join"
            element={
              <ProtectedRoute>
                <JoinCreateTeam />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Needs to be authenticated */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/teams" element={<ManageTeams />} />
            <Route path="/teams/:teamId" element={<TeamDetails />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
