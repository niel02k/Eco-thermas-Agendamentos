// src/app/hooks/contratos/useContratoDetalhe.js
"use client";

import { useState, useCallback } from 'react';
import { buscarContratoPorId } from '@/app/services/contratosServices';

export function useContratoDetalhe() {
  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const buscarDetalhe = useCallback(async (id) => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await buscarContratoPorId(id);
      setContrato(dados);
      setModalAberto(true);
      return dados;
    } catch (e) {
      setErro(e.message || 'Erro ao carregar contrato');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const abrirVisualizar = useCallback(async (id) => {
    await buscarDetalhe(id);
  }, [buscarDetalhe]);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setContrato(null);
    setErro(null);
  }, []);

  return {
    contrato,
    loading,
    erro,
    modalAberto,
    buscarDetalhe,
    abrirVisualizar,
    fecharModal,
  };
}