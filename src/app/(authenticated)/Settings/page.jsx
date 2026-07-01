"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import {
  CalendarDays,
  UserPlus,
  Users,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Eye,
  EyeOff,
  Shield,
  ShieldOff,
  Loader2,
  Clock,
  Users2,
  Info,
} from "lucide-react";

import { useAuth } from "@/app/Context/AuthContext";
import { useSettings, HORARIOS_PADRAO, dateToISO, isoToDate } from "./useSettings";
import styles from "./settings.module.css";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                     */
/* -------------------------------------------------------------------------- */

function formatarData(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function formatarDataExibicao(date) {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long",
  });
}

/* -------------------------------------------------------------------------- */
/* SUBCOMPONENTES                                                              */
/* -------------------------------------------------------------------------- */

function FeedbackMsg({ msg }) {
  if (!msg) return null;
  return (
    <div className={`${styles.feedback} ${styles[`feedback_${msg.tipo}`]}`}>
      {msg.tipo === "ok"
        ? <CheckCircle2 size={15} />
        : <XCircle size={15} />}
      {msg.texto}
    </div>
  );
}

function SkeletonLine({ w = "100%" }) {
  return <div className={styles.skeletonLine} style={{ width: w }} />;
}

/* -------------------------------------------------------------------------- */
/* PÁGINA                                                                      */
/* -------------------------------------------------------------------------- */

