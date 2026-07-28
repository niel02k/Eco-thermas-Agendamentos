// src/app/Components/ModalAgendamento/components/VisualizarModal.jsx
"use client";

import React from "react";
import { X, Pencil, User, Users, MapPin, CalendarDays } from "lucide-react";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";

const STATUS_MAP = {
  CONFIRMADO: { label: "Confirmado", cls: "statusConfirmed", color: "#3CC83C" },
  PENDENTE: { label: "Pendente", cls: "statusPending", color: "#FAD228" },
  CANCELADO: { label: "Cancelado", cls: "statusCanceled", color: "#FA643C" },
  REALIZADO: { label: "Realizado", cls: "statusFinished", color: "#1E6EBE" },
};

function formatarDataExtensa(dataISO) {
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

export default function VisualizarModal({ agendamento, onClose, onEditar }) {
  if (!agendamento) return null;

  const statusInfo = STATUS_MAP[agendamento.status] || { label: agendamento.status, color: "#94A3B8" };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalDetalhe} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.modalDetalheHeader}>
          <div>
            <h2>Agendamento {agendamento.codigo}</h2>
            <span 
              className={styles.modalStatusBadge}
              style={{ 
                background: `${statusInfo.color}18`, 
                color: statusInfo.color,
                border: `1px solid ${statusInfo.color}30`
              }}
            >
              {statusInfo.label}
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
                <label>Idade</label>
                <p>{agendamento.cliente?.idade ? `${agendamento.cliente.idade} anos` : "—"}</p>
              </div>
              <div>
                <label>Telefone</label>
                <p>{agendamento.cliente?.telefone || "—"}</p>
              </div>
              <div>
                <label>E-mail</label>
                <p>{agendamento.cliente?.email || "—"}</p>
              </div>
              <div>
                <label>Origem</label>
                <p>{agendamento.cliente?.origem || agendamento.origem || "—"}</p>
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
              <div>
                <label>Consultor</label>
                <p>{agendamento.vendedor?.nome || "Não informado"}</p>
              </div>
              <div>
                <label>Resultado Venda</label>
                <p>
                  {agendamento.resultado_venda === 'VENDA_REALIZADA' && '✅ Venda Realizada'}
                  {agendamento.resultado_venda === 'VENDA_PERDIDA' && '❌ Venda Perdida'}
                  {agendamento.resultado_venda === 'NAO_APLICAVEL' && 'N/A'}
                  {agendamento.resultado_venda === 'PENDENTE' && '⏳ Pendente'}
                  {!agendamento.resultado_venda && '—'}
                </p>
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
                      {dep.idade} anos{dep.cpf ? ` · CPF: ${dep.cpf}` : ""}
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