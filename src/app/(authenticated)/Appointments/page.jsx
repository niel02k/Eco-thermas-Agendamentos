"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {Plus,CalendarCheck,CircleDollarSign,CheckCircle2,CalendarDays,Eye,Pencil,XCircle,Trash2,Clock3,Search,ChevronLeft,ChevronRight,AlertTriangle,} from "lucide-react";

import PageHeader from "@/app/Components/PageHeader/PageHeader.jsx";
import StatCard from "@/app/Components/StatCard/StatCard.jsx";
import { useAgendamentos } from "./useAgendamentos";
import styles from "./Appointments.module.css";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                     */
/* -------------------------------------------------------------------------- */

function formatarData(dataISO) {
  if (!dataISO) return "—";
  // data_visita vem como "YYYY-MM-DD"
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarHorario(horario) {
  if (!horario) return "—";
  return horario.slice(0, 5); // "HH:MM:SS" → "HH:MM"
}

const STATUS_MAP = {
  CONFIRMADO: { label: "Confirmado", cls: "statusConfirmed" },
  PENDENTE:   { label: "Pendente",   cls: "statusPending"   },
  CANCELADO:  { label: "Cancelado",  cls: "statusCanceled"  },
  REALIZADO:  { label: "Concluído",  cls: "statusFinished"  },
};

/* -------------------------------------------------------------------------- */
/* SUBCOMPONENTES                                                              */
/* -------------------------------------------------------------------------- */

/** Skeleton para linhas da tabela */
function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i}>
          <div className={styles.skeletonCell} />
        </td>
      ))}
    </tr>
  );
}

/** Skeleton para StatCard */
function SkeletonStat() {
  return <div className={styles.skeletonStat} />;
}

