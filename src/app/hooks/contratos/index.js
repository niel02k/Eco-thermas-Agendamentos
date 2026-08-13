// src/app/hooks/contratos/index.js
"use client";

import { useEffect, useMemo } from 'react';
import { useContratosList } from '@/app/hooks/contratos/useContratosList';
import { useContratoDetalhe } from '@/app/hooks/contratos/useContratoDetalhe';
import { useContratosActions } from '@/app/hooks/contratos/useContratosActions';
import { useContratosAnalytics } from '@/app/hooks/contratos/useContratosAnalytics';

export function useContratos() {
  // 1️⃣ Primeiro, cria a listagem
  const listagem = useContratosList();
  
  // 2️⃣ Depois, cria o analytics
  const analytics = useContratosAnalytics();
  
  // 3️⃣ Depois, cria o detalhe
  const detalhe = useContratoDetalhe();
  
  // 4️⃣ Função para recarregar tudo (ANTES de usar nas actions)
  const recarregarTudo = async () => {
    await Promise.all([
      listagem.carregar(),
      analytics.recarregar(),
    ]);
  };

  // 5️⃣ Depois, cria as ações passando o recarregar
  const actions = useContratosActions(recarregarTudo);

  // 6️⃣ Auto-load da listagem
  useEffect(() => {
    listagem.carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listagem.pagina, listagem.busca, listagem.filtroStatus]);

  // 7️⃣ Ticket Info (memoizado)
  const ticketInfo = useMemo(() => ({
    ticket_medio: analytics.resumoGeral?.ticket_medio || 0,
    valor_total: analytics.resumoGeral?.receita_total || 0,
    total_contratos: analytics.resumoGeral?.total_contratos || 0,
  }), [analytics.resumoGeral]);

  // 8️⃣ RETORNO
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
    fecharModal: detalhe.fecharModal,

    // ── Ações ──────────────────────────────────────────────
    criarContrato: actions.criar,
    editarContrato: actions.editar,
    excluirContrato: actions.excluir,
    loadingAcao: actions.loading || false,
    erroAcao: actions.erro || null,
    sucesso: actions.sucesso || false,
    resetarAcao: actions.resetar,

    // ── Analytics ──────────────────────────────────────────
    resumoGeral: analytics.resumoGeral || {},
    rankingVendedores: analytics.rankingVendedores || [],
    statusContratos: analytics.statusContratos || [],
    rankingCidades: analytics.rankingCidades || [],
    receita8m: analytics.receita8m || [],
    ticketInfo: ticketInfo,
    loadingAnalytics: analytics.loading || false,

    // ── Utilitários ──────────────────────────────────────
    recarregarTudo,
  };
}
