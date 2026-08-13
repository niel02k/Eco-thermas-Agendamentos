// src/app/hooks/contratos/useContratosActions.js
"use client";

import { useState, useCallback } from 'react';
import { 
  criarContrato, 
  atualizarContrato, 
  excluirContrato,
  buscarContratoPorId,
} from '@/app/services/contratosServices';

export function useContratosActions(onSuccess) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [contratoSelecionado, setContratoSelecionado] = useState(null);
  const [contratoCriado, setContratoCriado] = useState(null);
  const [modoModal, setModoModal] = useState(null); // 'visualizar', 'editar', 'criar'
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);

  // ============================================================
  // RECARREGAR
  // ============================================================

  const recarregar = useCallback(async () => {
    if (onSuccess) {
      await onSuccess();
    }
  }, [onSuccess]);

  const recarregarTudo = useCallback(async () => {
    // Reseta estados
    setErro(null);
    setSucesso(false);
    setContratoCriado(null);
    
    // Recarrega a lista
    if (onSuccess) {
      await onSuccess();
    }
  }, [onSuccess]);

  // ============================================================
  // VISUALIZAR / EDITAR
  // ============================================================

  const buscarDetalhe = useCallback(async (id) => {
    setLoadingDetalhe(true);
    try {
      const contrato = await buscarContratoPorId(id);
      setContratoSelecionado(contrato);
      return { contrato, erro: null };
    } catch (e) {
      const mensagem = e.message || 'Erro ao carregar detalhes do contrato';
      setErro(mensagem);
      return { contrato: null, erro: mensagem };
    } finally {
      setLoadingDetalhe(false);
    }
  }, []);

  const abrirVisualizar = useCallback(async (id) => {
    setModoModal('visualizar');
    await buscarDetalhe(id);
  }, [buscarDetalhe]);

  const abrirEditar = useCallback(async (id) => {
    setModoModal('editar');
    await buscarDetalhe(id);
  }, [buscarDetalhe]);

  const abrirCriar = useCallback(() => {
    setModoModal('criar');
    setContratoSelecionado(null);
  }, []);

  const fecharModal = useCallback(() => {
    setModoModal(null);
    setContratoSelecionado(null);
  }, []);

  // ============================================================
  // CRUD
  // ============================================================

  const criar = useCallback(async (dados) => {
    setLoading(true);
    setErro(null);
    setSucesso(false);
    setContratoCriado(null);
    try {
      const contrato = await criarContrato(dados);
      setContratoCriado(contrato);
      setSucesso(true);
      await recarregar();
      return { contrato, erro: null };
    } catch (e) {
      const mensagem = e.message || 'Erro ao criar contrato';
      setErro(mensagem);
      return { contrato: null, erro: mensagem };
    } finally {
      setLoading(false);
    }
  }, [recarregar]);

  const editar = useCallback(async (id, dados) => {
    setLoading(true);
    setErro(null);
    setSucesso(false);
    try {
      const contrato = await atualizarContrato(id, dados);
      setSucesso(true);
      await recarregar();
      return { contrato, erro: null };
    } catch (e) {
      const mensagem = e.message || 'Erro ao editar contrato';
      setErro(mensagem);
      return { contrato: null, erro: mensagem };
    } finally {
      setLoading(false);
    }
  }, [recarregar]);

  const excluir = useCallback(async (id) => {
    setLoading(true);
    setErro(null);
    try {
      await excluirContrato(id);
      await recarregar();
      return { sucesso: true, erro: null };
    } catch (e) {
      const mensagem = e.message || 'Erro ao excluir contrato';
      setErro(mensagem);
      return { sucesso: false, erro: mensagem };
    } finally {
      setLoading(false);
    }
  }, [recarregar]);

  const resetar = useCallback(() => {
    setLoading(false);
    setErro(null);
    setSucesso(false);
    setContratoSelecionado(null);
    setContratoCriado(null);
    setModoModal(null);
    setLoadingDetalhe(false);
  }, []);

  // ============================================================
  // RETORNO
  // ============================================================

  return {
    // Estados
    loading,
    erro,
    sucesso,
    contratoSelecionado,
    contratoCriado,
    modoModal,
    loadingDetalhe,

    // Ações CRUD
    criar,
    editar,
    excluir,
    resetar,

    // Modal
    abrirVisualizar,
    abrirEditar,
    abrirCriar,
    fecharModal,
    buscarDetalhe,

    // Recarregar
    recarregar,
    recarregarTudo,

    // Utilitários
    setErro,
  };
}