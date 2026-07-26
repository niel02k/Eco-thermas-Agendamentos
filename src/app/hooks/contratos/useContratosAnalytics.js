// src/app/hooks/contratos/useContratosAnalytics.js
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export function useContratosAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contratos, setContratos] = useState([]);

  // Carregar todos os contratos para análise
  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('contratos')
        .select('*, vendedor:vendedor_id(nome), dependentes:contrato_dependentes(id)');

      if (err) throw err;
      setContratos(data || []);
    } catch (e) {
      console.error('Erro ao carregar analytics:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // ─── Ranking de Vendedores ────────────────────────
  const rankingVendedores = useMemo(() => {
    const porVendedor = {};
    const receitaTotal = contratos.reduce((acc, c) => acc + Number(c.valor_total || 0), 0);

    contratos.forEach(c => {
      const nome = c.vendedor?.nome || 'Sem consultor';
      if (!porVendedor[nome]) {
        porVendedor[nome] = { nome, quantidade: 0, receita: 0 };
      }
      porVendedor[nome].quantidade += 1;
      porVendedor[nome].receita += Number(c.valor_total || 0);
    });

    return Object.values(porVendedor)
      .map(item => ({
        ...item,
        ticket_medio: item.quantidade > 0 ? item.receita / item.quantidade : 0,
        percentual: receitaTotal > 0 ? (item.receita / receitaTotal) * 100 : 0,
      }))
      .sort((a, b) => b.receita - a.receita);
  }, [contratos]);

  // ─── Status dos Contratos ─────────────────────────
  const statusContratos = useMemo(() => {
    const porStatus = {};
    contratos.forEach(c => {
      const status = c.status || 'PENDENTE';
      porStatus[status] = (porStatus[status] || 0) + 1;
    });

    return Object.entries(porStatus).map(([status, quantidade]) => ({
      status,
      quantidade,
      percentual: contratos.length > 0 ? (quantidade / contratos.length) * 100 : 0,
    }));
  }, [contratos]);

  // ─── Resumo Geral ─────────────────────────────────
  const resumoGeral = useMemo(() => {
    const receitaTotal = contratos.reduce((acc, c) => acc + Number(c.valor_total || 0), 0);
    const totalContratos = contratos.length;
    const ativos = contratos.filter(c => c.status === 'ATIVO').length;
    const pendentes = contratos.filter(c => c.status === 'PENDENTE').length;
    const cancelados = contratos.filter(c => c.status === 'CANCELADO').length;
    const totalDependentes = contratos.reduce((acc, c) => acc + (c.dependentes?.length || 0), 0);

    return {
      receita_total: receitaTotal,
      ticket_medio: totalContratos > 0 ? receitaTotal / totalContratos : 0,
      total_contratos: totalContratos,
      contratos_ativos: ativos,
      contratos_pendentes: pendentes,
      contratos_cancelados: cancelados,
      total_dependentes: totalDependentes,
    };
  }, [contratos]);

  // ─── Top 5 Cidades ────────────────────────────────
  const top5Cidades = useMemo(() => {
    const porCidade = {};

    contratos.forEach(c => {
      const cidade = c.cidade || 'Não informada';
      if (!porCidade[cidade]) {
        porCidade[cidade] = { cidade, quantidade: 0, receita: 0 };
      }
      porCidade[cidade].quantidade += 1;
      porCidade[cidade].receita += Number(c.valor_total || 0);
    });

    return Object.values(porCidade)
      .map(item => ({
        ...item,
        ticket_medio: item.quantidade > 0 ? item.receita / item.quantidade : 0,
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
  }, [contratos]);

  return {
    loading,
    error,
    recarregar: carregar,
    rankingVendedores,
    statusContratos,
    resumoGeral,
    top5Cidades,
  };
}