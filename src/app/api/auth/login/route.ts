import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email, password } = await req.json();
    console.log("Requête login reçue :", { email });

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Mot de passe incorrect" }, { status: 401 });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
    console.log("Token généré :", token); // Log pour vérifier

    return NextResponse.json(
      {
        message: "Connexion réussie",
        token,
        user: { username: user.username, email: user.email },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur dans POST /api/auth/login :", error);
    return NextResponse.json(
      { message: "Erreur serveur", error: (error as Error).message },
      { status: 500 }
    );
  }
}