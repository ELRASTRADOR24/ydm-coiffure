import { NextResponse } from "next/server";
import { getUserByEmail, createAdminUserIfMissing } from "@/lib/store";
import { comparePassword, setAdminSessionCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Identifiants requis." },
        { status: 400 }
      );
    }

    await createAdminUserIfMissing();
    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Adresse e-mail ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Adresse e-mail ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    await setAdminSessionCookie({
      userId: user.id || user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erreur de connexion:", error);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue lors de la connexion." },
      { status: 500 }
    );
  }
}
