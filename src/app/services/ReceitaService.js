import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const ReceitaService = {
  /**
   * Busca todas as receitas/faturamento mensal
   */
  async getReceitas() {
    const { data, error } = await supabase
      .from('faturamento_mensal')
      .select('*')
      .order('ano', { ascending: false })
      .order('mes', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Busca receita por ID
   */
  async getReceitaById(id) {
    const { data, error } = await supabase
      .from('faturamento_mensal')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Busca receita de um mês específico
   */
  async getReceitaByMesAno(ano, mes) {
    const { data, error } = await supabase
      .from('faturamento_mensal')
      .select('*')
      .eq('ano', ano)
      .eq('mes', mes)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  /**
   * Busca receitas de um ano específico
   */
  async getReceitasByAno(ano) {
    const { data, error } = await supabase
      .from('faturamento_mensal')
      .select('*')
      .eq('ano', ano)
      .order('mes', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Calcula o faturamento do mês atual baseado nos contratos ativos
   */
  async calcularFaturamentoMesAtual() {
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
  },

  /**
   * Atualiza o faturamento do mês atual (para ser usado durante o mês)
   */
  async atualizarFaturamentoMesAtual() {
    const faturamento = await this.calcularFaturamentoMesAtual();
    
    // Verifica se já existe registro para este mês
    const existing = await this.getReceitaByMesAno(faturamento.ano, faturamento.mes);
    
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
      return this.createReceita(faturamento);
    }
  },

  /**
   * Finaliza o mês e salva o faturamento consolidado
   * Deve ser chamado no final do mês ou no dia 1 do mês seguinte
   */
  async finalizarMes(ano, mes) {
    // Verifica se o mês já foi finalizado
    const existing = await this.getReceitaByMesAno(ano, mes);
    
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
    const faturamento = await this.calcularFaturamentoDoMes(ano, mes);
    
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
      return this.createReceita(faturamento);
    }
  },

  /**
   * Calcula o faturamento de um mês específico
   */
  async calcularFaturamentoDoMes(ano, mes) {
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
  },

  /**
   * Cria uma nova receita
   */
  async createReceita(receita) {
    const { data, error } = await supabase
      .from('faturamento_mensal')
      .insert([{
        ...receita,
        data_criacao: new Date().toISOString(),
        data_atualizacao: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Atualiza uma receita existente
   */
  async updateReceita(id, receita) {
    const { data, error } = await supabase
      .from('faturamento_mensal')
      .update({
        ...receita,
        data_atualizacao: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Obtém o faturamento acumulado do ano
   */
  async getFaturamentoAcumuladoAno(ano) {
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
  },

  /**
   * Obtém o resumo do faturamento (total, média, etc)
   */
  async getResumoFaturamento(ano) {
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
  },

  /**
   * Verifica se um mês já foi finalizado
   */
  async isMesFinalizado(ano, mes) {
    const registro = await this.getReceitaByMesAno(ano, mes);
    if (!registro) return false;
    
    const dataCalculo = new Date(registro.data_calculo);
    const ultimoDia = new Date(ano, mes, 0);
    
    // Se a data de cálculo é o último dia do mês, considera finalizado
    return dataCalculo.getDate() === ultimoDia.getDate() &&
           dataCalculo.getMonth() === ultimoDia.getMonth() &&
           dataCalculo.getFullYear() === ultimoDia.getFullYear();
  },

  /**
   * Deleta uma receita
   */
  async deleteReceita(id) {
    const { error } = await supabase
      .from('faturamento_mensal')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};