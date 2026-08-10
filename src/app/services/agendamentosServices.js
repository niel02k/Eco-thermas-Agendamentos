// src/app/services/agendamentosServices.js
import { createClient } from '@/lib/supabase/client';
import { buscarClientePorCpf, criarCliente } from '@/app/services/clientesService';

const supabase = createClient();

// ============ GERAR CÓDIGO ============
async function gerarCodigoAgendamento() {
  const hoje = new Date();
  const ano = String(hoje.getFullYear()).slice(-2);
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const prefixo = `${ano}${mes}`;

  const { data, error } = await supabase
    .from('agendamentos')
    .select('codigo')
    .like('codigo', `${prefixo}%`)
    .order('codigo', { ascending: false })
    .limit(1);

  if (error) throw error;

  let sequencial = 100;
  if (data && data.length > 0) {
    const ultimoNumero = parseInt(data[0].codigo.slice(-3));
    sequencial = ultimoNumero + 1;
  }

  return `${prefixo}${sequencial}`;
}

// ============ STATS ============

export async function totalClientesAtendidos() {
  const { data, error } = await supabase
    .from('agendamentos')
    .select('quantidade_pessoas')
    .eq('resultado_visita', 'REALIZADO');

  if (error) throw error;

  return data?.reduce((acc, a) => acc + (a.quantidade_pessoas || 1), 0) ?? 0;
}

export async function agendamentosHoje() {
  const hoje = new Date().toISOString().split('T')[0];

  const { count, error } = await supabase
    .from('agendamentos')
    .select('*', { count: 'exact', head: true })
    .eq('data_visita', hoje)
    .in('status', ['PENDENTE', 'CONFIRMADO']);

  if (error) throw error;

  return count ?? 0;
}
export async function agendamentosPorDiaSemana() {
  const hoje = new Date();
  console.log('📅 Hoje:', hoje);

  const diaSemana = hoje.getDay();
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
  inicioSemana.setHours(0, 0, 0, 0);
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);
  fimSemana.setHours(23, 59, 59, 999);

  const dataInicio = inicioSemana.toISOString().split('T')[0];
  const dataFim = fimSemana.toISOString().split('T')[0];

  console.log('📅 Buscando de', dataInicio, 'até', dataFim);

  const { data, error } = await supabase
    .from('agendamentos')
    .select('data_visita')
    .gte('data_visita', dataInicio)
    .lte('data_visita', dataFim);

  console.log('📊 Resultado:', data?.length, 'agendamentos');
  console.log('📊 Dados:', data);

  if (error) {
    console.error('❌ Erro:', error);
    throw error;
  }

  const contagem = [0, 0, 0, 0, 0, 0, 0];
  (data || []).forEach(a => {
    const d = new Date(a.data_visita + 'T12:00:00');
    const idx = d.getDay();
    const posicao = idx === 0 ? 6 : idx - 1;
    contagem[posicao] += 1;
  });

  console.log('📊 Contagem:', contagem);
  return contagem;
}

export async function proximosDiasComAgendamentos(quantidade = 2) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  const { data, error } = await supabase
    .from('agendamentos')
    .select('data_visita')
    .gte('data_visita', amanha.toISOString().split('T')[0])
    .in('status', ['PENDENTE', 'CONFIRMADO'])
    .order('data_visita', { ascending: true });

  if (error) throw error;

  const agrupado = {};
  (data || []).forEach(a => {
    agrupado[a.data_visita] = (agrupado[a.data_visita] || 0) + 1;
  });

  return Object.entries(agrupado)
    .slice(0, quantidade)
    .map(([data_visita, total]) => ({
      data_visita,
      total,
      label: new Date(data_visita + 'T12:00:00').toLocaleDateString('pt-BR', {
        weekday: 'short', day: '2-digit', month: '2-digit'
      })
    }));
}

