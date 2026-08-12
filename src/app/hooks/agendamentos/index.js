// src/app/hooks/agendamentos/index.js
"use client";

<<<<<<< HEAD
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
=======
import { useCallback, useEffect, useState } from "react";
import { useAgendamentosList } from "./useAgendamentosList";
import { useAgendamentosStats } from "./useAgendamentosStats";
import { useAgendamentosForm } from "./useAgendamentosForm";
import { useAgendamentoDetalhe } from "./useAgendamentoDetalhe";
import { useAgendamentosActions } from "./useAgendamentosActions";

export function useAgendamentos() {
  const [dataFiltro, setDataFiltro] = useState(null);

  // Listagem
  const listagem = useAgendamentosList();

  // Stats
  const stats = useAgendamentosStats();

  // Carrega a lista aplicando o filtro de data
  const carregarLista = useCallback(
    async (pagina, busca) => {
      await listagem.carregar(pagina, busca, dataFiltro);
    },
    [listagem.carregar, dataFiltro]
  );

  // Callback executado após qualquer ação
  const onActionComplete = useCallback(async () => {
    await Promise.all([
      carregarLista(listagem.pagina, listagem.busca),
      stats.carregar(),
    ]);
  }, [
    carregarLista,
    listagem.pagina,
    listagem.busca,
    stats.carregar,
  ]);

  // Formulário
  const form = useAgendamentosForm(onActionComplete);

  // Detalhe
  const detalhe = useAgendamentoDetalhe();

  // Ações
  const actions = useAgendamentosActions(onActionComplete);

  // Carrega estatísticas uma vez
  useEffect(() => {
    stats.carregar();
  }, [stats.carregar]);

  // Carrega a lista ao iniciar e quando mudar página, busca ou filtro
  useEffect(() => {
    carregarLista(listagem.pagina, listagem.busca);
  }, [
    carregarLista,
    listagem.pagina,
    listagem.busca,
  ]);

  const handleFiltroDataChange = useCallback((data) => {
    setDataFiltro(data);
    listagem.setPagina(1);
  }, [listagem.setPagina]);

  return {
    // Tabela
>>>>>>> parent of ec0cc7f (Amém)
    agendamentos: listagem.agendamentos,
    total: listagem.total,
    pagina: listagem.pagina,
    totalPaginas: listagem.totalPaginas,
    busca: listagem.busca,
<<<<<<< HEAD
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
=======
    loadingTabela: listagem.loading,
    handleBusca: listagem.handleBusca,
    setPagina: listagem.setPagina,

    // Filtro
    dataFiltro,
    handleFiltroDataChange,
>>>>>>> parent of ec0cc7f (Amém)

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
<<<<<<< HEAD
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
=======
    loadingDetalhe: detalhe.loading,
    modoModal: detalhe.modoModal,
    abrirVisualizar: detalhe.abrirVisualizar,
    abrirEditar: detalhe.abrirEditar,
    fecharModal: detalhe.fecharModal,
    buscarDetalhe: detalhe.buscarDetalhe,

    // Resultado de Venda
    showResultadoVenda: actions.showResultadoVenda,
    agendamentoParaResultado: actions.agendamentoParaResultado,
    loadingResultado: actions.loadingResultado,
    abrirResultadoVenda: actions.abrirResultadoVenda,
    fecharResultadoVenda: actions.fecharResultadoVenda,
    confirmarResultadoVenda: actions.confirmarResultadoVenda,
    confirmarRealizado: actions.confirmarRealizado,

    // Ações
    cancelarAgendamento: actions.cancelar,
    excluir: actions.excluir,

    // Erro
    erro:
      listagem.erro ||
      stats.erro ||
      form.erro ||
      detalhe.erro ||
      actions.erro,

    // Utilidades
    recarregar: onActionComplete,
>>>>>>> parent of ec0cc7f (Amém)
  };
}