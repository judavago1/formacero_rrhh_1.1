import { supabase } from "../config/supabase.js";
import bcrypt from "bcrypt";

const findOrCreateDepartamentoId = async (nombre) => {
  if (!nombre?.trim()) return null;

  const { data, error } = await supabase
    .from("departamentos")
    .select("id")
    .eq("nombre", nombre)
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  if (data?.id) return data.id;

  const { data: insertData, error: insertError } = await supabase
    .from("departamentos")
    .insert([{ nombre }])
    .select("id")
    .single();

  if (insertError) throw insertError;

  return insertData?.id || null;
};

// 🔹 OBTENER EMPLEADOS
export const getEmpleados = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("empleados")
      .select("id, nombre, correo, telefono, salario, fecha_ingreso, fecha_nacimiento, documento, departamento_id, departamentos(nombre)");

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("ERROR GET:", err);
    res.status(500).json(err);
  }
};

// 🔹 CONTAR EMPLEADOS ACTIVOS (DASHBOARD)
export const countEmpleados = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from("empleados")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    res.json({ total: count });
  } catch (err) {
    console.error("ERROR COUNT:", err);
    res.status(500).json(err);
  }
};

// 🔹 CREAR EMPLEADO
export const createEmpleado = async (req, res) => {
  try {
    const {
      nombre,
      cedula,
      correo,
      salario,
      fechaIngreso,
      departamento,
      fechaNacimiento,
      telefono,
      direccion
    } = req.body;

    if (!nombre || !cedula || !correo) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const departamentoId = departamento
      ? await findOrCreateDepartamentoId(departamento)
      : null;

    const empleadoPayload = {
      nombre,
      documento: cedula,
      correo,
      salario: salario || null,
      fecha_ingreso: fechaIngreso || null,
      fecha_nacimiento: fechaNacimiento || null,
      telefono: telefono || null,
      direccion: direccion || null,
      departamento_id: departamentoId
    };

    const { data: empleadoData, error: empError } = await supabase
      .from("empleados")
      .insert([empleadoPayload])
      .select();

    if (empError) throw empError;

    const empleadoId = empleadoData[0].id;

    // 2️⃣ Crear usuario
    const defaultPassword = cedula;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const { error: userError } = await supabase
      .from("usuarios")
      .insert([{
        nombre,
        correo,
        password: hashedPassword,
        rol: "empleado",
        empleado_id: empleadoId
      }]);

    if (userError) throw userError;

    res.json({
      message: "Empleado y usuario creados",
      credenciales: {
        correo,
        password: defaultPassword
      }
    });

  } catch (err) {
    console.error("ERROR CREATE:", err);
    res.status(500).json(err);
  }
};

// 🔹 ACTUALIZAR EMPLEADO
export const updateEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, departamento } = req.body;

    const departamentoId = departamento
      ? await findOrCreateDepartamentoId(departamento)
      : null;

    const updateData = {
      nombre
    };

    if (departamentoId !== null) {
      updateData.departamento_id = departamentoId;
    }

    const { error } = await supabase
      .from("empleados")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Empleado actualizado" });
  } catch (err) {
    console.error("ERROR UPDATE:", err);
    res.status(500).json(err);
  }
};

// 🔥 ELIMINAR → MOVER A EXEMPLEADOS
export const deleteEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    if (!motivo || motivo.trim() === "") {
      return res.status(400).json({ message: "Motivo obligatorio" });
    }

    // 1️⃣ Obtener empleado
    const { data: empleado, error: selectError } = await supabase
      .from("empleados")
      .select("*")
      .eq("id", id)
      .single();

    if (selectError) throw selectError;

    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    // 2️⃣ Intentar insertar en exempleados si la tabla existe
    const { error: insertError } = await supabase
      .from("exempleados")
      .insert([{
        nombre: empleado.nombre,
        correo: empleado.correo,
        telefono: empleado.telefono || null,
        fecha_salida: new Date(),
        razon_despido: motivo
      }]);

    if (insertError) {
      if (insertError.code === "PGRST205") {
        return res.status(500).json({
          message: "La tabla 'exempleados' no existe en la base de datos. Crea esta tabla para poder mover empleados eliminados."
        });
      }
      throw insertError;
    }

    // 3️⃣ Eliminar usuario asociado primero para evitar restricción de FK
    const { error: userDeleteError } = await supabase
      .from("usuarios")
      .delete()
      .eq("empleado_id", id);

    if (userDeleteError && userDeleteError.code !== "PGRST205") {
      throw userDeleteError;
    }

    // 4️⃣ Eliminar de empleados
    const { error: deleteError } = await supabase
      .from("empleados")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    res.json({
      message: "Empleado eliminado correctamente"
    });

  } catch (err) {
    console.error("ERROR DELETE:", err);
    res.status(500).json(err);
  }
};

// 🔹 OBTENER EXEMPLEADOS
export const getExEmpleados = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("exempleados")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      if (error.code === "PGRST205") {
        return res.status(500).json({
          message: "La tabla 'exempleados' no existe en la base de datos. Crea esta tabla para ver los exempleados."
        });
      }
      throw error;
    }

    res.json(data);
  } catch (err) {
    console.error("ERROR GET EX:", err);
    res.status(500).json(err);
  }
};

// 🔥 ELIMINAR DEFINITIVAMENTE EXEMPLEADO
export const deleteExEmpleado = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("exempleados")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.code === "PGRST205") {
        return res.status(404).json({ message: "No existe historial de exempleados" });
      }
      throw error;
    }

    res.json({ message: "Exempleado eliminado definitivamente" });
  } catch (err) {
    console.error("ERROR DELETE EX:", err);
    res.status(500).json(err);
  }
};

// 🎂 EMPLEADOS QUE CUMPLEN AÑOS ESTE MES
export const getCumpleaneros = async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;

    const { data, error } = await supabase
      .from("empleados")
      .select("id, nombre, fecha_nacimiento");

    if (error) throw error;

    const filtrados = data.filter(emp => {
      if (!emp.fecha_nacimiento) return false;
      const mes = new Date(emp.fecha_nacimiento).getMonth() + 1;
      return mes === currentMonth;
    });

    res.json(filtrados);

  } catch (err) {
    console.error("ERROR CUMPLEAÑOS:", err);
    res.status(500).json(err);
  }
};

// 🔍 BUSCAR EMPLEADO POR NOMBRE
export const searchEmpleado = async (req, res) => {
  try {
    const { q } = req.query;

    const { data, error } = await supabase
      .from("empleados")
      .select("id, nombre, documento, correo, telefono, departamento_id, departamentos(nombre)")
      .ilike("nombre", `%${q}%`)
      .limit(5);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("ERROR SEARCH:", err);
    res.status(500).json(err);
  }
};

// 🔹 OBTENER EMPLEADO POR ID
export const getEmpleadoById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("empleados")
      .select("*, departamentos(nombre)")
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    res.json(data);
  } catch (err) {
    console.error("ERROR GET BY ID:", err);
    res.status(500).json(err);
  }
};

// 🔹 OBTENER DATOS PARA CERTIFICADO
export const getCertificadoEmpleado = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("empleados")
      .select("nombre, salario, fecha_ingreso")
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    res.json(data);
  } catch (err) {
    console.error("ERROR CERTIFICADO:", err);
    res.status(500).json(err);
  }
};