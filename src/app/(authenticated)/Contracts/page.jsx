"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import PageHeader from "@/app/Components/PageHeader/PageHeader.jsx";
import styles from "./Contracts.module.css";
import { useContratos } from "@/app/hooks/contratos/index.js";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";

// Componentes
import ContractsFilters from "@/app/Components/ModalContrato/ContractsFilters.jsx";
import ContractsKPIs from "@/app/Components/ModalContrato/ContractsKPIs.jsx";
import ContractsInsights from "@/app/Components/ModalContrato/ContractsInsights.jsx";
import FormContrato from "@/app/Components/ModalContrato/Form/formcontrato.jsx";
import VisualizarModal from "@/app/Components/Shared/VisualizarModal.jsx";
import MobileList from "@/app/Components/Shared/MobileList.jsx";
import DataTable from "@/app/Components/Shared/DataTable.jsx";

export default function Contracts() {
  const [visible, setVisible] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [showCriarContrato, setShowCriarContrato] = useState(false);
  const [showEditarContrato, setShowEditarContrato] = useState(false);
  const [contratoParaEditar, setContratoParaEditar] = useState(null);

  const {
    contratos,
    total,
    pagina,
    totalPaginas,
    busca,
    filtroStatus,
    loading,
    erro,
    setErro,
    setPagina,
    setBusca,
    setFiltroStatus,
    carregarContratos,
    contratoSelecionado,
    modalAberto,
    setModalAberto,
    buscarContrato,
    buscarContratoDetalhe,
    excluirContrato,
    criarContrato,
    editarContrato,
    loadingAcao,
    erroAcao,
    resumoGeral,
    rankingVendedores,
    statusContratos,
    rankingCidades,
    ticketInfo,
    receita8m,
    recarregarTudo,
  } = useContratos();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleRowClick = useCallback((contrato) => {
    buscarContrato(contrato.id);
  }, [buscarContrato]);

  const handleEditar = useCallback(async (id) => {
    setModalAberto();
    const contrato = await buscarContratoDetalhe(id);
    if (contrato) {
      setContratoParaEditar(contrato);
      setShowEditarContrato(true);
    }
  }, [setModalAberto, buscarContratoDetalhe]);

  const handleExcluir = useCallback(async (id) => {
    if (!confirm("Tem certeza que deseja excluir este contrato?")) return;
    await excluirContrato(id);
    recarregarTudo();
  }, [excluirContrato, recarregarTudo]);


  const handleBuscaChange = useCallback((novaBusca) => {
    setBusca(novaBusca);
    setPagina(1);
  }, [setBusca, setPagina]);

  const handleStatusChange = useCallback((novoStatus) => {
    setFiltroStatus(novoStatus);
    setPagina(1);
  }, [setFiltroStatus, setPagina]);

  return (
    <>
      {/* Modais */}
      {modalAberto && contratoSelecionado && (
        <VisualizarModal
          tipo="contrato"
          contrato={contratoSelecionado}
          onClose={setModalAberto}
          onEditar={handleEditar}
          onExcluirContrato={handleExcluir}
        />
      )}

      {showCriarContrato && (
        <FormContrato
          onClose={() => setShowCriarContrato(false)}
          onSuccess={() => setShowCriarContrato(false)}
          criarContrato={criarContrato}
          editarContrato={editarContrato}
          loading={loadingAcao}
          erro={erroAcao}
        />
      )}

      {showEditarContrato && contratoParaEditar && (
        <FormContrato
          contrato={contratoParaEditar}
          onClose={() => {
            setShowEditarContrato(false);
            setContratoParaEditar(null);
          }}
          onSuccess={() => {
            setShowEditarContrato(false);
            setContratoParaEditar(null);
          }}
          criarContrato={criarContrato}
          editarContrato={editarContrato}
          loading={loadingAcao}
          erro={erroAcao}
        />
      )}

      {/* Conteúdo Principal */}
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
            onBuscaChange={handleBuscaChange}
            onBuscaSubmit={() => setPagina(1)}
            onStatusChange={handleStatusChange}
            onRefresh={recarregarTudo}
          />

          {erro && (
            <div className={styles.errorBanner}>
              <span>{erro}</span>
              <button onClick={() => setErro(null)}>✕</button>
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
            rankingCidades={rankingCidades}
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

          
        </main>
      </div>
    </>
  );
}