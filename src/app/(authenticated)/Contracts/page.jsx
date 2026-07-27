// src/app/(sua-rota)/contratos/Contracts.jsx
"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import PageHeader from "@/app/Components/PageHeader/PageHeader.jsx";
import styles from "./Contracts.module.css";
import { useContratosPage } from "@/app/hooks/useContratosPage";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";

// Componentes
import ContractsFilters from "@/app/Components/ModalContrato/ContractsFilters";
import ContractsKPIs from "@/app/Components/ModalContrato/ContractsKPIs";
import ContractsInsights from "@/app/Components/ModalContrato/ContractsInsights";
import ContractsTable from "@/app/Components/ModalContrato/ContractsTable";
import ContractsMobile from "@/app/Components/ModalContrato/ContractsMobile";
import FormContrato from "@/app/Components/ModalContrato/Form/formcontrato.jsx";
import VisualizarContrato from "@/app/Components/ModalContrato/Visualizar/VisualizarContratoModal.jsx";
import ReceitaMensalChart from "@/app/Components/ReceitaMensal/ReceitaMensalChart.jsx";

export default function Contracts() {
  const [visible, setVisible] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
    contratos, total, pagina, busca, filtroStatus,
    receita8m, ticketInfo, loading, error,
    resumoGeral, rankingVendedores, statusContratos,
    contratoSelecionado, modalAberto,
    showCriarContrato, showEditarContrato, contratoParaEditar,
    setPagina, setBusca, setFiltroStatus, setError, setModalAberto,
    setShowCriarContrato, setShowEditarContrato, setContratoParaEditar,
    carregarContratos, buscarContrato, handleEditar, handleExcluir,
    handleContratoCriado, handleContratoEditado, recarregarTudo
  } = useContratosPage();

  const totalPaginas = Math.max(1, Math.ceil(total / 10));

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Handlers
  const handleVisualizar = useCallback((id) => buscarContrato(id), [buscarContrato]);
  
  const handleExcluirWrapper = useCallback((id) => {
    if (window.confirm("Tem certeza que deseja excluir este contrato?")) {
      handleExcluir(id);
    }
  }, [handleExcluir]);

  return (
    <div className={styles.container}>
      <main className={`${styles.main} ${visible ? styles.mainVisible : ""}`}>
        <PageHeader
          title="Contratos"
          subtitle="Gestão e análise de contratos emitidos"
          actionLabel="Novo Contrato"
          actionIcon={Plus}
          onAction={() => setShowCriarContrato(true)}
        />

        {/* Filtros */}
        <ContractsFilters
          busca={busca}
          filtroStatus={filtroStatus}
          loading={loading}
          onBuscaChange={(val) => { setBusca(val); if (!val) { setPagina(1); carregarContratos(); } }}
          onBuscaSubmit={() => { setPagina(1); carregarContratos(); }}
          onStatusChange={setFiltroStatus}
          onRefresh={recarregarTudo}
        />

        {/* Erro */}
        {error && (
          <div className={styles.errorBanner}>
            <span>{error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* KPIs */}
        <ContractsKPIs
          contratos={contratos}
          total={total}
          resumoGeral={resumoGeral}
          ticketInfo={ticketInfo}
        />

        {/* Insights */}
        <ContractsInsights
          rankingVendedores={rankingVendedores}
          statusContratos={statusContratos}
          total={total}
          resumoGeral={resumoGeral}
        />

        {/* Tabela ou Cards */}
        {isMobile ? (
          <ContractsMobile
            contratos={contratos}
            loading={loading}
            busca={busca}
            onVisualizar={handleVisualizar}
            onEditar={handleEditar}
            onExcluir={handleExcluirWrapper}
          />
        ) : (
          <ContractsTable
            contratos={contratos}
            loading={loading}
            total={total}
            pagina={pagina}
            totalPaginas={totalPaginas}
            busca={busca}
            onPageChange={setPagina}
            onVisualizar={handleVisualizar}
            onEditar={handleEditar}
            onExcluir={handleExcluirWrapper}
          />
        )}

        {/* Gráfico */}
        {receita8m?.length > 0 && (
          <ReceitaMensalChart
            data={receita8m}
            height={300}
            title="Receita Mensal"
            subtitle="Últimos 8 meses"
          />
        )}

        {/* Modais */}
        {modalAberto && contratoSelecionado && (
          <VisualizarContrato
            contrato={contratoSelecionado}
            onClose={() => setModalAberto(false)}
            onEditar={(id) => { setModalAberto(false); handleEditar(id); }}
          />
        )}

        {showCriarContrato && (
          <FormContrato onClose={() => setShowCriarContrato(false)} onSuccess={handleContratoCriado} />
        )}

        {showEditarContrato && contratoParaEditar && (
          <FormContrato
            contrato={contratoParaEditar}
            onClose={() => { setShowEditarContrato(false); setContratoParaEditar(null); }}
            onSuccess={handleContratoEditado}
          />
        )}
      </main>
    </div>
  );
}