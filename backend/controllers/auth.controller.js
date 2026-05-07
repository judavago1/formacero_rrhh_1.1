import { supabase } from "../config/supabase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

const smtpPort = Number(process.env.EMAIL_PORT) || 465;
const smtpSecure = process.env.EMAIL_SECURE
  ? process.env.EMAIL_SECURE === "true"
  : smtpPort === 465;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

// Configuración de Nodemailer (STARTTLS en 587, SSL en 465)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const hasValidEmailConfig = () => {
  return Boolean(
    process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      process.env.EMAIL_FROM &&
      !process.env.EMAIL_USER.includes("tu-usuario@")
  );
};

export const login = async (req, res) => {
  const { usuario, correo, password } = req.body;
  const loginValue = (correo || usuario || "").trim().toLowerCase();

  if (!loginValue || !password) {
    return res.status(400).json({
      message: "Correo y contraseña son obligatorios"
    });
  }

  try {

    // 🔍 Buscar usuario por correo
    let { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("correo", loginValue)
      .limit(1);

    if (error) {
      console.error("ERROR DB:", error);
      return res.status(500).json({ message: "Error servidor" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "Usuario no existe"
      });
    }

    const user = data[0];

    try {

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(401).json({
          message: "Contraseña incorrecta"
        });
      }

      // 🔐 TOKEN (PRODUCCIÓN)
      const token = jwt.sign(
        {
          id: user.id,
          rol: user.rol
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      res.json({
        message: "Login exitoso",
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          rol: user.rol,
          empleado_id: user.empleado_id
        }
      });

    } catch (error) {
      return res.status(500).json({
        message: "Error validando contraseña"
      });
    }

  } catch (err) {
    console.error("ERROR GENERAL:", err);
    return res.status(500).json({
      message: "Error servidor"
    });
  }

};
// 🔑 RECUPERAR CONTRASEÑA
export const forgotPassword = async (req, res) => {
  const correo = (req.body?.correo || "").trim().toLowerCase();
  if (!correo) {
    return res.status(400).json({ message: "Correo es obligatorio" });
  }

  if (!hasValidEmailConfig()) {
    return res.status(500).json({
      message: "Falta configurar el servicio de correo en el backend",
    });
  }

  try {
    // 1) Buscar usuario por correo en tabla usuarios
    const { data: userByCorreo, error: userByCorreoError } = await supabase
      .from("usuarios")
      .select("id, correo")
      .eq("correo", correo)
      .single();

    let user = userByCorreo;

    // 2) Si no está en usuarios, buscar por correo del empleado y luego resolver usuario por empleado_id
    if (userByCorreoError || !userByCorreo) {
      const { data: empleado, error: empleadoError } = await supabase
        .from("empleados")
        .select("id, correo")
        .eq("correo", correo)
        .single();

      if (!empleadoError && empleado) {
        const { data: userByEmpleado, error: userByEmpleadoError } = await supabase
          .from("usuarios")
          .select("id, correo")
          .eq("empleado_id", empleado.id)
          .single();

        if (!userByEmpleadoError && userByEmpleado) {
          user = userByEmpleado;
        }
      }
    }

    if (!user) {
      return res.status(404).json({
        message: "No existe una cuenta de acceso asociada a ese correo",
      });
    }

    // Generar token único y expiración (1 hora)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000);  // 1 hora

    // Guardar token en DB
    const { error: updateError } = await supabase
      .from("usuarios")
      .update({ reset_token: resetToken, reset_expires: resetExpires })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error guardando token:", updateError);
      return res.status(500).json({ message: "Error interno" });
    }

    // Enviar email
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: correo,
      subject: "Recuperación de contraseña - Formacero RRHH",
      html: `<p>Haz clic en el enlace para restablecer tu contraseña: <a href="${resetUrl}">${resetUrl}</a></p><p>Expira en 1 hora.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Email de recuperación enviado" });
  } catch (err) {
    console.error("Error en forgotPassword:", err);
    res.status(500).json({ message: "Error interno" });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token y nueva contraseña son obligatorios" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      message: "La nueva contraseña debe tener al menos 8 caracteres",
    });
  }

  try {
    // Buscar usuario por token y verificar expiración
    const { data: user, error } = await supabase
      .from("usuarios")
      .select("id, reset_expires")
      .eq("reset_token", token)
      .single();

    if (error || !user || new Date() > new Date(user.reset_expires)) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar token
    const { error: updateError } = await supabase
      .from("usuarios")
      .update({ password: hashedPassword, reset_token: null, reset_expires: null })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error actualizando contraseña:", updateError);
      return res.status(500).json({ message: "Error interno" });
    }

    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (err) {
    console.error("Error en resetPassword:", err);
    res.status(500).json({ message: "Error interno" });
  }
};