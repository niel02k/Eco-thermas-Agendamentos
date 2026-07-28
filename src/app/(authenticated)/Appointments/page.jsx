// src/app/Components/ModalAgendamento/Appointments.jsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import PageHeader from "@/app/Components/PageHeader/PageHeader.jsx";
import { useAgendamentos } from "@/app/hooks/useAgendamentos";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";

// Componentes
import AppointmentsStats from "@/app/components/ModalAgendamento/AppointmentsStats.jsx";
import AppointmentsWeekStatus from "@/app/components/ModalAgendamento/AppointmentsWeekStatus.jsx";
import AppointmentsTable from "@/app/components/ModalAgendamento/AppointmentsTable.jsx";
import AppointmentsMobile from "@/app/components/ModalAgendamento/AppointmentsMobile.jsx";
import AppointmentsRecent from "@/app/components/ModalAgendamento/AppointmentsRecent.jsx";
import VisualizarModal from "@/app/components/ModalAgendamento/VisualizarModal.jsx";
import ConfirmModal from "@/app/components/ModalAgendamento/ConfirmModal.jsx";
import NewAppointment from "@/app/Components/modal/Newappointment.jsx";
import ResultCard from "@/app/Components/Cards/ResultCard/ResultCard.jsx";

export default function Appointments() {
  const [visible, setVisible] = useState(false);
  const [abrirModal, setAbrirModal] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [inputBusca, setInputBusca] = useState("");
  const debounceRef = useRef(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
    agendamentos, total, pagina, totalPaginas,
    loadingTabela, handleBusca, setPagina,
    totalHoje, semanaData, statusCount, loadingStats,
    criarAgendamento, loadingCriar, erroCriar, sucessoCriar, agendamentoCriado, resetarCriacao,
    agendamentoSelecionado, modoModal,
    abrirVisualizar, abrirEditar, fecharModal,
    showResultadoVenda, agendamentoParaResultado, loadingResultado,
    abrirResultadoVenda, fecharResultadoVenda,
    confirmarResultadoVenda, confirmarRealizado,
    cancelarAgendamento, excluir,
    erro, recarregar,
  } = useAgendamentos();

  // ─── Animação ──────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // ─── Sucesso ao criar ──────────────────────────────
  useEffect(() => {
    if (sucessoCriar) {
      setAbrirModal(false);
      resetarCriacao();
    }
  }, [sucessoCriar, resetarCriacao]);

  // ─── Busca com debounce ────────────────────────────
  const onChangeBusca = useCallback((e) => {
    const val = e.target.value;
    setInputBusca(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleBusca(val), 350);
  }, [handleBusca]);

  // ─── Handlers ──────────────────────────────────────
  const handleConfirmarResultado = useCallback(async (codigo, resultado) => {
    await confirmarResultadoVenda(codigo, resultado);
  }, [confirmarResultadoVenda]);

  // src/app/(authenticated)/Appointments/Appointments.jsx

const handleConfirmarRealizado = useCallback(async (codigo) => {
  // 1. Pega o agendamento atual da lista
  const ag = agendamentos.find(a => a.codigo === codigo);
  
  // 2. Abre o modal IMEDIATAMENTE com os dados atuais
  if (ag) {
    abrirResultadoVenda({ 
      ...ag, 
      status: 'REALIZADO', 
      resultado_venda: 'PENDENTE' 
    });
  }

  // 3. Marca como realizado em background
  try {
    await confirmarRealizado(codigo);
  } catch (e) {
    console.error('Erro ao confirmar:', e);
  }
}, [agendamentos, abrirResultadoVenda, confirmarRealizado]);

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

  const pedirCancelamento = useCallback((codigo) => {
    setConfirm({ tipo: "cancelar", codigo });
  }, []);

  const pedirExclusao = useCallback((codigo) => {
    setConfirm({ tipo: "excluir", codigo });
  }, []);

  const confirmarAcao = useCallback(async () => {
    if (!confirm) return;
    if (confirm.tipo === "cancelar") await cancelarAgendamento(confirm.codigo);
    if (confirm.tipo === "excluir") await excluir(confirm.codigo);
    setConfirm(null);
  }, [confirm, cancelarAgendamento, excluir]);


  

  return (
    <>
      {/* Modal de Confirmação */}
      {confirm && (
        <ConfirmModal
          mensagem={
            confirm.tipo === "cancelar"
              ? "Deseja cancelar este agendamento?"
              : "Deseja excluir permanentemente este agendamento?"
          }
          onConfirm={confirmarAcao}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Modal de Visualização */}
      {modoModal === 'visualizar' && agendamentoSelecionado && (
        <VisualizarModal
          agendamento={agendamentoSelecionado}
          onClose={fecharModal}
          onEditar={handleEditar}
        />
      )}

      {/* Modal de Resultado de Venda */}
      {showResultadoVenda && agendamentoParaResultado && (
        <ResultCard
          agendamento={agendamentoParaResultado}
          onConfirm={handleConfirmarResultado}
          onCancel={fecharResultadoVenda}
          loading={loadingResultado}
        />
      )}

      {/* Modal de Criar/Editar */}
      {abrirModal && (
        <NewAppointment
          onClose={handleCloseModal}
          dadosEdicao={modoModal === 'editar' ? agendamentoSelecionado : null}
        />
      )}

      <div className={styles.container}>
        <main className={`${styles.main} ${visible ? styles.mainVisible : ""}`}>
          
          {/* Header */}
          <PageHeader
            title="Agendamentos"
            subtitle="Gestão operacional dos visitantes e reservas"
            badge={{ text: "Sistema Ativo", type: "success" }}
            actionLabel="Novo Agendamento"
            actionIcon={Plus}
            onAction={() => {
              fecharModal();
              setAbrirModal(true);
            }}
          />

          {/* Erro */}
          {(erro || erroCriar) && (
            <div className={styles.errorBanner}>
              <AlertTriangle size={16} />
              <span>{erro || erroCriar}</span>
            </div>
          )}

          {/* Sucesso */}
          {sucessoCriar && agendamentoCriado && (
            <div className={styles.successBanner}>
              ✅ Agendamento {agendamentoCriado.codigo} criado com sucesso!
            </div>
          )}

          {/* Estatísticas */}
          <AppointmentsStats
            totalHoje={totalHoje}
            semanaData={semanaData}
            statusCount={statusCount}
            loading={loadingStats}
          />

          {/* Agenda + Status */}
          <AppointmentsWeekStatus
            semanaData={semanaData}
            statusCount={statusCount}
            loading={loadingStats}
          />

          {/* Busca */}
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Buscar por nome, código ou CPF..."
              value={inputBusca}
              onChange={onChangeBusca}
              className={styles.searchInput}
            />
          </div>

          {/* Tabela ou Cards */}
          {isMobile ? (
            <AppointmentsMobile
              agendamentos={agendamentos}
              loading={loadingTabela}
              onVisualizar={abrirVisualizar}
              onEditar={handleEditar}
              onConfirmarRealizado={handleConfirmarRealizado}
              onResultadoVenda={abrirResultadoVenda}
              onCancelar={pedirCancelamento}
              onExcluir={pedirExclusao}
            />
          ) : (
            <AppointmentsTable
              agendamentos={agendamentos}
              loading={loadingTabela}
              total={total}
              pagina={pagina}
              totalPaginas={totalPaginas}
              onPageChange={setPagina}
              onVisualizar={abrirVisualizar}
              onEditar={handleEditar}
              onConfirmarRealizado={handleConfirmarRealizado}
              onResultadoVenda={abrirResultadoVenda}
              onCancelar={pedirCancelamento}
              onExcluir={pedirExclusao}
            />
          )}

          {/* Últimas Entradas */}
          <AppointmentsRecent
            agendamentos={agendamentos}
            loading={loadingTabela}
          />
        </main>
      </div>
    </>
  );
}