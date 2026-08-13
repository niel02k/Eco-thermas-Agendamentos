'use client';

<<<<<<< HEAD
import { useCallback, useEffect, useState } from 'react';
import { useAgendamentosList } from '@/app/hooks/agendamentos/useAgendamentosList';
import { useAgendamentosStats } from '@/app/hooks/agendamentos/useAgendamentosStats';
import { useAgendamentosForm } from '@/app/hooks/agendamentos/useAgendamentosForm';
import { useAgendamentoDetalhe } from '@/app/hooks/agendamentos/useAgendamentoDetalhe';
import { useAgendamentosActions } from '@/app/hooks/agendamentos/useAgendamentosActions';
=======
import { useCallback, useEffect, useState } from "react";
import { useAgendamentosList } from "@/app/hooks/agendamentos/useAgendamentosList.js";
import { useAgendamentosStats } from "@/app/hooks/agendamentos/useAgendamentosStats";
import { useAgendamentosForm } from "@/app/hooks/agendamentos/useAgendamentosForm";
import { useAgendamentoDetalhe } from "@/app/hooks/agendamentos/useAgendamentoDetalhe";
import { useAgendamentosActions } from "@/app/hooks/agendamentos/useAgendamentosActions";
>>>>>>> 33955b4 (Teste)

const FILTROS_PAI_VAZIOS = Object.freeze({
  dataInicio: null,
  dataFim: null,
  statusAgendamento: '',
  resultadoVisita: '',
  resultadoVenda: '',
});

export function useAgendamentos(
  filtrosPai = FILTROS_PAI_VAZIOS,
) {
  // Filtro diário adicional da tabela.
  const [dataFiltro, setDataFiltro] = useState(null);

  // O filtro pai é enviado para a tabela e para os indicadores.
  const listagem = useAgendamentosList(filtrosPai);
  const stats = useAgendamentosStats(filtrosPai);

  const form = useAgendamentosForm();
  const detalhe = useAgendamentoDetalhe();

  const {
    agendamentos,
    total,
    pagina,
    totalPaginas,
    busca,
    loading: loadingTabela,
    erro: erroLista,
    setPagina,
    carregar,
    handleBusca,
  } = listagem;

  const {
    totalHoje,
    semanaData,
    proximosDias,
    taxaConversao,
    totalClientes,
    statusCount,
    resultadoVisitaCount,
    statusCountVenda,
    loading: loadingStats,
    erro: erroStats,
    carregar: carregarStats,
  } = stats;

  const carregarLista = useCallback(async () => {
    await carregar(pagina, busca, dataFiltro);
  }, [carregar, pagina, busca, dataFiltro]);

  useEffect(() => {
    carregarLista();
  }, [carregarLista]);

  const handleFiltroDataChange = useCallback((data) => {
    setDataFiltro(data || null);
    setPagina(1);
  }, [setPagina]);

  const carregarEstatisticas = useCallback(async () => {
    await carregarStats();
  }, [carregarStats]);

  const onActionComplete = useCallback(async () => {
    await Promise.all([
      carregarLista(),
      carregarEstatisticas(),
    ]);
  }, [carregarLista, carregarEstatisticas]);

  const actions = useAgendamentosActions(onActionComplete);

  return {
    filtrosPai,

    agendamentos,
    total,
    pagina,
    totalPaginas,
    busca,
    loadingTabela,
    erro: erroLista,
    setPagina,
    handleBusca,

    dataFiltro,
    handleFiltroDataChange,

    totalHoje,
    semanaData,
    proximosDias,
    taxaConversao,
    totalClientes,
    statusCount,
    resultadoVisitaCount,
    statusCountVenda,
    loadingStats,

    criarAgendamento: form.salvar,
    loadingCriar: form.loading,
    erroCriar: form.erro,
    sucessoCriar: form.sucesso,
    agendamentoCriado: form.agendamentoSalvo,
    resetarCriacao: form.resetar,

    agendamentoSelecionado: detalhe.agendamento,
    modalAberto: detalhe.modalAberto,
    loadingDetalhe: detalhe.loading,
    modoModal: detalhe.modoModal,
    abrirVisualizar: detalhe.abrirVisualizar,
    abrirEditar: detalhe.abrirEditar,
    fecharModal: detalhe.fecharModal,
    buscarDetalhe: detalhe.buscarDetalhe,

    showResultadoVenda: actions.showResultadoVenda,
    agendamentoParaResultado: actions.agendamentoParaResultado,
    loadingResultado: actions.loadingResultado,
    abrirResultadoVenda: actions.abrirResultadoVenda,
    fecharResultadoVenda: actions.fecharResultadoVenda,
    confirmarResultadoVenda: actions.confirmarResultadoVenda,
    confirmarRealizado: actions.confirmarRealizado,
    marcarComoFaltou: actions.marcarComoFaltou,

    cancelarAgendamento: actions.cancelar,
    excluir: actions.excluir,

    erroGeral:
      erroLista ||
      erroStats ||
      form.erro ||
      detalhe.erro ||
      actions.erro,

    recarregar: onActionComplete,
  };
}