/** Modal de confirmação simples */
function ConfirmModal({ mensagem, onConfirm, onCancel }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <AlertTriangle size={28} color="#FA643C" />
        <p className={styles.modalMsg}>{mensagem}</p>
        <div className={styles.modalActions}>
          <button className={styles.modalCancel} onClick={onCancel}>
            Cancelar
          </button>
          <button className={styles.modalConfirm} onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENTE PRINCIPAL                                                        */
/* -------------------------------------------------------------------------- */

export default function AppointmentsPage() {
  const [visible, setVisible] = useState(false);

  // ── Confirmação de ação destrutiva ────────────────────────────
  const [confirm, setConfirm] = useState(null); // { tipo: 'cancelar'|'excluir', codigo }

  // ── Busca com debounce ────────────────────────────────────────
  const [inputBusca, setInputBusca] = useState("");
  const debounceRef = useRef(null);

  // ── Hook de dados ─────────────────────────────────────────────
  const {
    agendamentos,
    total,
    pagina,
    totalPaginas,
    loadingTabela,
    handleBusca,
    setPagina,
    totalHoje,
    semanaData,
    statusCount,
    loadingStats,
    cancelarAgendamento,
    excluir,
    erro,
  } = useAgendamentos();

  // ── Animação de entrada ───────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // ── Debounce na busca ─────────────────────────────────────────
  const onChangeBusca = useCallback(
    (e) => {
      const val = e.target.value;
      setInputBusca(val);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => handleBusca(val), 350);
    },
    [handleBusca]
  );

  // ── Ações com confirmação ─────────────────────────────────────
  const pedirCancelamento = (codigo) =>
    setConfirm({ tipo: "cancelar", codigo });

  const pedirExclusao = (codigo) =>
    setConfirm({ tipo: "excluir", codigo });

  const confirmarAcao = async () => {
    if (!confirm) return;
    if (confirm.tipo === "cancelar") await cancelarAgendamento(confirm.codigo);
    if (confirm.tipo === "excluir") await excluir(confirm.codigo);
    setConfirm(null);
  };

  const getStatusClass = (status) => styles[STATUS_MAP[status]?.cls ?? ""] ?? "";

  /* ------------------------------------------------------------------ */
  /* RENDER                                                               */
  /* ------------------------------------------------------------------ */
  return (
    <>
      {/* Modal de confirmação */}
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

      <div className={styles.container}>
        <main
          className={`${styles.mainContent} ${
            visible ? styles.mainVisible : ""
          }`}
        >
          <div className={styles.content}>
            <PageHeader
              title="Agendamentos"
              subtitle="Gestão operacional dos visitantes e reservas"
              badge={{ text: "Sistema Ativo", type: "success" }}
              actionLabel="Novo Agendamento"
              actionIcon={Plus}
              onAction={() => console.log("Novo agendamento")}
            />

            {/* ── Erro global ─────────────────────────────────── */}
            {erro && (
              <div className={styles.erroBar}>
                <AlertTriangle size={16} />
                {erro}
              </div>
            )}

            {/* ── STATS ─────────────────────────────────────── */}
            <div className={styles.statsGrid}>
              {loadingStats ? (
                <>
                  <SkeletonStat />
                  <SkeletonStat />
                  <SkeletonStat />
                  <SkeletonStat />
                </>
              ) : (
                <>
                  <div className={styles.cardEntry} style={{ animationDelay: "0ms" }}>
                    <StatCard
                      title="Hoje"
                      value={String(totalHoje)}
                      label="Agendamentos confirmados"
                      trend={0}
                      icon={CalendarCheck}
                      color="blue"
                    />
                  </div>
                  <div className={styles.cardEntry} style={{ animationDelay: "80ms" }}>
                    <StatCard
                      title="Semana"
                      value={String(
                        semanaData.reduce((acc, d) => acc + d.total, 0)
                      )}
                      label="Total na semana atual"
                      trend={0}
                      icon={CalendarDays}
                      color="green"
                    />
                  </div>
                  <div className={styles.cardEntry} style={{ animationDelay: "160ms" }}>
                    <StatCard
                      title="Confirmados"
                      value={String(statusCount.CONFIRMADO)}
                      label="Aguardando visita"
                      trend={0}
                      icon={CheckCircle2}
                      color="green"
                    />
                  </div>
                  <div className={styles.cardEntry} style={{ animationDelay: "240ms" }}>
                    <StatCard
                      title="Pendentes"
                      value={String(statusCount.PENDENTE)}
                      label="Aguardando confirmação"
                      trend={0}
                      icon={CircleDollarSign}
                      color="yellow"
                    />
                  </div>
                </>
              )}
            </div>

            {/* ── SEMANA + STATUS ─────────────────────────────── */}
            <div className={styles.scheduleRow}>
              {/* Grade da semana */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h2>Agenda da Semana</h2>
                    <p>Agendamentos por dia — semana atual</p>
                  </div>
                </div>
                <div className={styles.weekGrid}>
                  {loadingStats
                    ? [...Array(7)].map((_, i) => (
                        <div key={i} className={`${styles.dayCard} ${styles.skeletonDay}`} />
                      ))
                    : semanaData.map((item) => (
                        <div key={item.day} className={styles.dayCard}>
                          <span className={styles.dayName}>{item.day}</span>
                          <strong>{item.total}</strong>
                          <small>agend.</small>
                        </div>
                      ))}
                </div>
              </div>

              {/* Status */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h2>Status</h2>
                    <p>Resumo operacional</p>
                  </div>
                </div>
                <div className={styles.statusList}>
                  {[
                    { label: "Confirmados", color: "#3CC83C", key: "CONFIRMADO" },
                    { label: "Pendentes",   color: "#FAD228", key: "PENDENTE"   },
                    { label: "Cancelados",  color: "#FA643C", key: "CANCELADO"  },
                    { label: "Concluídos",  color: "#1E6EBE", key: "REALIZADO"  },
                  ].map(({ label, color, key }) => (
                    <div key={key} className={styles.statusItem}>
                      <div className={styles.statusDot} style={{ background: color }} />
                      <span>{label}</span>
                      <strong>
                        {loadingStats ? "—" : statusCount[key]}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── TABELA ──────────────────────────────────────── */}
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <div>
                  <h2>Agendamentos</h2>
                  <p>
                    {loadingTabela
                      ? "Carregando..."
                      : `${total} registro${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`}
                  </p>
                </div>

                {/* Busca */}
                <div className={styles.searchBox}>
                  <Search size={16} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Buscar por cliente ou código..."
                    value={inputBusca}
                    onChange={onChangeBusca}
                    className={styles.searchInput}
                  />
                </div>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Cliente</th>
                      <th>Data / Horário</th>
                      <th>Pessoas</th>
                      <th>Cidade</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTabela ? (
                      [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                    ) : agendamentos.length === 0 ? (
                      <tr>
                        <td colSpan={7} className={styles.emptyRow}>
                          Nenhum agendamento encontrado.
                        </td>
                      </tr>
                    ) : (
                      agendamentos.map((ag) => (
                        <tr key={ag.codigo}>
                          <td>
                            <span className={styles.codBadge}>{ag.codigo}</span>
                          </td>
                          <td>
                            <div className={styles.clienteCell}>
                              <span className={styles.clienteNome}>
                                {ag.cliente?.nome ?? "—"}
                              </span>
                              <span className={styles.clienteTel}>
                                {ag.cliente?.telefone ?? ""}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.dataCell}>
                              <span>{formatarData(ag.data_visita)}</span>
                              <span className={styles.horario}>
                                {formatarHorario(ag.horario_visita)}
                              </span>
                            </div>
                          </td>
                          <td>{ag.quantidade_pessoas}</td>
                          <td>{ag.cidade ?? "—"}</td>
                          <td>
                            <span
                              className={`${styles.statusBadge} ${getStatusClass(ag.status)}`}
                            >
                              {STATUS_MAP[ag.status]?.label ?? ag.status}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actions}>
                              <button
                                className={styles.actionButton}
                                title="Visualizar"
                                onClick={() => console.log("ver", ag.codigo)}
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                className={styles.actionButton}
                                title="Editar"
                                onClick={() => console.log("editar", ag.codigo)}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                className={`${styles.actionButton} ${styles.cancelButton}`}
                                title="Cancelar"
                                disabled={ag.status === "CANCELADO" || ag.status === "REALIZADO"}
                                onClick={() => pedirCancelamento(ag.codigo)}
                              >
                                <XCircle size={15} />
                              </button>
                              <button
                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                title="Excluir"
                                onClick={() => pedirExclusao(ag.codigo)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageBtn}
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={pagina === 1 || loadingTabela}
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </button>

                  <span className={styles.pageInfo}>
                    Página {pagina} de {totalPaginas}
                    <span className={styles.pageTotal}> · {total} registros</span>
                  </span>

                  <button
                    className={styles.pageBtn}
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                    disabled={pagina === totalPaginas || loadingTabela}
                  >
                    Próximo
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* ── ATIVIDADE RECENTE ─────────────────────────── */}
            {/* Mostra os últimos 5 agendamentos carregados como feed */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>Últimas Entradas</h2>
                  <p>Registros mais recentes do sistema</p>
                </div>
              </div>

              <div className={styles.activityList}>
                {loadingTabela
                  ? [...Array(4)].map((_, i) => (
                      <div key={i} className={styles.skeletonActivity} />
                    ))
                  : agendamentos.slice(0, 5).map((ag) => {
                      const { color } =
                        {
                          CONFIRMADO: { color: "#3CC83C" },
                          PENDENTE:   { color: "#FAD228" },
                          CANCELADO:  { color: "#FA643C" },
                          REALIZADO:  { color: "#1E6EBE" },
                        }[ag.status] ?? { color: "#94a3b8" };

                      return (
                        <div key={ag.codigo} className={styles.activityItem}>
                          <div
                            className={styles.activityAvatar}
                            style={{ backgroundColor: color }}
                          >
                            <Clock3 size={16} />
                          </div>
                          <div className={styles.activityInfo}>
                            <span className={styles.activityName}>
                              {ag.cliente?.nome ?? ag.codigo}
                            </span>
                            <span className={styles.activityAction}>
                              {ag.cidade} · {ag.quantidade_pessoas} pessoa
                              {ag.quantidade_pessoas !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <span className={styles.activityTime}>
                            {formatarData(ag.data_visita)}{" "}
                            {formatarHorario(ag.horario_visita)}
                          </span>
                        </div>
                      );
                    })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
