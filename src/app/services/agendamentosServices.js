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

/**
 * Total de clientes atendidos (soma quantidade_pessoas dos agendamentos REALIZADOS)
 */
export async function totalClientesAtendidos() {
  const { data, error } = await supabase
    .from('agendamentos')
    .select('quantidade_pessoas')
    .eq('status', 'REALIZADO');
    
  if (error) throw error;
  
  return data?.reduce((acc, a) => acc + (a.quantidade_pessoas || 1), 0) ?? 0;
}

/**
 * Agendamentos de hoje (PENDENTE ou CONFIRMADO)
 */
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

/**
 * Agendamentos por dia da semana atual
 * Retorna array com 7 posições [Seg, Ter, Qua, Qui, Sex, Sáb, Dom]
 */
export async function agendamentosPorDiaSemana() {
  const hoje = new Date();
  const diaSemana = hoje.getDay(); // 0=Dom, 1=Seg, ..., 6=Sáb
  
  // Calcular início da semana (Segunda-feira)
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
  inicioSemana.setHours(0, 0, 0, 0);
  
  // Calcular fim da semana (Domingo)
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);
  fimSemana.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('agendamentos')
    .select('data_visita')
    .gte('data_visita', inicioSemana.toISOString().split('T')[0])
    .lte('data_visita', fimSemana.toISOString().split('T')[0]);

  if (error) throw error;

  // Inicializar contagem: [Seg, Ter, Qua, Qui, Sex, Sáb, Dom]
  const contagem = [0, 0, 0, 0, 0, 0, 0];
  
  (data || []).forEach(a => {
    const d = new Date(a.data_visita + 'T12:00:00');
    const idx = d.getDay(); // 0=Dom, 1=Seg, ..., 6=Sáb
    const posicao = idx === 0 ? 6 : idx - 1; // Converter para [Seg=0, ..., Dom=6]
    contagem[posicao] += 1;
  });
  
  return contagem;
}

/**
 * Buscar próximos dias que possuem agendamentos
 * @param {number} quantidade - Quantidade de dias para retornar (default: 2)
 */
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

  // Agrupar por data
  const agrupado = {};
  (data || []).forEach(a => {
    agrupado[a.data_visita] = (agrupado[a.data_visita] || 0) + 1;
  });
  
  // Retornar apenas a quantidade solicitada
  return Object.entries(agrupado)
    .slice(0, quantidade)
    .map(([data_visita, total]) => ({
      data_visita,
      total,
      label: new Date(data_visita + 'T12:00:00').toLocaleDateString('pt-BR', { 
        weekday: 'short', 
        day: '2-digit', 
        month: '2-digit' 
      })
    }));
}

/**
 * Taxa de conversão de agendamentos
 * Percentual de agendamentos REALIZADOS que resultaram em VENDA_REALIZADA
 */
export async function taxaDeConversao({ inicio, fim } = {}) {
  try {
    // Se tiver datas específicas, tentar primeiro com filtro
    if (inicio || fim) {
      const hoje = new Date();
      const dataInicio = inicio || new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
      const dataFim = fim || `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(ultimoDiaMes).padStart(2, '0')}`;
      
      // Buscar com filtro de data
      const { count: vendasFiltrado, error: error1 } = await supabase
        .from('agendamentos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'REALIZADO')
        .eq('resultado_venda', 'VENDA_REALIZADA')
        .gte('data_visita', dataInicio)
        .lte('data_visita', dataFim);
      
      if (error1) console.error('Erro query vendas (filtrado):', error1);
      
      const { count: atendidosFiltrado, error: error2 } = await supabase
        .from('agendamentos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'REALIZADO')
        .gte('data_visita', dataInicio)
        .lte('data_visita', dataFim);
      
      if (error2) console.error('Erro query atendidos (filtrado):', error2);
      
      if (atendidosFiltrado > 0) {
        return Number(((vendasFiltrado / atendidosFiltrado) * 100).toFixed(2));
      }
    }
    
    // FALLBACK: Buscar sem filtro de data
    const { count: vendasrealizada, error: error3 } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'REALIZADO')
      .eq('resultado_venda', 'VENDA_REALIZADA');
    
    if (error3) throw error3;
    
    const { count: atendidos, error: error4 } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'REALIZADO');
    
    if (error4) throw error4;
    
    return atendidos > 0 
      ? Number(((vendasrealizada / atendidos) * 100).toFixed(2)) 
      : 0;
    
  } catch (error) {
    console.error('Erro geral na taxaDeConversao:', error);
    return 0;
  }
}

// ============ CRUD ============

/**
 * Listar agendamentos com paginação e busca
 */
