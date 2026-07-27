// src/app/hooks/agendamentos/useAgendamentosActions.js
"use client";

import { useState, useCallback } from 'react';
import { 
  atualizarAgendamento, 
  excluirAgendamento,
  atualizarResultadoVenda,
  marcarComoRealizado 
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

  // Cancelar agendamento
  const cancelar = useCallback((codigo) => {
    return handleAction(
      (cod) => atualizarAgendamento(cod, { status: 'CANCELADO' }),
      codigo
    );
  }, [handleAction]);

  // Excluir agendamento
  const excluir = useCallback((codigo) => {
    return handleAction(excluirAgendamento, codigo);
  }, [handleAction]);

  // Confirmar como realizado
  const confirmarRealizado = useCallback((codigo) => {
    return handleAction(marcarComoRealizado, codigo);
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
    cancelar,
    excluir,
    confirmarRealizado,
    // Resultado de venda
    showResultadoVenda,
    agendamentoParaResultado,
    loadingResultado,
    abrirResultadoVenda,
    fecharResultadoVenda,
    confirmarResultadoVenda,
  };
}