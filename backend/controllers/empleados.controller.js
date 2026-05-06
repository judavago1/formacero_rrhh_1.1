import { supabase } from "../config/supabase.js";
import bcrypt from "bcrypt";

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const SUPABASE_BUCKET = "empleados";

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

const safeParseJSON = (value) => {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
};

const uploadFileToSupabase = async (empleadoId, file, folder) => {
  if (!file) return null;

  const ext = file.originalname.split(".").pop() || "bin";
  const filePath = `${folder}/${empleadoId}/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: publicUrlData, error: publicUrlError } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(filePath);

  if (publicUrlError) throw publicUrlError;
  return publicUrlData?.publicUrl || null;
};

const saveDocumentosMetadata = async (empleadoId, docs) => {
  if (!docs?.length) return;

  for (const file of docs) {
    const url = await uploadFileToSupabase(empleadoId, file, "documentos");
    const { error } = await supabase.from("documentos_empleado").insert([{
      empleado_id: empleadoId,
      nombre_original: file.originalname,
      tipo: file.mimetype,
      url,
    }]);

    if (error && error.code !== "PGRST205") {
      throw error;
    }
  }
};

// 🔹 OBTENER EMPLEADOS
export const getEmpleados = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("empleados")
      .select("id, nombre, correo, telefono, salario, fecha_ingreso, fecha_nacimiento, documento, cargo, departamento_id, foto_url, departamentos(nombre)");

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
      cargo,
      salario,
      fechaIngreso,
      departamento,
      fechaNacimiento,
      telefono,
      direccion,
      contactoEmergencia: contactoRaw
    } = req.body;

    const contactoEmergencia = safeParseJSON(contactoRaw) || {};
    const fotoFile = req.files?.foto?.[0] || null;
    const documentosFiles = req.files?.documentos || [];

    if (!nombre || !cedula || !correo) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    if (fotoFile && fotoFile.size > MAX_PHOTO_SIZE) {
      return res.status(400).json({ message: "La foto no debe superar los 2MB." });
    }

    const correoNormalizado = correo.trim().toLowerCase();
    const cedulaNormalizada = String(cedula).trim();

    const { data: existingEmpleado, error: empleadoExistsError } = await supabase
      .from("empleados")
      .select("id")
      .eq("correo", correoNormalizado)
      .limit(1)
      .single();

    if (empleadoExistsError && empleadoExistsError.code !== "PGRST116") {
      throw empleadoExistsError;
    }

    if (existingEmpleado) {
      return res.status(409).json({
        message: "El correo ya está registrado para otro empleado. Usa un correo diferente."
      });
    }

    const { data: existingUsuario, error: usuarioExistsError } = await supabase
      .from("usuarios")
      .select("id")
      .eq("correo", correoNormalizado)
      .limit(1)
      .single();

    if (usuarioExistsError && usuarioExistsError.code !== "PGRST116") {
      throw usuarioExistsError;
    }

    if (existingUsuario) {
      return res.status(409).json({
        message: "El correo ya está registrado para otro usuario. Usa un correo diferente."
      });
    }

    const departamentoId = departamento
      ? await findOrCreateDepartamentoId(departamento)
      : null;

    const isUsingServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (!isUsingServiceRole && contactoEmergencia && contactoEmergencia.nombre) {
      return res.status(500).json({
        message: "No hay SUPABASE_SERVICE_ROLE_KEY configurada. Sin ella, la tabla contactos_emergencia bloquea la inserción por RLS."
      });
    }

    const empleadoPayload = {
      nombre,
      documento: cedulaNormalizada,
      correo: correoNormalizado,
      cargo: cargo || null,
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

    if (empError) {
      if (empError.code === "23505") {
        return res.status(409).json({
          message: "El correo ya existe en la base de datos. Usa un correo diferente."
        });
      }
      throw empError;
    }

    const empleadoId = empleadoData[0].id;

    let fotoUrl = null;
    if (fotoFile) {
      fotoUrl = await uploadFileToSupabase(empleadoId, fotoFile, "perfil");
      const { error: updateFotoError } = await supabase
        .from("empleados")
        .update({ foto_url: fotoUrl })
        .eq("id", empleadoId);

      if (updateFotoError) {
        throw updateFotoError;
      }
    }

    if (documentosFiles.length) {
      try {
        await saveDocumentosMetadata(empleadoId, documentosFiles);
      } catch (docError) {
        console.warn("No se pudieron guardar todos los documentos:", docError);
      }
    }

    if (contactoEmergencia && contactoEmergencia.nombre) {
      const contactoPayload = {
        empleado_id: empleadoId,
        nombre: contactoEmergencia.nombre,
        relacion: contactoEmergencia.relacion,
        telefono_principal: contactoEmergencia.telefonoPrincipal,
        telefono_alternativo: contactoEmergencia.telefonoAlternativo || null,
        direccion: contactoEmergencia.direccion || null,
        ciudad: contactoEmergencia.ciudad || null,
        autorizacion: false
      };

      const { error: contactoError } = await supabase
        .from("contactos_emergencia")
        .insert([contactoPayload]);

      if (contactoError) {
        await supabase.from("empleados").delete().eq("id", empleadoId);
        await supabase.from("usuarios").delete().eq("empleado_id", empleadoId);

        if (contactoError.code === "42501") {
          return res.status(500).json({
            message: "Error RLS: revise la clave SUPABASE_SERVICE_ROLE_KEY o las políticas de seguridad de la tabla contactos_emergencia."
          });
        }

        throw contactoError;
      }
    }

    const defaultPassword = cedulaNormalizada;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const { error: userError } = await supabase
      .from("usuarios")
      .insert([{
        nombre,
        correo: correoNormalizado,
        password: hashedPassword,
        rol: "empleado",
        empleado_id: empleadoId
      }]);

    if (userError) {
      await supabase.from("empleados").delete().eq("id", empleadoId);

      if (userError.code === "23505") {
        return res.status(409).json({
          message: "El correo ya existe para otro usuario. Usa un correo diferente."
        });
      }

      throw userError;
    }

    res.json({
      message: "Empleado y usuario creados",
      credenciales: {
        correo: correoNormalizado,
        password: defaultPassword
      },
      foto_url: fotoUrl
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
    const { nombre, cargo, departamento, telefono, direccion } = req.body;
    const fotoFile = req.file || null;

    if (fotoFile && fotoFile.size > MAX_PHOTO_SIZE) {
      return res.status(400).json({ message: "La foto no debe superar los 2MB." });
    }

    const departamentoId = departamento
      ? await findOrCreateDepartamentoId(departamento)
      : null;

    const updateData = {};

    if (nombre) updateData.nombre = nombre;
    if (cargo !== undefined) updateData.cargo = cargo;
    if (telefono) updateData.telefono = telefono;
    if (direccion) updateData.direccion = direccion;
    if (departamentoId !== null) {
      updateData.departamento_id = departamentoId;
    }

    if (fotoFile) {
      const fotoUrl = await uploadFileToSupabase(id, fotoFile, "perfil");
      updateData.foto_url = fotoUrl;
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

    // 3.5️⃣ Eliminar contactos de emergencia asociados
    const { error: contactosDeleteError } = await supabase
      .from("contactos_emergencia")
      .delete()
      .eq("empleado_id", id);

    if (contactosDeleteError && contactosDeleteError.code !== "PGRST205") {
      throw contactosDeleteError;
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
    const q = (req.query.q || "").trim();

    if (q.length < 2) {
      return res.json([]);
    }

    const { data, error } = await supabase
      .from("empleados")
      .select("id, nombre, documento, correo, telefono, cargo, foto_url, departamento_id, departamentos(nombre)")
      .or(`nombre.ilike.%${q}%,correo.ilike.%${q}%,documento.ilike.%${q}%`)
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
      .select("*, departamentos(nombre), contactos_emergencia(*)")
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const { data: documentos, error: documentosError } = await supabase
      .from("documentos_empleado")
      .select("id, nombre_original, tipo, url, fecha_subida")
      .eq("empleado_id", id);

    if (!documentosError) {
      data.documentos = documentos;
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