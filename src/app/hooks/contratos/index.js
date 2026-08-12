"use client";

import { useEffect, useMemo } from 'react';
import { useContratosList } from './useContratosList';
import { useContratoDetalhe } from './useContratoDetalhe';
import { useContratosActions } from './useContratosActions';
import { useContratosAnalytics } from './useContratosAnalytics';

export function useContratos() {
  const listagem = useContratosList();
  const detalhe = useContratoDetalhe();
  const analytics = useContratosAnalytics();
  const actions = useContratosActions(recarregarTudo);

  const recarregarTudo = async () => {
    await Promise.all([listagem.carregar(), analytics.recarregar()]);
  };

  // Auto-load da listagem
  useEffect(() => {
    listagem.carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listagem.pagina, listagem.busca, listagem.filtroStatus]);

  // ticketInfo
  const ticketInfo = useMemo(() => ({
    ticket_medio: analytics.resumoGeral?.ticket_medio || 0,
    valor_total: analytics.resumoGeral?.receita_total || 0,
    total_contratos: analytics.resumoGeral?.total_contratos || 0,
  }), [analytics.resumoGeral]);

  return {
    // ── Listagem ──────────────────────────────────────────
    contratos: listagem.contratos || [],
    total: listagem.total || 0,
    pagina: listagem.pagina || 1,
    totalPaginas: listagem.totalPaginas || 1,
    busca: listagem.busca || '',
    filtroStatus: listagem.filtroStatus || 'todos',
    loading: listagem.loading || false,
    erro: listagem.erro || null,
    setPagina: listagem.setPagina,
    setBusca: listagem.setBusca,
    setFiltroStatus: listagem.setFiltroStatus,
    setErro: listagem.setErro,
    carregarContratos: listagem.carregar,

    // ── Detalhe ────────────────────────────────────────────
    contratoSelecionado: detalhe.contrato || null,
    modalAberto: detalhe.modalAberto || false,
    loadingDetalhe: detalhe.loading || false,
    buscarContrato: detalhe.abrirVisualizar,
    buscarContratoDetalhe: detalhe.buscarDetalhe,
    setModalAberto: detalhe.fecharModal,

    // ── Ações ──────────────────────────────────────────────
    excluirContrato: actions.excluir,
    loadingAcao: actions.loading || false,
    erroAcao: actions.erro || null,

    // ── Analytics ──────────────────────────────────────────
    resumoGeral: analytics.resumoGeral || {},
    rankingVendedores: analytics.rankingVendedores || [],
    statusContratos: analytics.statusContratos || [],
    rankingCidades: analytics.rankingCidades || [], // ✅ CORRETO
    receita8m: analytics.receita8m || [],          // ✅ CORRETO
    ticketInfo: ticketInfo || {},
    loadingAnalytics: analytics.loading || false,

    // ── Utilitários ──────────────────────────────────────
    recarregarTudo,
  };
}