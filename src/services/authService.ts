import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import { UserInput } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

interface DecodedToken {
  userId: string;
}

export const authService = {
  async login(email: string, password: string) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Login error");
    }

    const data = await response.json();
    console.log("Token reçu après login :", data.token); // Log pour vérifier
    localStorage.setItem("token", data.token); // Stocke le token
    return data;
  },

  async register(userData: UserInput) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Registration error");
    }

    return response.json();
  },

  verifyToken(token: string): DecodedToken {
    if (!token) {
      throw new Error("Token missing");
    }

    try {
      return jwtDecode(token) as DecodedToken;
    } catch (error) {
      throw new Error("Invalid token");
    }
  },
};