// src/app/services/agendamentosServices.js

import { createClient } from '@/lib/supabase/client';
import {
  buscarClientePorCpf,
  criarCliente,
} from '@/app/services/clientesService';

const supabase = createClient();

const STATUS_ATIVOS = ['PENDENTE', 'CONFIRMADO'];
const COLUNAS_ORDENACAO = [
  'data_criacao',
  'data_visita',
  'status',
  'codigo',
  'quantidade_pessoas',
];

function dataLocalISO(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function normalizarCpf(cpf = '') {
  return String(cpf).replace(/\D/g, '');
}

function normalizarPagina(valor, padrao = 1) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : padrao;
}

function normalizarLimite(valor, padrao = 10) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? Math.min(numero, 100) : padrao;
}

function escaparFiltroPostgrest(valor = '') {
  return String(valor)
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/\./g, '\\.');
}

function validarCodigo(codigo) {
  if (codigo === null || codigo === undefined || String(codigo).trim() === '') {
    throw new Error('O código do agendamento é obrigatório.');
  }
}

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
  const ultimoCodigo = data?.[0]?.codigo;

  if (ultimoCodigo) {
    const ultimoNumero = Number.parseInt(String(ultimoCodigo).slice(-3), 10);
    if (Number.isInteger(ultimoNumero)) {
      sequencial = ultimoNumero + 1;
    }
  }

  if (sequencial > 999) {
    throw new Error(`Não há mais sequências disponíveis para o prefixo ${prefixo}.`);
  }

  return `${prefixo}${String(sequencial).padStart(3, '0')}`;
}

// ============ ESTATÍSTICAS ============

export async function totalClientesAtendidos() {
  const { data, error } = await supabase
    .from('agendamentos')
    .select('quantidade_pessoas')
    .eq('resultado_visita', 'REALIZADO');

  if (error) throw error;

  return (data || []).reduce(
    (total, agendamento) => total + (Number(agendamento.quantidade_pessoas) || 1),
    0,
  );
}

export async function agendamentosHoje() {
  const hoje = dataLocalISO();

  const { count, error } = await supabase
    .from('agendamentos')
    .select('*', { count: 'exact', head: true })
    .eq('data_visita', hoje)
    .in('status', STATUS_ATIVOS);

  if (error) throw error;

  return count || 0;
}

export async function agendamentosPorDiaSemana() {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const inicioSemana = new Date(hoje);

  inicioSemana.setDate(
    hoje.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1),
  );
  inicioSemana.setHours(0, 0, 0, 0);

  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);
  fimSemana.setHours(23, 59, 59, 999);

  const dataInicio = dataLocalISO(inicioSemana);
  const dataFim = dataLocalISO(fimSemana);

  const { data, error } = await supabase
    .from('agendamentos')
    .select('data_visita')
    .gte('data_visita', dataInicio)
    .lte('data_visita', dataFim);

  if (error) throw error;

  const contagem = [0, 0, 0, 0, 0, 0, 0];

  (data || []).forEach(({ data_visita }) => {
    if (!data_visita) return;

    const dia = new Date(`${data_visita}T12:00:00`).getDay();
    const posicao = dia === 0 ? 6 : dia - 1;
    contagem[posicao] += 1;
  });

  return contagem;
}

export async function proximosDiasComAgendamentos(quantidade = 2) {
  const limite = normalizarLimite(quantidade, 2);
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);

  const { data, error } = await supabase
    .from('agendamentos')
    .select('data_visita')
    .gte('data_visita', dataLocalISO(amanha))
    .in('status', STATUS_ATIVOS)
    .order('data_visita', { ascending: true });

  if (error) throw error;

  const agrupado = (data || []).reduce((resultado, agendamento) => {
    const dataVisita = agendamento.data_visita;
    if (dataVisita) {
      resultado[dataVisita] = (resultado[dataVisita] || 0) + 1;
    }
    return resultado;
  }, {});

  return Object.entries(agrupado)
    .slice(0, limite)
    .map(([data_visita, total]) => ({
      data_visita,
      total,
      label: new Date(`${data_visita}T12:00:00`).toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      }),
    }));
}

