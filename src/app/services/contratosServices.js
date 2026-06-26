import { createClient } from '@/lib/supabase/client';


const supabase = createClient();


// ============ CRUD BÁSICO ============


// LISTAR com busca por nome do titular
export async function listarContratos({ pagina = 1, limite = 10, busca = '' } = {}) {
  const inicio = (pagina - 1) * limite;
  const fim = inicio + limite - 1;


  let query = supabase
    .from('contratos')
    .select(`*,
      vendedor:vendedor_id (nome),
      agendamento:agendamento_id (codigo, data_visita, horario_visita),
      dependentes:contrato_dependentes (nome, cpf)
    `, { count: 'exact' });


  // Busca por nome do titular
  if (busca) {
    query = query.ilike('titular_nome', `%${busca}%`);
  }


  const { data, count, error } = await query
    .order('data_criacao', { ascending: false })
    .range(inicio, fim);


  if (error) throw error;


  return {
    contratos: data,
    total: count,
    pagina,
    totalPaginas: Math.ceil(count / limite)
  };
}


// BUSCAR por ID
export async function buscarContratoPorId(id) {
  const { data, error } = await supabase
    .from('contratos')
    .select(`
      *,
      vendedor:vendedor_id (nome, email),
      agendamento:agendamento_id (*),
      dependentes:contrato_dependentes (*)
    `)
    .eq('id', id)
    .single();


  if (error) throw error;
  return data;
}


// BUSCAR por nome do titular ou dependente
export async function buscarContratosPorNome(busca) {
  const { data, error } = await supabase
    .from('contratos')
    .select(`
      *,
      vendedor:vendedor_id (nome),
      dependentes:contrato_dependentes (nome, cpf)
    `)
    .or(
      `titular_nome.ilike.%${busca}%,` +
      `id.in.(SELECT contrato_id FROM contrato_dependentes WHERE nome.ilike.%${busca}%)`
    )
    .order('data_criacao', { ascending: false })
    .limit(20);


  if (error) throw error;
  return data;
}


// CRIAR
export async function criarContrato(dados) {
  const { data, error } = await supabase
    .from('contratos')
    .insert([{
      agendamento_id: dados.agendamento_id || null,
      vendedor_id: dados.vendedor_id,
      titular_nome: dados.titular_nome,
      titular_cpf: dados.titular_cpf,
      titular_email: dados.titular_email || null,
      titular_telefone: dados.titular_telefone || null,
      titular_data_nascimento: dados.titular_data_nascimento,
      valor_total: dados.valor_total,
      forma_pagamento: dados.forma_pagamento,
      tipo_cobranca: dados.tipo_cobranca || null,
      parcelas: dados.parcelas || 1,
      status: dados.status || 'PENDENTE',
      data_inicio: dados.data_inicio,
      data_fim: dados.data_fim || null,
      observacoes: dados.observacoes || null
    }])
    .select()
    .single();


  if (error) throw error;


  // Dependentes
  if (dados.dependentes && dados.dependentes.length > 0) {
    const deps = dados.dependentes.map(d => ({
      contrato_id: data.id,
      nome: d.nome,
      cpf: d.cpf || null,
      data_nascimento: d.data_nascimento
    }));


    const { error: depError } = await supabase
      .from('contrato_dependentes')
      .insert(deps);


    if (depError) throw depError;
  }


  return data;
}


// ATUALIZAR
export async function atualizarContrato(id, dados) {
  const { data, error } = await supabase
    .from('contratos')
    .update({
      agendamento_id: dados.agendamento_id,
      vendedor_id: dados.vendedor_id,
      titular_nome: dados.titular_nome,
      titular_cpf: dados.titular_cpf,
      titular_email: dados.titular_email,
      titular_telefone: dados.titular_telefone,
      titular_data_nascimento: dados.titular_data_nascimento,
      valor_total: dados.valor_total,
      forma_pagamento: dados.forma_pagamento,
      tipo_cobranca: dados.tipo_cobranca,
      parcelas: dados.parcelas,
      status: dados.status,
      data_inicio: dados.data_inicio,
      data_fim: dados.data_fim,
      observacoes: dados.observacoes
    })
    .eq('id', id)
    .select()
    .single();


  if (error) throw error;
  return data;
}


