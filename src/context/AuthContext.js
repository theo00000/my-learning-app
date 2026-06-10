import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const isAuthenticated = Boolean(token && user);

  const saveSession = async ({ token: newToken, user: newUser }) => {
    await AsyncStorage.setItem("learning_token", newToken);
    await AsyncStorage.setItem("learning_user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  };

  const clearSession = async () => {
    await AsyncStorage.removeItem("learning_token");
    await AsyncStorage.removeItem("learning_user");

    setToken(null);
    setUser(null);
  };

  const register = async (payload) => {
    const response = await api.post("/auth/register", payload);
    await saveSession(response.data);
    return response.data;
  };

  const login = async (payload) => {
    const response = await api.post("/auth/login", payload);
    await saveSession(response.data);
    return response.data;
  };

  const logout = async () => {
    await clearSession();
  };

  const refreshProfile = async () => {
    const response = await api.get("/auth/me");
    const freshUser = response.data.user;

    await AsyncStorage.setItem("learning_user", JSON.stringify(freshUser));
    setUser(freshUser);

    return freshUser;
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("learning_token");
        const storedUser = await AsyncStorage.getItem("learning_user");

        if (!storedToken || !storedUser) {
          return;
        }

        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        await refreshProfile();
      } catch {
        await clearSession();
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isCheckingSession,
      register,
      login,
      logout,
      refreshProfile,
    }),
    [user, token, isAuthenticated, isCheckingSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
