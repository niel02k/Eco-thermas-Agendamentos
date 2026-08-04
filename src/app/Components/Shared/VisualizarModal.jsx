// src/app/Components/Shared/VisualizarModal.jsx
"use client";

import React from "react";
import { X, Pencil, CheckCircle2, CircleDollarSign, Trash2, User, Users, MapPin, CalendarDays, CreditCard } from "lucide-react";
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
  RESULTADO_VENDA_LABELS,
  STATUS_CONTRATO_LABELS,
  PAGAMENTO_LABELS
} from "@/lib/constants";

function formatarData(dataISO) {
  if (!dataISO) return "—";
  return new Date(dataISO + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

function formatarHorario(horario) {
  if (!horario) return "—";
  return horario.slice(0, 5);
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function VisualizarModal({ 
  tipo = 'agendamento',
  agendamento,
  contrato,
  onClose, 
  onEditar,
  onConfirmarAgendamento, 
  onConfirmarRealizado, 
  onResultadoVenda, 
  onCancelar, 
  onExcluir,
  onExcluirContrato,
}) {
  // ═══════════ VERIFICAÇÃO ANTES DE TUDO ═══════════
  const dados = tipo === 'contrato' ? contrato : agendamento;
  
  if (!dados) return null;
  if (tipo === 'agendamento' && !dados.codigo) return null;
  if (tipo === 'contrato' && !dados.id) return null;
  // ═══════════════════════════════════════════════════

  const isAgendamento = tipo === 'agendamento';
  const isContrato = tipo === 'contrato';

  const statusColor = isAgendamento ? (STATUS_AGENDAMENTO_COLORS[dados.status] || "#94A3B8") : null;
  const statusLabel = isAgendamento ? (STATUS_AGENDAMENTO_LABELS[dados.status] || dados.status) : null;
  const visitaLabel = isAgendamento ? (RESULTADO_VISITA_LABELS[dados.resultado_visita] || '') : null;
  const visitaColor = isAgendamento ? (RESULTADO_VISITA_COLORS[dados.resultado_visita] || '') : null;
  const isFinalizado = isAgendamento ? (dados.resultado_visita === RESULTADO_VISITA.REALIZADO || dados.resultado_visita === RESULTADO_VISITA.FALTOU) : false;
  const titulo = isContrato ? `Contrato #${dados.id}` : `Agendamento ${dados.codigo}`;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalDetalhe} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.modalDetalheHeader}>
          <div>
            <h2>{titulo}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {isAgendamento && (
                <span className={styles.modalStatusBadge} style={{
                  background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30`
                }}>{statusLabel}</span>
              )}
              {isContrato && (
                <span className={styles.modalStatusBadge} style={{
                  background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0'
                }}>{STATUS_CONTRATO_LABELS[dados.status] || dados.status}</span>
              )}
              {isAgendamento && visitaLabel && (
                <span className={styles.modalStatusBadge} style={{
                  background: `${visitaColor}18`, color: visitaColor, border: `1px solid ${visitaColor}30`
                }}>{visitaLabel}</span>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {isAgendamento && <VoucherPDFButton agendamento={dados} />}
            
            {isAgendamento && !isFinalizado && dados.status === STATUS_AGENDAMENTO.PENDENTE && (
              <button className={styles.actionButton} title="Confirmar Agendamento"
                onClick={() => { onClose(); onConfirmarAgendamento(dados.codigo); }}>
                <CheckCircle2 size={16} color="#15803D" />
              </button>
            )}
            {isAgendamento && !isFinalizado && dados.status === STATUS_AGENDAMENTO.CONFIRMADO && (
              <button className={styles.actionButton} title="Realizar Agendamento"
                onClick={() => { onClose(); onConfirmarRealizado(dados); }}>
                <CheckCircle2 size={16} color="#A16207" />
              </button>
            )}
            {isAgendamento && dados.resultado_visita === RESULTADO_VISITA.REALIZADO && dados.resultado_venda === RESULTADO_VENDA.PENDENTE && (
              <button className={styles.actionButton} title="Resultado Venda"
                onClick={() => { onClose(); onResultadoVenda(dados); }}>
                <CircleDollarSign size={16} color="#A16207" />
              </button>
            )}
            
            <button className={styles.actionButton} 
              onClick={() => { onClose(); onEditar(isContrato ? dados.id : dados.codigo); }}>
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
            <h3><User size={16} /> {isContrato ? 'Titular' : 'Cliente'}</h3>
            <div className={styles.detalheGrid}>
              {isAgendamento ? (
                <>
                  <div><label>Nome</label><p>{dados.cliente?.nome || "—"}</p></div>
                  <div><label>CPF</label><p>{dados.cliente?.cpf || "—"}</p></div>
                  <div><label>Idade</label><p>{dados.cliente?.idade ? `${dados.cliente.idade} anos` : "—"}</p></div>
                  <div><label>Telefone</label><p>{dados.cliente?.telefone || "—"}</p></div>
                  <div><label>E-mail</label><p>{dados.cliente?.email || "—"}</p></div>
                  <div><label>Origem</label><p>{dados.origem || "—"}</p></div>
                </>
              ) : (
                <>
                  <div><label>Nome</label><p>{dados.titular_nome || "—"}</p></div>
                  <div><label>CPF</label><p>{dados.titular_cpf || "—"}</p></div>
                  <div><label>Idade</label><p>{dados.titular_idade ? `${dados.titular_idade} anos` : "—"}</p></div>
                  <div><label>Email</label><p>{dados.titular_email || "—"}</p></div>
                  <div><label>Telefone</label><p>{dados.titular_telefone || "—"}</p></div>
                  <div><label>Cidade</label><p><MapPin size={14} style={{ display: 'inline' }} /> {dados.cidade || "—"}</p></div>
                </>
              )}
            </div>
          </div>

          <div className={styles.detalheSection}>
            <h3>{isContrato ? <CreditCard size={16} /> : <CalendarDays size={16} />} {isContrato ? 'Contrato' : 'Agendamento'}</h3>
            <div className={styles.detalheGrid}>
              {isAgendamento ? (
                <>
                  <div><label>Data</label><p>{formatarData(dados.data_visita)}</p></div>
                  <div><label>Horário</label><p>{formatarHorario(dados.horario_visita)}</p></div>
                  <div><label>Pessoas</label><p>{dados.quantidade_pessoas}</p></div>
                  <div><label>Cidade</label><p><MapPin size={14} style={{ display: 'inline' }} /> {dados.cidade || "—"}</p></div>
                  <div><label>Consultor</label><p>{dados.vendedor?.nome || "Não informado"}</p></div>
                  <div><label>Status</label><p>{statusLabel}</p></div>
                  <div><label>Comparecimento</label><p>{RESULTADO_VISITA_LABELS[dados.resultado_visita] || 'Pendente'}</p></div>
                  <div>
                    <label>Resultado Venda</label>
                    <p>
                      {dados.resultado_venda === RESULTADO_VENDA.VENDA_REALIZADA && '✅ Venda Realizada'}
                      {dados.resultado_venda === RESULTADO_VENDA.VENDA_PERDIDA && '❌ Venda Perdida'}
                      {dados.resultado_venda === RESULTADO_VENDA.NAO_APLICAVEL && 'ℹ️ Não Aplicável'}
                      {dados.resultado_venda === RESULTADO_VENDA.PENDENTE && '⏳ Pendente'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div><label>Valor Total</label><p style={{ color: '#15803D', fontWeight: 700 }}>{formatarMoeda(dados.valor_total)}</p></div>
                  <div><label>Forma Pagamento</label><p>{PAGAMENTO_LABELS[dados.forma_pagamento] || dados.forma_pagamento || "—"}</p></div>
                  <div><label>Tipo Cobrança</label><p>{dados.tipo_cobranca || "—"}</p></div>
                  <div><label>Parcelas</label><p>{dados.parcelas || 1}x</p></div>
                  <div><label>Data Início</label><p>{formatarData(dados.data_inicio)}</p></div>
                  {dados.data_fim && <div><label>Data Fim</label><p>{formatarData(dados.data_fim)}</p></div>}
                  <div><label>Consultor</label><p>{dados.vendedor?.nome || "—"}</p></div>
                  <div><label>Tipo</label><p>{dados.tipo_contrato || "Padrão"}</p></div>
                </>
              )}
            </div>
          </div>

          {dados.dependentes && dados.dependentes.length > 0 && (
            <div className={styles.detalheSection}>
              <h3><Users size={16} /> Dependentes ({dados.dependentes.length})</h3>
              <div className={styles.dependentesList}>
                {dados.dependentes.map((dep, i) => (
                  <div key={i} className={styles.dependenteItem}>
                    <span className={styles.dependenteNome}>{i + 1}. {dep.nome}</span>
                    <span className={styles.dependenteInfo}>{dep.idade} anos{dep.cpf ? ` · CPF: ${dep.cpf}` : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dados.observacoes && (
            <div className={styles.detalheSection}>
              <h3>Observações</h3>
              <p className={styles.observacoes}>{dados.observacoes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalDetalheFooter}>
          
          <button className={styles.btnFechar}
            onClick={() => { onClose(); isContrato ? onExcluirContrato(dados.id) : onExcluir(dados.codigo); }}>
            <Trash2 size={16} /> Excluir
          </button>
        </div>
      </div>
    </div>
  );
}