// EXCLUIR
export async function excluirContrato(id) {
  const { error } = await supabase
    .from('contratos')
    .delete()
    .eq('id', id);


  if (error) throw error;
  return true;
}


// RECEITA REAL POR MÊS (últimos 8 meses)
export async function receitaPorMes() {
  const hoje = new Date()
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 7, 1)

  const { data, error } = await supabase
    .from('contratos')
    .select('valor_total, data_inicio')
    .gte('data_inicio', inicio.toISOString().split('T')[0])
    .eq('status', 'ATIVO')
    

  if (error) throw error

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const agrupado = {}

  // Inicializa os últimos 8 meses com 0
  for (let i = 7; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const chave = meses[d.getMonth()]
    agrupado[chave] = 0
  }

  data.forEach(c => {
    const d = new Date(c.data_inicio)
    const chave = meses[d.getMonth()]
    if (agrupado[chave] !== undefined) {
      agrupado[chave] += Number(c.valor_total)
    }
  })

  return Object.entries(agrupado).map(([mes, receita]) => ({ mes, receita }))
}

// TICKET MÉDIO (totalmente reutilizável)
export async function ticketMedio({ 
  inicio, 
  fim, 
  status = ['ATIVO'],
  vendedor_id = null,
  forma_pagamento = null,
  agrupado_por = null // 'vendedor', 'forma_pagamento', 'mes'
} = {}) {
  
  const hoje = new Date();
  const dataInicio = inicio || new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
  const dataFim = fim || hoje.toISOString().split('T')[0];

  // Query base
let query = supabase
  .from('contratos')
  .select('valor_total, data_inicio, forma_pagamento, vendedor_id, vendedor:vendedor_id(nome)', { count: 'exact' })
  .gte('data_inicio', dataInicio)
  .lte('data_inicio', dataFim)
  .in('status', status);

  // Filtros opcionais
  if (vendedor_id) {
    query = query.eq('vendedor_id', vendedor_id);
  }

  if (forma_pagamento) {
    query = query.eq('forma_pagamento', forma_pagamento);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  if (!data || data.length === 0) {
    return {
      ticket_medio: 0,
      total_contratos: 0,
      valor_total: 0,
      periodo: { inicio: dataInicio, fim: dataFim },
      filtros: { vendedor_id, forma_pagamento }
    };
  }

  

  // Se quiser agrupado
  if (agrupado_por) {
    return agruparTicketMedio(data, agrupado_por, dataInicio, dataFim);
  }

  // Ticket médio geral
  const valorTotal = data.reduce((acc, c) => acc + Number(c.valor_total), 0);

  return {
    ticket_medio: valorTotal / data.length,
    total_contratos: data.length,
    valor_total: valorTotal,
    periodo: { inicio: dataInicio, fim: dataFim },
    filtros: { vendedor_id, forma_pagamento }
  };
}

// Função auxiliar para agrupar
function agruparTicketMedio(data, tipo, inicio, fim) {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  const agrupado = data.reduce((acc, contrato) => {
    let chave;

    if (tipo === 'vendedor') {
      chave = contrato.vendedor?.nome || 'Sem vendedor';
    } else if (tipo === 'forma_pagamento') {
      chave = contrato.forma_pagamento;
    } else if (tipo === 'mes') {
      const d = new Date(contrato.data_inicio);
      chave = meses[d.getMonth()];
    }

    if (!acc[chave]) {
      acc[chave] = { total: 0, quantidade: 0 };
    }
    acc[chave].total += Number(contrato.valor_total);
    acc[chave].quantidade += 1;
    return acc;
  }, {});

  return Object.entries(agrupado).map(([chave, valor]) => ({
    grupo: chave,
    ticket_medio: valor.total / valor.quantidade,
    total_contratos: valor.quantidade,
    valor_total: valor.total,
    periodo: { inicio, fim }
  }));
}