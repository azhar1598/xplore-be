import { Request, Response } from "express";
import { supabase } from "../supabaseClient";

export class AuthController {
  async login(req: Request, res: Response) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback", // Adjust to match your app's callback route
      },
    });

    if (error) {
      console.error("OAuth Error:", error.message);
      return res.status(500).json({ message: "Failed to initiate login" });
    }

    // Redirect the user to the OAuth login URL
    res.redirect(data.url);
  }

  //   async callback(req: Request, res: Response) {
  //     const { code } = req.query;

  //     if (!code) return res.status(400).send("Authorization code missing");

  //     try {
  //       const { data, error } = await supabase.auth.exchangeCodeForSession(
  //         code as string
  //       );

  //       if (error) throw error;

  //       const session = data.session;

  //       // Redirect to your frontend with the session
  //       res.redirect("http://localhost:3000/dashboard"); // Or wherever you want to redirect after successful login
  //     } catch (error) {
  //       console.error("Callback Error:", error);
  //       res.status(500).json({ message: "Failed to handle callback" });
  //     }
  //   }

  async callback(req: Request, res: Response) {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "No code provided" });
    }

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(
        code as string
      );

      if (error) throw error;

      // Set session cookie or handle as needed
      res.cookie("auth-token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect to your frontend
      res.redirect("http://localhost:3000/dashboard");
    } catch (error) {
      console.error("Callback error:", error);
      res.redirect("http://localhost:3000/auth/error");
    }
  }
}
