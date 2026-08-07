// src/app/services/receitaServices.js
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// ============ CRUD BÁSICO ============

/**
 * Listar todas as receitas/faturamento mensal
 */
export async function listarReceitas({ ano = null, ordenarPor = 'ano', ordem = 'desc' } = {}) {
  let query = supabase
    .from('faturamento_mensal')
    .select('*');

  if (ano) {
    query = query.eq('ano', ano);
  }

  const ascending = ordem === 'asc';
  query = query.order(ordenarPor, { ascending });

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Buscar receita por ID
 */
export async function buscarReceitaPorId(id) {
  const { data, error } = await supabase
    .from('faturamento_mensal')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Buscar receita de um mês específico
 */
export async function buscarReceitaPorMesAno(ano, mes) {
  const { data, error } = await supabase
    .from('faturamento_mensal')
    .select('*')
    .eq('ano', ano)
    .eq('mes', mes)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/**
 * Buscar receitas de um ano específico
 */
export async function buscarReceitasPorAno(ano) {
  const { data, error } = await supabase
    .from('faturamento_mensal')
    .select('*')
    .eq('ano', ano)
    .order('mes', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ============ CÁLCULOS E OPERAÇÕES ============

/**
 * Calcula o faturamento do mês atual baseado nos contratos ativos
 */
export async function calcularFaturamentoMesAtual() {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = now.getMonth() + 1;

  // Buscar contratos ativos no mês atual
  const { data: contratos, error } = await supabase
    .from('contratos')
    .select('valor_total')
    .eq('status', 'ATIVO')
    .lte('data_inicio', `${ano}-${String(mes).padStart(2, '0')}-31`)
    .or(`data_fim.is.null,data_fim.gte.${ano}-${String(mes).padStart(2, '0')}-01`);

  if (error) throw error;

  const valorTotal = contratos?.reduce((sum, c) => sum + Number(c.valor_total), 0) || 0;
  const quantidade = contratos?.length || 0;

  return {
    ano,
    mes,
    valor_total: valorTotal,
    quantidade_contratos: quantidade,
    data_calculo: new Date().toISOString().split('T')[0]
  };
}

/**
 * Calcula o faturamento de um mês específico
 */
export async function calcularFaturamentoDoMes(ano, mes) {
  const primeiroDia = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const ultimoDia = new Date(ano, mes, 0);
  const ultimoDiaStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;

  // Buscar contratos ativos no período
  const { data: contratos, error } = await supabase
    .from('contratos')
    .select('valor_total')
    .eq('status', 'ATIVO')
    .lte('data_inicio', ultimoDiaStr)
    .or(`data_fim.is.null,data_fim.gte.${primeiroDia}`);

  if (error) throw error;

  const valorTotal = contratos?.reduce((sum, c) => sum + Number(c.valor_total), 0) || 0;
  const quantidade = contratos?.length || 0;

  return {
    ano,
    mes,
    valor_total: valorTotal,
    quantidade_contratos: quantidade,
    data_calculo: ultimoDiaStr
  };
}

/**
 * Atualiza o faturamento do mês atual (para ser usado durante o mês)
 */
export async function atualizarFaturamentoMesAtual() {
  const faturamento = await calcularFaturamentoMesAtual();
  
  // Verifica se já existe registro para este mês
  const existing = await buscarReceitaPorMesAno(faturamento.ano, faturamento.mes);
  
  if (existing) {
    // Atualiza o registro existente
    const { data, error } = await supabase
      .from('faturamento_mensal')
      .update({
        valor_total: faturamento.valor_total,
        quantidade_contratos: faturamento.quantidade_contratos,
        data_calculo: faturamento.data_calculo,
        data_atualizacao: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select();

    if (error) throw error;
    return data || [];
  } else {
    // Cria novo registro
    return criarReceita(faturamento);
  }
}

/**
 * Finaliza o mês e salva o faturamento consolidado
 * Deve ser chamado no final do mês ou no dia 1 do mês seguinte
 */
export async function finalizarMes(ano, mes) {
  // Verifica se o mês já foi finalizado
  const existing = await buscarReceitaPorMesAno(ano, mes);
  
  if (existing) {
    // Verifica se já é o último dia do mês ou se já passou
    const ultimoDiaMes = new Date(ano, mes, 0).getDate();
    const dataCalculo = new Date(existing.data_calculo);
    const hoje = new Date();
    
    // Se já passou do último dia do mês, considera finalizado
    if (hoje.getDate() > ultimoDiaMes || dataCalculo.getMonth() > mes - 1) {
      return [existing];
    }
  }

  // Recalcula o faturamento do mês
  const faturamento = await calcularFaturamentoDoMes(ano, mes);
  
  // Salva com a data do último dia do mês
  const ultimoDia = new Date(ano, mes, 0);
  faturamento.data_calculo = ultimoDia.toISOString().split('T')[0];
  
  if (existing) {
    const { data, error } = await supabase
      .from('faturamento_mensal')
      .update({
        valor_total: faturamento.valor_total,
        quantidade_contratos: faturamento.quantidade_contratos,
        data_calculo: faturamento.data_calculo,
        data_atualizacao: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select();

    if (error) throw error;
    return data || [];
  } else {
    return criarReceita(faturamento);
  }
}

// ============ CRUD DE RECEITAS ============

/**
 * Criar uma nova receita
 */
export async function criarReceita(receita) {
  const { data, error } = await supabase
    .from('faturamento_mensal')
    .insert([{
      ano: receita.ano,
      mes: receita.mes,
      valor_total: Number(receita.valor_total) || 0,
      quantidade_contratos: Number(receita.quantidade_contratos) || 0,
      data_calculo: receita.data_calculo || new Date().toISOString().split('T')[0],
      data_criacao: new Date().toISOString(),
      data_atualizacao: new Date().toISOString()
    }])
    .select();

  if (error) throw error;
  return data || [];
}

/**
 * Atualizar uma receita existente
 */
export async function atualizarReceita(id, receita) {
  const updateData = {
    valor_total: receita.valor_total !== undefined ? Number(receita.valor_total) : undefined,
    quantidade_contratos: receita.quantidade_contratos !== undefined ? Number(receita.quantidade_contratos) : undefined,
    data_calculo: receita.data_calculo || undefined,
    data_atualizacao: new Date().toISOString()
  };

  // Remover undefined
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) delete updateData[key];
  });

  const { data, error } = await supabase
    .from('faturamento_mensal')
    .update(updateData)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data || [];
}

/**
 * Excluir uma receita
 */
export async function excluirReceita(id) {
  const { error } = await supabase
    .from('faturamento_mensal')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// ============ RELATÓRIOS E ANÁLISES ============

/**
 * Obtém o faturamento acumulado do ano
 */
export async function getFaturamentoAcumuladoAno(ano) {
  const { data, error } = await supabase
    .from('faturamento_mensal')
    .select('*')
    .eq('ano', ano)
    .order('mes', { ascending: true });

  if (error) throw error;

  let acumulado = 0;
  return (data || []).map((item) => {
    acumulado += Number(item.valor_total);
    return {
      ...item,
      valor_acumulado: acumulado
    };
  });
}

/**
 * Obtém o resumo do faturamento (total, média, etc)
 */
export async function getResumoFaturamento(ano) {
  const { data, error } = await supabase
    .from('faturamento_mensal')
    .select('valor_total, quantidade_contratos')
    .eq('ano', ano);

  if (error) throw error;

  const total = (data || []).reduce((sum, item) => sum + Number(item.valor_total), 0);
  const totalContratos = (data || []).reduce((sum, item) => sum + (item.quantidade_contratos || 0), 0);
  const meses = (data || []).length;

  return {
    total_ano: total,
    total_contratos: totalContratos,
    media_mensal: meses > 0 ? total / meses : 0,
    meses_com_dados: meses
  };
}

/**
 * Verifica se um mês já foi finalizado
 */
export async function isMesFinalizado(ano, mes) {
  const registro = await buscarReceitaPorMesAno(ano, mes);
  if (!registro) return false;

  const dataCalculo = new Date(registro.data_calculo);
  const ultimoDia = new Date(ano, mes, 0);

  return dataCalculo.getDate() === ultimoDia.getDate() &&
         dataCalculo.getMonth() === ultimoDia.getMonth() &&
         dataCalculo.getFullYear() === ultimoDia.getFullYear();
}

/**
 * Receita mensal para gráfico (últimos 8 meses)
 */
export async function receitaPorMes(ano = null) {
  const hoje = new Date();
  const anoAtual = ano || hoje.getFullYear();
  
  const { data, error } = await supabase
    .from('faturamento_mensal')
    .select('*')
    .eq('ano', anoAtual)
    .order('mes', { ascending: true });

  if (error) throw error;

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const agrupado = {};

  // Inicializa todos os meses com 0
  meses.forEach(mes => {
    agrupado[mes] = 0;
  });

  // Preenche com os dados existentes
  (data || []).forEach(item => {
    const mes = meses[item.mes - 1];
    if (mes) {
      agrupado[mes] = Number(item.valor_total);
    }
  });

  // Retorna apenas os últimos 8 meses
  const mesAtual = hoje.getMonth();
  const ultimos8Meses = [];
  
  for (let i = 7; i >= 0; i--) {
    const mesIndex = (mesAtual - i + 12) % 12;
    const mesNome = meses[mesIndex];
    // Verifica se é um mês do ano atual ou do ano passado
    const mesNumero = mesIndex + 1;
    const anoMes = mesNumero > (mesAtual + 1) ? anoAtual - 1 : anoAtual;
    
    ultimos8Meses.push({
      mes: mesNome,
      mesNumero: mesNumero,
      ano: anoMes,
      receita: agrupado[mesNome] || 0
    });
  }

  return ultimos8Meses;
}

// ============ EXPORTAÇÃO PARA USO EM COMPONENTES ============
export const ReceitaService = {
  listarReceitas,
  buscarReceitaPorId,
  buscarReceitaPorMesAno,
  buscarReceitasPorAno,
  calcularFaturamentoMesAtual,
  calcularFaturamentoDoMes,
  atualizarFaturamentoMesAtual,
  finalizarMes,
  criarReceita,
  atualizarReceita,
  excluirReceita,
  getFaturamentoAcumuladoAno,
  getResumoFaturamento,
  isMesFinalizado,
  receitaPorMes
};