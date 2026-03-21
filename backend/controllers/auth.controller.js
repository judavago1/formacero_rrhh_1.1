import { db } from "../db.js";

export const login = (req, res) => {
  const { correo, password } = req.body;

  db.query(
    "SELECT * FROM usuarios WHERE correo=? AND password=?",
    [correo, password],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length > 0) {
        res.json({ success: true, user: result[0] });
      } else {
        res.json({ success: false, message: "Credenciales incorrectas" });
      }
    }
  );
};