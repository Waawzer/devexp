"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/authService";

interface User {
  _id?: string;
  username: string;
  email: string;
  description?: string;
  skills?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: { username: string; email: string; password: string }) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Vérifier le token au chargement
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = authService.verifyToken(token);
        // Charger les données de l'utilisateur
        fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((userData) => {
            setUser(userData);
          })
          .catch((error) => {
            console.error("Erreur lors du chargement de l'utilisateur:", error);
            localStorage.removeItem("token");
          });
      } catch (error) {
        console.error("Token invalide:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const register = async (userData: { username: string; email: string; password: string }) => {
    const data = await authService.register(userData);
    // Après l'inscription, connecter automatiquement
    await login(userData.email, userData.password);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}