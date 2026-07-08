// src/app/services/usuariosServices.js

import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/* ===========================================================
   LISTAR USUÁRIOS
=========================================================== */

export async function listarUsuarios({
  pagina = 1,
  limite = 100,
  busca = '',
  status = '',
  cargo = ''
} = {}) {
  try {
    const inicio = (pagina - 1) * limite;
    const fim = inicio + limite - 1;

    let query = supabase
      .from('usuarios')
      .select('*', { count: 'exact' });

    if (busca) {
      query = query.or(`nome.ilike.%${busca}%,email.ilike.%${busca}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (cargo) {
      query = query.eq('cargo', cargo);
    }

    const { data, count, error } = await query
      .order('data_criacao', { ascending: false })
      .range(inicio, fim);

    if (error) {
      console.warn('Erro ao buscar usuários:', error);
      return { usuarios: [], total: 0, pagina, totalPaginas: 0 };
    }

    return {
      usuarios: data || [],
      total: count || 0,
      pagina,
      totalPaginas: Math.ceil((count || 0) / limite)
    };
  } catch (error) {
    console.error('Erro no listarUsuarios:', error);
    return { usuarios: [], total: 0, pagina, totalPaginas: 0 };
  }
}

/* ===========================================================
   BUSCAR POR ID
=========================================================== */

export async function buscarUsuario(id) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}

/* ===========================================================
   CRIAR USUÁRIO
=========================================================== */

export async function criarUsuario(usuario) {
  const { data, error } = await supabase
    .from('usuarios')
    .insert(usuario)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===========================================================
   EDITAR USUÁRIO
=========================================================== */

export async function editarUsuario(id, usuario) {
  const { data, error } = await supabase
    .from('usuarios')
    .update({
      ...usuario,
      data_atualizacao: new Date()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===========================================================
   DESATIVAR USUÁRIO
=========================================================== */

export async function desativarUsuario(id) {
  const { data, error } = await supabase
    .from('usuarios')
    .update({
      status: 'INATIVO',
      data_atualizacao: new Date()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===========================================================
   ATIVAR USUÁRIO
=========================================================== */

export async function ativarUsuario(id) {
  const { data, error } = await supabase
    .from('usuarios')
    .update({
      status: 'ATIVO',
      data_atualizacao: new Date()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===========================================================
   EXCLUIR USUÁRIO
=========================================================== */

export async function excluirUsuario(id) {
  const { error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/* ===========================================================
   ALTERAR COMISSÕES
=========================================================== */

export async function atualizarComissoes(
  id,
  {
    prctagem_Pix,
    prctagem_Rec,
    prctagem_M12x
  }
) {
  const { data, error } = await supabase
    .from('usuarios')
    .update({
      prctagem_Pix,
      prctagem_Rec,
      prctagem_M12x,
      data_atualizacao: new Date()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}