// src/app/Components/Comp_Contrato/VisualizarContrato/VisualizarContrato.jsx
"use client";

import React from "react";
import { X, Pencil, User, CreditCard, Users, MapPin, Calendar, DollarSign } from "lucide-react";
import styles from "./VisualizarContrato.module.css";
import { STATUS_CONTRATO_LABELS, PAGAMENTO_LABELS } from "@/lib/constants";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                     */
/* -------------------------------------------------------------------------- */

function formatarData(data) {
  if (!data) return "—";
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getStatusClass(status) {
  const statusLower = String(status || "").toLowerCase();
  switch (statusLower) {
    case 'ativo': return styles.statusAtivo;
    case 'pendente': return styles.statusPendente;
    case 'bloqueado': return styles.statusBloqueado;
    case 'encerrado': return styles.statusEncerrado;
    case 'cancelado': return styles.statusCancelado;
    default: return styles.statusPendente;
  }
}

/* -------------------------------------------------------------------------- */
/* COMPONENTE                                                                  */
/* -------------------------------------------------------------------------- */

export default function VisualizarContrato({ contrato, onClose, onEditar }) {
  if (!contrato) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalDetalhe} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.modalDetalheHeader}>
          <div>
            <h2>Contrato #{contrato.id}</h2>
            <span className={`${styles.statusBadge} ${getStatusClass(contrato.status)}`}>
              {STATUS_CONTRATO_LABELS[contrato.status] || contrato.status}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className={styles.actionButton} onClick={() => onEditar(contrato.id)}>
              <Pencil size={16} />
            </button>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={styles.modalDetalheBody}>
          
          {/* Titular */}
          <div className={styles.detalheSection}>
            <h3><User size={16} /> Titular</h3>
            <div className={styles.detalheGrid}>
              <div>
                <label>Nome</label>
                <p>{contrato.titular_nome || "—"}</p>
              </div>
              <div>
                <label>CPF</label>
                <p>{contrato.titular_cpf || "—"}</p>
              </div>
              <div>
                <label>Idade</label>
                <p>{contrato.titular_idade ? `${contrato.titular_idade} anos` : "—"}</p>
              </div>
              <div>
                <label>Email</label>
                <p>{contrato.titular_email || "—"}</p>
              </div>
              <div>
                <label>Telefone</label>
                <p>{contrato.titular_telefone || "—"}</p>
              </div>
              <div>
                <label>Cidade</label>
                <p><MapPin size={14} style={{ display: 'inline' }} /> {contrato.cidade || "—"}</p>
              </div>
            </div>
          </div>

          {/* Contrato */}
          <div className={styles.detalheSection}>
            <h3><CreditCard size={16} /> Contrato</h3>
            <div className={styles.detalheGrid}>
              <div>
                <label>Valor Total</label>
                <p className={styles.valorDestaque}>{formatarMoeda(contrato.valor_total)}</p>
              </div>
              <div>
                <label>Forma de Pagamento</label>
                <p>{PAGAMENTO_LABELS[contrato.forma_pagamento] || contrato.forma_pagamento || "—"}</p>
              </div>
              <div>
                <label>Tipo de Cobrança</label>
                <p>{contrato.tipo_cobranca || "—"}</p>
              </div>
              <div>
                <label>Parcelas</label>
                <p>{contrato.parcelas || 1}x</p>
              </div>
              <div>
                <label>Data de Início</label>
                <p>{formatarData(contrato.data_inicio)}</p>
              </div>
              {contrato.data_fim && (
                <div>
                  <label>Data de Término</label>
                  <p>{formatarData(contrato.data_fim)}</p>
                </div>
              )}
              <div>
                <label>Consultor</label>
                <p>{contrato.vendedor?.nome || "—"}</p>
              </div>
              <div>
                <label>Tipo de Contrato</label>
                <p>{contrato.tipo_contrato || "Padrão"}</p>
              </div>
            </div>
          </div>

          {/* Dependentes */}
          {contrato.dependentes && contrato.dependentes.length > 0 && (
            <div className={styles.detalheSection}>
              <h3><Users size={16} /> Dependentes ({contrato.dependentes.length})</h3>
              <div className={styles.dependentesList}>
                {contrato.dependentes.map((dep, i) => (
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
          {contrato.observacoes && (
            <div className={styles.detalheSection}>
              <h3>Observações</h3>
              <p className={styles.observacoes}>{contrato.observacoes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalDetalheFooter}>
          <button className={styles.btnFechar} onClick={onClose}>
            Fechar
          </button>
          <button className={styles.btnEditar} onClick={() => onEditar(contrato.id)}>
            <Pencil size={16} /> Editar
          </button>
        </div>
      </div>
    </div>
  );
}