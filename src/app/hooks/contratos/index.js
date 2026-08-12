// src/app/hooks/contratos/index.js
"use client";

import { useEffect, useMemo } from 'react';
import { useContratosList } from '@/app/hooks/contratos/useContratosList';
import { useContratoDetalhe } from '@/app/hooks/contratos/useContratoDetalhe';
import { useContratosActions } from '@/app/hooks/contratos/useContratosActions';
import { useContratosAnalytics } from '@/app/hooks/contratos/useContratosAnalytics';

export function useContratos() {
  const listagem = useContratosList();
  const detalhe = useContratoDetalhe();
  const analytics = useContratosAnalytics();

  const recarregarTudo = async () => {
    await Promise.all([listagem.carregar(), analytics.recarregar()]);
  };

  const actions = useContratosActions(recarregarTudo);

  // Auto-load da listagem
  useEffect(() => {
    listagem.carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listagem.pagina, listagem.busca, listagem.filtroStatus]);

  const ticketInfo = useMemo(() => ({
    ticket_medio: analytics.resumoGeral.ticket_medio,
    valor_total: analytics.resumoGeral.receita_total,
    total_contratos: analytics.resumoGeral.total_contratos,
  }), [analytics.resumoGeral]);

  return {
    // ── Listagem ──────────────────────────────────────────
    contratos: listagem.contratos,
    total: listagem.total,
    pagina: listagem.pagina,
    totalPaginas: listagem.totalPaginas,
    busca: listagem.busca,
    filtroStatus: listagem.filtroStatus,
    loading: listagem.loading,
    erro: listagem.erro,
    setPagina: listagem.setPagina,
    setBusca: listagem.setBusca,
    setFiltroStatus: listagem.setFiltroStatus,
    setErro: listagem.setErro,
    carregarContratos: listagem.carregar,

    // ── Detalhe ──────────────────────────────────────────
    contratoSelecionado: detalhe.contrato,
    modalAberto: detalhe.modalAberto,
    loadingDetalhe: detalhe.loading,
    buscarContrato: detalhe.abrirVisualizar,
    buscarContratoDetalhe: detalhe.buscarDetalhe,
    setModalAberto: detalhe.fecharModal,

    // ── Ações ────────────────────────────────────────────
    excluirContrato: actions.excluir,
    loadingAcao: actions.loading,
    erroAcao: actions.erro,

    // ── Analytics ────────────────────────────────────────
    resumoGeral: analytics.resumoGeral,
    rankingVendedores: analytics.rankingVendedores,
    statusContratos: analytics.statusContratos,
    rankingCidades: analytics.rankingCidades, // 👈 NOVO
    receita8m: analytics.receita8m,
    ticketInfo,
    loadingAnalytics: analytics.loading,

    recarregarTudo,
  };
}