// src/app/hooks/agendamentos/useAgendamentosStats.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  agendamentosHoje, 
  agendamentosPorDiaSemana,
  proximosDiasComAgendamentos,
  taxaDeConversao,
  totalClientesAtendidos,
  listarAgendamentos 
} from '@/app/services/agendamentosServices';

const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export function useAgendamentosStats() {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [totalHoje, setTotalHoje] = useState(0);
  const [semanaData, setSemanaData] = useState([]);
  const [proximosDias, setProximosDias] = useState([]);
  const [taxaConversao, setTaxaConversao] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [statusCount, setStatusCount] = useState({
    CONFIRMADO: 0,
    PENDENTE: 0,
    CANCELADO: 0,
    REALIZADO: 0,
  });

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const [hoje, semana, proximos, taxa, clientes, todos] = await Promise.all([
        agendamentosHoje(),
        agendamentosPorDiaSemana(),
        proximosDiasComAgendamentos(2),
        taxaDeConversao({}),
        totalClientesAtendidos(),
        listarAgendamentos({ pagina: 1, limite: 200 }), // Para contar status
      ]);

      setTotalHoje(hoje ?? 0);

      // Semana formatada
      const semanaFormatada = DIAS_SEMANA.map((dia, i) => ({
        day: dia,
        total: semana[i] ?? 0,
      }));
      setSemanaData(semanaFormatada);

      setProximosDias(proximos || []);
      setTaxaConversao(taxa ?? 0);
      setTotalClientes(clientes ?? 0);

      // Contagem de status
      const counts = { CONFIRMADO: 0, PENDENTE: 0, CANCELADO: 0, REALIZADO: 0 };
      (todos.agendamentos ?? []).forEach((a) => {
        if (counts[a.status] !== undefined) counts[a.status]++;
      });
      setStatusCount(counts);

    } catch (e) {
      console.error('Erro ao carregar estatísticas:', e);
      setErro('Erro ao carregar estatísticas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return {
    loading,
    erro,
    totalHoje,
    semanaData,
    proximosDias,
    taxaConversao,
    totalClientes,
    statusCount,
    carregar,
  };
}