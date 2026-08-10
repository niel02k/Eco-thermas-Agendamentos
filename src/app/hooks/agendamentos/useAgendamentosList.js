// src/app/hooks/agendamentos/useAgendamentosList.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { listarAgendamentos } from '@/app/services/agendamentosServices';

const LIMITE = 10;

export function useAgendamentosList() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

const carregar = useCallback(async (
  pag = pagina,
  termoBusca = busca,
  filtroData = null
) => {
  setLoading(true);
  setErro(null);

  try {
    const resultado = await listarAgendamentos({
      pagina: pag,
      limite: LIMITE,
      busca: termoBusca,
      dataInicio: filtroData,
      dataFim: filtroData,
    });

    setAgendamentos(resultado.agendamentos ?? []);
    setTotal(resultado.total ?? 0);
  } catch (e) {
    setErro("Erro ao carregar agendamentos.");
    console.error(e);
  } finally {
    setLoading(false);
  }
}, [pagina, busca]);

  const handleBusca = useCallback((termo) => {
    setBusca(termo);
    setPagina(1);
  }, []);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));

  return {
    agendamentos,
    total,
    pagina,
    totalPaginas,
    busca,
    loading,
    erro,
    setPagina,
    handleBusca,
    carregar,
  };
}