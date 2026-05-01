import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getApiError } from "../api/client";

const AuthContext = createContext(null);

const safeGetStoredUser = () => {
  try {
    const raw = localStorage.getItem("auth_user") || localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("user");
    return null;
  }
};

const safeGetStoredToken = () => {
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(safeGetStoredUser());
  const [token, setToken] = useState(safeGetStoredToken());

  const saveSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem("auth_token", nextToken);
    localStorage.setItem("auth_user", JSON.stringify(nextUser));
    localStorage.setItem("user", JSON.stringify(nextUser));
  };

  const clearSession = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("user");
    } catch {
      // no-op
    }
  };

  // Restore missing user data from backend when a token exists.
  useEffect(() => {
    const hydrateSession = async () => {
      if (!token || user) return;
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
        localStorage.setItem("auth_user", JSON.stringify(data));
        localStorage.setItem("user", JSON.stringify(data));
      } catch {
        clearSession();
      }
    };
    hydrateSession();
  }, [token, user]);

  const loginStep1 = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data?.token && data?.user) {
        saveSession(data.token, data.user);
      }
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: getApiError(error, "Login failed") };
    }
  };

  const loginStep2 = async (tempToken, code) => {
    try {
      const { data } = await api.post("/auth/2fa/verify", {
        temp_token: tempToken,
        code,
      });
      saveSession(data.token, data.user);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: getApiError(error, "2FA verification failed") };
    }
  };

  const resendOtp = async (tempToken) => {
    try {
      const { data } = await api.post("/auth/2fa/resend", {
        temp_token: tempToken,
      });
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: getApiError(error, "Failed to resend verification code") };
    }
  };

  const refreshMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      localStorage.setItem("auth_user", JSON.stringify(data));
      localStorage.setItem("user", JSON.stringify(data));
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: getApiError(error) };
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      isAdmin: user?.role === "admin",
      isTeacher: user?.role === "teacher",
      loginStep1,
      loginStep2,
      resendOtp,
      refreshMe,
      logout: clearSession,
      saveSession,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
