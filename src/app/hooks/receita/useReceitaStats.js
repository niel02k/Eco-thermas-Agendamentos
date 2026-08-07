// src/app/hooks/receita/useReceitaStats.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  atualizarFaturamentoMesAtual,
  finalizarMes,
  getResumoFaturamento,
  receitaPorMes,
} from '@/app/services/receitaService';

export function useReceitaStats(ano = null) {
  const [data, setData] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [atualizando, setAtualizando] = useState(false);

  const anoAtual = ano || new Date().getFullYear();

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Busca os dados dos últimos 8 meses
      const dadosGrafico = await receitaPorMes(anoAtual);
      setData(dadosGrafico);

      // Busca resumo do faturamento
      const resumoData = await getResumoFaturamento(anoAtual);
      setResumo(resumoData);

    } catch (err) {
      console.error('Erro ao carregar dados do faturamento:', err);
      setError('Não foi possível carregar os dados de faturamento');
    } finally {
      setLoading(false);
      setAtualizando(false);
    }
  }, [anoAtual]);

  const atualizarDados = useCallback(async () => {
    try {
      setAtualizando(true);
      setError(null);

      // Atualiza o faturamento do mês atual
      await atualizarFaturamentoMesAtual();
      
      // Recarrega os dados
      await carregarDados();
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
      setError('Erro ao atualizar dados');
      setAtualizando(false);
    }
  }, [carregarDados]);

  const finalizarMesHandler = useCallback(async (mes, anoFinalizar) => {
    try {
      setAtualizando(true);
      const anoRef = anoFinalizar || anoAtual;
      await finalizarMes(anoRef, mes);
      await carregarDados();
      return { success: true };
    } catch (err) {
      console.error('Erro ao finalizar mês:', err);
      setError('Erro ao finalizar mês');
      setAtualizando(false);
      return { success: false, error: err.message };
    }
  }, [anoAtual, carregarDados]);

  // Carregar dados na montagem
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Formatações
  const formatarMoeda = useCallback((valor) => {
    const num = Number(valor) || 0;
    return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }, []);

  const formatarNumero = useCallback((valor) => {
    return new Intl.NumberFormat('pt-BR').format(valor || 0);
  }, []);

  // Dados para o gráfico
  const dadosGrafico = data.map(item => ({
    mes: item.mes,
    receita: item.receita,
    mesNumero: item.mesNumero,
    ano: item.ano
  }));

  // Totalizadores
  const totalReceita = data.reduce((sum, item) => sum + item.receita, 0);
  const totalContratos = resumo?.total_contratos || 0;
  const mediaMensal = resumo?.media_mensal || 0;

  return {
    // Dados
    dadosGrafico,
    resumo,
    loading,
    error,
    atualizando,
    
    // Totalizadores
    totalReceita,
    totalContratos,
    mediaMensal,
    
    // Funções
    carregarDados,
    atualizarDados,
    finalizarMes: finalizarMesHandler,
    
    // Utilitários
    formatarMoeda,
    formatarNumero,
    
    // Dados brutos (caso precise)
    dadosBrutos: data
  };
}