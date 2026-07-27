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

      const totalHojeResult = await agendamentosHoje();
      const semanaResult = await agendamentosPorDiaSemana();
      const receitaResult = await receitaPorMes();
      console.log('4️⃣ Buscando ticket médio...');  const ticketMedioResult = await ticketMedio({
        inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          .toISOString().split('T')[0],
        fim: new Date().toISOString().split('T')[0],
        status: ['ATIVO', 'PENDENTE']
      });
      const taxaConversaoResult = await taxaDeConversao({
        inicio: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Desde janeiro
        fim: new Date().toISOString().split('T')[0]
      });
  
      const proximosDiasResult = await proximosDiasComAgendamentos(2);

      // Processar total de hoje
      setTotalHoje(Number(totalHojeResult) || 0);

      // Processar dados da semana
      const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      if (Array.isArray(semanaResult)) {
        const semanaFormatada = DIAS_SEMANA.map((dia, i) => ({
          day: dia,
          total: Number(semanaResult[i]) || 0
        }));
        setSemanaData(semanaFormatada);
        
        const totalSemana = semanaResult.reduce((acc, val) => acc + (Number(val) || 0), 0);
        setTotalClientesSemana(totalSemana);
      }

      // Processar receita mensal
      setDadosReceita(Array.isArray(receitaResult) ? receitaResult : []);

      // Processar ticket médio
      console.log('🔍 Processando ticket médio:', {
        recebido: ticketMedioResult,
        ticket_medio: ticketMedioResult?.ticket_medio,
        total_contratos: ticketMedioResult?.total_contratos,
        valor_total: ticketMedioResult?.valor_total
      });
      
      if (ticketMedioResult) {
        const ticketData = {
          ticket_medio: Number(ticketMedioResult.ticket_medio) || 0,
          total_contratos: Number(ticketMedioResult.total_contratos) || 0,
          valor_total: Number(ticketMedioResult.valor_total) || 0,
          periodo: ticketMedioResult.periodo || {}
        };
        console.log('💾 Salvando ticketMedioData:', ticketData);
        setTicketMedioData(ticketData);
        setTotalContratos(ticketData.total_contratos);
      } else {
        console.warn('⚠️ ticketMedioResult é null/undefined');
        setTicketMedioData({
          ticket_medio: 0,
          total_contratos: 0,
          valor_total: 0,
          periodo: {}
        });
        setTotalContratos(0);
      }

      // Processar taxa de conversão
      console.log('🔍 Processando taxa de conversão:', {
        recebido: taxaConversaoResult,
        tipo: typeof taxaConversaoResult
      });
      
      const taxaConvertida = Number(taxaConversaoResult);
      console.log('💾 Salvando taxaConversaoData:', taxaConvertida);
      setTaxaConversaoData(isNaN(taxaConvertida) ? 0 : taxaConvertida);

      // Processar próximos dias
      setProximosDiasComAgendamento(
        Array.isArray(proximosDiasResult) ? proximosDiasResult : []
      );

    } catch (err) {
      console.error('❌ Erro detalhado:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(err.message || 'Erro ao carregar dados do dashboard');
    } finally {
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