export async function taxaDeConversao({ inicio, fim } = {}) {
  try {
    if (inicio || fim) {
      const hoje = new Date();
      const dataInicio = inicio || new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
      const dataFim = fim || `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(ultimoDiaMes).padStart(2, '0')}`;

      const { count: vendasFiltrado } = await supabase
        .from('agendamentos')
        .select('*', { count: 'exact', head: true })
        .eq('resultado_visita', 'REALIZADO')
        .eq('resultado_venda', 'VENDA_REALIZADA')
        .gte('data_visita', dataInicio)
        .lte('data_visita', dataFim);

      const { count: atendidosFiltrado } = await supabase
        .from('agendamentos')
        .select('*', { count: 'exact', head: true })
        .eq('resultado_visita', 'REALIZADO')
        .gte('data_visita', dataInicio)
        .lte('data_visita', dataFim);

      if (atendidosFiltrado > 0) {
        return Number(((vendasFiltrado / atendidosFiltrado) * 100).toFixed(2));
      }
    }

    const { count: vendasrealizada } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('resultado_visita', 'REALIZADO')
      .eq('resultado_venda', 'VENDA_REALIZADA');

    const { count: atendidos } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('resultado_visita', 'REALIZADO');

    return atendidos > 0
      ? Number(((vendasrealizada / atendidos) * 100).toFixed(2))
      : 0;

  } catch (error) {
    console.error('Erro geral na taxaDeConversao:', error);
    return 0;
  }
}

// ============ CRUD ============

// src/app/services/agendamentosServices.js

export async function listarAgendamentos({
  pagina = 1,
  limite = 10,
  busca = '',
  status = null,
  ordenarPor = 'data_visita',
  ordem = 'desc',
  dataInicio = null,
  dataFim = null,
  periodoMeses = 3,
  campoData = 'data_visita'
} = {}) {
  const inicio = (pagina - 1) * limite;
  const fim = inicio + limite - 1;

  let query = supabase
    .from('agendamentos')
    .select(`
      *,
      cliente:cliente_id (id, nome, cpf, telefone, email, idade, origem),
      dependentes:agendamento_dependentes (id, nome, idade, cpf)
    `, { count: 'exact' });

  // FILTRO POR PERÍODO
  if (dataInicio && dataFim) {
    console.log(`📅 Filtrando por período: ${dataInicio} até ${dataFim}`);

    query = query
      .gte(campoData, dataInicio)
      .lte(campoData, dataFim);
  } else {
    const dataAtual = new Date();

    const dataInicioPadrao = new Date(dataAtual);
    dataInicioPadrao.setMonth(
      dataInicioPadrao.getMonth() - periodoMeses
    );

    const dataFimPadrao = new Date(dataAtual);
    dataFimPadrao.setMonth(
      dataFimPadrao.getMonth() + periodoMeses
    );

    const dataInicioStr = dataInicioPadrao
      .toISOString()
      .split('T')[0];

    const dataFimStr = dataFimPadrao
      .toISOString()
      .split('T')[0];

    console.log(
      `📅 Filtrando período: ${dataInicioStr} até ${dataFimStr}`
    );

    query = query
      .gte(campoData, dataInicioStr)
      .lte(campoData, dataFimStr);
  }

  // BUSCA
  if (busca && busca.trim() !== '') {
    const buscaLimpa = busca.trim();

    query = query.or(
      `codigo.ilike.%${buscaLimpa}%,` +
      `cliente_id.in.(SELECT id FROM clientes WHERE nome.ilike.%${buscaLimpa}%),` +
      `cliente_id.in.(SELECT id FROM clientes WHERE cpf.ilike.%${buscaLimpa}%)`
    );
  }

  // STATUS
  if (status) {
    if (Array.isArray(status) && status.length > 0) {
      query = query.in('status', status);
    } else if (
      typeof status === 'string' &&
      status.trim() !== ''
    ) {
      query = query.eq('status', status);
    }
  }

  // ORDENAÇÃO
  const colunasPermitidas = [
    'data_criacao',
    'data_visita',
    'status',
    'codigo',
    'quantidade_pessoas'
  ];

  const ordenarPorValido = colunasPermitidas.includes(ordenarPor)
    ? ordenarPor
    : 'data_criacao';

  const ordemValida = ordem === 'desc' ? 'desc' : 'asc';

  query = query.order(ordenarPorValido, {
    ascending: ordemValida === 'asc'
  });

  // EXECUTA
  const { data, count, error } = await query.range(inicio, fim);

  if (error) {
    throw error;
  }

  const dataAtual = new Date();

  const dataInicioPadrao = new Date(dataAtual);
  dataInicioPadrao.setMonth(
    dataInicioPadrao.getMonth() - periodoMeses
  );

  const dataFimPadrao = new Date(dataAtual);
  dataFimPadrao.setMonth(
    dataFimPadrao.getMonth() + periodoMeses
  );

  return {
    agendamentos: data || [],
    total: count || 0,
    pagina,
    totalPaginas: Math.ceil((count || 0) / limite),
    filtroPeriodo: {
      dataInicio:
        dataInicio ||
        dataInicioPadrao.toISOString().split('T')[0],
      dataFim:
        dataFim ||
        dataFimPadrao.toISOString().split('T')[0],
      periodoMeses,
      campoData
    }
  };
}



