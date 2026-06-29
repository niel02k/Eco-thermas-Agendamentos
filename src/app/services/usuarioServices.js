import { createClient } from '@/lib/supabase/client';


const supabase = createClient();

/* ===========================================================
   LISTAR USUÁRIOS
=========================================================== */

export async function listarUsuarios({
  pagina = 1,
  limite = 10,
  busca = '',
  status = '',
  cargo = ''
} = {}) {

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

  if (error) throw error;

  return {
    usuarios: data,
    total: count,
    pagina,
    totalPaginas: Math.ceil(count / limite)
  };
}

/* ===========================================================
   BUSCAR POR ID
=========================================================== */

export async function buscarUsuario(id) {

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return data;
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