import express from "express";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

dotenv.config();

const db = new Database("auth.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    reset_token TEXT,
    reset_token_expires DATETIME
  )
`);

// Email helper
let transporter: nodemailer.Transporter | null = null;

async function sendEmail({ to, subject, text, html }: { to: string, subject: string, text: string, html: string }) {
  if (!transporter) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
    
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      console.warn("[EMAIL] SMTP configuration missing. Falling back to console log.");
      console.log("\n" + "=".repeat(40));
      console.log(`[MOCK EMAIL] TO: ${to}`);
      console.log(`[MOCK EMAIL] SUBJECT: ${subject}`);
      console.log(`[MOCK EMAIL] BODY: ${text}`);
      console.log("=".repeat(40) + "\n");
      return;
    }

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: parseInt(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Aura Health" <noreply@aurahealth.com>',
      to,
      subject,
      text,
      html,
    });
    console.log(`[EMAIL] Sent successfully to ${to}`);
  } catch (err) {
    console.error("[EMAIL ERROR]", err);
    throw new Error("Failed to send email");
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    
    // Simple password validation: 8 chars, letters, numbers, symbols
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters and include letters, numbers, and symbols" });
    }

    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const insert = db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
      insert.run(email, passwordHash);
      
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ email });
    } catch (err: any) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ error: "Email already exists" });
      }
      throw err;
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ email });
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user) {
      // Don't reveal if user exists for security, but for this demo we'll be helpful
      return res.status(400).json({ error: "User not found" });
    }

    const resetToken = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 chars (4 bytes hex)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    db.prepare("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?")
      .run(resetToken, expiresAt, email);

    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}&email=${email}`;

    // Send real email
    sendEmail({
      to: email,
      subject: "Recuperación de Contraseña - Aura Health",
      text: `Hola,\n\nHas solicitado restablecer tu contraseña en Aura Health.\n\nTu código de recuperación es: ${resetToken}\n\nO puedes usar este enlace: ${resetUrl}\n\nSi no solicitaste esto, puedes ignorar este correo.\n\nSaludos,\nEl equipo de Aura Health`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #8B5CF6; margin-bottom: 20px;">Recuperación de Contraseña</h2>
          <p>Hola,</p>
          <p>Has solicitado restablecer tu contraseña en <strong>Aura Health</strong>.</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Tu código de recuperación</p>
            <h1 style="font-size: 32px; font-weight: 900; color: #1e293b; margin: 0; letter-spacing: 0.2em;">${resetToken}</h1>
          </div>
          <p>También puedes hacer clic en el siguiente botón para restablecer tu clave directamente:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #8B5CF6; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            Si no solicitaste esto, puedes ignorar este correo de forma segura. Este enlace expirará en 15 minutos.
          </p>
        </div>
      `
    }).catch(err => console.error("Async email send failed:", err));

    res.json({ message: "Reset token sent to email" });
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ error: "All fields are required" });

    const user = db.prepare("SELECT * FROM users WHERE email = ? AND reset_token = ?").get(email, token) as any;
    if (!user) return res.status(400).json({ error: "Invalid token or email" });

    if (new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ error: "Token expired" });
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ error: "Password must be at least 8 characters and include letters, numbers, and symbols" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE email = ?")
      .run(passwordHash, email);

    res.json({ message: "Password updated successfully" });
  });

  app.get("/api/auth/me", (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
      res.json({ email: decoded.email });
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.json({ message: "Logged out" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("[SERVER ERROR]", err);
    res.status(500).json({ error: "Internal server error" });
  });
}

startServer();
