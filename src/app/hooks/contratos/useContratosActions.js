'use client';

import { useCallback, useState } from 'react';
import {
  criarContrato as criarContratoService,
  atualizarContrato as atualizarContratoService,
  excluirContrato as excluirContratoService,
  buscarContratoPorId,
} from '@/app/services/contratosServices';

function obterMensagemErro(error, mensagemPadrao) {
  if (typeof error === 'string' && error.trim()) return error;
  if (error?.message && String(error.message).trim()) {
    return String(error.message);
  }
  return mensagemPadrao;
}

export function useContratosActions(onSuccess) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [contratoSelecionado, setContratoSelecionado] = useState(null);
  const [contratoCriado, setContratoCriado] = useState(null);
  const [modoModal, setModoModal] = useState(null);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);

  const recarregar = useCallback(async () => {
    if (typeof onSuccess === 'function') {
      await onSuccess();
    }
  }, [onSuccess]);

  const buscarDetalhe = useCallback(async (id) => {
    if (!id) {
      const mensagem = 'ID do contrato não informado.';
      setErro(mensagem);
      return { contrato: null, erro: mensagem };
    }

    setLoadingDetalhe(true);
    setErro(null);

    try {
      const contrato = await buscarContratoPorId(id);
      setContratoSelecionado(contrato || null);
      return { contrato: contrato || null, erro: null };
    } catch (error) {
      const mensagem = obterMensagemErro(
        error,
        'Erro ao carregar detalhes do contrato.',
      );
      setErro(mensagem);
      return { contrato: null, erro: mensagem };
    } finally {
      setLoadingDetalhe(false);
    }
  }, []);

  const abrirVisualizar = useCallback(async (id) => {
    setModoModal('visualizar');
    return buscarDetalhe(id);
  }, [buscarDetalhe]);

  const abrirEditar = useCallback(async (id) => {
    setModoModal('editar');
    return buscarDetalhe(id);
  }, [buscarDetalhe]);

  const abrirCriar = useCallback(() => {
    setErro(null);
    setSucesso(false);
    setContratoCriado(null);
    setContratoSelecionado(null);
    setModoModal('criar');
  }, []);

  const fecharModal = useCallback(() => {
    setModoModal(null);
    setContratoSelecionado(null);
  }, []);

  const criar = useCallback(async (dados) => {
    setLoading(true);
    setErro(null);
    setSucesso(false);
    setContratoCriado(null);

    try {
      if (!dados || typeof dados !== 'object') {
        throw new Error('Os dados do contrato não foram informados.');
      }

      const contrato = await criarContratoService(dados);

      setContratoCriado(contrato || null);
      setSucesso(true);
      await recarregar();

      return { contrato: contrato || null, erro: null };
    } catch (error) {
      const mensagem = obterMensagemErro(
        error,
        'Erro ao criar contrato.',
      );
      setErro(mensagem);
      setSucesso(false);
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
      if (!id) throw new Error('ID do contrato não informado.');
      if (!dados || typeof dados !== 'object') {
        throw new Error('Os dados do contrato não foram informados.');
      }

      const contrato = await atualizarContratoService(id, dados);
      setSucesso(true);
      await recarregar();
      return { contrato: contrato || null, erro: null };
    } catch (error) {
      const mensagem = obterMensagemErro(
        error,
        'Erro ao editar contrato.',
      );
      setErro(mensagem);
      setSucesso(false);
      return { contrato: null, erro: mensagem };
    } finally {
      setLoading(false);
    }
  }, [recarregar]);

  const excluir = useCallback(async (id) => {
    setLoading(true);
    setErro(null);
    setSucesso(false);

    try {
      if (!id) throw new Error('ID do contrato não informado.');
      await excluirContratoService(id);
      await recarregar();
      setSucesso(true);
      return { sucesso: true, erro: null };
    } catch (error) {
      const mensagem = obterMensagemErro(
        error,
        'Erro ao excluir contrato.',
      );
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

  return {
    loading,
    erro,
    sucesso,
    contratoSelecionado,
    contratoCriado,
    modoModal,
    loadingDetalhe,
    criar,
    editar,
    excluir,
    resetar,
    abrirVisualizar,
    abrirEditar,
    abrirCriar,
    fecharModal,
    buscarDetalhe,
    recarregar,
    setErro,
  };
}