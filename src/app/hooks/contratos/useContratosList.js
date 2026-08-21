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
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 👈 novo state
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const status = filtroStatus !== 'todos' ? filtroStatus : null;
      const tipoContrato = filtroTipo !== 'todos' ? filtroTipo : null; // 👈

      const resultado = await listarContratos({
        pagina,
        limite: LIMITE,
        busca,
        status,
        tipoContrato,       // 👈 nome correto, sem referência solta
        ordenarPor: 'data_criacao',
        ordem: 'desc',
      });
      setContratos(resultado.contratos || []);
      setTotal(resultado.total || 0);
    } catch (e) {
      setErro(e.message || 'Erro ao carregar contratos');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [pagina, busca, filtroStatus, filtroTipo]); // 👈 incluir na dependência

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));

  return {
    contratos,
    total,
    pagina,
    totalPaginas,
    busca,
    filtroStatus,
    filtroTipo,           // 👈 expor
    loading,
    erro,
    setPagina,
    setBusca,
    setFiltroStatus,
    setFiltroTipo,        // 👈 expor
    setErro,
    carregar,
  };
}