export async function taxaDeConversao({ inicio = null, fim = null } = {}) {
  try {
    const filtros = inicio || fim
      ? {
          inicio: inicio || dataLocalISO(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
          fim: fim || dataLocalISO(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)),
        }
      : null;

    let vendasQuery = supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('resultado_visita', 'REALIZADO')
      .eq('resultado_venda', 'VENDA_REALIZADA');

    let atendidosQuery = supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('resultado_visita', 'REALIZADO');

    if (filtros) {
      vendasQuery = vendasQuery
        .gte('data_visita', filtros.inicio)
        .lte('data_visita', filtros.fim);
      atendidosQuery = atendidosQuery
        .gte('data_visita', filtros.inicio)
        .lte('data_visita', filtros.fim);
    }

    const [vendasResultado, atendidosResultado] = await Promise.all([
      vendasQuery,
      atendidosQuery,
    ]);

    if (vendasResultado.error) throw vendasResultado.error;
    if (atendidosResultado.error) throw atendidosResultado.error;

    const vendas = vendasResultado.count || 0;
    const atendidos = atendidosResultado.count || 0;

    return atendidos > 0
      ? Number(((vendas / atendidos) * 100).toFixed(2))
      : 0;
  } catch (error) {
    console.error('Erro ao calcular taxa de conversão:', error);
    return 0;
  }
}

// ============ CRUD: LISTAR ============

export async function listarAgendamentos({
  pagina = 1,
  limite = 10,
  busca = '',
  status = null,
  statusAgendamento = null,
  resultadoVisita = null,
  resultadoVenda = null,
  ordenarPor = 'data_visita',
  ordem = 'desc',
  dataInicio = null,
  dataFim = null,
  periodoMeses = 3,
  campoData = 'data_visita',
} = {}) {
  const paginaNormalizada = normalizarPagina(pagina);
  const limiteNormalizado = normalizarLimite(limite);
  const inicio = (paginaNormalizada - 1) * limiteNormalizado;
  const fim = inicio + limiteNormalizado - 1;
  const meses = Number.isFinite(Number(periodoMeses)) && Number(periodoMeses) >= 0
    ? Number(periodoMeses)
    : 3;

  let query = supabase
    .from('agendamentos')
    .select(`
      *,
      cliente:cliente_id (id, nome, cpf, telefone, email, idade, origem),
      dependentes:agendamento_dependentes (id, nome, idade, cpf)
    `, { count: 'exact' });

  const dataAtual = new Date();
  let dataInicioFiltro = dataInicio;
  let dataFimFiltro = dataFim;

  if (!dataInicioFiltro || !dataFimFiltro) {
    const inicioPadrao = new Date(dataAtual);
    inicioPadrao.setMonth(inicioPadrao.getMonth() - meses);
    dataInicioFiltro = dataLocalISO(inicioPadrao);
    const fimPadrao = new Date(dataAtual);
    fimPadrao.setMonth(fimPadrao.getMonth() + 2);
    dataFimFiltro = dataLocalISO(fimPadrao);
  }

  if (campoData !== 'data_visita' && campoData !== 'data_criacao') {
    campoData = 'data_visita';
  }

  query = query
    .gte(campoData, dataInicioFiltro)
    .lte(campoData, dataFimFiltro);

  const buscaLimpa = String(busca || '').trim();
  if (buscaLimpa) {
    const termo = escaparFiltroPostgrest(buscaLimpa);
    query = query.or(`codigo.ilike.%${termo}%`);
  }

    if (statusAgendamento) {
    query = query.eq('status', statusAgendamento);
  } else if (Array.isArray(status) && status.length > 0) {
    query = query.in('status', status);
  } else if (typeof status === 'string' && status.trim()) {
    query = query.eq('status', status.trim());
  }

  if (resultadoVisita) {
    query = query.eq('resultado_visita', resultadoVisita);
  }

  if (resultadoVenda) {
    query = query.eq('resultado_venda', resultadoVenda);
  }

  const colunaOrdenacao = COLUNAS_ORDENACAO.includes(ordenarPor) 
  ? ordenarPor 
  : 'data_visita';

// 🔥 CORREÇÃO: 'desc' = ascending FALSE
const ascending = ordem === 'asc';
query = query.order(colunaOrdenacao, { ascending });

const { data, count, error } = await query.range(inicio, fim);

if (error) {
  throw new Error(`Erro ao listar agendamentos: ${error.message}`);
}

  return {
    agendamentos: data || [],
    total: count || 0,
    pagina: paginaNormalizada,
    totalPaginas: Math.ceil((count || 0) / limiteNormalizado),
    filtroPeriodo: {
      dataInicio: dataInicioFiltro,
      dataFim: dataFimFiltro,
      periodoMeses: meses,
      campoData,
    },
  };
}

