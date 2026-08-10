// src/app/(authenticated)/Appointments/page.jsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import PageHeader from "@/app/Components/PageHeader/PageHeader.jsx";
import { useAgendamentos } from "@/app/hooks/agendamentos/index.js";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import styles from "./Appointments.module.css";

// Componentes
import AppointmentsWeekStatus from "@/app/Components/ModalAgendamento/AppointmentsWeekStatus.jsx";
import VisualizarModal from "@/app/Components/Shared/VisualizarModal.jsx";
import ConfirmModal from "@/app/Components/ModalAgendamento/ConfirmModal.jsx";
import ModalRealizado from "@/app/Components/ModalAgendamento/ModalRealizado.jsx";
import NewAppointment from "@/app/Components/modal/Newappointment.jsx";
import ResultCard from "@/app/Components/Cards/ResultCard/ResultCard.jsx";
import MobileList from "@/app/Components/Shared/MobileList.jsx";
import DataTable from "@/app/Components/Shared/DataTable.jsx";

export default function AppointmentsPage() {
  const [visible, setVisible] = useState(false);
  const [abrirModal, setAbrirModal] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [inputBusca, setInputBusca] = useState("");
  const debounceRef = useRef(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [showModalRealizado, setShowModalRealizado] = useState(false);
  const [agendamentoParaRealizar, setAgendamentoParaRealizar] = useState(null);

  const {
    agendamentos, total, pagina, totalPaginas,
    loadingTabela, handleBusca, setPagina,
    semanaData, statusCount, statusCountVenda, loadingStats,
    agendamentoSelecionado, modoModal,
    abrirVisualizar, abrirEditar, fecharModal,
    showResultadoVenda, agendamentoParaResultado, loadingResultado,
    abrirResultadoVenda, fecharResultadoVenda,
    confirmarResultadoVenda, confirmarRealizado, confirmarAgendamento, marcarComoFaltou,
    cancelarAgendamento, excluir,
    erro, recarregar,handleFiltroDataChange,
  } = useAgendamentos(); 

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const onChangeBusca = useCallback((e) => {
    const val = e.target.value;
    setInputBusca(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleBusca(val), 350);
  }, [handleBusca]);

  const handleConfirmarAgendamento = useCallback(async (codigo) => {
    await confirmarAgendamento(codigo);
  }, [confirmarAgendamento]);

  const handleAbrirModalRealizado = useCallback((agendamento) => {
    setAgendamentoParaRealizar(agendamento);
    setShowModalRealizado(true);
  }, []);


  const handleConfirmarRealizado = useCallback(async (codigo) => {
    await confirmarRealizado(codigo);
    setShowModalRealizado(false);
    const ag = agendamentos.find(a => a.codigo === codigo);
    if (ag) {
      abrirResultadoVenda({ ...ag, resultado_visita: 'REALIZADO', resultado_venda: 'PENDENTE' });
    }
  }, [confirmarRealizado, agendamentos, abrirResultadoVenda]);

  const handleFaltou = useCallback(async (codigo) => {
    await marcarComoFaltou(codigo);
    setShowModalRealizado(false);
  }, [marcarComoFaltou]);

  const handleConfirmarResultado = useCallback(async (codigo, resultado) => {
    await confirmarResultadoVenda(codigo, resultado);
  }, [confirmarResultadoVenda]);

  const handleEditar = useCallback(async (codigo) => {
    fecharModal();
    await abrirEditar(codigo);
    setAbrirModal(true);
  }, [fecharModal, abrirEditar]);

  const handleCloseModal = useCallback(async () => {
    setAbrirModal(false);
    fecharModal();
    await recarregar();
  }, [fecharModal, recarregar]);

  const pedirCancelamento = useCallback((codigo) => setConfirm({ tipo: "cancelar", codigo }), []);
  const pedirExclusao = useCallback((codigo) => setConfirm({ tipo: "excluir", codigo }), []);

  const confirmarAcao = useCallback(async () => {
    if (!confirm) return;
    if (confirm.tipo === "cancelar") await cancelarAgendamento(confirm.codigo);
    if (confirm.tipo === "excluir") await excluir(confirm.codigo);
    setConfirm(null);
  }, [confirm, cancelarAgendamento, excluir]);

  return (
    <>
      {/* ═══════════ MODAIS ═══════════ */}
      {confirm && (
        <ConfirmModal
          mensagem={confirm.tipo === "cancelar" ? "Deseja cancelar este agendamento?" : "Deseja excluir permanentemente este agendamento?"}
          onConfirm={confirmarAcao}
          onCancel={() => setConfirm(null)}
        />
      )}

      {modoModal === 'visualizar' && agendamentoSelecionado && (
        <VisualizarModal
          tipo="agendamento"
          agendamento={agendamentoSelecionado}
          onClose={fecharModal}
          onEditar={handleEditar}
          onConfirmarAgendamento={handleConfirmarAgendamento}
          onConfirmarRealizado={handleAbrirModalRealizado}
          onResultadoVenda={abrirResultadoVenda}
          onCancelar={pedirCancelamento}
          onExcluir={pedirExclusao}
        />
      )}

      {showResultadoVenda && agendamentoParaResultado && (
        <ResultCard agendamento={agendamentoParaResultado} onConfirm={handleConfirmarResultado} onCancel={fecharResultadoVenda} loading={loadingResultado} />
      )}

      {abrirModal && (
        <NewAppointment onClose={handleCloseModal} dadosEdicao={modoModal === 'editar' ? agendamentoSelecionado : null} />
      )}

      {showModalRealizado && agendamentoParaRealizar && (
        <ModalRealizado agendamento={agendamentoParaRealizar} onConfirm={handleConfirmarRealizado} onFaltou={handleFaltou} onClose={() => setShowModalRealizado(false)} />
      )}

      {/* ═══════════ CONTEÚDO PRINCIPAL ═══════════ */}
      <div className={styles.container}>
        <main className={`${styles.main} ${visible ? styles.mainVisible : ""}`}>
          <PageHeader title="Agendamentos" subtitle="Gestão operacional dos visitantes e reservas"
            badge={{ text: "Sistema Ativo", type: "success" }} actionLabel="Novo Agendamento" actionIcon={Plus}
            onAction={() => { fecharModal(); setAbrirModal(true); }} />

          {erro && <div className={styles.errorBanner}><AlertTriangle size={16} /><span>{erro}</span></div>}

          <AppointmentsWeekStatus semanaData={semanaData} statusCount={statusCount} statusCountVenda={statusCountVenda} loading={loadingStats} />

          {isMobile ? (
            <MobileList tipo="agendamento" dados={agendamentos} loading={loadingTabela} total={total} pagina={pagina} totalPaginas={totalPaginas}
              onPageChange={setPagina} onCardClick={(ag) => abrirVisualizar(ag.codigo)} emptyMessage="Nenhum agendamento encontrado" />
          ) : (
           <DataTable
  tipo="agendamento"
  dados={agendamentos}
  loading={loadingTabela}
  total={total}
  pagina={pagina}
  totalPaginas={totalPaginas}
  busca={inputBusca}
  onBuscaChange={onChangeBusca}
  onPageChange={setPagina}
  onRowClick={(ag) => abrirVisualizar(ag.codigo)}
  onFiltroDataChange={handleFiltroDataChange}
  showExport={true}
  showSearch={true}
/>
          )}
        </main>
      </div>
    </>
  );
}