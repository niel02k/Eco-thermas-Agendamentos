// src/app/hooks/agendamentos/index.js
"use client";

<<<<<<< Updated upstream
import { useCallback, useEffect } from 'react';
import { useAgendamentosList } from './useAgendamentosList';
import { useAgendamentosStats } from './useAgendamentosStats';
import { useAgendamentosForm } from './useAgendamentosForm';
import { useAgendamentoDetalhe } from './useAgendamentoDetalhe';
import { useAgendamentosActions } from './useAgendamentosActions';

const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
=======
import { useCallback, useEffect, useState } from "react";
import { useAgendamentosList } from "@/app/hooks/agendamentos/useAgendamentosList";
import { useAgendamentosStats } from "@/app/hooks/agendamentos/useAgendamentosStats";
import { useAgendamentosForm } from "@/app/hooks/agendamentos/useAgendamentosForm";
import { useAgendamentoDetalhe } from "@/app/hooks/agendamentos/useAgendamentoDetalhe";
import { useAgendamentosActions } from "@/app/hooks/agendamentos/useAgendamentosActions";
>>>>>>> Stashed changes

export function useAgendamentos() {
  // ── Listagem ──────────────────────────────────────────────
  const listagem = useAgendamentosList();
  
  // ── Stats ─────────────────────────────────────────────────
  const stats = useAgendamentosStats();
  
  // ── Callback executado após qualquer ação ─────────────────
  const onActionComplete = useCallback(async () => {
    await Promise.all([
      listagem.carregar(listagem.pagina, listagem.busca),
      stats.carregar(),
    ]);
  }, [listagem.carregar, listagem.pagina, listagem.busca, stats.carregar]);
  
  // ── Formulário (Criar/Editar) ────────────────────────────
  const form = useAgendamentosForm(onActionComplete);
  
  // ── Detalhe ───────────────────────────────────────────────
  const detalhe = useAgendamentoDetalhe();
  
  // ── Ações (Cancelar, Excluir, Resultado Venda) ────────────
  const actions = useAgendamentosActions(onActionComplete);

  // ── Efeitos iniciais ──────────────────────────────────────
  useEffect(() => {
    listagem.carregar(1, '');
    stats.carregar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Recarregar lista quando mudar página ou busca
  useEffect(() => {
    listagem.carregar(listagem.pagina, listagem.busca);
  }, [listagem.pagina, listagem.busca]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Retorno compatível com a página atual ─────────────────
  return {
    // Tabela
    agendamentos: listagem.agendamentos,
    total: listagem.total,
    pagina: listagem.pagina,
    totalPaginas: listagem.totalPaginas,
    busca: listagem.busca,
    loadingTabela: listagem.loading,
    handleBusca: listagem.handleBusca,
    setPagina: listagem.setPagina,

    // Stats
    totalHoje: stats.totalHoje,
    semanaData: stats.semanaData,
    statusCount: stats.statusCount,
    loadingStats: stats.loading,

    // Criar/Editar
    criarAgendamento: form.salvar,
    loadingCriar: form.loading,
    erroCriar: form.erro,
    sucessoCriar: form.sucesso,
    agendamentoCriado: form.agendamentoSalvo,
    resetarCriacao: form.resetar,

    // Visualizar/Editar
    agendamentoSelecionado: detalhe.agendamento,
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
    erro: listagem.erro || stats.erro || form.erro || detalhe.erro || actions.erro,

    // Utilidades
    recarregar: () => onActionComplete(),
  };
}