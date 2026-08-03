// src/app/hooks/useContratosPage.js
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useContratosList } from '@/app/hooks/contratos/useContratosList';
import { useContratoDetalhe } from '@/app/hooks/contratos/useContratoDetalhe';
import { useContratosActions } from '@/app/hooks/contratos/useContratosActions';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export function useContratosPage() {
  const listagem = useContratosList();
  const detalhe = useContratoDetalhe();
  
  const [todosContratos, setTodosContratos] = useState([]);

  const carregarTodosContratos = useCallback(async () => {
    try {
      const [contratosRes, usuariosRes] = await Promise.all([
        supabase
          .from('contratos')
          .select('*, dependentes:contrato_dependentes(id)')
          .order('data_criacao', { ascending: false }),
        supabase
          .from('usuarios')
          .select('id, nome')
      ]);

      if (contratosRes.error || usuariosRes.error) return;

      const usuariosMap = {};
      (usuariosRes.data || []).forEach(u => {
        usuariosMap[u.id] = u;
      });

      const contratosComVendedor = (contratosRes.data || []).map(c => ({
        ...c,
        vendedor: usuariosMap[c.vendedor_id] || null
      }));

      setTodosContratos(contratosComVendedor);
    } catch (e) {
      console.error('Erro:', e);
    }
  }, []);

  const onActionComplete = useCallback(async () => {
    await Promise.all([
      listagem.carregar(),
      carregarTodosContratos()
    ]);
  }, [listagem.carregar, carregarTodosContratos]);

  const actions = useContratosActions(onActionComplete);

  const [showCriarContrato, setShowCriarContrato] = useState(false);
  const [showEditarContrato, setShowEditarContrato] = useState(false);
  const [contratoParaEditar, setContratoParaEditar] = useState(null);

  // ═══════════ MÉTRICAS ═══════════
  const rankingVendedores = useMemo(() => {
    const contratos = todosContratos || [];
    if (contratos.length === 0) return [];

    const porVendedor = {};
    const receitaTotal = contratos.reduce((acc, c) => acc + Number(c.valor_total || 0), 0);

    contratos.forEach(c => {
      const nome = c.vendedor?.nome || 'Sem consultor';
      if (!porVendedor[nome]) {
        porVendedor[nome] = { nome, quantidade: 0, receita: 0 };
      }
      porVendedor[nome].quantidade += 1;
      porVendedor[nome].receita += Number(c.valor_total || 0);
    });

    return Object.values(porVendedor)
      .map(item => ({
        ...item,
        ticket_medio: item.quantidade > 0 ? Number((item.receita / item.quantidade).toFixed(2)) : 0,
        percentual: receitaTotal > 0 ? Number(((item.receita / receitaTotal) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.receita - a.receita);
  }, [todosContratos]);

  const statusContratos = useMemo(() => {
    const contratos = todosContratos || [];
    if (contratos.length === 0) return [];

    const porStatus = {};
    contratos.forEach(c => {
      const status = c.status || 'PENDENTE';
      porStatus[status] = (porStatus[status] || 0) + 1;
    });

    return Object.entries(porStatus).map(([status, quantidade]) => ({
      status,
      quantidade,
      percentual: Number(((quantidade / contratos.length) * 100).toFixed(1)),
    }));
  }, [todosContratos]);

  const resumoGeral = useMemo(() => {
    const contratos = todosContratos || [];
    
    if (contratos.length === 0) {
      return {
        receita_total: 0,
        ticket_medio: 0,
        total_contratos: 0,
        contratos_ativos: 0,
        contratos_pendentes: 0,
        contratos_cancelados: 0,
        total_dependentes: 0,
      };
    }

    const receitaTotal = contratos.reduce((acc, c) => acc + Number(c.valor_total || 0), 0);
    const total = contratos.length;

    return {
      receita_total: Number(receitaTotal.toFixed(2)),
      ticket_medio: Number((receitaTotal / total).toFixed(2)),
      total_contratos: total,
      contratos_ativos: contratos.filter(c => c.status === 'ATIVO').length,
      contratos_pendentes: contratos.filter(c => c.status === 'PENDENTE').length,
      contratos_cancelados: contratos.filter(c => c.status === 'CANCELADO').length,
      total_dependentes: contratos
        .filter(c => c.status === "ATIVO")
        .reduce((acc, c) => acc + (c.dependentes?.length || 0), 0), // 👈 Corrigido
    };
  }, [todosContratos]);

  const ticketInfo = useMemo(() => ({
    ticket_medio: resumoGeral.ticket_medio,
    valor_total: resumoGeral.receita_total,
    total_contratos: resumoGeral.total_contratos,
  }), [resumoGeral]);

  const handleEditar = useCallback(async (id) => {
    try {
      const contrato = await detalhe.buscarDetalhe(id);
      if (contrato) {
        setContratoParaEditar(contrato);
        setShowEditarContrato(true);
      }
    } catch (error) {
      console.error('Erro ao buscar contrato:', error);
    }
  }, [detalhe]);

  const handleExcluir = useCallback(async (id) => {
    await actions.excluir(id);
  }, [actions]);

  const handleContratoCriado = useCallback(async () => {
    setShowCriarContrato(false);
    await onActionComplete();
  }, [onActionComplete]);

  const handleContratoEditado = useCallback(async () => {
    setShowEditarContrato(false);
    setContratoParaEditar(null);
    await onActionComplete();
  }, [onActionComplete]);

  useEffect(() => {
    listagem.carregar();
    carregarTodosContratos();
  }, []);

  useEffect(() => {
    listagem.carregar();
  }, [listagem.pagina, listagem.busca, listagem.filtroStatus]);

  return {
    contratos: listagem.contratos,
    total: listagem.total,
    pagina: listagem.pagina,
    busca: listagem.busca,
    filtroStatus: listagem.filtroStatus,
    loading: listagem.loading,
    error: listagem.erro,
    
    rankingVendedores,
    statusContratos,
    resumoGeral,
    ticketInfo,
    receita8m: [],
    
    contratoSelecionado: detalhe.contrato,
    modalAberto: detalhe.modalAberto,
    
    showCriarContrato,
    showEditarContrato,
    contratoParaEditar,
    
    setPagina: listagem.setPagina,
    setBusca: listagem.setBusca,
    setFiltroStatus: listagem.setFiltroStatus,
    setError: listagem.setErro,
    setModalAberto: detalhe.fecharModal,
    setShowCriarContrato,
    setShowEditarContrato,
    setContratoParaEditar,
    
    carregarContratos: listagem.carregar,
    buscarContrato: detalhe.abrirVisualizar,
    handleEditar,
    handleExcluir,
    handleContratoCriado,
    handleContratoEditado,
    recarregarTudo: onActionComplete,
  };
}