export async function buscarDatasComAgendamentos({
  dataInicio = null,
  dataFim = null,
  periodoMeses = 3,
  campoData = 'data_visita'
} = {}) {
  try {
    let query = supabase
      .from('agendamentos')
      .select(campoData)
      .order(campoData, { ascending: true });

    // Filtro por período
    if (dataInicio && dataFim) {
      query = query.gte(campoData, dataInicio).lte(campoData, dataFim);
    } else {
      const dataAtual = new Date();
      const dataInicioPadrao = new Date();
      dataInicioPadrao.setMonth(dataAtual.getMonth() - periodoMeses);

      const dataInicioStr = dataInicioPadrao.toISOString().split('T')[0];
      const dataFimStr = dataAtual.toISOString().split('T')[0];

      query = query.gte(campoData, dataInicioStr).lte(campoData, dataFimStr);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Remove duplicatas e formata
    const datasUnicas = [...new Set(data.map(item => item[campoData]))];

    return datasUnicas.map(dataStr => ({
      value: dataStr,
      label: new Date(dataStr + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }));
  } catch (error) {
    console.error('Erro ao buscar datas com agendamentos:', error);
    return [];
  }
}

export async function buscarAgendamentoPorCodigo(codigo) {
  const { data: agendamento, error } = await supabase
    .from('agendamentos')
    .select(`*, cliente:cliente_id (*)`)
    .eq('codigo', codigo)
    .single();

  if (error) throw error;

  const { data: dependentes } = await supabase
    .from('agendamento_dependentes')
    .select('*')
    .eq('agendamento_id', codigo);

  return { ...agendamento, dependentes: dependentes || [] };
}

export async function buscarAgendamentosPorNome(busca) {
  const { data, error } = await supabase
    .from('agendamentos')
    .select(`*, cliente:cliente_id (nome, cpf, telefone, email), dependentes:agendamento_dependentes (nome, idade, cpf)`)
    .or(
      `cliente_id.in.(SELECT id FROM clientes WHERE nome.ilike.%${busca}%),` +
      `codigo.in.(SELECT agendamento_id FROM agendamento_dependentes WHERE nome.ilike.%${busca}%)`
    )
    .order('data_visita', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
}

// ============ CRIAR ============

export async function criarAgendamento(dados) {
  const codigo = await gerarCodigoAgendamento();

  let cliente_id = null;
  let origem = 'OUTRO';

  if (dados.cliente?.cpf) {
    const existente = await buscarClientePorCpf(dados.cliente.cpf);

    if (existente) {
      cliente_id = existente.id;
      origem = existente.origem || 'OUTRO';
    } else {
      cliente_id = await criarCliente({
        cpf: dados.cliente.cpf,
        nome: dados.cliente.nome || dados.nome,
        email: dados.cliente.email || null,
        telefone: dados.cliente.telefone || null,
        idade: dados.cliente.idade || null,
        origem: dados.origem || dados.cliente.origem || 'OUTRO',
      });
      if (cliente_id) origem = dados.origem || dados.cliente.origem || 'OUTRO';
    }
  }

  if (!cliente_id) throw new Error('Não foi possível identificar/criar o cliente.');

  const { data, error } = await supabase
    .from('agendamentos')
    .insert([{
      codigo,
      cliente_id: Number(cliente_id),
      vendedor_id: dados.vendedor_id || null,
      data_visita: dados.data_visita,
      horario_visita: dados.horario_visita,
      quantidade_pessoas: dados.quantidade_pessoas || 1,
      cidade: dados.cidade || "Não informada",
      origem: origem,
      status: dados.status || 'PENDENTE',
      resultado_visita: 'PENDENTE',
      resultado_venda: 'PENDENTE',
      observacoes: dados.observacoes || null,
    }])
    .select()
    .single();

  if (error) throw error;

  if (dados.dependentes && dados.dependentes.length > 0) {
    const deps = dados.dependentes.map(dep => ({
      agendamento_id: codigo,
      nome: dep.nome,
      idade: Number(dep.idade) || 0,
      cpf: dep.cpf || null,
    }));

    const { error: depError } = await supabase
      .from('agendamento_dependentes')
      .insert(deps);

    if (depError) throw depError;
  }

  return data;
}

// ============ ATUALIZAR ============

export async function atualizarAgendamento(codigo, dados) {
  console.log('🔍 [atualizarAgendamento] Dados recebidos:', JSON.stringify(dados, null, 2));

  // Atualizar cliente
  if (dados.cliente && dados.cliente_id) {
    console.log('👤 Atualizando cliente:', dados.cliente_id, dados.cliente);

    const { data: clienteData, error: clienteError } = await supabase
      .from('clientes')
      .update({
        nome: dados.cliente.nome,
        idade: dados.cliente.idade,
        telefone: dados.cliente.telefone,
      })
      .eq('id', dados.cliente_id)
      .select();

    console.log('📊 Resultado update cliente:', { data: clienteData, error: clienteError });

    if (clienteError) {
      console.error('❌ Erro ao atualizar cliente:', clienteError);
    }
  } else {
    console.log('⚠️ Não atualizou cliente - faltando:', {
      temCliente: !!dados.cliente,
      temId: !!dados.cliente_id,
      cliente: dados.cliente,
      cliente_id: dados.cliente_id
    });
  }

  const updateData = {
    vendedor_id: dados.vendedor_id,
    data_visita: dados.data_visita,
    horario_visita: dados.horario_visita,
    quantidade_pessoas: dados.quantidade_pessoas,
    cidade: dados.cidade,
    origem: dados.origem,
    status: dados.status,
    resultado_visita: dados.resultado_visita,
    resultado_venda: dados.resultado_venda,
    observacoes: dados.observacoes,
  };

  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) delete updateData[key];
  });

  const { data, error } = await supabase
    .from('agendamentos')
    .update(updateData)
    .eq('codigo', codigo)
    .select()
    .single();

  if (error) throw error;

  // Atualizar dependentes...

  return data;
}
// ============ STATUS / RESULTADO ============

