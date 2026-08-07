// src/app/hooks/useDashboardStats.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  agendamentosHoje, 
  agendamentosPorDiaSemana, 
  taxaDeConversao,
  proximosDiasComAgendamentos 
} from '@/app/services/agendamentosServices';
import { receitaPorMes, ticketMedio } from '@/app/services/contratosServices';

export function useDashboardStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [totalHoje, setTotalHoje] = useState(0);
  const [semanaData, setSemanaData] = useState([]);
  const [dadosReceita, setDadosReceita] = useState([]);
  const [ticketMedioData, setTicketMedioData] = useState(null);
  const [taxaConversaoData, setTaxaConversaoData] = useState(null);
  const [totalContratos, setTotalContratos] = useState(0);
  const [proximosDiasComAgendamento, setProximosDiasComAgendamento] = useState([]);
  const [totalClientesSemana, setTotalClientesSemana] = useState(0);

  const carregarStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // ═══════════ PRIMEIRA ONDA: Dados rápidos (mostra imediatamente) ═══════════
      const [totalHojeResult, semanaResult, proximosDiasResult] = await Promise.all([
        agendamentosHoje(),
        agendamentosPorDiaSemana(),
        proximosDiasComAgendamentos(2),
      ]);

      // Atualizar UI imediatamente
      setTotalHoje(Number(totalHojeResult) || 0);

      const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      if (Array.isArray(semanaResult)) {
        const semanaFormatada = DIAS_SEMANA.map((dia, i) => ({
          day: dia,
          total: Number(semanaResult[i]) || 0
        }));
        setSemanaData(semanaFormatada);
        setTotalClientesSemana(semanaResult.reduce((acc, val) => acc + (Number(val) || 0), 0));
      }

      setProximosDiasComAgendamento(Array.isArray(proximosDiasResult) ? proximosDiasResult : []);
      
      // 👇 Liberar loading - cards e gráfico já aparecem
      setLoading(false);

      // ═══════════ SEGUNDA ONDA: Dados pesados (carrega em segundo plano) ═══════════
      const [receitaResult, ticketMedioResult, taxaConversaoResult] = await Promise.all([
        receitaPorMes(),
        ticketMedio({
          inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          fim: new Date().toISOString().split('T')[0],
          status: ['ATIVO', 'PENDENTE']
        }),
        taxaDeConversao({
          inicio: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
          fim: new Date().toISOString().split('T')[0]
        }),
      ]);

      // Atualizar dados pesados
      setDadosReceita(Array.isArray(receitaResult) ? receitaResult : []);

      if (ticketMedioResult) {
        setTicketMedioData({
          ticket_medio: Number(ticketMedioResult.ticket_medio) || 0,
          total_contratos: Number(ticketMedioResult.total_contratos) || 0,
          valor_total: Number(ticketMedioResult.valor_total) || 0,
          periodo: ticketMedioResult.periodo || {}
        });
        setTotalContratos(Number(ticketMedioResult.total_contratos) || 0);
      }

      setTaxaConversaoData(Number(taxaConversaoResult) || 0);

    } catch (err) {
      console.error('❌ Erro:', err);
      setError(err.message || 'Erro ao carregar dados do dashboard');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarStats();
  }, [carregarStats]);

  return {
    loading,
    error,
    totalHoje,
    semanaData,
    dadosReceita,
    ticketMedioData,
    taxaConversaoData,
    totalContratos,
    proximosDiasComAgendamento,
    totalClientesSemana,
    atualizarStats: carregarStats
  };
}