export async function listarAgendamentos({ pagina = 1, limite = 10, busca = '', status = null, ordenarPor = 'data_visita', ordem = 'desc' } = {}) {
  const inicio = (pagina - 1) * limite;
  const fim = inicio + limite - 1;
  
  let query = supabase
    .from('agendamentos')
    .select(`*, cliente:cliente_id (nome, cpf, telefone, email, idade, origem), dependentes:agendamento_dependentes (nome, idade, cpf)`, { count: 'exact' });

  // Filtro de busca
  if (busca) {
    query = query.or(
      `cliente_id.in.(SELECT id FROM clientes WHERE nome.ilike.%${busca}%),` +
      `codigo.in.(SELECT agendamento_id FROM agendamento_dependentes WHERE nome.ilike.%${busca}%)`
    );
  }

  // Filtro de status
  if (status) {
    if (Array.isArray(status)) {
      query = query.in('status', status);
    } else {
      query = query.eq('status', status);
    }
  }

  // Ordenação
  const ascending = ordem === 'asc';
  query = query.order(ordenarPor, { ascending });

  // Paginação
  const { data, count, error } = await query.range(inicio, fim);
  
  if (error) throw error;
  
  return {
    agendamentos: data || [],
    total: count || 0,
    pagina,
    totalPaginas: Math.ceil((count || 0) / limite)
  };
}

/**
 * Buscar agendamento por código
 */
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

/**
 * Buscar agendamentos por nome do cliente ou dependente
 */
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

/**
 * Criar novo agendamento
 */
export async function criarAgendamento(dados) {
  const codigo = await gerarCodigoAgendamento();

  let cliente_id = null;
  let origem = 'OUTRO';

  // Processar cliente
  if (dados.cliente?.cpf) {
    const existente = await buscarClientePorCpf(dados.cliente.cpf);
    
    if (existente) {
      cliente_id = existente.id;
      origem = existente.origem || 'OUTRO';
    } else {
      // Criar novo cliente
      cliente_id = await criarCliente({
        cpf: dados.cliente.cpf,
        nome: dados.cliente.nome || dados.nome,
        email: dados.cliente.email || null,
        telefone: dados.cliente.telefone || null,
        idade: dados.cliente.idade || null,
        origem: dados.origem || dados.cliente.origem || 'OUTRO',
      });
      
      if (cliente_id) {
        origem = dados.origem || dados.cliente.origem || 'OUTRO';
      }
    }
  }

  if (!cliente_id) {
    throw new Error('Não foi possível identificar/criar o cliente.');
  }

  // Inserir agendamento
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
      resultado_venda: 'PENDENTE',
      observacoes: dados.observacoes || null,
    }])
    .select()
    .single();

  if (error) throw error;

  // Inserir dependentes
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

/**
 * Atualizar agendamento existente
 */
export async function atualizarAgendamento(codigo, dados) {
  const updateData = {
    vendedor_id: dados.vendedor_id || null,
    data_visita: dados.data_visita,
    horario_visita: dados.horario_visita,
    quantidade_pessoas: dados.quantidade_pessoas,
    cidade: dados.cidade,
    origem: dados.origem,
    status: dados.status,
    observacoes: dados.observacoes,
  };

  // Remover campos undefined
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

  // Atualizar dependentes (remove antigos e insere novos)
  if (dados.dependentes !== undefined) {
    await supabase
      .from('agendamento_dependentes')
      .delete()
      .eq('agendamento_id', codigo);

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
  }

  return data;
}

// ============ STATUS / RESULTADO ============

/**
 * Atualizar resultado de venda do agendamento
 */
export async function atualizarResultadoVenda(codigo, resultadoVenda) {
  const { data, error } = await supabase
    .from('agendamentos')
    .update({ 
      status: 'REALIZADO', 
      resultado_venda: resultadoVenda 
    })
    .eq('codigo', codigo)
    .select()
    .single();
    
  if (error) throw error;
  
  return data;
}

/**
 * Marcar agendamento como realizado (sem definir venda)
 */
export async function marcarComoRealizado(codigo) {
  const { data, error } = await supabase
    .from('agendamentos')
    .update({ 
      status: 'REALIZADO', 
      resultado_venda: 'NAO_APLICAVEL' 
    })
    .eq('codigo', codigo)
    .select()
    .single();
    
  if (error) throw error;
  
  return data;
}

/**
 * Cancelar agendamento
 */
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

/**
 * Excluir agendamento (dependentes são excluídos por CASCADE)
 */
export async function excluirAgendamento(codigo) {
  const { error } = await supabase
    .from('agendamentos')
    .delete()
    .eq('codigo', codigo);
    
  if (error) throw error;
  
  return true;
}