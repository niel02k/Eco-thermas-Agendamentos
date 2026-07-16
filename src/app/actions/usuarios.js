// src/app/actions/usuarios.js
"use server";

import { createClient } from '@/lib/supabase/server';

export async function criarUsuario({ nome, email, senha, cargo }) {
  const supabase = await createClient();

  // Chamar a função SQL diretamente
  const { data, error } = await supabase.rpc('criar_usuario_sql', {
    p_nome: nome,
    p_email: email,
    p_senha: senha,
    p_cargo: cargo,
  });

  if (error) {
    console.error('Erro RPC:', error);
    throw new Error(error.message || 'Erro ao criar usuário');
  }

  if (!data.sucesso) {
    throw new Error(data.erro || 'Erro ao criar usuário');
  }

  return { sucesso: true };
}