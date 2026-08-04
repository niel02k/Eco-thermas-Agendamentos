// src/app/Components/ModalAgendamento/VisualizarModal.jsx
"use client";

import React from "react";
import { X, Pencil, CheckCircle2, CircleDollarSign, XCircle, Trash2, User, Users, MapPin, CalendarDays } from "lucide-react";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";
import VoucherPDFButton from "@/app/Components/ModalAgendamento/VoucherPDFButton";
import { 
  STATUS_AGENDAMENTO, 
  STATUS_AGENDAMENTO_LABELS, 
  STATUS_AGENDAMENTO_COLORS,
  RESULTADO_VISITA,
  RESULTADO_VISITA_LABELS,
  RESULTADO_VISITA_COLORS,
  RESULTADO_VENDA,
  RESULTADO_VENDA_LABELS 
} from "@/lib/constants";

function formatarDataExtensa(dataISO) {
  if (!dataISO) return "—";
  return new Date(dataISO + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

function formatarHorario(horario) {
  if (!horario) return "—";
  return horario.slice(0, 5);
}

export default function VisualizarModal({ 
  agendamento, onClose, onEditar,
  onConfirmarAgendamento, onConfirmarRealizado, onResultadoVenda, onCancelar, onExcluir 
}) {
  if (!agendamento) return null;
  const ag = agendamento;
  
  const statusColor = STATUS_AGENDAMENTO_COLORS[ag.status] || "#94A3B8";
  const statusLabel = STATUS_AGENDAMENTO_LABELS[ag.status] || ag.status;
  const visitaLabel = RESULTADO_VISITA_LABELS[ag.resultado_visita] || '';
  const visitaColor = RESULTADO_VISITA_COLORS[ag.resultado_visita] || '';
  const isFinalizado = ag.resultado_visita === RESULTADO_VISITA.REALIZADO || ag.resultado_visita === RESULTADO_VISITA.FALTOU;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalDetalhe} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.modalDetalheHeader}>
          <div>
            <h2>Agendamento {ag.codigo}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className={styles.modalStatusBadge} style={{
                background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30`
              }}>
                {statusLabel}
              </span>
              {visitaLabel && (
                <span className={styles.modalStatusBadge} style={{
                  background: `${visitaColor}18`, color: visitaColor, border: `1px solid ${visitaColor}30`
                }}>
                  {visitaLabel}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' , gridTemplateColumns: 'repeat(auto-fit, minmax(40px, 1fr))'}}>
            <VoucherPDFButton agendamento={ag} />
            {!isFinalizado && ag.status === STATUS_AGENDAMENTO.PENDENTE && (
              <button className={styles.actionButton} title="Confirmar Agendamento"
                onClick={() => { onClose(); onConfirmarAgendamento(ag.codigo); }}>
                <CheckCircle2 size={16} color="#15803D" />
              </button>
            )}
            {!isFinalizado && ag.status === STATUS_AGENDAMENTO.CONFIRMADO && (
              <button className={styles.actionButton} title="Realizar Agendamento"
                onClick={() => { onClose(); onConfirmarRealizado(ag); }}>
                <CheckCircle2 size={16} color="#A16207" />
              </button>
            )}
            {ag.resultado_visita === RESULTADO_VISITA.REALIZADO && ag.resultado_venda === RESULTADO_VENDA.PENDENTE && (
              <button className={styles.actionButton} title="Resultado Venda"
                onClick={() => { onClose(); onResultadoVenda(ag); }}>
                <CircleDollarSign size={16} color="#A16207" />
              </button>
            )}
            <button className={styles.actionButton} onClick={() => { onClose(); onEditar(ag.codigo); }}>
              <Pencil size={16} />
            </button>
            
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>

            
          </div>
        </div>

        {/* Body */}
        <div className={styles.modalDetalheBody}>
          <div className={styles.detalheSection}>
            <h3><User size={16} /> Cliente</h3>
            <div className={styles.detalheGrid}>
              <div><label>Nome</label><p>{ag.cliente?.nome || "—"}</p></div>
              <div><label>CPF</label><p>{ag.cliente?.cpf || "—"}</p></div>
              <div><label>Idade</label><p>{ag.cliente?.idade ? `${ag.cliente.idade} anos` : "—"}</p></div>
              <div><label>Telefone</label><p>{ag.cliente?.telefone || "—"}</p></div>
              <div><label>E-mail</label><p>{ag.cliente?.email || "—"}</p></div>
              <div><label>Origem</label><p>{ag.origem || "—"}</p></div>
            </div>
          </div>

          <div className={styles.detalheSection}>
            <h3><CalendarDays size={16} /> Agendamento</h3>
            <div className={styles.detalheGrid}>
              <div><label>Data</label><p>{formatarDataExtensa(ag.data_visita)}</p></div>
              <div><label>Horário</label><p>{formatarHorario(ag.horario_visita)}</p></div>
              <div><label>Pessoas</label><p>{ag.quantidade_pessoas}</p></div>
              <div><label>Cidade</label><p><MapPin size={14} style={{ display: 'inline' }} /> {ag.cidade || "—"}</p></div>
              <div><label>Consultor</label><p>{ag.vendedor?.nome || "Não informado"}</p></div>
              <div><label>Status Confirmação</label><p>{statusLabel}</p></div>
              <div><label>Comparecimento</label><p>{RESULTADO_VISITA_LABELS[ag.resultado_visita] || 'Pendente'}</p></div>
              <div>
                <label>Resultado Venda</label>
                <p>
                  {ag.resultado_venda === RESULTADO_VENDA.VENDA_REALIZADA && '✅ Venda Realizada'}
                  {ag.resultado_venda === RESULTADO_VENDA.VENDA_PERDIDA && '❌ Venda Perdida'}
                  {ag.resultado_venda === RESULTADO_VENDA.NAO_APLICAVEL && 'ℹ️ Não Aplicável'}
                  {ag.resultado_venda === RESULTADO_VENDA.PENDENTE && '⏳ Pendente'}
                </p>
              </div>
            </div>
          </div>

          {ag.dependentes && ag.dependentes.length > 0 && (
            <div className={styles.detalheSection}>
              <h3><Users size={16} /> Dependentes ({ag.dependentes.length})</h3>
              <div className={styles.dependentesList}>
                {ag.dependentes.map((dep, i) => (
                  <div key={i} className={styles.dependenteItem}>
                    <span className={styles.dependenteNome}>{i + 1}. {dep.nome}</span>
                    <span className={styles.dependenteInfo}>{dep.idade} anos{dep.cpf ? ` · CPF: ${dep.cpf}` : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ag.observacoes && (
            <div className={styles.detalheSection}>
              <h3>Observações</h3>
              <p className={styles.observacoes}>{ag.observacoes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalDetalheFooter}>
          
          <button className={styles.btnFechar} onClick={() => { onClose(); onExcluir(ag.codigo); }}>
            <Trash2 size={16} /> Excluir
          </button>
        </div>
      </div>
    </div>
  );
}