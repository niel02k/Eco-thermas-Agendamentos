// src/app/hooks/useDashboardMetrics.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { listarContratos } from '@/app/services/contratosServices';
import { listarAgendamentos } from '@/app/services/agendamentosServices';

export function useDashboardMetrics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Métricas calculadas
  const [metricasComparativas, setMetricasComparativas] = useState({
    crescimentoContratos: 0,
    crescimentoAgendamentos: 0,
    satisfacaoMedia: 0
  });
  
  const [tendenciaSemanal, setTendenciaSemanal] = useState({
    labels: [],
    valores: [],
    crescimento: 0
  });

  const carregarMetricas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const hoje = new Date();
      const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const inicioMesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const fimMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
      
      // Buscar dados dos dois meses para comparação
      const [contratosAtuais, contratosAnteriores, agendamentosAtuais, agendamentosAnteriores] = await Promise.all([
        listarContratos({ 
          pagina: 1, 
          limite: 1,
          data_inicio: inicioMesAtual.toISOString().split('T')[0],
          data_fim: hoje.toISOString().split('T')[0]
        }),
        listarContratos({ 
          pagina: 1, 
          limite: 1,
          data_inicio: inicioMesPassado.toISOString().split('T')[0],
          data_fim: fimMesPassado.toISOString().split('T')[0]
        }),
        listarAgendamentos({ 
          pagina: 1, 
          limite: 1,
          data_inicio: inicioMesAtual.toISOString().split('T')[0],
          data_fim: hoje.toISOString().split('T')[0]
        }),
        listarAgendamentos({ 
          pagina: 1, 
          limite: 1,
          data_inicio: inicioMesPassado.toISOString().split('T')[0],
          data_fim: fimMesPassado.toISOString().split('T')[0]
        })
      ]);
      
      // Calcular crescimento
      const totalContratosAtual = contratosAtuais?.total || 0;
      const totalContratosAnterior = contratosAnteriores?.total || 0;
      const totalAgendamentosAtual = agendamentosAtuais?.total || 0;
      const totalAgendamentosAnterior = agendamentosAnteriores?.total || 0;
      
      const calcCrescimento = (atual, anterior) => {
        if (anterior === 0) return atual > 0 ? 100 : 0;
        return ((atual - anterior) / anterior) * 100;
      };
      
      setMetricasComparativas({
        crescimentoContratos: calcCrescimento(totalContratosAtual, totalContratosAnterior),
        crescimentoAgendamentos: calcCrescimento(totalAgendamentosAtual, totalAgendamentosAnterior),
        satisfacaoMedia: 85 // Pode ser calculado posteriormente com dados reais
      });
      
      // Calcular tendência semanal (últimas 4 semanas)
      const semanasLabels = [];
      const semanasValores = [];
      
      for (let i = 3; i >= 0; i--) {
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - (i * 7) - hoje.getDay());
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        
        const resultado = await listarAgendamentos({
          pagina: 1,
          limite: 1,
          data_inicio: inicioSemana.toISOString().split('T')[0],
          data_fim: inicioSemana.toISOString().split('T')[0]
        });
        
        semanasLabels.push(`Sem ${i + 1}`);
        semanasValores.push(resultado?.total || 0);
      }
      
      const tendenciaCrescimento = semanasValores.length >= 2 
        ? ((semanasValores[semanasValores.length - 1] - semanasValores[0]) / Math.max(semanasValores[0], 1)) * 100
        : 0;
      
      setTendenciaSemanal({
        labels: semanasLabels,
        valores: semanasValores,
        crescimento: tendenciaCrescimento
      });
      
    } catch (err) {
      console.error('Erro ao carregar métricas:', err);
      setError(err.message || 'Erro ao carregar métricas comparativas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarMetricas();
  }, [carregarMetricas]);

  return {
    loading,
    error,
    metricasComparativas,
    tendenciaSemanal,
    atualizar: carregarMetricas
  };
}