import { createClient } from '@/lib/supabase/client';


const supabase = createClient();


// ============ DASHBOARD ============


export async function getTotalClientes() {
  console.log('🔵 Buscando total de clientes...');
 
  const { data, error, count } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true });


  console.log('📦 Resposta completa:', { data, error, count });
 
  if (error) {
    console.error('🔴 Erro detalhado:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(error.message || 'Erro ao buscar clientes');
  }


  console.log('✅ Total encontrado:', count);
  return count || 0;
}


// ============ LISTAR COM PAGINAÇÃO ============


export async function listarClientes(pagina = 1, limite = 10) {
  const inicio = (pagina - 1) * limite;
  const fim = inicio + limite - 1;


  const { data, count, error } = await supabase
    .from('clientes')
    .select('*', { count: 'exact' })
    .range(inicio, fim)
    .order('nome', { ascending: true });


  if (error) throw error;


  return {
    clientes: data,
    total: count,
    pagina,
    totalPaginas: Math.ceil(count / limite)
  };
}


// ============ BUSCAR POR ID ============


export async function buscarCliente(id) {
  const { data, error } = await supabase
    .from('clientes')
    .select(`
      *,
      agendamentos (
        id,
        data_visita,
        horario_visita,
        quantidade_pessoas,
        status
      ),
      contratos:titular_cpf (
        id,
        valor_total,
        status,
        data_inicio,
        data_fim
      )
    `)
    .eq('id', id)
    .single();


  if (error) throw error;
  return data;
}


// ============ CRIAR ============


export async function criarCliente(dados) {
  const { data, error } = await supabase
    .from('clientes')
    .insert([{
      nome: dados.nome,
      cpf: dados.cpf,
      email: dados.email,
      telefone: dados.telefone,
      data_nascimento: dados.data_nascimento,
      origem: dados.origem || 'OUTRO'
    }])
    .select()
    .single();


  if (error) throw error;
  return data;
}


// ============ ATUALIZAR ============


export async function atualizarCliente(id, dados) {
  const { data, error } = await supabase
    .from('clientes')
    .update({
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      data_nascimento: dados.data_nascimento,
      origem: dados.origem
    })
    .eq('id', id)
    .select()
    .single();


  if (error) throw error;
  return data;
}


// ============ EXCLUIR ============


export async function excluirCliente(id) {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id);


  if (error) throw error;
  return true;
}


// ============ BUSCAR POR NOME/CPF ============


export async function buscarClientesPorTermo(termo) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .or(`nome.ilike.%${termo}%,cpf.ilike.%${termo}%`)
    .order('nome', { ascending: true })
    .limit(20);


  if (error) throw error;
  return data;
}






// ============ CLIENTES DO MÊS ============
export async function getClientesPorOrigem({ dataInicio = '', dataFim = '' } = {}) {
  let query = supabase.from('clientes').select('origem');


  if (dataInicio) query = query.gte('data_cadastro', dataInicio);
  if (dataFim) query = query.lte('data_cadastro', dataFim);


  const { data, error } = await query;


  if (error) throw error;


  const origemCount = data.reduce((acc, cliente) => {
    acc[cliente.origem] = (acc[cliente.origem] || 0) + 1;
    return acc;
  }, {});


  return origemCount;
}


export async function getClientesPorPeriodo(dataInicio, dataFim) {
  const { data, error } = await supabase
    .from('clientes')
    .select('data_cadastro')
    .gte('data_cadastro', dataInicio)
    .lte('data_cadastro', dataFim);


  if (error) throw error;


  // Agrupa por mês
  const porMes = data.reduce((acc, cliente) => {
    const mes = new Date(cliente.data_cadastro).getMonth();
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {});


  return porMes;
}
