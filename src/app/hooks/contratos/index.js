'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useContratosList } from '@/app/hooks/contratos/useContratosList';
import { useContratoDetalhe } from '@/app/hooks/contratos/useContratoDetalhe';
import { useContratosActions } from '@/app/hooks/contratos/useContratosActions';
import { useContratosAnalytics } from '@/app/hooks/contratos/useContratosAnalytics';

export function useContratos() {
  const listagem = useContratosList();
  const analytics = useContratosAnalytics();
  const detalhe = useContratoDetalhe();

  // Este callback precisa ser estável. Sem useCallback, ele é recriado
  // em toda renderização e força a recriação do hook de ações.
  const recarregarTudo = useCallback(async () => {
    await Promise.all([
      listagem.carregar(),
      analytics.recarregar(),
    ]);
  }, [listagem.carregar, analytics.recarregar]);

  const actions = useContratosActions(recarregarTudo);

  useEffect(() => {
    listagem.carregar();
  }, [
    listagem.carregar,
    listagem.pagina,
    listagem.busca,
    listagem.filtroStatus,
  ]);

  const ticketInfo = useMemo(() => ({
    ticket_medio: Number(analytics.resumoGeral?.ticket_medio || 0),
    valor_total: Number(analytics.resumoGeral?.receita_total || 0),
    total_contratos: Number(analytics.resumoGeral?.total_contratos || 0),
  }), [analytics.resumoGeral]);

  return {
    // Listagem
    contratos: listagem.contratos || [],
    total: listagem.total || 0,
    pagina: listagem.pagina || 1,
    totalPaginas: listagem.totalPaginas || 1,
    busca: listagem.busca || '',
    filtroStatus: listagem.filtroStatus || 'todos',
    loading: Boolean(listagem.loading),
    erro: listagem.erro || null,
    setPagina: listagem.setPagina,
    setBusca: listagem.setBusca,
    setFiltroStatus: listagem.setFiltroStatus,
    setErro: listagem.setErro,
    carregarContratos: listagem.carregar,

    // Detalhe
    contratoSelecionado: detalhe.contrato || null,
    modalAberto: Boolean(detalhe.modalAberto),
    loadingDetalhe: Boolean(detalhe.loading),
    buscarContrato: detalhe.abrirVisualizar,
    buscarContratoDetalhe: detalhe.buscarDetalhe,
    setModalAberto: detalhe.fecharModal,
    fecharModal: detalhe.fecharModal,

    // Ações
    criarContrato: actions.criar,
    editarContrato: actions.editar,
    excluirContrato: actions.excluir,
    loadingAcao: Boolean(actions.loading),
    erroAcao: actions.erro || null,
    sucesso: Boolean(actions.sucesso),
    contratoCriado: actions.contratoCriado || null,
    resetarAcao: actions.resetar,

    // Analytics
    resumoGeral: analytics.resumoGeral || {},
    rankingVendedores: analytics.rankingVendedores || [],
    statusContratos: analytics.statusContratos || [],
    rankingCidades: analytics.rankingCidades || [],
    receita8m: analytics.receita8m || [],
    ticketInfo,
    loadingAnalytics: Boolean(analytics.loading),

    // Utilitário
    recarregarTudo,
  };
}