// src/app/(sua-rota)/contratos/Contracts.jsx
"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import PageHeader from "@/app/Components/PageHeader/PageHeader.jsx";
import styles from "./Contracts.module.css";
import { useContratosPage } from "@/app/hooks/contratos/useContratosPage";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";

// Componentes
import ContractsFilters from "@/app/Components/ModalContrato/ContractsFilters";
import ContractsKPIs from "@/app/Components/ModalContrato/ContractsKPIs";
import ContractsInsights from "@/app/Components/ModalContrato/ContractsInsights";
import FormContrato from "@/app/Components/ModalContrato/Form/formcontrato.jsx";
import VisualizarModal from "@/app/Components/Shared/VisualizarModal";
import MobileList from "@/app/Components/Shared/MobileList";
import DataTable from "@/app/Components/Shared/DataTable";
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

  const handleRowClick = useCallback((contrato) => {
    buscarContrato(contrato.id);
  }, [buscarContrato]);

  return (
    <>
      {/* ═══════════ MODAIS (FORA DO CONTAINER) ═══════════ */}
      
      {/* Modal de Visualização */}
      {modalAberto && contratoSelecionado && (
        <VisualizarModal
          tipo="contrato"
          contrato={contratoSelecionado}
          onClose={() => setModalAberto(false)}
          onEditar={handleEditar}
          onExcluirContrato={handleExcluir}
        />
      )}

      {/* Modal de Criar Contrato */}
      {showCriarContrato && (
        <FormContrato
          onClose={() => setShowCriarContrato(false)}
          onSuccess={handleContratoCriado}
        />
      )}

      {/* Modal de Editar Contrato */}
      {showEditarContrato && contratoParaEditar && (
        <FormContrato
          contrato={contratoParaEditar}
          onClose={() => { setShowEditarContrato(false); setContratoParaEditar(null); }}
          onSuccess={handleContratoEditado}
        />
      )}

      {/* ═══════════ CONTEÚDO PRINCIPAL ═══════════ */}
      <div className={styles.container}>
        <main className={`${styles.main} ${visible ? styles.mainVisible : ""}`}>
          <PageHeader
            title="Contratos"
            subtitle="Gestão e análise de contratos emitidos"
            actionLabel="Novo Contrato"
            actionIcon={Plus}
            onAction={() => setShowCriarContrato(true)}
          />

          <ContractsFilters
            busca={busca}
            filtroStatus={filtroStatus}
            loading={loading}
            onBuscaChange={(val) => { setBusca(val); if (!val) { setPagina(1); carregarContratos(); } }}
            onBuscaSubmit={() => { setPagina(1); carregarContratos(); }}
            onStatusChange={setFiltroStatus}
            onRefresh={recarregarTudo}
          />

          {error && (
            <div className={styles.errorBanner}>
              <span>{error}</span>
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          <ContractsKPIs
            contratos={contratos}
            total={total}
            resumoGeral={resumoGeral}
            ticketInfo={ticketInfo}
          />

          <ContractsInsights
            rankingVendedores={rankingVendedores}
            statusContratos={statusContratos}
            total={total}
            resumoGeral={resumoGeral}
          />

          {isMobile ? (
            <MobileList
              tipo="contrato"
              dados={contratos}
              loading={loading}
              total={total}
              pagina={pagina}
              totalPaginas={totalPaginas}
              onPageChange={setPagina}
              onCardClick={handleRowClick}
              emptyMessage="Nenhum contrato encontrado"
            />
          ) : (
            <DataTable
              tipo="contrato"
              dados={contratos}
              loading={loading}
              total={total}
              pagina={pagina}
              totalPaginas={totalPaginas}
              onPageChange={setPagina}
              onRowClick={handleRowClick}
            />
          )}

          {receita8m?.length > 0 && (
            <ReceitaMensalChart
              data={receita8m}
              height={300}
              title="Receita Mensal"
              subtitle="Últimos 8 meses"
            />
          )}
        </main>
      </div>
    </>
  );
}