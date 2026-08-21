// src/app/hooks/agendamentos/useAgendamentosActions.js
"use client";

import { useState, useCallback } from 'react';
import { 
  atualizarAgendamento, 
  excluirAgendamento,
  atualizarResultadoVenda,
  marcarComoRealizado,
  marcarComoFaltou as marcarComoFaltouService,
  cancelarAgendamento as cancelarAgendamentoService,
} from '@/app/services/agendamentosServices';

export function useAgendamentosActions(onActionComplete) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // Resultado de venda
  const [showResultadoVenda, setShowResultadoVenda] = useState(false);
  const [agendamentoParaResultado, setAgendamentoParaResultado] = useState(null);
  const [loadingResultado, setLoadingResultado] = useState(false);

  const handleAction = useCallback(async (action, ...args) => {
    setLoading(true);
    setErro(null);
    try {
      await action(...args);
      if (onActionComplete) await onActionComplete();
      return { sucesso: true, erro: null };
    } catch (e) {
      const mensagem = e.message || 'Erro ao executar ação.';
      setErro(mensagem);
      return { sucesso: false, erro: mensagem };
    } finally {
      setLoading(false);
    }
  }, [onActionComplete]);

  // Confirmar agendamento (PENDENTE → CONFIRMADO)
  const confirmarAgendamento = useCallback((codigo) => {
    return handleAction(
      (cod) => atualizarAgendamento(cod, { status: 'CONFIRMADO' }),
      codigo
    );
  }, [handleAction]);

  // Cancelar agendamento
  const cancelar = useCallback((codigo) => {
    return handleAction(cancelarAgendamentoService, codigo);
  }, [handleAction]);

  // Excluir agendamento
  const excluir = useCallback((codigo) => {
    return handleAction(excluirAgendamento, codigo);
  }, [handleAction]);

  // Confirmar como realizado (resultado_visita = REALIZADO)
const confirmarRealizado = useCallback((codigo, vendedorId) => {
  if (!codigo || !vendedorId) {
    return Promise.resolve({
      sucesso: false,
      erro: 'Selecione o vendedor que atendeu o agendamento.',
    });
  }

  return handleAction(
    marcarComoRealizado,
    codigo,
    vendedorId,
  );
}, [handleAction]);

  // Marcar como faltou (resultado_visita = FALTOU)
  const marcarComoFaltou = useCallback((codigo) => {
    return handleAction(marcarComoFaltouService, codigo);
  }, [handleAction]);

  // Abrir modal de resultado de venda
  const abrirResultadoVenda = useCallback((agendamento) => {
    setAgendamentoParaResultado(agendamento);
    setShowResultadoVenda(true);
  }, []);

  // Fechar modal de resultado de venda
  const fecharResultadoVenda = useCallback(() => {
    setShowResultadoVenda(false);
    setAgendamentoParaResultado(null);
  }, []);

  // Confirmar resultado de venda
  const confirmarResultadoVenda = useCallback(async (codigo, resultado) => {
    setLoadingResultado(true);
    setErro(null);
    try {
      await atualizarResultadoVenda(codigo, resultado);
      if (onActionComplete) await onActionComplete();
      fecharResultadoVenda();
      return { sucesso: true, erro: null };
    } catch (e) {
      const mensagem = e.message || 'Erro ao atualizar resultado da venda.';
      setErro(mensagem);
      return { sucesso: false, erro: mensagem };
    } finally {
      setLoadingResultado(false);
    }
  }, [onActionComplete, fecharResultadoVenda]);

  return {
    loading,
    erro,
    confirmarAgendamento,
    cancelar,
    excluir,
    confirmarRealizado,
    marcarComoFaltou,
    // Resultado de venda
    showResultadoVenda,
    agendamentoParaResultado,
    loadingResultado,
    abrirResultadoVenda,
    fecharResultadoVenda,
    confirmarResultadoVenda,
  };
}