export default function Settings() {
  const { usuario } = useAuth();
  const [showPass, setShowPass]           = useState(false);
  const [hoveredDate, setHoveredDate]     = useState(null); // Date | null

  const {
    selectedDates, toggleDate,
    month, setMonth,
    calConfig, setCalConfig,
    disponibilidades, getInfoData,
    loadingCal, savingCal, calMsg,
    salvarDisponibilidades,
    usuarios, loadingUsers,
    newUser, setNewUser,
    savingUser, userMsg,
    handleCriarUsuario,
    alterarCargo,
    alternarStatus,
  } = useSettings();

  /* ── Proteção de rota ──────────────────────────────────────── */
  if (usuario && usuario.cargo !== "ADM") {
    return (
      <div className={styles.accessDenied}>
        <Shield size={48} color="#FA643C" />
        <h2>Acesso Restrito</h2>
        <p>Esta área é exclusiva para Administradores.</p>
      </div>
    );
  }

  /* ── Conjuntos para o DayPicker ────────────────────────────── */
  // Datas salvas no banco como abertas (para visual distinto de "selecionado mas não salvo")
  const savedOpenISOs = new Set(
    disponibilidades.filter((d) => d.disponivel).map((d) => d.data)
  );

  // Classificadores de dias para o DayPicker
  const modifiers = {
    selected:  selectedDates,
    savedOpen: selectedDates.filter((d) => savedOpenISOs.has(dateToISO(d))),
    newOpen:   selectedDates.filter((d) => !savedOpenISOs.has(dateToISO(d))),
    savedClosed: disponibilidades
      .filter((d) => !d.disponivel)
      .map((d) => isoToDate(d.data)),
    past: { before: new Date() },
  };

  /* ── Info do dia em hover ──────────────────────────────────── */
  const infoHovered = hoveredDate ? getInfoData(hoveredDate) : null;
  const isHoveredSelected = hoveredDate
    ? selectedDates.some((d) => dateToISO(d) === dateToISO(hoveredDate))
    : false;

  const totalSelecionadas = selectedDates.filter((d) => {
    const hoje = dateToISO(new Date());
    return dateToISO(d) >= hoje;
  }).length;

  /* ------------------------------------------------------------------ */
  return (
    <div className={styles.container}>

      {/* ── Cabeçalho ─────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Configurações</h1>
          <p className={styles.subtitle}>Painel exclusivo · Administradores</p>
        </div>
        <div className={styles.adminBadge}>
          <Shield size={14} />
          ADM
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SEÇÃO 1 — CALENDÁRIO DE DISPONIBILIDADE
      ══════════════════════════════════════════════════════════ */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div className={styles.cardIcon} style={{ background: "#eff6ff", color: "#1e6ebe" }}>
            <CalendarDays size={20} />
          </div>
          <div>
            <h2 className={styles.cardTitle}>Disponibilidade do Parque</h2>
            <p className={styles.cardSub}>
              Clique nas datas para abrir ou fechar. As alterações só são salvas ao clicar em "Salvar".
            </p>
          </div>
        </div>

        {loadingCal ? (
          <div className={styles.calSkeleton}>
            <div className={styles.skeletonCal} />
            <div className={styles.skeletonPanel} />
          </div>
        ) : (
          <div className={styles.calLayout}>

            {/* ── Calendário ─────────────────────────────────── */}
            <div className={styles.calWrapper}>
              <DayPicker
                mode="multiple"
                selected={selectedDates}
                onDayClick={(date, { disabled }) => {
                  if (disabled) return;
                  toggleDate(date);
                }}
                onDayMouseEnter={(date) => setHoveredDate(date)}
                onDayMouseLeave={() => setHoveredDate(null)}
                month={month}
                onMonthChange={setMonth}
                locale={ptBR}
                disabled={[{ before: new Date() }]}
                modifiers={modifiers}
                modifiersClassNames={{
                  selected:    styles.daySelected,
                  savedOpen:   styles.daySavedOpen,
                  newOpen:     styles.dayNewOpen,
                  savedClosed: styles.daySavedClosed,
                  past:        styles.dayPast,
                }}
                classNames={{
                  root:            styles.rdpRoot,
                  months:          styles.rdpMonths,
                  month:           styles.rdpMonth,
                  month_caption:   styles.rdpCaption,
                  caption_label:   styles.rdpCaptionLabel,
                  nav:             styles.rdpNav,
                  button_previous: styles.rdpNavBtnPrev,
                  button_next:     styles.rdpNavBtnNext,
                  month_grid:      styles.rdpTable,
                  weekdays:        styles.rdpHeadRow,
                  weekday:         styles.rdpHeadCell,
                  week:            styles.rdpRow,
                  day:             styles.rdpCell,
                  day_button:      styles.rdpDayBtn,
                  today:           styles.rdpToday,
                  outside:         styles.rdpOutside,
                  disabled:        styles.rdpDisabled,
                  hidden:          styles.rdpHidden,
                  selected:        styles.rdpSelected,
                  chevron:         styles.rdpChevron,
                }}
              />

              {/* Legenda */}
              <div className={styles.legenda}>
                <span className={styles.legendaItem}>
                  <span className={`${styles.legendaDot} ${styles.dotSavedOpen}`} />
                  Salvo & aberto
                </span>
                <span className={styles.legendaItem}>
                  <span className={`${styles.legendaDot} ${styles.dotNewOpen}`} />
                  Novo (não salvo)
                </span>
                <span className={styles.legendaItem}>
                  <span className={`${styles.legendaDot} ${styles.dotClosed}`} />
                  Fechado
                </span>
              </div>
            </div>

            {/* ── Painel lateral ─────────────────────────────── */}
            <div className={styles.calPanel}>

              {/* Preview do dia em hover */}
              {hoveredDate ? (
                <div className={styles.hoverCard}>
                  <p className={styles.hoverDate}>{formatarDataExibicao(hoveredDate)}</p>
                  {infoHovered ? (
                    <>
                      <div className={`${styles.hoverStatus} ${infoHovered.disponivel ? styles.hoverAberto : styles.hoverFechado}`}>
                        {infoHovered.disponivel ? "Aberto" : "Fechado"}
                      </div>
                      {infoHovered.disponivel && (
                        <p className={styles.hoverCap}>
                          Capacidade: <strong>{infoHovered.capacidade_maxima}</strong>
                        </p>
                      )}
                    </>
                  ) : isHoveredSelected ? (
                    <div className={`${styles.hoverStatus} ${styles.hoverNovo}`}>
                      Novo — não salvo
                    </div>
                  ) : (
                    <p className={styles.hoverSemInfo}>
                      <Info size={13} /> Sem registro. Clique para abrir.
                    </p>
                  )}
                </div>
              ) : (
                <div className={styles.hoverCard} style={{ opacity: 0.4 }}>
                  <p className={styles.hoverDate}>Passe o mouse sobre uma data</p>
                </div>
              )}

              {/* Config aplicada ao salvar */}
              <div className={styles.panelSection}>
                <p className={styles.panelLabel}>
                  <Clock size={13} />
                  Horário de funcionamento
                </p>
                <div className={styles.timeRange}>
                  <div className={styles.timeField}>
                    <label>Abertura</label>
                    <select
                      className={styles.selectSmall2}
                      value={calConfig.abertura}
                      onChange={(e) =>
                        setCalConfig((p) => ({ ...p, abertura: e.target.value }))
                      }
                    >
                      {HORARIOS_PADRAO.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <span className={styles.timeSep}>até</span>
                  <div className={styles.timeField}>
                    <label>Fechamento</label>
                    <select
                      className={styles.selectSmall2}
                      value={calConfig.fechamento}
                      onChange={(e) =>
                        setCalConfig((p) => ({ ...p, fechamento: e.target.value }))
                      }
                    >
                      {HORARIOS_PADRAO.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className={styles.panelLabel} style={{ marginTop: "1rem" }}>
                  <Users2 size={13} />
                  Capacidade máxima por dia
                </p>
                <input
                  type="number"
                  min={1}
                  max={200}
                  className={styles.inputSmall}
                  value={calConfig.capacidade}
                  onChange={(e) =>
                    setCalConfig((p) => ({ ...p, capacidade: e.target.value }))
                  }
                />

                <p className={styles.panelLabel} style={{ marginTop: "1rem" }}>
                  Observações (opcional)
                </p>
                <textarea
                  className={styles.textareaSmall}
                  placeholder="Ex: Funcionamento especial – Férias escolares"
                  value={calConfig.observacoes}
                  onChange={(e) =>
                    setCalConfig((p) => ({ ...p, observacoes: e.target.value }))
                  }
                  rows={2}
                />
              </div>

              {/* Resumo */}
              <div className={styles.resumoBox}>
                <span className={styles.resumoNum}>{totalSelecionadas}</span>
                <span className={styles.resumoLabel}>
                  data{totalSelecionadas !== 1 ? "s" : ""} abertas neste mês
                </span>
              </div>

              <div className={styles.panelFooter}>
                <FeedbackMsg msg={calMsg} />
                <button
                  className={styles.btnPrimary}
                  onClick={salvarDisponibilidades}
                  disabled={savingCal}
                >
                  {savingCal ? (
                    <><Loader2 size={15} className={styles.spin} /> Salvando…</>
                  ) : (
                    "Salvar datas"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════
          SEÇÃO 2 — CRIAR USUÁRIO
      ══════════════════════════════════════════════════════════ */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div className={styles.cardIcon} style={{ background: "#f0fdf4", color: "#16a34a" }}>
            <UserPlus size={20} />
          </div>
          <div>
            <h2 className={styles.cardTitle}>Criar Usuário</h2>
            <p className={styles.cardSub}>Adiciona um novo colaborador ao sistema</p>
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nome completo</label>
            <input
              className={styles.input}
              placeholder="Ex: Marcos Daniel"
              value={newUser.name}
              onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>E-mail</label>
            <input
              type="email"
              className={styles.input}
              placeholder="colaborador@ecothermas.com"
              value={newUser.email}
              onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Senha inicial</label>
            <div className={styles.inputIconBox}>
              <input
                type={showPass ? "text" : "password"}
                className={styles.input}
                placeholder="Mínimo 8 caracteres"
                value={newUser.password}
                onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
              />
              <button className={styles.eyeBtn} onClick={() => setShowPass((v) => !v)} type="button">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Cargo</label>
            <div className={styles.selectWrapper}>
              <select
                className={styles.select}
                value={newUser.role}
                onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="ADM">Administrador</option>
                <option value="CONSULTOR">Consultor</option>
              </select>
              <ChevronDown size={16} className={styles.selectIcon} />
            </div>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <FeedbackMsg msg={userMsg} />
          <button className={styles.btnPrimary} onClick={handleCriarUsuario} disabled={savingUser}>
            {savingUser
              ? <><Loader2 size={15} className={styles.spin} /> Criando…</>
              : <><UserPlus size={15} /> Criar usuário</>}
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SEÇÃO 3 — GERENCIAR USUÁRIOS
      ══════════════════════════════════════════════════════════ */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div className={styles.cardIcon} style={{ background: "#faf5ff", color: "#7c3aed" }}>
            <Users size={20} />
          </div>
          <div>
            <h2 className={styles.cardTitle}>Gerenciar Usuários</h2>
            <p className={styles.cardSub}>
              {loadingUsers
                ? "Carregando..."
                : `${usuarios.length} colaborador${usuarios.length !== 1 ? "es" : ""} cadastrado${usuarios.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <div className={styles.userTableWrapper}>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Cargo</th>
                <th>Cadastro</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((__, j) => (
                      <td key={j}><SkeletonLine /></td>
                    ))}
                  </tr>
                ))
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyRow}>Nenhum usuário encontrado.</td>
                </tr>
              ) : (
                usuarios.map((u) => {
                  const isMe = u.id === usuario?.id;
                  return (
                    <tr key={u.id} className={u.status === "INATIVO" ? styles.rowInativo : ""}>
                      <td>
                        <div className={styles.userNameCell}>
                          <div
                            className={styles.userAvatar}
                            style={{ background: u.cargo === "ADM" ? "#1e6ebe" : "#991094" }}
                          >
                            {u.nome?.slice(0, 2).toUpperCase()}
                          </div>
                          <span>
                            {u.nome}
                            {isMe && <span className={styles.youBadge}>você</span>}
                          </span>
                        </div>
                      </td>
                      <td className={styles.emailCell}>{u.email}</td>
                      <td>
                        {isMe ? (
                          <span className={styles.cargoBadge} data-cargo={u.cargo}>{u.cargo}</span>
                        ) : (
                          <div className={styles.selectWrapper} style={{ minWidth: 130 }}>
                            <select
                              className={`${styles.select} ${styles.selectSmall}`}
                              value={u.cargo}
                              onChange={(e) => alterarCargo(u.id, e.target.value)}
                            >
                              <option value="ADM">Administrador</option>
                              <option value="CONSULTOR">Consultor</option>
                            </select>
                            <ChevronDown size={14} className={styles.selectIcon} />
                          </div>
                        )}
                      </td>
                      <td className={styles.dataCell}>{formatarData(u.data_criacao)}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${u.status === "ATIVO" ? styles.badgeAtivo : styles.badgeInativo}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>
                        {isMe ? (
                          <span className={styles.selfNote}>—</span>
                        ) : (
                          <button
                            className={`${styles.toggleStatusBtn} ${u.status === "ATIVO" ? styles.btnDesativar : styles.btnAtivar}`}
                            onClick={() => alternarStatus(u.id, u.status)}
                          >
                            {u.status === "ATIVO"
                              ? <><ShieldOff size={13} /> Desativar</>
                              : <><Shield size={13} /> Reativar</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}