'use client';

import { useState, useEffect, useCallback } from 'react';
import {listarAgendamentos,agendamentosHoje,agendamentosPorDiaSemana,atualizarAgendamento,excluirAgendamento,} from '@/app/services/agendamentosServices';

const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const LIMITE = 10;

export function useAgendamentos() {
  // ── Listagem ──────────────────────────────────────────────────
  const [agendamentos, setAgendamentos] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState('');
  const [loadingTabela, setLoadingTabela] = useState(true);

  // ── Stats ─────────────────────────────────────────────────────
  const [totalHoje, setTotalHoje] = useState(0);
  const [semanaData, setSemanaData] = useState([]);
  const [statusCount, setStatusCount] = useState({
    CONFIRMADO: 0,
    PENDENTE: 0,
    CANCELADO: 0,
    REALIZADO: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // ── Erros ─────────────────────────────────────────────────────
  const [erro, setErro] = useState(null);

  // ── Carregar tabela ───────────────────────────────────────────
  const carregarAgendamentos = useCallback(async (pag = 1, buscar = '') => {
    setLoadingTabela(true);
    setErro(null);
    try {
      const resultado = await listarAgendamentos({
        pagina: pag,
        limite: LIMITE,
        busca: buscar,
      });
      setAgendamentos(resultado.agendamentos ?? []);
      setTotal(resultado.total ?? 0);
    } catch (e) {
      setErro('Erro ao carregar agendamentos.');
      console.error(e);
    } finally {
      setLoadingTabela(false);
    }
  }, []);

  // ── Carregar stats (roda uma vez) ─────────────────────────────
  const carregarStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [hoje, semana, todos] = await Promise.all([
        agendamentosHoje(),
        agendamentosPorDiaSemana(),
        // busca sem limite só para calcular status — head:true seria ideal,
        // mas como a função retorna 10 registros vamos pegar 200 para o cálculo
        listarAgendamentos({ pagina: 1, limite: 200 }),
      ]);

      setTotalHoje(hoje);

      // Formata para o weekGrid
      setSemanaData(
        DIAS_SEMANA.map((dia, i) => ({ day: dia, total: semana[i] ?? 0 }))
      );

      // Calcula contagem de status a partir dos registros retornados
      const counts = { CONFIRMADO: 0, PENDENTE: 0, CANCELADO: 0, REALIZADO: 0 };
      (todos.agendamentos ?? []).forEach((a) => {
        if (counts[a.status] !== undefined) counts[a.status]++;
      });
      setStatusCount(counts);
    } catch (e) {
      console.error('Erro ao carregar stats:', e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ── Efeito principal ─────────────────────────────────────────
  useEffect(() => {
    carregarStats();
  }, [carregarStats]);

  useEffect(() => {
    carregarAgendamentos(pagina, busca);
  }, [pagina, busca, carregarAgendamentos]);

  // ── Debounce na busca ─────────────────────────────────────────
  const handleBusca = useCallback((termo) => {
    setBusca(termo);
    setPagina(1);
  }, []);

  // ── Ações ─────────────────────────────────────────────────────
  const cancelarAgendamento = useCallback(async (codigo) => {
    try {
      await atualizarAgendamento(codigo, { status: 'CANCELADO' });
      await carregarAgendamentos(pagina, busca);
      await carregarStats();
    } catch (e) {
      setErro('Erro ao cancelar agendamento.');
      console.error(e);
    }
  }, [pagina, busca, carregarAgendamentos, carregarStats]);

  const excluir = useCallback(async (codigo) => {
    try {
      await excluirAgendamento(codigo);
      // Se a página ficou vazia, volta uma página
      const novaPag = agendamentos.length === 1 && pagina > 1 ? pagina - 1 : pagina;
      setPagina(novaPag);
      await carregarAgendamentos(novaPag, busca);
      await carregarStats();
    } catch (e) {
      setErro('Erro ao excluir agendamento.');
      console.error(e);
    }
  }, [agendamentos.length, pagina, busca, carregarAgendamentos, carregarStats]);

  const totalPaginas = Math.ceil(total / LIMITE);

  return {
    // Tabela
    agendamentos,
    total,
    pagina,
    totalPaginas,
    busca,
    loadingTabela,
    handleBusca,
    setPagina,

    // Stats
    totalHoje,
    semanaData,
    statusCount,
    loadingStats,

    // Ações
    cancelarAgendamento,
    excluir,

    // Util
    erro,
    recarregar: () => carregarAgendamentos(pagina, busca),
  };
}