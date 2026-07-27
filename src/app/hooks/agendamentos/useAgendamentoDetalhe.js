// src/app/hooks/agendamentos/useAgendamentoDetalhe.js
"use client";

import { useState, useCallback } from 'react';
import { buscarAgendamentoPorCodigo } from '@/app/services/agendamentosServices';

export function useAgendamentoDetalhe() {
  const [agendamento, setAgendamento] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [modoModal, setModoModal] = useState(null); // 'visualizar' | 'editar' | null

  const buscarDetalhe = useCallback(async (codigo) => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await buscarAgendamentoPorCodigo(codigo);
      setAgendamento(dados);
      return { agendamento: dados, erro: null };
    } catch (e) {
      setErro('Erro ao carregar detalhes do agendamento.');
      return { agendamento: null, erro: e.message };
    } finally {
      setLoading(false);
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
    setAgendamento(null);
    setErro(null);
  }, []);

  return {
    agendamento,
    loading,
    erro,
    modoModal,
    abrirVisualizar,
    abrirEditar,
    fecharModal,
    buscarDetalhe,
  };
}