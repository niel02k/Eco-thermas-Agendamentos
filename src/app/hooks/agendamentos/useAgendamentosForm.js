// src/app/hooks/agendamentos/useAgendamentosForm.js
"use client";

import { useState, useCallback } from 'react';
import { criarAgendamento, atualizarAgendamento } from '@/app/services/agendamentosServices';

export function useAgendamentosForm(onSuccess) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [agendamentoSalvo, setAgendamentoSalvo] = useState(null);

  const salvar = useCallback(async (dados, isEdicao = false) => {
    setLoading(true);
    setErro(null);
    setSucesso(false);
    setAgendamentoSalvo(null);

    try {
      let agendamento;

      if (isEdicao && dados.codigo) {
        // Atualizar agendamento existente
        agendamento = await atualizarAgendamento(dados.codigo, {
          vendedor_id: dados.vendedor_id,
          data_visita: dados.data_visita,
          horario_visita: dados.horario_visita,
          quantidade_pessoas: dados.quantidade_pessoas,
          cidade: dados.cidade,
          origem: dados.origem,
          status: dados.status,
          observacoes: dados.observacoes,
          dependentes: dados.dependentes,
        });
      } else {
        // Criar novo agendamento
        agendamento = await criarAgendamento(dados);
      }

      setAgendamentoSalvo(agendamento);
      setSucesso(true);

      if (onSuccess) {
        await onSuccess(agendamento);
      }

      return { agendamento, erro: null };
    } catch (e) {
      const mensagem = e.message || 'Erro ao salvar agendamento.';
      setErro(mensagem);
      return { agendamento: null, erro: mensagem };
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  const resetar = useCallback(() => {
    setLoading(false);
    setErro(null);
    setSucesso(false);
    setAgendamentoSalvo(null);
  }, []);

  return {
    loading,
    erro,
    sucesso,
    agendamentoSalvo,
    salvar,
    resetar,
  };
}