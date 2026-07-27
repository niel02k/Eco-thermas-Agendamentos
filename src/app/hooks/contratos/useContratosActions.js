// src/app/hooks/contratos/useContratosActions.js
"use client";

import { useState, useCallback } from 'react';
import { criarContrato, atualizarContrato, excluirContrato } from '@/app/services/contratosServices';

export function useContratosActions(onSuccess) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const criar = useCallback(async (dados) => {
    setLoading(true);
    setErro(null);
    try {
      const contrato = await criarContrato(dados);
      if (onSuccess) await onSuccess();
      return { contrato, erro: null };
    } catch (e) {
      const mensagem = e.message || 'Erro ao criar contrato';
      setErro(mensagem);
      return { contrato: null, erro: mensagem };
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  const editar = useCallback(async (id, dados) => {
    setLoading(true);
    setErro(null);
    try {
      const contrato = await atualizarContrato(id, dados);
      if (onSuccess) await onSuccess();
      return { contrato, erro: null };
    } catch (e) {
      const mensagem = e.message || 'Erro ao editar contrato';
      setErro(mensagem);
      return { contrato: null, erro: mensagem };
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  const excluir = useCallback(async (id) => {
    setLoading(true);
    setErro(null);
    try {
      await excluirContrato(id);
      if (onSuccess) await onSuccess();
      return { sucesso: true, erro: null };
    } catch (e) {
      const mensagem = e.message || 'Erro ao excluir contrato';
      setErro(mensagem);
      return { sucesso: false, erro: mensagem };
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { loading, erro, criar, editar, excluir, setErro };
}