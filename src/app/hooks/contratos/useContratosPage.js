// src/app/hooks/useContratosPage.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useContratos } from './contratos/index';

export function useContratosPage() {
  const contratos = useContratos();
  const [showCriarContrato, setShowCriarContrato] = useState(false);
  const [showEditarContrato, setShowEditarContrato] = useState(false);
  const [contratoParaEditar, setContratoParaEditar] = useState(null);

  const handleEditar = useCallback(async (id) => {
    try {
      const c = await contratos.buscarDetalhe(id);
      if (c) {
        setContratoParaEditar(c);
        setShowEditarContrato(true);
      }
    } catch (error) {
      console.error('Erro ao buscar contrato para edição:', error);
    }
  }, [contratos.buscarDetalhe]);

  const handleExcluir = useCallback(async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      await contratos.excluir(id);
    }
  }, [contratos.excluir]);

  const handleContratoCriado = useCallback(async () => {
    setShowCriarContrato(false);
    await contratos.recarregarTudo();
  }, [contratos.recarregarTudo]);

  const handleContratoEditado = useCallback(async () => {
    setShowEditarContrato(false);
    setContratoParaEditar(null);
    await contratos.recarregarTudo();
  }, [contratos.recarregarTudo]);

  useEffect(() => {
    contratos.carregar();
  }, [contratos.pagina, contratos.busca, contratos.filtroStatus]);

  return {
    ...contratos,
    showCriarContrato,
    showEditarContrato,
    contratoParaEditar,
    setShowCriarContrato,
    setShowEditarContrato,
    setContratoParaEditar,
    handleEditar,
    handleExcluir,
    handleContratoCriado,
    handleContratoEditado,
  };
}