// src/app/hooks/agendamentos/index.js
"use client";

import { useEffect, useMemo, useCallback } from 'react';
import { useAgendamentosList } from '@/app/hooks/agendamentos/useAgendamentosList';
import { useAgendamentoDetalhe } from '@/app/hooks/agendamentos/useAgendamentoDetalhe';
import { useAgendamentosActions } from '@/app/hooks/agendamentos/useAgendamentosActions';
import { useAgendamentosStats } from '@/app/hooks/agendamentos/useAgendamentosStats';
import { useAgendamentosForm } from '@/app/hooks/agendamentos/useAgendamentosForm';

export function useAgendamentos() {
  const listagem = useAgendamentosList();
  const detalhe = useAgendamentoDetalhe();
  const stats = useAgendamentosStats();
  const form = useAgendamentosForm();
  const actions = useAgendamentosActions();

  const recarregarTudo = useCallback(async () => {
    await Promise.all([
      listagem.carregar(),
      stats.carregarStats()
    ]);
  }, [listagem, stats]);

  // Auto-load da listagem
  useEffect(() => {
    listagem.carregar();
    stats.carregarStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listagem.pagina, listagem.busca, listagem.filtroStatus, listagem.filtroData]);

  return {
    // ── Listagem ──────────────────────────────────────────
    agendamentos: listagem.agendamentos,
    total: listagem.total,
    pagina: listagem.pagina,
    totalPaginas: listagem.totalPaginas,
    busca: listagem.busca,
    filtroStatus: listagem.filtroStatus,
    filtroData: listagem.filtroData,
    loading: listagem.loading,
    erro: listagem.erro,
    setPagina: listagem.setPagina,
    setBusca: listagem.setBusca,
    setFiltroStatus: listagem.setFiltroStatus,
    setFiltroData: listagem.setFiltroData,
    setErro: listagem.setErro,
    carregarAgendamentos: listagem.carregar,

    // ── Stats ──────────────────────────────────────────────
    totalHoje: stats.totalHoje,
    semanaData: stats.semanaData,
    statusCount: stats.statusCount,
    statusCountVenda: stats.statusCountVenda,
    loadingStats: stats.loading,

    // ── Form (Criar/Editar) ──────────────────────────────
    criarAgendamento: form.salvar,
    loadingCriar: form.loading,
    erroCriar: form.erro,
    sucessoCriar: form.sucesso,
    agendamentoCriado: form.agendamentoSalvo,
    resetarCriacao: form.resetar,

    // ── Detalhe ────────────────────────────────────────────
    agendamentoSelecionado: detalhe.agendamento,
    modalAberto: detalhe.modalAberto,
    loadingDetalhe: detalhe.loading,
    buscarAgendamento: detalhe.abrirVisualizar,
    buscarAgendamentoDetalhe: detalhe.buscarDetalhe,
    setModalAberto: detalhe.fecharModal,

    // ── Ações ──────────────────────────────────────────────
    excluirAgendamento: actions.excluir,
    loadingAcao: actions.loading,
    erroAcao: actions.erro,

    // ── Utilitários ──────────────────────────────────────
    recarregarTudo,
  };
}