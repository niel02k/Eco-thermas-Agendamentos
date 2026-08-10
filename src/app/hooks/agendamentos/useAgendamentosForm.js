// src/app/hooks/agendamentos/useAgendamentosForm.js
"use client";

import { useState, useCallback, useRef } from 'react';
import { criarAgendamento, atualizarAgendamento, verificarCPFDuplicado } from '@/app/services/agendamentosServices';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';

export function useAgendamentosForm(onSuccess) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [agendamentoSalvo, setAgendamentoSalvo] = useState(null);
  const [erroCPF, setErroCPF] = useState('');
  const [verificandoCPF, setVerificandoCPF] = useState(false);
  
  // 👇 Usando useRef para não causar re-renderizações
  const timeoutRef = useRef(null);

  // Verificar CPF duplicado com debounce
  const validarCPF = useCallback(async (cpf, codigoIgnorar = null) => {
    // 1️⃣ Limpa o CPF
    const cpfLimpo = cpf?.replace(/\D/g, '') || '';
    
    // 2️⃣ Se estiver vazio, limpa o erro e retorna true
    if (!cpfLimpo) {
      setErroCPF('');
      return true;
    }

    // 3️⃣ Verifica se tem 11 dígitos
    if (cpfLimpo.length !== 11) {
      setErroCPF('CPF deve ter 11 dígitos');
      return false;
    }

    // 4️⃣ Validação matemática com a biblioteca
    if (!cpfValidator.isValid(cpfLimpo)) {
      setErroCPF('CPF inválido. Verifique os números digitados.');
      return false;
    }

    // 5️⃣ Cancela a verificação anterior (debounce)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 6️⃣ Aguarda 500ms após parar de digitar para fazer a verificação
    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(async () => {
        setVerificandoCPF(true);
        try {
          const resultado = await verificarCPFDuplicado(cpfLimpo, codigoIgnorar);
          
          if (resultado.duplicado) {
            setErroCPF('Este CPF já possui um agendamento ativo no sistema.');
            setVerificandoCPF(false);
            resolve(false);
          } else {
            // ✅ CPF válido e não duplicado
            setErroCPF('');
            setVerificandoCPF(false);
            resolve(true);
          }
        } catch (e) {
          console.error('Erro ao verificar CPF:', e);
          // Em caso de erro na API, permite prosseguir
          setErroCPF('');
          setVerificandoCPF(false);
          resolve(true);
        }
      }, 500); // ⏱️ 500ms de debounce
    });
  }, []); // ⚠️ Não precisa de dependências porque usamos useRef

  // Salvar agendamento
  const salvar = useCallback(async (dados, isEdicao = false) => {
    setLoading(true);
    setErro(null);
    setSucesso(false);
    setAgendamentoSalvo(null);

    try {
      // 🔥 Valida CPF antes de salvar (se existir)
      if (dados.cliente?.cpf) {
        const cpfValido = await validarCPF(
          dados.cliente.cpf, 
          isEdicao ? dados.codigo : null
        );
        
        if (!cpfValido) {
          setLoading(false);
          return { 
            agendamento: null, 
            erro: 'CPF inválido ou duplicado' 
          };
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
          cliente: dados.cliente,
          cliente_id: dados.cliente_id,
        });
      } else {
        agendamento = await criarAgendamento(dados);
      }

      setAgendamentoSalvo(agendamento);
      setSucesso(true);
      if (onSuccess) await onSuccess(agendamento);
      return { agendamento, erro: null };
      
    } catch (e) {
      const mensagem = e.message || 'Erro ao salvar agendamento.';
      setErro(mensagem);
      return { agendamento: null, erro: mensagem };
    } finally {
      setLoading(false);
    }
  }, [onSuccess, validarCPF]);

  const resetar = useCallback(() => {
    // Limpa o timeout se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
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