// src/app/services/usuariosServices.js
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function listarConsultores({ status = 'ATIVO' } = {}) {
  try {
    let query = supabase
      .from('usuarios')
      .select('*')
      .eq('cargo', 'CONSULTOR'); // Usando o campo 'cargo' da sua tabela

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Garante que sempre retorna um array
    return data || [];
  } catch (error) {
    console.error('Erro ao listar consultores:', error);
    return []; // Retorna array vazio em caso de erro
  }
}

export async function listarUsuariosPorCargo(cargo, status = 'ATIVO') {
  try {
    let query = supabase
      .from('usuarios')
      .select('*')
      .eq('cargo', cargo);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error(`Erro ao listar usuários com cargo ${cargo}:`, error);
    return [];
  }
}

// Se você quiser listar todos os usuários
export async function listarUsuarios({ status = 'ATIVO', cargo = null } = {}) {
  try {
    let query = supabase
      .from('usuarios')
      .select('*');

    if (status) {
      query = query.eq('status', status);
    }

    if (cargo) {
      query = query.eq('cargo', cargo);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return [];
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