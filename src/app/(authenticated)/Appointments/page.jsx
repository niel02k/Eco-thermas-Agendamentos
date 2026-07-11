"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Plus, CalendarCheck, CircleDollarSign, CheckCircle2, CalendarDays,
  Eye, Pencil, XCircle, Trash2, Clock3, Search,
  ChevronLeft, ChevronRight, AlertTriangle, X, User, Users, MapPin,
} from "lucide-react";

import PageHeader from "@/app/Components/PageHeader/PageHeader.jsx";
import StatCard from "@/app/Components/StatCard/StatCard.jsx";
import { useAgendamentos } from "@/app/hooks/useAgendamentos.js";
import styles from "./Appointments.module.css";
import NewAppointment from "@/app/Components/modal/Newappointment";
import ResultCard from "@/app/Components/ResultCard/ResultCard.jsx";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                     */
/* -------------------------------------------------------------------------- */

function formatarData(dataISO) {
  if (!dataISO) return "—";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarDataExtenso(dataISO) {
  if (!dataISO) return "—";
  return new Date(dataISO + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatarHorario(horario) {
  if (!horario) return "—";
  return horario.slice(0, 5);
}

function formatarDataExtensa(dataISO) {
  if (!dataISO) return "—";
  return new Date(dataISO + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}



const STATUS_MAP = {
  CONFIRMADO: { label: "Confirmado", cls: "statusConfirmed", color: "#3CC83C" },
  PENDENTE: { label: "Pendente", cls: "statusPending", color: "#FAD228" },
  CANCELADO: { label: "Cancelado", cls: "statusCanceled", color: "#FA643C" },
  REALIZADO: { label: "Concluído", cls: "statusFinished", color: "#1E6EBE" },
};

/* -------------------------------------------------------------------------- */
/* SUBCOMPONENTES                                                              */
/* -------------------------------------------------------------------------- */

function SkeletonRow() {
  return (
    <tr>
      {[...Array(7)].map((_, i) => (
        <td key={i}><div className={styles.skeletonCell} /></td>
      ))}
    </tr>
  );
}

function SkeletonStat() {
  return <div className={styles.skeletonStat} />;
}

function ConfirmModal({ mensagem, onConfirm, onCancel }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <AlertTriangle size={28} color="#FA643C" />
        <p className={styles.modalMsg}>{mensagem}</p>
        <div className={styles.modalActions}>
          <button className={styles.modalCancel} onClick={onCancel}>Cancelar</button>
          <button className={styles.modalConfirm} onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

/** Modal de Visualização do Agendamento */
function VisualizarModal({ agendamento, onClose, onEditar }) {
  if (!agendamento) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalDetalhe} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalDetalheHeader}>
          <div>
            <h2>Agendamento {agendamento.codigo}</h2>
            <span className={`${styles.statusBadge} ${styles[STATUS_MAP[agendamento.status]?.cls]}`}>
              {STATUS_MAP[agendamento.status]?.label}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className={styles.actionButton} onClick={() => onEditar(agendamento.codigo)}>
              <Pencil size={16} />
            </button>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={styles.modalDetalheBody}>
          {/* Cliente */}
          <div className={styles.detalheSection}>
            <h3><User size={16} /> Cliente</h3>
            <div className={styles.detalheGrid}>
              <div>
                <label>Nome</label>
                <p>{agendamento.cliente?.nome || "—"}</p>
              </div>
              <div>
                <label>CPF</label>
                <p>{agendamento.cliente?.cpf || "—"}</p>
              </div>
              <div>
                <label>Telefone</label>
                <p>{agendamento.cliente?.telefone || "—"}</p>
              </div>
              <div>
                <label>E-mail</label>
                <p>{agendamento.cliente?.email || "—"}</p>
              </div>
            </div>
          </div>

          {/* Agendamento */}
          <div className={styles.detalheSection}>
            <h3><CalendarDays size={16} /> Agendamento</h3>
            <div className={styles.detalheGrid}>
              <div>
                <label>Data</label>
                <p>{formatarDataExtensa(agendamento.data_visita)}</p>
              </div>
              <div>
                <label>Horário</label>
                <p>{formatarHorario(agendamento.horario_visita)}</p>
              </div>
              <div>
                <label>Pessoas</label>
                <p>{agendamento.quantidade_pessoas}</p>
              </div>
              <div>
                <label>Cidade</label>
                <p><MapPin size={14} style={{ display: 'inline' }} /> {agendamento.cidade || "—"}</p>
              </div>
            </div>
          </div>

          {/* Dependentes */}
          {agendamento.dependentes && agendamento.dependentes.length > 0 && (
            <div className={styles.detalheSection}>
              <h3><Users size={16} /> Dependentes ({agendamento.dependentes.length})</h3>
              <div className={styles.dependentesList}>
                {agendamento.dependentes.map((dep, i) => (
                  <div key={i} className={styles.dependenteItem}>
                    <span className={styles.dependenteNome}>
                      {i + 1}. {dep.nome}
                    </span>
                    <span className={styles.dependenteInfo}>
                      {dep.idade} anos {dep.cpf ? `· CPF: ${dep.cpf}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          {agendamento.observacoes && (
            <div className={styles.detalheSection}>
              <h3>Observações</h3>
              <p className={styles.observacoes}>{agendamento.observacoes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalDetalheFooter}>
          <button className={styles.btnFechar} onClick={onClose}>
            Fechar
          </button>
          <button className={styles.btnEditar} onClick={() => onEditar(agendamento.codigo)}>
            <Pencil size={16} /> Editar
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
  const [abrirModal, setAbrirModal] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [inputBusca, setInputBusca] = useState("");
  const debounceRef = useRef(null);

  const {
    // Tabela
    agendamentos, total, pagina, totalPaginas,
    loadingTabela, handleBusca, setPagina,

    // Stats
    totalHoje, semanaData, statusCount, loadingStats,

    // Criar
    criarAgendamento, loadingCriar, erroCriar,
    sucessoCriar, agendamentoCriado, resetarCriacao,

    // Visualizar/Editar
    agendamentoSelecionado, loadingDetalhe, modoModal,
    abrirVisualizar, abrirEditar, fecharModal,

    // Resultado de Venda 👈
    showResultadoVenda,
    agendamentoParaResultado,
    loadingResultado,
    abrirResultadoVenda,
    fecharResultadoVenda,
    confirmarResultadoVenda,
    confirmarRealizado,

    // Ações
    cancelarAgendamento, excluir,
    erro,
  } = useAgendamentos();


  const handleConfirmarResultado = async (codigo, resultado) => {
    await confirmarResultadoVenda(codigo, resultado);
  };


  const handleConfirmarRealizado = async (codigo) => {
    await confirmarRealizado(codigo);
  };
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (sucessoCriar) {
      setAbrirModal(false);
      resetarCriacao();
    }
  }, [sucessoCriar, resetarCriacao]);

  const onChangeBusca = useCallback(
    (e) => {
      const val = e.target.value;
      setInputBusca(val);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => handleBusca(val), 350);
    },
    [handleBusca]
  );

  const pedirCancelamento = (codigo) => setConfirm({ tipo: "cancelar", codigo });
  const pedirExclusao = (codigo) => setConfirm({ tipo: "excluir", codigo });

  const confirmarAcao = async () => {
    if (!confirm) return;
    if (confirm.tipo === "cancelar") await cancelarAgendamento(confirm.codigo);
    if (confirm.tipo === "excluir") await excluir(confirm.codigo);
    setConfirm(null);
  };

  const handleCriarAgendamento = async (dados) => {
    await criarAgendamento({
      cliente_id: dados.cliente_id,
      vendedor_id: dados.vendedor_id,
      data_visita: dados.data_visita,
      horario_visita: dados.horario_visita,
      quantidade_pessoas: dados.quantidade_pessoas,
      observacoes: dados.observacoes,
      cidade: dados.cidade,
      dependentes: dados.dependentes,
    });
  };

  // ── Handler para editar (abre modal de criação em modo edição) ──


  const getStatusClass = (status) => styles[STATUS_MAP[status]?.cls ?? ""] ?? "";


   const handleEditar = async (codigo) => {
    fecharModal(); // Fecha visualização se estiver aberta
    await abrirEditar(codigo); // 👈 Carrega os dados do agendamento no hook
    setAbrirModal(true); // Abre o modal
  };
  return (
    <>
      {/* Modal de confirmação (Cancelar/Excluir) */}
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

      {/* 👇 Modal de Resultado de Venda */}
      {showResultadoVenda && agendamentoParaResultado && (
        <ResultCard
          agendamento={agendamentoParaResultado}
          onConfirm={handleConfirmarResultado}
          onCancel={fecharResultadoVenda}
          loading={loadingResultado}
        />
      )}

      {/* Modal de Novo/Editar Agendamento */}
      {abrirModal && (
        <NewAppointment
          onClose={() => {
            setAbrirModal(false);
            resetarCriacao();
          }}
          onSubmit={handleCriarAgendamento}
          loading={loadingCriar}
          erro={erroCriar}
          sucesso={sucessoCriar}
          agendamentoCriado={agendamentoCriado}
          dadosEdicao={modoModal === 'editar' ? agendamentoSelecionado : null}
        />
      )}

      <div className={styles.container}>
        <main className={`${styles.mainContent} ${visible ? styles.mainVisible : ""}`}>
          <div className={styles.content}>

            <PageHeader
              title="Agendamentos"
              subtitle="Gestão operacional dos visitantes e reservas"
              badge={{ text: "Sistema Ativo", type: "success" }}
              actionLabel="Novo Agendamento"
              actionIcon={Plus}
              onAction={() => {
                setAbrirModal(true);
                fecharModal(); // Garante que não abre em modo edição
              }}
            />

            {/* Erro */}
            {(erro || erroCriar) && (
              <div className={styles.erroBar}>
                <AlertTriangle size={16} />
                {erro || erroCriar}
              </div>
            )}

            {/* Sucesso */}
            {sucessoCriar && agendamentoCriado && (
              <div className={styles.sucessoBar}>
                <CheckCircle2 size={16} />
                Agendamento {agendamentoCriado.codigo} criado com sucesso!
              </div>
            )}

            {/* STATS */}
            <div className={styles.statsGrid}>
              {loadingStats ? (
                <><SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat /></>
              ) : (
                <>
                  <div className={styles.cardEntry}>
                    <StatCard title="Hoje" value={String(totalHoje)} label="Agendamentos hoje" trend={0} icon={CalendarCheck} color="blue" />
                  </div>
                  <div className={styles.cardEntry}>
                    <StatCard title="Semana" value={String(semanaData.reduce((acc, d) => acc + d.total, 0))} label="Total na semana" trend={0} icon={CalendarDays} color="green" />
                  </div>
                  <div className={styles.cardEntry}>
                    <StatCard title="Confirmados" value={String(statusCount.CONFIRMADO)} label="Aguardando visita" trend={0} icon={CheckCircle2} color="green" />
                  </div>
                  <div className={styles.cardEntry}>
                    <StatCard title="Pendentes" value={String(statusCount.PENDENTE)} label="Aguardando confirmação" trend={0} icon={CircleDollarSign} color="yellow" />
                  </div>
                </>
              )}
            </div>

            {/* SEMANA + STATUS */}
            <div className={styles.scheduleRow}>
              <div className={styles.card}>
                <div className={styles.cardHeader}><div><h2>Agenda da Semana</h2><p>Agendamentos por dia</p></div></div>
                <div className={styles.weekGrid}>
                  {loadingStats
                    ? [...Array(7)].map((_, i) => <div key={i} className={`${styles.dayCard} ${styles.skeletonDay}`} />)
                    : semanaData.map((item) => (
                      <div key={item.day} className={styles.dayCard}>
                        <span className={styles.dayName}>{item.day}</span>
                        <strong>{item.total}</strong>
                        <small>agend.</small>
                      </div>
                    ))}
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardHeader}><div><h2>Status</h2><p>Resumo operacional</p></div></div>
                <div className={styles.statusList}>
                  {["CONFIRMADO", "PENDENTE", "CANCELADO", "REALIZADO"].map((key) => (
                    <div key={key} className={styles.statusItem}>
                      <div className={styles.statusDot} style={{ background: STATUS_MAP[key]?.color }} />
                      <span>{STATUS_MAP[key]?.label}</span>
                      <strong>{loadingStats ? "—" : statusCount[key]}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TABELA */}
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <div>
                  <h2>Agendamentos</h2>
                  <p>{loadingTabela ? "Carregando..." : `${total} registro${total !== 1 ? "s" : ""}`}</p>
                </div>
                <div className={styles.searchBox}>
                  <Search size={16} color="#94a3b8" />
                  <input type="text" placeholder="Buscar..." value={inputBusca} onChange={onChangeBusca} className={styles.searchInput} />
                </div>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Código</th><th>Cliente</th><th>Data / Horário</th>
                      <th>Pessoas</th><th>Cidade</th><th>Status</th><th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTabela ? (
                      [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                    ) : agendamentos.length === 0 ? (
                      <tr><td colSpan={7} className={styles.emptyRow}>Nenhum agendamento encontrado.</td></tr>
                    ) : (
                      agendamentos.map((ag) => (
                        <tr key={ag.codigo}>
                          <td><span className={styles.codBadge}>{ag.codigo}</span></td>
                          <td>
                            <div className={styles.clienteCell}>
                              <span className={styles.clienteNome}>{ag.cliente?.nome ?? "—"}</span>
                              <span className={styles.clienteTel}>{ag.cliente?.telefone ?? ""}</span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.dataCell}>
                              <span>{formatarData(ag.data_visita)}</span>
                              <span className={styles.horario}>{formatarHorario(ag.horario_visita)}</span>
                            </div>
                          </td>
                          <td>{ag.quantidade_pessoas}</td>
                          <td>{ag.cidade ?? "—"}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${getStatusClass(ag.status)}`}>
                              {STATUS_MAP[ag.status]?.label ?? ag.status}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actions}>
                              {/* Visualizar */}
                              <button className={styles.actionButton} title="Visualizar" onClick={() => abrirVisualizar(ag.codigo)}>
                                <Eye size={15} />
                              </button>

                              {/* Editar */}
                              <button className={styles.actionButton} title="Editar" onClick={() => handleEditar(ag.codigo)}>
                                <Pencil size={15} />
                              </button>

                              {/* 👇 Botão CONFIRMAR REALIZADO (só para CONFIRMADO ou PENDENTE) */}
                              {(ag.status === 'CONFIRMADO' || ag.status === 'PENDENTE') && (
                                <button
                                  className={`${styles.actionButton} ${styles.confirmButton}`}
                                  title="Confirmar Realização"
                                  onClick={() => handleConfirmarRealizado(ag.codigo)}
                                >
                                  <CheckCircle2 size={15} />
                                </button>
                              )}

                              {/* 👇 Botão RESULTADO DE VENDA (só para REALIZADOS com PENDENTE) */}
                              {ag.status === 'REALIZADO' && ag.resultado_venda === 'PENDENTE' && (
                                <button
                                  className={`${styles.actionButton} ${styles.resultadoButton}`}
                                  title="Resultado da Venda"
                                  onClick={() => abrirResultadoVenda(ag)}
                                >
                                  <CircleDollarSign size={15} />
                                </button>
                              )}

                              {/* 👇 Badge de resultado já definido */}
                              {ag.resultado_venda && ag.resultado_venda !== 'PENDENTE' && (
                                <span className={`${styles.resultadoBadge} ${ag.resultado_venda === 'VENDA_REALIZADA' ? styles.resultadoVendido :
                                    ag.resultado_venda === 'VENDA_PERDIDA' ? styles.resultadoPerdido :
                                      styles.resultadoNA
                                  }`}>
                                  {ag.resultado_venda === 'VENDA_REALIZADA' ? '✓ Vendido' :
                                    ag.resultado_venda === 'VENDA_PERDIDA' ? '✗ Perdido' : 'N/A'}
                                </span>
                              )}

                              {/* Cancelar */}
                              <button
                                className={`${styles.actionButton} ${styles.cancelButton}`}
                                title="Cancelar"
                                disabled={ag.status === "CANCELADO" || ag.status === "REALIZADO"}
                                onClick={() => pedirCancelamento(ag.codigo)}
                              >
                                <XCircle size={15} />
                              </button>

                              {/* Excluir */}
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

              {totalPaginas > 1 && (
                <div className={styles.pagination}>
                  <button className={styles.pageBtn} onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}>
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <span className={styles.pageInfo}>Página {pagina} de {totalPaginas} · {total} registros</span>
                  <button className={styles.pageBtn} onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}>
                    Próximo <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* ATIVIDADE RECENTE */}
            <div className={styles.card}>
              <div className={styles.cardHeader}><div><h2>Últimas Entradas</h2><p>Registros mais recentes</p></div></div>
              <div className={styles.activityList}>
                {loadingTabela
                  ? [...Array(4)].map((_, i) => <div key={i} className={styles.skeletonActivity} />)
                  : agendamentos.slice(0, 5).map((ag) => {
                    const color = STATUS_MAP[ag.status]?.color ?? "#94a3b8";
                    return (
                      <div key={ag.codigo} className={styles.activityItem}>
                        <div className={styles.activityAvatar} style={{ backgroundColor: color }}><Clock3 size={16} /></div>
                        <div className={styles.activityInfo}>
                          <span className={styles.activityName}>{ag.cliente?.nome ?? ag.codigo}</span>
                          <span className={styles.activityAction}>{ag.cidade} · {ag.quantidade_pessoas} pessoa{ag.quantidade_pessoas !== 1 ? "s" : ""}</span>
                        </div>
                        <span className={styles.activityTime}>{formatarData(ag.data_visita)} {formatarHorario(ag.horario_visita)}</span>
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