// ============ CRUD: CONSULTAS AUXILIARES ============

export async function buscarDatasComAgendamentos({
  dataInicio = null,
  dataFim = null,
  periodoMeses = 3,
  campoData = 'data_visita',
} = {}) {
  try {
    const campo = campoData === 'data_criacao' ? 'data_criacao' : 'data_visita';
    const hoje = new Date();
    const inicioPadrao = new Date(hoje);
    inicioPadrao.setMonth(inicioPadrao.getMonth() - Number(periodoMeses || 3));

    const inicio = dataInicio || dataLocalISO(inicioPadrao);
    const fim = dataFim || dataLocalISO(hoje);

    const { data, error } = await supabase
      .from('agendamentos')
      .select(campo)
      .gte(campo, inicio)
      .lte(campo, fim)
      .order(campo, { ascending: true });

    if (error) throw error;

    const datasUnicas = [
      ...new Set((data || []).map(item => item[campo]).filter(Boolean)),
    ];

    return datasUnicas.map(dataStr => ({
      value: dataStr,
      label: new Date(`${dataStr}T12:00:00`).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    }));
  } catch (error) {
    console.error('Erro ao buscar datas com agendamentos:', error);
    return [];
  }
}

export async function buscarAgendamentoPorCodigo(codigo) {
  validarCodigo(codigo);

  const { data: agendamento, error } = await supabase
    .from('agendamentos')
    .select(`*, cliente:cliente_id (*)`)
    .eq('codigo', codigo)
    .single();

  if (error) throw error;

  const { data: dependentes, error: dependentesError } = await supabase
    .from('agendamento_dependentes')
    .select('*')
    .eq('agendamento_id', codigo);

  if (dependentesError) throw dependentesError;

  return {
    ...agendamento,
    dependentes: dependentes || [],
  };
}

export async function buscarAgendamentosPorNome(busca = '') {
  const termo = String(busca).trim();
  if (!termo) return [];

  const termoSeguro = escaparFiltroPostgrest(termo);
  const resultados = [];

  const { data: clientes, error: clientesError } = await supabase
    .from('clientes')
    .select('id')
    .or(`nome.ilike.%${termoSeguro}%,cpf.ilike.%${termoSeguro}%`)
    .limit(100);

  if (clientesError) throw clientesError;

  if (clientes?.length) {
    const ids = clientes.map(cliente => cliente.id);
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        cliente:cliente_id (nome, cpf, telefone, email),
        dependentes:agendamento_dependentes (nome, idade, cpf)
      `)
      .in('cliente_id', ids)
      .order('data_visita', { ascending: false })
      .limit(20);

    if (error) throw error;
    resultados.push(...(data || []));
  }

  const { data: dependentes, error: dependentesError } = await supabase
    .from('agendamento_dependentes')
    .select('agendamento_id')
    .ilike('nome', `%${termo}%`)
    .limit(100);

  if (dependentesError) throw dependentesError;

  const codigos = [
    ...new Set((dependentes || []).map(item => item.agendamento_id).filter(Boolean)),
  ];

  if (codigos.length) {
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        cliente:cliente_id (nome, cpf, telefone, email),
        dependentes:agendamento_dependentes (nome, idade, cpf)
      `)
      .in('codigo', codigos)
      .order('data_visita', { ascending: false })
      .limit(20);

    if (error) throw error;
    resultados.push(...(data || []));
  }

  const unicos = new Map(
    resultados.map(agendamento => [agendamento.codigo, agendamento]),
  );

  return [...unicos.values()]
    .sort((a, b) => String(b.data_visita || '').localeCompare(String(a.data_visita || '')))
    .slice(0, 20);
}

