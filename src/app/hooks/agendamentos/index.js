"use client";
// src/app/hooks/agendamentos/index.js

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

  // Formulário
  const form = useAgendamentosForm();

  // Detalhe
  const detalhe = useAgendamentoDetalhe();

  // Ações
  const actions = useAgendamentosActions();

  // Carrega a lista aplicando o filtro de data
  const carregarLista = useCallback(
    async (pagina, busca) => {
      await listagem.carregar(pagina, busca, dataFiltro);
    },
    [listagem, dataFiltro]
  );

  // Callback executado após qualquer ação
  const onActionComplete = useCallback(async () => {
    await Promise.all([
      carregarLista(listagem.pagina, listagem.busca),
      stats.carregar(),
    ]);
  }, [carregarLista, listagem.pagina, listagem.busca, stats]);

  // Carrega estatísticas uma vez
  useEffect(() => {
    stats.carregar();
  }, [stats]);

  // Carrega a lista ao iniciar e quando mudar página, busca ou filtro
  useEffect(() => {
    carregarLista(listagem.pagina, listagem.busca);
  }, [carregarLista, listagem.pagina, listagem.busca]);

  const handleFiltroDataChange = useCallback((data) => {
    setDataFiltro(data);
    listagem.setPagina(1);
  }, [listagem]);

  return {
    // ── Tabela ──────────────────────────────────────────
    agendamentos: listagem.agendamentos,
    total: listagem.total,
    pagina: listagem.pagina,
    totalPaginas: listagem.totalPaginas,
    busca: listagem.busca,
    filtroStatus: listagem.filtroStatus,
    loadingTabela: listagem.loading,
    erro: listagem.erro,
    setPagina: listagem.setPagina,
    setBusca: listagem.setBusca,
    setFiltroStatus: listagem.setFiltroStatus,
    setErro: listagem.setErro,
    handleBusca: listagem.handleBusca,

    // ── Filtro de Data ──────────────────────────────────
    dataFiltro,
    handleFiltroDataChange,

    // ── Stats ────────────────────────────────────────────
    totalHoje: stats.totalHoje,
    semanaData: stats.semanaData,
    statusCount: stats.statusCount,
    statusCountVenda: stats.statusCountVenda,
    loadingStats: stats.loading,

    // ── Form (Criar/Editar) ─────────────────────────────
    criarAgendamento: form.salvar,
    loadingCriar: form.loading,
    erroCriar: form.erro,
    sucessoCriar: form.sucesso,
    agendamentoCriado: form.agendamentoSalvo,
    resetarCriacao: form.resetar,

    // ── Detalhe (Visualizar) ────────────────────────────
    agendamentoSelecionado: detalhe.agendamento,
    modalAberto: detalhe.modalAberto,
    loadingDetalhe: detalhe.loading,
    modoModal: detalhe.modoModal,
    abrirVisualizar: detalhe.abrirVisualizar,
    abrirEditar: detalhe.abrirEditar,
    fecharModal: detalhe.fecharModal,
    buscarDetalhe: detalhe.buscarDetalhe,

    // ── Resultado de Venda ──────────────────────────────
    showResultadoVenda: actions.showResultadoVenda,
    agendamentoParaResultado: actions.agendamentoParaResultado,
    loadingResultado: actions.loadingResultado,
    abrirResultadoVenda: actions.abrirResultadoVenda,
    fecharResultadoVenda: actions.fecharResultadoVenda,
    confirmarResultadoVenda: actions.confirmarResultadoVenda,
    confirmarRealizado: actions.confirmarRealizado,

    // ── Ações ────────────────────────────────────────────
    cancelarAgendamento: actions.cancelar,
    excluir: actions.excluir,

    // ── Erro ─────────────────────────────────────────────
    erroGeral: listagem.erro || stats.erro || form.erro || detalhe.erro || actions.erro,

    // ── Utilidades ──────────────────────────────────────
    recarregar: onActionComplete,
  };
}