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
    CONFIRMADO: 0, PENDENTE: 0, CANCELADO: 0,
  });
  const [statusCountVenda, setStatusCountVenda] = useState({
    VENDA_REALIZADA: 0,
    VENDA_PERDIDA: 0,
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
        pagina: pag, 
        limite: LIMITE, 
        busca: buscar,
        ordenarPor: 'data_criacao',
        ordem: 'desc',
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
    const [hojeData, semana, todos] = await Promise.all([
      agendamentosHoje(),
      agendamentosPorDiaSemana(),
      listarAgendamentos({ pagina: 1, limite: 200 }),
    ]);
    setTotalHoje(hojeData);
    setSemanaData(DIAS_SEMANA.map((dia, i) => ({ day: dia, total: semana[i] ?? 0 })));
    
    const counts = { CONFIRMADO: 0, PENDENTE: 0, CANCELADO: 0 };
    const countsVenda = { VENDA_REALIZADA: 0, VENDA_PERDIDA: 0 };
    
    const agora = new Date();
    const diaSemana = agora.getDay();
    const inicioSemana = new Date(agora);
    inicioSemana.setDate(agora.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
    inicioSemana.setHours(0, 0, 0, 0);
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);
    
    console.log('📅 Semana:', inicioSemana.toISOString().split('T')[0], 'até', fimSemana.toISOString().split('T')[0]);
    
    (todos.agendamentos ?? []).forEach((a) => {
      if (counts[a.status] !== undefined) counts[a.status]++;
      
      const dataAgendamento = new Date(a.data_visita + 'T00:00:00');
      console.log('📊 Agendamento:', a.codigo, a.data_visita, a.resultado_venda, 
        'Na semana?', dataAgendamento >= inicioSemana && dataAgendamento <= fimSemana);
      
      if (dataAgendamento >= inicioSemana && dataAgendamento <= fimSemana) {
        if (countsVenda[a.resultado_venda] !== undefined) {
          countsVenda[a.resultado_venda]++;
        }
      }
    });
    
    
    setStatusCount(counts);
    setStatusCountVenda(countsVenda);
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
  // CRIAR / EDITAR AGENDAMENTO
  // ═══════════════════════════════════════════════════════════════
  const handleCriarAgendamento = useCallback(async (dados) => {
    setLoadingCriar(true);
    setErroCriar(null);
    setSucessoCriar(false);
    setAgendamentoCriado(null);
    try {
      let agendamento;
      if (dados.codigo && modoModal === 'editar') {
        agendamento = await atualizarAgendamento(dados.codigo, {
          cliente_id: dados.cliente_id,
          vendedor_id: dados.vendedor_id,
          data_visita: dados.data_visita,
          horario_visita: dados.horario_visita,
          quantidade_pessoas: dados.quantidade_pessoas,
          status: dados.status,
          resultado_visita: dados.resultado_visita,
          resultado_venda: dados.resultado_venda,
          observacoes: dados.observacoes,
          cidade: dados.cidade,
          dependentes: dados.dependentes,
        });
      } else {
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
  // CONFIRMAR AGENDAMENTO (PENDENTE → CONFIRMADO)
  // ═══════════════════════════════════════════════════════════════
  const confirmarAgendamento = useCallback(async (codigo) => {
    try {
      await atualizarAgendamento(codigo, { status: 'CONFIRMADO' });
      await carregarAgendamentos(pagina, busca);
      await carregarStats();
      return { sucesso: true, erro: null };
    } catch (e) {
      setErro('Erro ao confirmar agendamento.');
      return { sucesso: false, erro: e.message };
    }
  }, [pagina, busca, carregarAgendamentos, carregarStats]);

  // ═══════════════════════════════════════════════════════════════
  // MARCAR COMO REALIZADO (resultado_visita = REALIZADO)
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
  // MARCAR COMO FALTOU (resultado_visita = FALTOU)
  // ═══════════════════════════════════════════════════════════════
  const marcarComoFaltou = useCallback(async (codigo) => {
    try {
      await atualizarAgendamento(codigo, { resultado_visita: 'FALTOU' });
      await carregarAgendamentos(pagina, busca);
      await carregarStats();
      return { sucesso: true, erro: null };
    } catch (e) {
      setErro('Erro ao marcar como faltou.');
      return { sucesso: false, erro: e.message };
    }
  }, [pagina, busca, carregarAgendamentos, carregarStats]);

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
    carregarAgendamentos(1, '');
    carregarStats();
  }, []); // eslint-disable-line

  useEffect(() => {
    carregarAgendamentos(pagina, busca);
  }, [pagina, busca]); // eslint-disable-line

  const totalPaginas = Math.ceil(total / LIMITE);

  // ═══════════════════════════════════════════════════════════════
  // RETORNO COMPLETO
  // ═══════════════════════════════════════════════════════════════
  return {
    agendamentos, total, pagina, totalPaginas,
    busca, loadingTabela, handleBusca, setPagina,
    totalHoje, semanaData, statusCount, statusCountVenda, loadingStats,
    criarAgendamento: handleCriarAgendamento,
    loadingCriar, erroCriar, sucessoCriar, agendamentoCriado, resetarCriacao,
    agendamentoSelecionado, loadingDetalhe, modoModal,
    abrirVisualizar, abrirEditar, fecharModal, buscarDetalhe,
    showResultadoVenda, agendamentoParaResultado, loadingResultado,
    abrirResultadoVenda, fecharResultadoVenda, confirmarResultadoVenda,
    confirmarAgendamento,
    confirmarRealizado,
    marcarComoFaltou,
    cancelarAgendamento, excluir,
    erro, recarregar: () => carregarAgendamentos(pagina, busca),
  };
}