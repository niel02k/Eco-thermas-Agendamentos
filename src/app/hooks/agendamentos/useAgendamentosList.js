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
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [filtroData, setFiltroData] = useState(null);

<<<<<<< Updated upstream
  const carregar = useCallback(async (pag, termoBusca) => {
    setLoading(true);
    setErro(null);
    try {
      const resultado = await listarAgendamentos({
        pagina: pag || pagina,
        limite: LIMITE,
        busca: termoBusca !== undefined ? termoBusca : busca,
      });
      setAgendamentos(resultado.agendamentos ?? []);
      setTotal(resultado.total ?? 0);
    } catch (e) {
      setErro('Erro ao carregar agendamentos.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [pagina, busca]);
=======
  // ============================================================
  // CARREGAR
  // ============================================================
  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    try {
      console.log('📥 Carregando agendamentos:', { pagina, busca, filtroData });

      const resultado = await listarAgendamentos({
        pagina,
        limite: LIMITE,
        busca: busca || '',
        dataInicio: filtroData || undefined,
        dataFim: filtroData || undefined,
        periodoMeses: 3,
        campoData: 'data_visita',
        ordenarPor: 'data_visita',
        ordem: 'desc',
      });
>>>>>>> Stashed changes

      setAgendamentos(resultado.agendamentos ?? []);
      setTotal(resultado.total ?? 0);
    } catch (e) {
      console.error('❌ Erro ao carregar agendamentos:', e);
      setErro(e.message || 'Erro ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  }, [pagina, busca, filtroData]);

  // ============================================================
  // HANDLES
  // ============================================================
  const handleBusca = useCallback((termo) => {
    setBusca(termo);
    setPagina(1);
  }, []);

  const handleFiltroData = useCallback((data) => {
    setFiltroData(data);
    setPagina(1);
  }, []);

  const limparFiltroData = useCallback(() => {
    setFiltroData(null);
    setPagina(1);
  }, []);

  // ============================================================
  // EFEITO - RECARREGA QUANDO DEPENDÊNCIAS MUDAREM
  // ============================================================
  useEffect(() => {
    carregar();
  }, [pagina, busca, filtroData]);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));

  // ============================================================
  // RETORNO
  // ============================================================
  return {
    agendamentos,
    total,
    pagina,
    totalPaginas,
    busca,
    loading,
    erro,
    filtroData,
    setPagina,
    handleBusca,
    handleFiltroData,
    limparFiltroData,
    carregar,
  };
}