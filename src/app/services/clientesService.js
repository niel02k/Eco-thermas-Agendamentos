// src/app/services/clientesService.js
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/**
 * Buscar cliente por CPF
 */
export async function buscarClientePorCpf(cpf) {
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('cpf', cpfLimpo)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar cliente por CPF:', error);
    throw error;
  }

  return data;
}

/**
 * Criar novo cliente
 */
export async function criarCliente(dados) {
  console.log('📝 Criando cliente com dados:', dados);

  const clienteData = {
    nome: dados.nome,
    cpf: dados.cpf.replace(/\D/g, ''),
    email: dados.email || null,
    telefone: dados.telefone || null,
    idade: dados.idade ? Number(dados.idade) : null,  // 👈 IDADE, não data_nascimento
    origem: dados.origem || 'OUTRO',
  };

  // Remover campos undefined/null que não deveriam ser enviados
  Object.keys(clienteData).forEach(key => {
    if (clienteData[key] === undefined) delete clienteData[key];
  });

  console.log('📤 Enviando para Supabase:', clienteData);

  const { data, error } = await supabase
    .from('clientes')
    .insert([clienteData])
    .select()
    .single();

  if (error) {
    console.error('❌ Erro ao criar cliente:', error);
    throw error;
  }

  console.log('✅ Cliente criado:', data);
  return data.id;
}

/**
 * Atualizar cliente existente
 */
export async function atualizarCliente(id, dados) {
  const updateData = {
    nome: dados.nome,
    email: dados.email || null,
    telefone: dados.telefone || null,
    idade: dados.idade ? Number(dados.idade) : undefined,  // 👈 IDADE
    origem: dados.origem,
  };

  // Remover undefined
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) delete updateData[key];
  });

  const { data, error } = await supabase
    .from('clientes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw error;
  }

  return data;
}

/**
 * Listar clientes com paginação
 */
export async function listarClientes({ pagina = 1, limite = 10, busca = '' } = {}) {
  const inicio = (pagina - 1) * limite;
  const fim = inicio + limite - 1;

  let query = supabase
    .from('clientes')
    .select('*', { count: 'exact' });

  if (busca) {
    query = query.or(`nome.ilike.%${busca}%,cpf.ilike.%${busca}%`);
  }

  const { data, count, error } = await query
    .order('nome', { ascending: true })
    .range(inicio, fim);

  if (error) throw error;

  return {
    clientes: data || [],
    total: count || 0,
    pagina,
    totalPaginas: Math.ceil((count || 0) / limite)
  };
}

/**
 * Buscar cliente por ID
 */
export async function buscarClientePorId(id) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}


