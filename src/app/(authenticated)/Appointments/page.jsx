// src/app/Components/ModalAgendamento/Appointments.jsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import PageHeader from "@/app/Components/PageHeader/PageHeader.jsx";
import { useAgendamentos } from "@/app/hooks/useAgendamentos";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";

// Componentes
import AppointmentsStats from "@/app/Components/ModalAgendamento/AppointmentsStats";
import AppointmentsWeekStatus from "@/app/Components/ModalAgendamento/AppointmentsWeekStatus";
import AppointmentsTable from "@/app/Components/ModalAgendamento/AppointmentsTable";
import AppointmentsMobile from "@/app/Components/ModalAgendamento/AppointmentsMobile";
import VisualizarModal from "@/app/Components/ModalAgendamento/VisualizarModal";
import ConfirmModal from "@/app/Components/ModalAgendamento/ConfirmModal";
import ModalRealizado from "@/app/Components/ModalAgendamento/ModalRealizado";
import NewAppointment from "@/app/Components/modal/Newappointment.jsx";
import ResultCard from "@/app/Components/Cards/ResultCard/ResultCard.jsx";


export default function Appointments() {
  const [visible, setVisible] = useState(false);
  const [abrirModal, setAbrirModal] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [inputBusca, setInputBusca] = useState("");
  const debounceRef = useRef(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Modal de Realizado/Faltou
  const [showModalRealizado, setShowModalRealizado] = useState(false);
  const [agendamentoParaRealizar, setAgendamentoParaRealizar] = useState(null);

  const {
    agendamentos, total, pagina, totalPaginas,
    loadingTabela, handleBusca, setPagina,
    totalHoje, semanaData, statusCount, statusCountVenda, loadingStats, // 👈 Adicionar statusCountVenda
    criarAgendamento, loadingCriar, erroCriar, sucessoCriar, agendamentoCriado, resetarCriacao,
    agendamentoSelecionado, modoModal,
    abrirVisualizar, abrirEditar, fecharModal,
    showResultadoVenda, agendamentoParaResultado, loadingResultado,
    abrirResultadoVenda, fecharResultadoVenda,
    confirmarResultadoVenda, confirmarRealizado, confirmarAgendamento, marcarComoFaltou,
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

  // PENDENTE → CONFIRMADO
  const handleConfirmarAgendamento = useCallback(async (codigo) => {
    await confirmarAgendamento(codigo);
  }, [confirmarAgendamento]);

  // CONFIRMADO → Abre modal Realizado/Faltou
  const handleAbrirModalRealizado = useCallback((agendamento) => {
    setAgendamentoParaRealizar(agendamento);
    setShowModalRealizado(true);
  }, []);

  // Modal Realizado: SIM → REALIZADO + abre venda
  const handleConfirmarRealizado = useCallback(async (codigo) => {
    await confirmarRealizado(codigo); // resultado_visita = REALIZADO
    setShowModalRealizado(false);

    const ag = agendamentos.find(a => a.codigo === codigo);
    if (ag) {
      abrirResultadoVenda({
        ...ag,
        resultado_visita: 'REALIZADO',  // 👈 Mudou de status para resultado_visita
        resultado_venda: 'PENDENTE'
      });
    }
  }, [confirmarRealizado, agendamentos, abrirResultadoVenda]);

  // Modal Realizado: NÃO → FALTOU
  const handleFaltou = useCallback(async (codigo) => {
    await marcarComoFaltou(codigo);
    setShowModalRealizado(false);
  }, [marcarComoFaltou]);

  // Resultado da venda
  const handleConfirmarResultado = useCallback(async (codigo, resultado) => {
    await confirmarResultadoVenda(codigo, resultado);
  }, [confirmarResultadoVenda]);

  // Editar
  const handleEditar = useCallback(async (codigo) => {
    fecharModal();
    await abrirEditar(codigo);
    setAbrirModal(true);
  }, [fecharModal, abrirEditar]);

  // Fechar modal de criação/edição
  const handleCloseModal = useCallback(async () => {
    setAbrirModal(false);
    fecharModal();
    await recarregar();
  }, [fecharModal, recarregar]);

  // Cancelar
  const pedirCancelamento = useCallback((codigo) => {
    setConfirm({ tipo: "cancelar", codigo });
  }, []);

  // Excluir
  const pedirExclusao = useCallback((codigo) => {
    setConfirm({ tipo: "excluir", codigo });
  }, []);

  // Confirmar ação do modal de confirmação
  const confirmarAcao = useCallback(async () => {
    if (!confirm) return;
    if (confirm.tipo === "cancelar") await cancelarAgendamento(confirm.codigo);
    if (confirm.tipo === "excluir") await excluir(confirm.codigo);
    setConfirm(null);
  }, [confirm, cancelarAgendamento, excluir]);

  return (
    <>
      {/* ═══════════ MODAIS ═══════════ */}

      {/* Modal de Confirmação (Cancelar/Excluir) */}
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
          onConfirmarAgendamento={handleConfirmarAgendamento}
          onConfirmarRealizado={handleAbrirModalRealizado}
          onResultadoVenda={abrirResultadoVenda}
          onCancelar={pedirCancelamento}
          onExcluir={pedirExclusao}
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

      {/* Modal Realizado/Faltou */}
      {showModalRealizado && agendamentoParaRealizar && (
        <ModalRealizado
          agendamento={agendamentoParaRealizar}
          onConfirm={handleConfirmarRealizado}
          onFaltou={handleFaltou}
          onClose={() => setShowModalRealizado(false)}
        />
      )}

      {/* ═══════════ CONTEÚDO PRINCIPAL ═══════════ */}
      <div className={styles.container}>
        <main className={`${styles.main} ${visible ? styles.mainVisible : ""}`}>

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

          {(erro || erroCriar) && (
            <div className={styles.errorBanner}>
              <AlertTriangle size={16} />
              <span>{erro || erroCriar}</span>
            </div>
          )}

          {sucessoCriar && agendamentoCriado && (
            <div className={styles.successBanner}>
              ✅ Agendamento {agendamentoCriado.codigo} criado com sucesso!
            </div>
          )}



          <AppointmentsWeekStatus
            semanaData={semanaData}
            statusCount={statusCount}
            statusCountVenda={statusCountVenda}  // 👈 Passar contagem de vendas
            loading={loadingStats}
          />
          {/*  */}
          {/* Tabela ou Cards */}
          {isMobile ? (
            <AppointmentsMobile
              agendamentos={agendamentos}
              loading={loadingTabela}
              onCardClick={(ag) => abrirVisualizar(ag.codigo)} // 👈 Clica no card = abre visualização
            />
          ) : (
            <AppointmentsTable
              agendamentos={agendamentos}
              loading={loadingTabela}
              total={total}
              pagina={pagina}
              totalPaginas={totalPaginas}/*  */
              busca={inputBusca}
              onBuscaChange={onChangeBusca}
              onPageChange={setPagina}
              onSelecionar={abrirVisualizar}
              onVisualizar={abrirVisualizar}
              onEditar={handleEditar}
              onConfirmarAgendamento={handleConfirmarAgendamento}
              onConfirmarRealizado={handleAbrirModalRealizado}
              onResultadoVenda={abrirResultadoVenda}
              onCancelar={pedirCancelamento}
              onExcluir={pedirExclusao}
            />
          )}
        </main>
      </div>
    </>
  );
}