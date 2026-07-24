// contratosServices.js

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
  console.log("=== DADOS RECEBIDOS NO SERVIÇO ===");
  console.log("dados:", dados);
  console.log("dados.cidade:", dados.cidade);
  
  // Garantir que cidade não seja undefined ou null
  const cidade = dados.cidade?.trim() || "";
  
  if (!cidade) {
    console.error("ERRO: cidade está vazia!");
    throw new Error("Cidade é obrigatória e não pode estar vazia");
  }

  const dadosInsert = {
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
    observacoes: dados.observacoes || null,
    cidade: cidade  // VARCHAR(30) NOT NULL
  };

  console.log("=== DADOS PARA INSERT ===");
  console.log(JSON.stringify(dadosInsert, null, 2));

  const { data, error } = await supabase
    .from('contratos')
    .insert([dadosInsert])
    .select()
    .single();

  if (error) {
    console.error("Erro do Supabase:", error);
    console.error("Detalhes:", error.details);
    console.error("Hint:", error.hint);
    console.error("Dados que tentamos inserir:", dadosInsert);
    throw error;
  }

  console.log("Contrato criado com sucesso:", data);

  // Inserir dependentes se existirem
  if (dados.dependentes && dados.dependentes.length > 0) {
    const deps = dados.dependentes.map(d => ({
      contrato_id: data.id,
      nome: d.nome,
      cpf: d.cpf || null,
      data_nascimento: d.data_nascimento || null
    }));

    const { error: depError } = await supabase
      .from('contrato_dependentes')
      .insert(deps);

    if (depError) {
      console.error("Erro ao inserir dependentes:", depError);
      throw depError;
    }
    
    console.log("Dependentes inseridos com sucesso:", deps);
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
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 7, 1);

  const { data, error } = await supabase
    .from('contratos')
    .select('valor_total, data_inicio')
    .gte('data_inicio', inicio.toISOString().split('T')[0])
    .eq('status', 'ATIVO');

  if (error) throw error;

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const agrupado = {};

  // Inicializa os últimos 8 meses com 0
  for (let i = 7; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const chave = meses[d.getMonth()];
    agrupado[chave] = 0;
  }

  data.forEach(c => {
    const d = new Date(c.data_inicio);
    const chave = meses[d.getMonth()];
    if (agrupado[chave] !== undefined) {
      agrupado[chave] += Number(c.valor_total);
    }
  });

  return Object.entries(agrupado).map(([mes, receita]) => ({ mes, receita }));
}

// Função auxiliar para agrupar ticket médio (NÃO exportada diretamente)
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

// TICKET MÉDIO (totalmente reutilizável)
// src/app/services/contratosServices.js

export async function ticketMedio({ 
  inicio, 
  fim, 
  status = ['ATIVO', 'PENDENTE'],
  vendedor_id = null,
  forma_pagamento = null,
  agrupado_por = null
} = {}) {
  
  try {

    // Função auxiliar para buscar contratos
    const buscarContratos = async (comFiltroData = true) => {
      let query = supabase
        .from('contratos')
        .select('valor_total, data_inicio, data_criacao, forma_pagamento, status, vendedor_id, vendedor:vendedor_id(nome)', { count: 'exact' });

      // Aplicar filtro de data apenas se solicitado
      if (comFiltroData && (inicio || fim)) {
        const hoje = new Date();
        const dataInicio = inicio || new Date(hoje.getFullYear(), 0, 1).toISOString().split('T')[0];
        const dataFim = fim || hoje.toISOString().split('T')[0];
        query = query.gte('data_inicio', dataInicio).lte('data_inicio', dataFim);
      }

      if (status && status.length > 0) {
        query = query.in('status', status);
      }

      if (vendedor_id) {
        query = query.eq('vendedor_id', vendedor_id);
      }

      if (forma_pagamento) {
        query = query.eq('forma_pagamento', forma_pagamento);
      }

      const { data, error, count } = await query;
      return { data, error, count };
    };

    // Primeira tentativa: COM filtro de data (se datas foram fornecidas)
    if (inicio || fim) {
      const { data, error, count } = await buscarContratos(true);
      
      if (error) {
        console.error('❌ Erro na query com filtro:', error);
      } else if (data && data.length > 0) {
        
        const valorTotal = data.reduce((acc, c) => acc + (Number(c.valor_total) || 0), 0);
        const resultado = {
          ticket_medio: valorTotal / data.length,
          total_contratos: data.length,
          valor_total: valorTotal,
          periodo: { 
            inicio: inicio || 'início', 
            fim: fim || 'hoje' 
          }
        };
        
        return resultado;
      }
      
    }
    
    // Segunda tentativa: SEM filtro de data (todos os contratos)
    console.log('🔍 Buscando sem filtro de data...');
    const { data, error, count } = await buscarContratos(false);
    
    if (error) {
      console.error('❌ Erro na query sem filtro:', error);
      throw error;
    }
    
    console.log('📊 Dados encontrados sem filtro:', { count, length: data?.length });
    
    if (!data || data.length === 0) {
      console.warn('⚠️ Nenhum contrato encontrado');
      return {
        ticket_medio: 0,
        total_contratos: 0,
        valor_total: 0,
        periodo: { inicio: 'N/A', fim: 'N/A' }
      };
    }
    
    // Calcular ticket médio
    const valorTotal = data.reduce((acc, c) => acc + (Number(c.valor_total) || 0), 0);
    
    const resultado = {
      ticket_medio: Number((valorTotal / data.length).toFixed(2)),
      total_contratos: data.length,
      valor_total: valorTotal,
      periodo: { inicio: 'todos', fim: 'todos' }
    };
    

    return resultado;
    
  } catch (error) {
    console.error('❌ Erro geral no ticketMedio:', error);
    return {
      ticket_medio: 0,
      total_contratos: 0,
      valor_total: 0,
      periodo: {},
      erro: error.message
    };
  }
}