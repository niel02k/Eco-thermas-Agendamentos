// src/app/hooks/useDashboard.js
"use client";

import { useState, useCallback } from 'react';
import { useDashboardStats } from '@/app/hooks/useDashboardStats.js';
import { useDashboardAgendamentos } from '@/app/hooks/useDashboardAgendamentos.js';
import {   } from '@/app/hooks/useDashboardMetrics.js';

export function useDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Hooks individuais
  const stats = useDashboardStats();
  const agendamentos = useDashboardAgendamentos();
  const metrics = useDashboardMetrics();
  
  // Estado combinado de loading
  const loading = stats.loading || agendamentos.loading || metrics.loading;
  
  // Erro combinado
  const error = stats.error || agendamentos.error || metrics.error;
  
  // Função para atualizar tudo
  const refreshAll = useCallback(async () => {
    setRefreshKey(prev => prev + 1);
    await Promise.all([
      stats.atualizarStats(),
      agendamentos.atualizar(),
      metrics.atualizar()
    ]);
  }, [stats, agendamentos, metrics]);
  
  return {
    // Loading e erro
    loading,
    error,
    
    // Stats básicos
    totalHoje: stats.totalHoje,
    semanaData: stats.semanaData,
    dadosReceita: stats.dadosReceita,
    ticketMedioData: stats.ticketMedioData,
    taxaConversaoData: stats.taxaConversaoData,
    totalContratos: stats.totalContratos,
    totalClientes: stats.totalClientes,
    
    // Agendamentos futuros
    diasAgendamentos: agendamentos.diasAgendamentos,
    proximosAgendamentos: agendamentos.proximosAgendamentos,
    
    // Métricas avançadas
    metricasComparativas: metrics.metricasComparativas,
    tendenciaSemanal: metrics.tendenciaSemanal,
    
    // Funções
    refreshAll,
    refreshKey
  };
}