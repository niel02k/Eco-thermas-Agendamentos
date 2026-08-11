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
    FALTOU: 0,
  });
  const [statusCountVenda, setStatusCountVenda] = useState({
    VENDA_REALIZADA: 0,
    VENDA_PERDIDA: 0,
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

      // ── Janela da semana atual (Seg 00:00 → Dom 23:59) ──────────
      const agora = new Date();
      const diaSemana = agora.getDay();
      const inicioSemana = new Date(agora);
      inicioSemana.setDate(agora.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
      inicioSemana.setHours(0, 0, 0, 0);
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6);
      fimSemana.setHours(23, 59, 59, 999);

      // Contagem de status (operacional) + resultado_visita (FALTOU)
      const counts = { CONFIRMADO: 0, PENDENTE: 0, CANCELADO: 0, REALIZADO: 0, FALTOU: 0 };
      // Contagem de resultado de venda, restrita à semana atual
      const countsVenda = { VENDA_REALIZADA: 0, VENDA_PERDIDA: 0 };

      (todos.agendamentos ?? []).forEach((a) => {
        const dataVisita = new Date(a.data_visita + 'T00:00:00');
        const naSemana = dataVisita >= inicioSemana && dataVisita <= fimSemana;

        if (counts[a.status] !== undefined) counts[a.status]++;
        if (naSemana &&  counts[a.resultado_visita ] === 'FALTOU') counts.FALTOU++;

        
        if (naSemana && countsVenda[a.resultado_venda] !== undefined ) {
          countsVenda[a.resultado_venda]++;
        }
        console.log(fimSemana);
      });

      setStatusCount(counts);
      setStatusCountVenda(countsVenda);

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
    statusCountVenda,
    carregar,
  };
}