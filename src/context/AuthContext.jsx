import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getApiError } from "../api/client";
import { getSupabaseBrowserClient, getSupabaseConfigError, isSupabaseConfigured } from "../supabase";

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

const extractAuthConfigMessage = (error) => {
  const backendMessage = error?.response?.data?.error || "";
  const details = error?.response?.data?.details;
  if (Array.isArray(details) && details.length > 0) {
    return `${backendMessage}: ${details.join(", ")}`;
  }
  return backendMessage;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(safeGetStoredUser());
  const [token, setToken] = useState(safeGetStoredToken());
  const [isReady, setIsReady] = useState(false);
  const [authConfigError, setAuthConfigError] = useState("");

  const saveToken = (nextToken) => {
    setToken(nextToken || null);
    if (nextToken) {
      localStorage.setItem("auth_token", nextToken);
    } else {
      localStorage.removeItem("auth_token");
    }
  };

  const saveUser = (nextUser) => {
    setUser(nextUser || null);
    if (nextUser) {
      localStorage.setItem("auth_user", JSON.stringify(nextUser));
      localStorage.setItem("user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("user");
    }
  };

  const clearSession = () => {
    saveToken(null);
    saveUser(null);
  };

  const hydrateProfile = async (accessToken) => {
    if (!accessToken) {
      clearSession();
      return null;
    }

    saveToken(accessToken);

    try {
      const { data } = await api.get("/auth/me");
      saveUser(data);
      setAuthConfigError("");
      return data;
    } catch (error) {
      const configMessage = extractAuthConfigMessage(error);
      if (error?.response?.status === 503 && configMessage) {
        setAuthConfigError(configMessage);
      }
      clearSession();
      throw error;
    }
  };

  useEffect(() => {
    let subscription;

    const bootstrap = async () => {
      const configError = getSupabaseConfigError();
      if (configError) {
        setAuthConfigError(configError);
        setIsReady(true);
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          try {
            await hydrateProfile(session.access_token);
          } catch {
            await supabase.auth.signOut();
          }
        } else {
          clearSession();
        }

        const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
          setTimeout(async () => {
            if (event === "SIGNED_OUT") {
              clearSession();
              return;
            }

            if (nextSession?.access_token) {
              try {
                await hydrateProfile(nextSession.access_token);
              } catch {
                await supabase.auth.signOut();
              }
            }
          }, 0);
        });

        subscription = data.subscription;
      } catch (error) {
        setAuthConfigError(error.message || "Failed to initialize Supabase Auth");
      } finally {
        setIsReady(true);
      }
    };

    bootstrap();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loginStep1 = async (email, password) => {
    if (!isSupabaseConfigured()) {
      return { ok: false, error: getSupabaseConfigError() || "Supabase Auth is not configured yet." };
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { ok: false, error: error.message || "Login failed" };
      }

      const profile = await hydrateProfile(data.session?.access_token);
      return {
        ok: true,
        data: {
          token: data.session?.access_token,
          user: profile,
        },
      };
    } catch (error) {
      const configMessage = extractAuthConfigMessage(error);
      return { ok: false, error: configMessage || getApiError(error, error.message || "Login failed") };
    }
  };

  const refreshMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      saveUser(data);
      setAuthConfigError("");
      return { ok: true, data };
    } catch (error) {
      const configMessage = extractAuthConfigMessage(error);
      if (error?.response?.status === 503 && configMessage) {
        setAuthConfigError(configMessage);
      }
      return { ok: false, error: configMessage || getApiError(error) };
    }
  };

  const logout = async () => {
    clearSession();
    if (!isSupabaseConfigured()) return;

    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // ignore local logout fallback
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      isAdmin: user?.role === "admin",
      isTeacher: user?.role === "teacher",
      isReady,
      authConfigError,
      loginStep1,
      refreshMe,
      logout,
    }),
    [authConfigError, isReady, token, user]
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