// ============ CRUD: CRIAR ============

export async function criarAgendamento(dados = {}) {
  if (!dados.data_visita) {
    throw new Error('A data da visita é obrigatória.');
  }

  const codigo = await gerarCodigoAgendamento();
  let clienteId = null;
  let origem = 'OUTRO';
  const cliente = dados.cliente || {};
  const cpf = normalizarCpf(cliente.cpf);

  if (cpf) {
    const existente = await buscarClientePorCpf(cpf);

    if (existente) {
      clienteId = existente.id;
      origem = existente.origem || 'OUTRO';
    } else {
      clienteId = await criarCliente({
        cpf,
        nome: cliente.nome || dados.nome,
        email: cliente.email || null,
        telefone: cliente.telefone || null,
        idade: cliente.idade || null,
        origem: dados.origem || cliente.origem || 'OUTRO',
      });
      origem = dados.origem || cliente.origem || 'OUTRO';
    }
  }

  if (!clienteId) {
    throw new Error('Não foi possível identificar ou criar o cliente.');
  }

  const registro = {
    codigo,
    cliente_id: Number(clienteId),
    vendedor_id: dados.vendedor_id || null,
    data_visita: dados.data_visita,
    horario_visita: dados.horario_visita || null,
    quantidade_pessoas: Number(dados.quantidade_pessoas) || 1,
    cidade: dados.cidade || 'Não informada',
    origem,
    status: dados.status || 'PENDENTE',
    resultado_visita: 'PENDENTE',
    resultado_venda: 'PENDENTE',
    observacoes: dados.observacoes || null,
  };

  const { data, error } = await supabase
    .from('agendamentos')
    .insert([registro])
    .select()
    .single();

  if (error) throw error;

  const dependentes = Array.isArray(dados.dependentes)
    ? dados.dependentes.filter(dependente => dependente?.nome?.trim())
    : [];

  if (dependentes.length > 0) {
    const registrosDependentes = dependentes.map(dependente => ({
      agendamento_id: codigo,
      nome: dependente.nome.trim(),
      idade: Number(dependente.idade) || 0,
      cpf: normalizarCpf(dependente.cpf) || null,
    }));

    const { error: dependentesError } = await supabase
      .from('agendamento_dependentes')
      .insert(registrosDependentes);

    if (dependentesError) throw dependentesError;
  }

  return data;
}

// ============ CRUD: ATUALIZAR ============

export async function atualizarAgendamento(codigo, dados = {}) {
  validarCodigo(codigo);

  if (dados.cliente && dados.cliente_id) {
    const { error: clienteError } = await supabase
      .from('clientes')
      .update({
        nome: dados.cliente.nome,
        idade: dados.cliente.idade,
        telefone: dados.cliente.telefone,
      })
      .eq('id', dados.cliente_id);

    if (clienteError) throw clienteError;
  }

  const campos = [
    'vendedor_id',
    'data_visita',
    'horario_visita',
    'quantidade_pessoas',
    'cidade',
    'origem',
    'status',
    'resultado_visita',
    'resultado_venda',
    'observacoes',
  ];

  const updateData = Object.fromEntries(
    campos
      .filter(campo => dados[campo] !== undefined)
      .map(campo => [campo, dados[campo]]),
  );

  const { data, error } = await supabase
    .from('agendamentos')
    .update(updateData)
    .eq('codigo', codigo)
    .select()
    .single();

  if (error) throw error;

  if (Array.isArray(dados.dependentes)) {
    const { error: exclusaoError } = await supabase
      .from('agendamento_dependentes')
      .delete()
      .eq('agendamento_id', codigo);

    if (exclusaoError) throw exclusaoError;

    const dependentes = dados.dependentes.filter(dependente => dependente?.nome?.trim());
    if (dependentes.length > 0) {
      const registros = dependentes.map(dependente => ({
        agendamento_id: codigo,
        nome: dependente.nome.trim(),
        idade: Number(dependente.idade) || 0,
        cpf: normalizarCpf(dependente.cpf) || null,
      }));

      const { error: insercaoError } = await supabase
        .from('agendamento_dependentes')
        .insert(registros);

      if (insercaoError) throw insercaoError;
    }
  }

  return data;
}

