import { supabase } from "../config/supabase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {

  const { usuario, correo, password } = req.body;
  const loginValue = (usuario || correo || "").trim();

  if (!loginValue || !password) {
    return res.status(400).json({
      message: "Usuario y contraseña son obligatorios"
    });
  }

  try {

    // 🔍 Buscar usuario por correo o cédula
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
      const fallback = await supabase
        .from("usuarios")
        .select("*")
        .eq("username", loginValue)
        .limit(1);

      if (fallback.error) {
        console.error("ERROR DB fallback:", fallback.error);
        return res.status(500).json({ message: "Error servidor" });
      }

      data = fallback.data;
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