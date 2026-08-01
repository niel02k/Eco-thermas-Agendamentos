// src/app/Components/ModalAgendamento/AppointmentsTable.jsx
"use client";

import React from "react";
import AppointmentRow from "@/app/Components/ModalAgendamento/AppointmentRow";
import AppointmentsPagination from "@/app/Components/ModalAgendamento/AppointmentsPagination";
import ExportVouchersButton from "@/app/Components/ModalAgendamento/ExportVouchersButton";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";

export default function AppointmentsTable({
  agendamentos, loading, total, pagina, totalPaginas,
  onPageChange, onSelecionar, onVisualizar, onEditar,
  onConfirmarRealizado, onResultadoVenda, onCancelar, onExcluir
}) {
  return (
    <div className={styles.tableCard}>
      {/* Topo da tabela */}
      <div className={styles.tableTop}>
        <div>
          <h3>Agendamentos</h3>
          <span className={styles.tableCount}>
            {loading ? "Carregando..." : `${total} registro${total !== 1 ? "s" : ""}`}
          </span>
        </div>
        
        {/* Botão Exportar Vouchers */}
        <ExportVouchersButton 
          agendamentos={agendamentos} 
          disabled={loading} 
        />
      </div>

      {loading ? (
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <span>Carregando agendamentos...</span>
        </div>
      ) : agendamentos.length === 0 ? (
        <div className={styles.emptyBox}>
          <p>Nenhum agendamento encontrado</p>
        </div>
      ) : (
        <>
          {/* Cabeçalho */}
          <div className={styles.tableHead}>
            <span>Código</span>
            <span>Cliente</span>
            <span>Data / Horário</span>
            <span>Pessoas</span>
            <span>Cidade</span>
            <span>Status</span>
          </div>

          {/* Linhas */}
          <div className={styles.tableBody}>
            {agendamentos.map(ag => (
              <AppointmentRow
                key={ag.codigo}
                agendamento={ag}
                onSelecionar={onSelecionar}
                onVisualizar={onVisualizar}
                onEditar={onEditar}
                onConfirmarRealizado={onConfirmarRealizado}
                onResultadoVenda={onResultadoVenda}
                onCancelar={onCancelar}
                onExcluir={onExcluir}
              />
            ))}
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <AppointmentsPagination
              pagina={pagina}
              totalPaginas={totalPaginas}
              total={total}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </div>
  );
}