// src/app/hooks/useContratos.js
"use client";

import { useState, useCallback } from "react";
import { 
  listarContratos, 
  buscarContratoPorId, 
  buscarContratosPorNome, 
  criarContrato, 
  atualizarContrato, 
  excluirContrato, 
  receitaPorMes, 
  ticketMedio 
} from "@/app/services/contratosServices.js";

export function useContratos() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Listar contratos com paginação e filtros
  const fetchContratos = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { pagina = 1, limite = 10, busca = "", status = null } = filtros;

      if (busca && busca.length > 2) {
        const resultados = await buscarContratosPorNome(busca);
        const filtrados = status && status !== "todos"
          ? resultados.filter(c => c.status === status)
          : resultados;
        return {
          contratos: filtrados || [],
          total: filtrados?.length || 0,
          pagina,
          totalPaginas: Math.ceil((filtrados?.length || 0) / limite)
        };
      }

      const resp = await listarContratos({ pagina, limite, busca, status });
      return resp;
    } catch (e) {
      setError(e.message || "Erro ao carregar contratos");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar contrato por ID
  const fetchContratoById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const contrato = await buscarContratoPorId(id);
      return contrato;
    } catch (e) {
      setError(e.message || "Erro ao buscar contrato");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar contrato
  const createContrato = useCallback(async (dados) => {
    setLoading(true);
    setError(null);
    try {
      const contrato = await criarContrato(dados);
      return contrato;
    } catch (e) {
      setError(e.message || "Erro ao criar contrato");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar contrato
  const updateContrato = useCallback(async (id, dados) => {
    setLoading(true);
    setError(null);
    try {
      const contrato = await atualizarContrato(id, dados);
      return contrato;
    } catch (e) {
      setError(e.message || "Erro ao atualizar contrato");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // Excluir contrato
  const deleteContrato = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await excluirContrato(id);
      return true;
    } catch (e) {
      setError(e.message || "Erro ao excluir contrato");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar métricas
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

      const [r8m, tm] = await Promise.all([
        receitaPorMes(),
        ticketMedio({
          inicio: inicioMes.toISOString().split('T')[0],
          fim: hoje.toISOString().split('T')[0],
          status: ['ATIVO']
        })
      ]);

      return {
        receitaMensal: r8m || [],
        ticketMedio: tm || null
      };
    } catch (e) {
      setError(e.message || "Erro ao carregar métricas");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    setError,
    fetchContratos,
    fetchContratoById,
    createContrato,
    updateContrato,
    deleteContrato,
    fetchMetrics
  };
}