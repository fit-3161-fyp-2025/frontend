import { authApi } from "@/api/auth";
import { type AuthContextType, type User } from "@/types/auth";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = !!user;

  // Ask backend who the user is (cookie-based session)
  const fetchMe = async () => {
    try {
      const userRes = await authApi.me();
      setUser(userRes);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setIsLoading(true);
      try {
        await fetchMe();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
    // Initial load only - token refresh is handled by useTokenRefresh hook
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const form = _form_helper(email, password);

      // Server should set http-only cookies (access/refresh) via Set-Cookie
      await authApi.login(form);
      // Only fetch user data if login was successful
      await fetchMe();
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    _passwordConfirmation: string,
    first_name: string,
    last_name: string
  ): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.register({ email, password, first_name, last_name });
      // NOTE: LOGIN WILL NOW HAPPEN AFTER EMAIL VERFICATION
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Server should clear cookies + revoke refresh token
      await authApi.logout();
    } finally {
      setUser(null);
      if (
        !location.pathname.startsWith("/signup") &&
        !location.pathname.startsWith("/email-verify")
      ) {
        navigate("/login", { replace: true });
      }
    }
  };

  const verifyEmailAndLogin = async (
    email: string,
    password: string,
    code: string
  ) => {
    try {
      setIsLoading(true);
      // Clear user state without navigating
      setUser(null);

      const user = await authApi.verifyCode({
        email: email,
        verification_code: code,
      });

      if (!user) {
        throw new Error("Failed to validate email");
      }

      const form = _form_helper(email, password);
      await authApi.login(form);

      await fetchMe();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    verifyEmailAndLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

function _form_helper(email: string, password: string): FormData {
  const form = new FormData();
  form.append("username", email);
  form.append("password", password);
  return form;
}
