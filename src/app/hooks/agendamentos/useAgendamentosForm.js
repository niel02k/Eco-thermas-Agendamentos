// src/app/hooks/agendamentos/useAgendamentosForm.js
"use client";

import { useState, useCallback } from 'react';
import { criarAgendamento, atualizarAgendamento, verificarCPFDuplicado } from '@/app/services/agendamentosServices';

export function useAgendamentosForm(onSuccess) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [agendamentoSalvo, setAgendamentoSalvo] = useState(null);
  const [erroCPF, setErroCPF] = useState('');
  const [verificandoCPF, setVerificandoCPF] = useState(false);

  // Verificar CPF duplicado
  const validarCPF = useCallback(async (cpf, codigoIgnorar = null) => {
    if (!cpf) {
      setErroCPF('');
      return true;
    }
    
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      setErroCPF('');
      return true;
    }

    setVerificandoCPF(true);
    try {
      const resultado = await verificarCPFDuplicado(cpf, codigoIgnorar);
      if (resultado.duplicado) {
        setErroCPF('Este CPF já possui um agendamento ativo no sistema.');
        setVerificandoCPF(false);
        return false;
      }
      setErroCPF('');
      setVerificandoCPF(false);
      return true;
    } catch (e) {
      console.error('Erro ao verificar CPF:', e);
      setErroCPF('');
      setVerificandoCPF(false);
      return true;
    }
  }, []);

  const salvar = useCallback(async (dados, isEdicao = false) => {
    setLoading(true);
    setErro(null);
    setSucesso(false);
    setAgendamentoSalvo(null);

    try {
      // Verificar CPF duplicado antes de salvar
      const cpf = dados.cliente?.cpf || dados.titular_cpf;
      if (cpf && !isEdicao) {
        const { duplicado } = await verificarCPFDuplicado(cpf);
        if (duplicado) {
          setErro('Este CPF já possui um agendamento ativo no sistema.');
          setLoading(false);
          return { agendamento: null, erro: 'CPF duplicado' };
        }
      }

      let agendamento;

      if (isEdicao && dados.codigo) {
        agendamento = await atualizarAgendamento(dados.codigo, {
          vendedor_id: dados.vendedor_id,
          data_visita: dados.data_visita,
          horario_visita: dados.horario_visita,
          quantidade_pessoas: dados.quantidade_pessoas,
          cidade: dados.cidade,
          origem: dados.origem,
          status: dados.status,
          resultado_visita: dados.resultado_visita,
          resultado_venda: dados.resultado_venda,
          observacoes: dados.observacoes,
          dependentes: dados.dependentes,
        });
      } else {
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
    setErroCPF('');
    setVerificandoCPF(false);
  }, []);

  return {
    loading,
    erro,
    sucesso,
    agendamentoSalvo,
    salvar,
    resetar,
    erroCPF,
    verificandoCPF,
    validarCPF,
  };
}