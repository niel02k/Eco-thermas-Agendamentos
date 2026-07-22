"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function criarUsuario({
  nome,
  email,
  senha,
  cargo,
}) {
  const { data, error } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,

      user_metadata: {
        nome,
        cargo,
      },
    });

  if (error) {
    throw new Error(error.message);
  }

  return {
    sucesso: true,
    data,
  };
}