// src/app/hooks/useAgendamentos.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  listarAgendamentos,
  agendamentosHoje,
  agendamentosPorDiaSemana,
  atualizarAgendamento,
  excluirAgendamento,
  criarAgendamento,
  buscarAgendamentoPorCodigo,
  atualizarResultadoVenda,
  marcarComoRealizado,
} from '@/app/services/agendamentosServices';

const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const LIMITE = 10;

export function useAgendamentos() {
  // ── Listagem ──────────────────────────────────────────────────
  const [agendamentos, setAgendamentos] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState('');
  const [loadingTabela, setLoadingTabela] = useState(true);

  // ── Visualizar/Editar ────────────────────────────────────────
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);
  const [modoModal, setModoModal] = useState(null);

  // ── Stats ─────────────────────────────────────────────────────
  const [totalHoje, setTotalHoje] = useState(0);
  const [semanaData, setSemanaData] = useState([]);
  const [statusCount, setStatusCount] = useState({
    CONFIRMADO: 0, PENDENTE: 0, CANCELADO: 0, REALIZADO: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // ── Criar Agendamento ─────────────────────────────────────────
  const [loadingCriar, setLoadingCriar] = useState(false);
  const [erroCriar, setErroCriar] = useState(null);
  const [sucessoCriar, setSucessoCriar] = useState(false);
  const [agendamentoCriado, setAgendamentoCriado] = useState(null);

  // ── Resultado de Venda ────────────────────────────────────────
  const [showResultadoVenda, setShowResultadoVenda] = useState(false);
  const [agendamentoParaResultado, setAgendamentoParaResultado] = useState(null);
  const [loadingResultado, setLoadingResultado] = useState(false);

  // ── Erros ─────────────────────────────────────────────────────
  const [erro, setErro] = useState(null);

  // ═══════════════════════════════════════════════════════════════
  // CARREGAR TABELA
  // ═══════════════════════════════════════════════════════════════
  const carregarAgendamentos = useCallback(async (pag = 1, buscar = '') => {
    setLoadingTabela(true);
    setErro(null);
    try {
      const resultado = await listarAgendamentos({
        pagina: pag, limite: LIMITE, busca: buscar,
      });
      setAgendamentos(resultado.agendamentos ?? []);
      setTotal(resultado.total ?? 0);
    } catch (e) {
      setErro('Erro ao carregar agendamentos.');
      console.error(e);
    } finally {
      setLoadingTabela(false);
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // CARREGAR STATS
  // ═══════════════════════════════════════════════════════════════
  const carregarStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [hoje, semana, todos] = await Promise.all([
        agendamentosHoje(),
        agendamentosPorDiaSemana(),
        listarAgendamentos({ pagina: 1, limite: 200 }),
      ]);
      setTotalHoje(hoje);
      setSemanaData(DIAS_SEMANA.map((dia, i) => ({ day: dia, total: semana[i] ?? 0 })));
      const counts = { CONFIRMADO: 0, PENDENTE: 0, CANCELADO: 0, REALIZADO: 0 };
      (todos.agendamentos ?? []).forEach((a) => {
        if (counts[a.status] !== undefined) counts[a.status]++;
      });
      setStatusCount(counts);
    } catch (e) {
      console.error('Erro ao carregar stats:', e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // BUSCAR DETALHE
  // ═══════════════════════════════════════════════════════════════
  const buscarDetalhe = useCallback(async (codigo) => {
    setLoadingDetalhe(true);
    try {
      const agendamento = await buscarAgendamentoPorCodigo(codigo);
      setAgendamentoSelecionado(agendamento);
      return { agendamento, erro: null };
    } catch (e) {
      setErro('Erro ao carregar detalhes do agendamento.');
      return { agendamento: null, erro: e.message };
    } finally {
      setLoadingDetalhe(false);
    }
  }, []);

  const abrirVisualizar = useCallback(async (codigo) => {
    setModoModal('visualizar');
    await buscarDetalhe(codigo);
  }, [buscarDetalhe]);

  const abrirEditar = useCallback(async (codigo) => {
    setModoModal('editar');
    await buscarDetalhe(codigo);
  }, [buscarDetalhe]);

  const fecharModal = useCallback(() => {
    setModoModal(null);
    setAgendamentoSelecionado(null);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // CRIAR AGENDAMENTO
  // ═══════════════════════════════════════════════════════════════
  // useAgendamentos.js

const handleCriarAgendamento = useCallback(async (dados) => {
  setLoadingCriar(true);
  setErroCriar(null);
  setSucessoCriar(false);
  setAgendamentoCriado(null);
  
  try {
    let agendamento;
    
    // 👇 Verifica se é edição ou criação
    if (dados.codigo && modoModal === 'editar') {
      // Atualizar existente (incluindo dependentes)
      agendamento = await atualizarAgendamento(dados.codigo, {
        cliente_id: dados.cliente_id,
        vendedor_id: dados.vendedor_id,
        data_visita: dados.data_visita,
        horario_visita: dados.horario_visita,
        quantidade_pessoas: dados.quantidade_pessoas,
        status: dados.status,
        observacoes: dados.observacoes,
        cidade: dados.cidade,
        dependentes: dados.dependentes, // 👈 Passa os dependentes
      });
    } else {
      // Criar novo
      agendamento = await criarAgendamento(dados);
    }
    
    setAgendamentoCriado(agendamento);
    setSucessoCriar(true);
    await carregarAgendamentos(pagina, busca);
    await carregarStats();
    return { agendamento, erro: null };
  } catch (e) {
    const mensagem = e.message || 'Erro ao salvar agendamento';
    setErroCriar(mensagem);
    return { agendamento: null, erro: mensagem };
  } finally {
    setLoadingCriar(false);
  }
}, [pagina, busca, modoModal, carregarAgendamentos, carregarStats]);

  const resetarCriacao = useCallback(() => {
    setLoadingCriar(false);
    setErroCriar(null);
    setSucessoCriar(false);
    setAgendamentoCriado(null);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // RESULTADO DE VENDA
  // ═══════════════════════════════════════════════════════════════
  const abrirResultadoVenda = useCallback((agendamento) => {
    setAgendamentoParaResultado(agendamento);
    setShowResultadoVenda(true);
  }, []);

  const fecharResultadoVenda = useCallback(() => {
    setShowResultadoVenda(false);
    setAgendamentoParaResultado(null);
  }, []);

  const confirmarResultadoVenda = useCallback(async (codigo, resultado) => {
    setLoadingResultado(true);
    try {
      await atualizarResultadoVenda(codigo, resultado);
      await carregarAgendamentos(pagina, busca);
      await carregarStats();
      fecharResultadoVenda();
      return { sucesso: true, erro: null };
    } catch (e) {
      setErro('Erro ao atualizar resultado da venda.');
      return { sucesso: false, erro: e.message };
    } finally {
      setLoadingResultado(false);
    }
  }, [pagina, busca, carregarAgendamentos, carregarStats, fecharResultadoVenda]);

  // ═══════════════════════════════════════════════════════════════
  // MARCAR COMO REALIZADO
  // ═══════════════════════════════════════════════════════════════
  const confirmarRealizado = useCallback(async (codigo) => {
    try {
      await marcarComoRealizado(codigo);
      await carregarAgendamentos(pagina, busca);
      await carregarStats();
      return { sucesso: true, erro: null };
    } catch (e) {
      setErro('Erro ao confirmar agendamento.');
      return { sucesso: false, erro: e.message };
    }
  }, [pagina, busca, carregarAgendamentos, carregarStats]);

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS DE AÇÕES
  // ═══════════════════════════════════════════════════════════════
  const handleBusca = useCallback((termo) => {
    setBusca(termo);
    setPagina(1);
  }, []);

  const cancelarAgendamento = useCallback(async (codigo) => {
    try {
      await atualizarAgendamento(codigo, { status: 'CANCELADO' });
      await carregarAgendamentos(pagina, busca);
      await carregarStats();
    } catch (e) {
      setErro('Erro ao cancelar agendamento.');
      console.error(e);
    }
  }, [pagina, busca, carregarAgendamentos, carregarStats]);

  const excluir = useCallback(async (codigo) => {
    try {
      await excluirAgendamento(codigo);
      const novaPag = agendamentos.length === 1 && pagina > 1 ? pagina - 1 : pagina;
      setPagina(novaPag);
      await carregarAgendamentos(novaPag, busca);
      await carregarStats();
    } catch (e) {
      setErro('Erro ao excluir agendamento.');
      console.error(e);
    }
  }, [agendamentos.length, pagina, busca, carregarAgendamentos, carregarStats]);

  // ═══════════════════════════════════════════════════════════════
  // EFEITOS
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    carregarStats();
  }, [carregarStats]);

  useEffect(() => {
    carregarAgendamentos(pagina, busca);
  }, [pagina, busca, carregarAgendamentos]);

  const totalPaginas = Math.ceil(total / LIMITE);

  // ═══════════════════════════════════════════════════════════════
  // RETORNO COMPLETO
  // ═══════════════════════════════════════════════════════════════
  return {
    // Tabela
    agendamentos, total, pagina, totalPaginas,
    busca, loadingTabela, handleBusca, setPagina,

    // Stats
    totalHoje, semanaData, statusCount, loadingStats,

    // Criar
    criarAgendamento: handleCriarAgendamento,
    loadingCriar, erroCriar, sucessoCriar,
    agendamentoCriado, resetarCriacao,

    // Visualizar/Editar
    agendamentoSelecionado, loadingDetalhe, modoModal,
    abrirVisualizar, abrirEditar, fecharModal, buscarDetalhe,

    // Resultado de Venda
    showResultadoVenda, agendamentoParaResultado, loadingResultado,
    abrirResultadoVenda, fecharResultadoVenda, confirmarResultadoVenda,

    // Confirmar Realizado
    confirmarRealizado,

    // Ações
    cancelarAgendamento, excluir,

    // Util
    erro, recarregar: () => carregarAgendamentos(pagina, busca),
  };
}