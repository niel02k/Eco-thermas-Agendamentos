// src/app/hooks/contratos/useContratosList.js
"use client";

import { useState, useCallback } from 'react';
import { listarContratos } from '@/app/services/contratosServices';

const LIMITE = 10;

export function useContratosList() {
  const [contratos, setContratos] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const status = filtroStatus !== 'todos' ? filtroStatus : null;
      const resultado = await listarContratos({
        pagina,
        limite: LIMITE,
        busca,
        status,
      });
      setContratos(resultado.contratos || []);
      setTotal(resultado.total || 0);
    } catch (e) {
      setErro(e.message || 'Erro ao carregar contratos');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [pagina, busca, filtroStatus]);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));

  return {
    contratos,
    total,
    pagina,
    totalPaginas,
    busca,
    filtroStatus,
    loading,
    erro,
    setPagina,
    setBusca,
    setFiltroStatus,
    setErro,
    carregar,
  };
}