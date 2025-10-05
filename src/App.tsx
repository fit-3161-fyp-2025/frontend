import { BrowserRouter, Route, Routes } from "react-router";
import { Layout } from "@/layout";
import { Dashboard } from "@/dashboard";
import { Settings } from "@/settings";
import Projects from "@/projects";
import { Events } from "@/events";
import { LogIn } from "@/login";
import { SignUp } from "@/signup";
import Error from "@/error";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { JoinCreateTeam } from "./JoinCreateTeam";
import { ManageTeams } from "./ManageTeams";
import { EmailVerification } from "./EmailVerification";
import { TeamDetails } from "./pages/TeamDetails";
import { SmartLanding } from "./components/SmartLanding";
import { PublicEvents } from "./PublicEvents";
import { ToastProvider } from "@/components/ui/toast";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<SmartLanding />} />
            <Route path="/public/events" element={<PublicEvents />} />
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
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
            </Route>

            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Events />} />
            </Route>

            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Projects />} />
            </Route>

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Settings />} />
            </Route>

            <Route
              path="/teams"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ManageTeams />} />
              <Route path=":teamId" element={<TeamDetails />} />
            </Route>
            <Route path="*" element={<Error />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
