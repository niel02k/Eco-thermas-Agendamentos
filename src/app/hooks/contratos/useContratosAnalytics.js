"use client";

import { useState, useCallback, useEffect } from 'react';
import { obterAnalyticsContratos } from '@/app/services/contratosServices';

export function useContratosAnalytics() {
  const [resumoGeral, setResumoGeral] = useState({
    total_contratos: 0,
    receita_total: 0,
    ticket_medio: 0,
    contratos_ativos: 0,
    total_dependentes: 0,
  });
  const [rankingVendedores, setRankingVendedores] = useState([]);
  const [statusContratos, setStatusContratos] = useState([]);
  const [rankingCidades, setRankingCidades] = useState([]);
  const [receita8m, setReceita8m] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const carregarAnalytics = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await obterAnalyticsContratos();
      
      setResumoGeral({
        total_contratos: dados.total_contratos || 0,
        receita_total: dados.receita_total || 0,
        ticket_medio: dados.ticket_medio || 0,
        contratos_ativos: dados.contratos_ativos || 0,
        total_dependentes: dados.total_dependentes || 0,
      });
      
      setRankingVendedores(dados.rankingVendedores || []);
      setStatusContratos(dados.statusContratos || []);
      setRankingCidades(dados.rankingCidades || []);
      setReceita8m(dados.receitaMensal || []);
      
    } catch (e) {
      setErro(e.message || 'Erro ao carregar analytics');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarAnalytics();
  }, [carregarAnalytics]);

  return {
    resumoGeral,
    rankingVendedores,
    statusContratos,
    rankingCidades,
    receita8m,
    loading,
    erro,
    recarregar: carregarAnalytics,
  };
}