// ============ STATUS / RESULTADO ============

export async function atualizarResultadoVenda(codigo, resultadoVenda) {
  validarCodigo(codigo);

  const { data, error } = await supabase
    .from('agendamentos')
    .update({ resultado_venda: resultadoVenda })
    .eq('codigo', codigo)
    .select()
    .single();

  if (error) throw error;
  return data;
}


export async function marcarComoRealizado(codigo, vendedorId) {
  return atualizarAgendamento(codigo, {
    resultado_visita: 'REALIZADO',
    vendedor_id: vendedorId,
  });
}

export async function marcarComoFaltou(codigo) {
  validarCodigo(codigo);

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
  validarCodigo(codigo);

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
  validarCodigo(codigo);

  const { error: dependentesError } = await supabase
    .from('agendamento_dependentes')
    .delete()
    .eq('agendamento_id', codigo);

  if (dependentesError) throw dependentesError;

  const { error } = await supabase
    .from('agendamentos')
    .delete()
    .eq('codigo', codigo);

  if (error) throw error;
  return true;
}

// ============ VALIDAÇÕES ============

export async function verificarCPFDuplicado(cpf, codigoIgnorar = null) {
  const cpfLimpo = normalizarCpf(cpf);

  if (!cpfLimpo) {
    return { duplicado: false, count: 0 };
  }

  const { data: clientes, error: clientesError } = await supabase
    .from('clientes')
    .select('id')
    .eq('cpf', cpfLimpo);

  if (clientesError) throw clientesError;
  if (!clientes?.length) return { duplicado: false, count: 0 };

  const clienteIds = clientes.map(cliente => cliente.id);

  let query = supabase
    .from('agendamentos')
    .select('codigo', { count: 'exact', head: true })
    .in('cliente_id', clienteIds)
    .neq('status', 'CANCELADO');

  if (codigoIgnorar) {
    query = query.neq('codigo', codigoIgnorar);
  }

  const { count, error } = await query;

  if (error) throw error;

  return {
    duplicado: (count || 0) > 0,
    count: count || 0,
  };
}


// ============ ESTATÍSTICAS FILTRADAS ============

function aplicarFiltrosStats(query, filtros = {}) {
  const {
    dataInicio = null,
    dataFim = null,
    statusAgendamento = null,
    resultadoVisita = null,
    resultadoVenda = null,
  } = filtros;

  if (dataInicio) query = query.gte('data_visita', dataInicio);
  if (dataFim) query = query.lte('data_visita', dataFim);
  if (statusAgendamento) query = query.eq('status', statusAgendamento);
  if (resultadoVisita) query = query.eq('resultado_visita', resultadoVisita);
  if (resultadoVenda) query = query.eq('resultado_venda', resultadoVenda);

  return query;
}

function normalizarFiltrosStats(filtros = {}) {
  return {
    dataInicio: filtros.dataInicio || null,
    dataFim: filtros.dataFim || null,
    statusAgendamento: filtros.statusAgendamento || null,
    resultadoVisita: filtros.resultadoVisita || null,
    resultadoVenda: filtros.resultadoVenda || null,
  };
}

