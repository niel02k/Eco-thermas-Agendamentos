// src/app/hooks/contratos/index.js

export function useContratos() {
  const listagem = useContratosList();
  const detalhe = useContratoDetalhe();
  const analytics = useContratosAnalytics();

  const recarregarTudo = async () => {
    await Promise.all([listagem.carregar(), analytics.recarregar()]);
  };

  const actions = useContratosActions(recarregarTudo);

  // ── Auto-load da listagem: dispara no mount e sempre que
  // página, busca ou filtro de status mudarem. Sem isso a
  // tabela nunca carrega sozinha. ──────────────────────────
  useEffect(() => {
    listagem.carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listagem.pagina, listagem.busca, listagem.filtroStatus]);

  // ── ticketInfo: shape esperado pelo ContractsKPIs,
  // derivado do resumoGeral (evita recomputar/refetchar) ───
  const ticketInfo = useMemo(() => ({
    ticket_medio: analytics.resumoGeral.ticket_medio,
    valor_total: analytics.resumoGeral.receita_total,
    total_contratos: analytics.resumoGeral.total_contratos,
  }), [analytics.resumoGeral]);


  return {
    // ── Listagem (tabela paginada) ──────────────────────────
    contratos: listagem.contratos,
    total: listagem.total,
    pagina: listagem.pagina,
    totalPaginas: listagem.totalPaginas,
    busca: listagem.busca,
    filtroStatus: listagem.filtroStatus,
    loading: listagem.loading,       // loading da TABELA (não do analytics)
    erro: listagem.erro,             // erro da TABELA
    setPagina: listagem.setPagina,
    setBusca: listagem.setBusca,
    setFiltroStatus: listagem.setFiltroStatus,
    setErro: listagem.setErro,
    carregarContratos: listagem.carregar,
    // Filtro
    dataFiltro,
    handleFiltroDataChange,

    // Stats
    totalHoje: stats.totalHoje,
    semanaData: stats.semanaData,
    statusCount: stats.statusCount,
    statusCountVenda: stats.statusCountVenda,
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

    // ── Detalhe (modal de visualização) ─────────────────────
    contratoSelecionado: detalhe.contrato,
    modalAberto: detalhe.modalAberto,

    loadingDetalhe: detalhe.loading,
    buscarContrato: detalhe.abrirVisualizar,
    buscarContratoDetalhe: detalhe.buscarDetalhe, // fetch puro, sem abrir modal de visualização (usado pra editar)
    setModalAberto: detalhe.fecharModal,

    // ── Ações (criar/editar/excluir) ────────────────────────
    excluirContrato: actions.excluir,
    loadingAcao: actions.loading,
    erroAcao: actions.erro,

    // ── Analytics (KPIs, ranking, receita mensal) ───────────
    resumoGeral: analytics.resumoGeral,
    rankingVendedores: analytics.rankingVendedores,
    statusContratos: analytics.statusContratos,
    top5Cidades: analytics.top5Cidades,
    receita8m: analytics.receita8m,
    ticketInfo,
    loadingAnalytics: analytics.loading,


    // Erro
    erro:
      listagem.erro ||
      stats.erro ||
      form.erro ||
      detalhe.erro ||
      actions.erro,

    // Utilidades
    recarregar: onActionComplete,

    recarregarTudo,

  };
}
