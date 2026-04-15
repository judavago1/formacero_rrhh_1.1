import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// 🔍 Debug (puedes borrarlo luego)
console.log("SUPABASE_URL:", supabaseUrl);
console.log("SUPABASE_KEY_TYPE:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "service_role" : "anon");

export const supabase = createClient(supabaseUrl, supabaseKey);