async function contarAgendamentosComFiltros(filtros, coluna, valor) {
  let query = supabase
    .from('agendamentos')
    .select('*', { count: 'exact', head: true });

  query = aplicarFiltrosStats(query, filtros).eq(coluna, valor);

  const { count, error } = await query;
  if (error) throw error;

  return count || 0;
}

async function somarClientesAtendidosComFiltros(filtros) {
  let query = supabase
    .from('agendamentos')
    .select('quantidade_pessoas')
    .eq('resultado_visita', 'REALIZADO');

  query = aplicarFiltrosStats(query, filtros);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).reduce(
    (total, item) => total + (Number(item.quantidade_pessoas) || 1),
    0,
  );
}

async function buscarSemanaFiltrada(filtros) {
  let query = supabase
    .from('agendamentos')
    .select('data_visita');

  query = aplicarFiltrosStats(query, filtros);

  const { data, error } = await query;
  if (error) throw error;

  const contagem = [0, 0, 0, 0, 0, 0, 0];

  (data || []).forEach(({ data_visita }) => {
    if (!data_visita) return;

    const dia = new Date(`${data_visita}T12:00:00`).getDay();
    const indice = dia === 0 ? 6 : dia - 1;
    contagem[indice] += 1;
  });

  return ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(
    (day, index) => ({ day, total: contagem[index] }),
  );
}



export async function buscarAgendamentosStats(filtros = {}) {
  const filtrosNormalizados = normalizarFiltrosStats(filtros);
  const hoje = dataLocalISO();

  const statusAdministrativo = ['PENDENTE', 'CONFIRMADO', 'CANCELADO'];
  const resultadosVisita = ['PENDENTE', 'REALIZADO', 'FALTOU'];
  const resultadosVenda = [
    'PENDENTE',
    'VENDA_REALIZADA',
    'VENDA_PERDIDA',
    'NAO_APLICAVEL',
  ];

  const [
    totalHoje,
    statusResultados,
    visitaResultados,
    vendaResultados,
    totalVendas,
    totalAtendidos,
    totalClientes,
    semanaData,
  ] = await Promise.all([
    contarAgendamentosComFiltros(
      {
        ...filtrosNormalizados,
        dataInicio: hoje,
        dataFim: hoje,
      },
      'status',
      'CONFIRMADO',
    ),

    Promise.all(
      statusAdministrativo.map(async (status) => ({
        status,
        total: await contarAgendamentosComFiltros(
          filtrosNormalizados,
          'status',
          status,
        ),
      })),
    ),

    Promise.all(
      resultadosVisita.map(async (resultado) => ({
        resultado,
        total: await contarAgendamentosComFiltros(
          filtrosNormalizados,
          'resultado_visita',
          resultado,
        ),
      })),
    ),


    
    Promise.all(
      resultadosVenda.map(async (resultado) => ({
        resultado,
        total: await contarAgendamentosComFiltros(
          filtrosNormalizados,
          'resultado_venda',
          resultado,
        ),
      })),
    ),

    contarAgendamentosComFiltros(
      filtrosNormalizados,
      'resultado_venda',
      'VENDA_REALIZADA',
    ),

    contarAgendamentosComFiltros(
      filtrosNormalizados,
      'resultado_visita',
      'REALIZADO',
    ),

    somarClientesAtendidosComFiltros(filtrosNormalizados),
    buscarSemanaFiltrada(filtrosNormalizados),
  ]);

  const statusCount = Object.fromEntries(
    statusResultados.map(({ status, total }) => [status, total]),
  );

  const resultadoVisitaCount = Object.fromEntries(
    visitaResultados.map(({ resultado, total }) => [resultado, total]),
  );

  const statusCountVenda = Object.fromEntries(
    vendaResultados.map(({ resultado, total }) => [resultado, total]),
  );


  

  

  return {
    totalHoje,
    semanaData,
    proximosDias: [],
    taxaConversao: totalAtendidos > 0
      ? Number(((totalVendas / totalAtendidos) * 100).toFixed(2))
      : 0,
    totalClientes,
    statusCount,
    resultadoVisitaCount,
    statusCountVenda,
  };
}