export async function atualizarResultadoVenda(codigo, resultadoVenda) {
  const { data, error } = await supabase
    .from('agendamentos')
    .update({ resultado_venda: resultadoVenda })
    .eq('codigo', codigo)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function marcarComoRealizado(codigo) {
  const { data, error } = await supabase
    .from('agendamentos')
    .update({
      resultado_visita: 'REALIZADO',
      resultado_venda: 'PENDENTE'
    })
    .eq('codigo', codigo)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function marcarComoFaltou(codigo) {
  const { data, error } = await supabase
    .from('agendamentos')
    .update({ resultado_visita: 'FALTOU' })
    .eq('codigo', codigo)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelarAgendamento(codigo) {
  const { data, error } = await supabase
    .from('agendamentos')
    .update({ status: 'CANCELADO' })
    .eq('codigo', codigo)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============ EXCLUIR ============

export async function excluirAgendamento(codigo) {
  const { error } = await supabase
    .from('agendamentos')
    .delete()
    .eq('codigo', codigo);

  if (error) throw error;
  return true;
}


// src/app/services/agendamentosServices.js

/**
 * Verificar se CPF já existe em algum agendamento (não cancelado)
 */
export async function verificarCPFDuplicado(cpf, codigoIgnorar = null) {
  const cpfLimpo = cpf.replace(/\D/g, '');

  // Buscar cliente pelo CPF
  const { data: clientes } = await supabase
    .from('clientes')
    .select('id')
    .eq('cpf', cpfLimpo);

  if (!clientes || clientes.length === 0) {
    return { duplicado: false };
  }

  const clienteIds = clientes.map(c => c.id);

  let query = supabase
    .from('agendamentos')
    .select('codigo', { count: 'exact' })
    .in('cliente_id', clienteIds)
    .neq('status', 'CANCELADO');

  if (codigoIgnorar) {
    query = query.neq('codigo', codigoIgnorar);
  }

  const { count, error } = await query;

  if (error) throw error;

  return { duplicado: count > 0, count };
}