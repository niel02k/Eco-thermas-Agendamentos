// src/app/Components/ResultCard/ResultCard.jsx
"use client";

import React from 'react';
import { X, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import styles from './ResultCard.module.css';

const opcoes = [
  { 
    value: 'VENDA_REALIZADA', 
    label: 'Venda Realizada', 
    icon: CheckCircle,
    color: '#3CC83C',
    bg: '#dcfce7',
    borderColor: '#3CC83C'
  },
  { 
    value: 'VENDA_PERDIDA', 
    label: 'Venda Perdida', 
    icon: XCircle,
    color: '#EF4444',
    bg: '#fee2e2',
    borderColor: '#EF4444'
  },
  { 
    value: 'NAO_APLICAVEL', 
    label: 'Não Aplicável', 
    icon: MinusCircle,
    color: '#64748B',
    bg: '#f1f5f9',
    borderColor: '#94A3B8'
  },
];

export default function ResultCard({ agendamento, onConfirm, onCancel, loading }) {
  if (!agendamento) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h3>Resultado da Venda</h3>
            <p>
              Agendamento <strong>{agendamento.codigo}</strong> — {agendamento.cliente?.nome || agendamento.titular_nome || '—'}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onCancel} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {/* Opções */}
        <div className={styles.opcoes}>
          {opcoes.map((opcao) => {
            const Icon = opcao.icon;
            return (
              <button
                key={opcao.value}
                className={styles.cardOpcao}
                style={{
                  borderColor: opcao.borderColor,
                  backgroundColor: opcao.bg,
                }}
                onClick={() => onConfirm(agendamento.codigo, opcao.value)}
                disabled={loading}
              >
                <Icon size={28} color={opcao.color} />
                <span 
                  className={styles.labelOpcao}
                  style={{ color: opcao.color }}
                >
                  {opcao.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button 
            className={styles.btnCancelar} 
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className={styles.loadingOverlay}>
            <span>Salvando...</span>
          </div>
        )}
      </div>
    </div>
  );
}