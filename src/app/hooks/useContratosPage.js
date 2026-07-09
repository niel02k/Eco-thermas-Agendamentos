// src/app/hooks/useContratosPage.js
"use client";

import { useState, useCallback, useEffect } from "react";
import { useContratos } from "./useContratos";

export function useContratosPage() {
  // Estados da página
  const [contratos, setContratos] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [limite] = useState(10);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [receita8m, setReceita8m] = useState([]);
  const [ticketInfo, setTicketInfo] = useState(null);

  // Estados de modal
  const [contratoSelecionado, setContratoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalTipo, setModalTipo] = useState('visualizar');
  const [showCriarContrato, setShowCriarContrato] = useState(false);
  const [showEditarContrato, setShowEditarContrato] = useState(false);
  const [contratoParaEditar, setContratoParaEditar] = useState(null);

  const {
    loading,
    error,
    setError,
    fetchContratos,
    fetchContratoById,
    createContrato,
    updateContrato,
    deleteContrato,
    fetchMetrics
  } = useContratos();

  // Carregar contratos
  const carregarContratos = useCallback(async () => {
    try {
      const result = await fetchContratos({
        pagina,
        limite,
        busca,
        status: filtroStatus
      });
      
      setContratos(result.contratos || []);
      setTotal(result.total || 0);
    } catch (e) {
      // Erro já tratado no hook
    }
  }, [fetchContratos, pagina, limite, busca, filtroStatus]);

  // Carregar métricas
  const carregarMetricas = useCallback(async () => {
    try {
      const metrics = await fetchMetrics();
      setReceita8m(metrics.receitaMensal);
      setTicketInfo(metrics.ticketMedio);
    } catch (e) {
      // Erro já tratado no hook
    }
  }, [fetchMetrics]);

  // Buscar contrato específico
  const buscarContrato = useCallback(async (id) => {
    try {
      const contrato = await fetchContratoById(id);
      setContratoSelecionado(contrato);
      setModalAberto(true);
      setModalTipo('visualizar');
    } catch (e) {
      // Erro já tratado no hook
    }
  }, [fetchContratoById]);

  // Abrir edição
  const handleEditar = useCallback(async (id) => {
    try {
      const contrato = await fetchContratoById(id);
      setContratoParaEditar(contrato);
      setShowEditarContrato(true);
    } catch (e) {
      // Erro já tratado no hook
    }
  }, [fetchContratoById]);

  // Excluir contrato
  const handleExcluir = useCallback(async (id) => {
    if (!confirm('Tem certeza que deseja excluir este contrato?')) return;

    try {
      await deleteContrato(id);
      await carregarContratos();
      await carregarMetricas();
    } catch (e) {
      // Erro já tratado no hook
    }
  }, [deleteContrato, carregarContratos, carregarMetricas]);

  // Callback de sucesso ao criar
  const handleContratoCriado = useCallback(async (contrato) => {
    setShowCriarContrato(false);
    await carregarContratos();
    await carregarMetricas();
    
    if (contrato?.id) {
      await buscarContrato(contrato.id);
    }
  }, [carregarContratos, carregarMetricas, buscarContrato]);

  // Callback de sucesso ao editar
  const handleContratoEditado = useCallback(async (contrato) => {
    setShowEditarContrato(false);
    setContratoParaEditar(null);
    await carregarContratos();
    await carregarMetricas();
    
    if (contrato?.id) {
      await buscarContrato(contrato.id);
    }
  }, [carregarContratos, carregarMetricas, buscarContrato]);

  // Efeitos
  useEffect(() => {
    carregarContratos();
  }, [carregarContratos]);

  useEffect(() => {
    carregarMetricas();
  }, [carregarMetricas]);

  return {
    // Dados
    contratos,
    total,
    pagina,
    limite,
    busca,
    filtroStatus,
    receita8m,
    ticketInfo,
    loading,
    error,
    
    // Modal
    contratoSelecionado,
    modalAberto,
    modalTipo,
    showCriarContrato,
    showEditarContrato,
    contratoParaEditar,
    
    // Setters
    setPagina,
    setBusca,
    setFiltroStatus,
    setError,
    setModalAberto,
    setModalTipo,
    setShowCriarContrato,
    setShowEditarContrato,
    setContratoParaEditar,
    
    // Ações
    carregarContratos,
    carregarMetricas,
    buscarContrato,
    handleEditar,
    handleExcluir,
    handleContratoCriado,
    handleContratoEditado
  };
}