// src/app/Components/ModalAgendamento/ExportVouchersButton.jsx
"use client";

import React, { useState } from "react";
import { FileSpreadsheet, X } from "lucide-react";
import { exportarVouchersExcel, listarAgendamentos } from "@/app/services/exportServices";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";

export default function ExportVouchersButton({ disabled = false }) {
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleExport = async () => {
    setLoading(true);
    try {
      // 👇 Buscar TODOS os agendamentos da data (sem paginação)
      const { listarAgendamentos } = await import('@/app/services/agendamentosServices');
      
      const resultado = await listarAgendamentos({
        pagina: 1,
        limite: 1000, // 👈 Buscar até 1000 registros
      });

      // Filtrar pela data selecionada
      const filtrados = (resultado.agendamentos || []).filter(
        ag => ag.data_visita === selectedDate
      );

      if (filtrados.length === 0) {
        alert(`Nenhum agendamento encontrado para ${formatarData(selectedDate)}`);
        setLoading(false);
        return;
      }

      const dataFormatada = selectedDate.replace(/-/g, "");
      await exportarVouchersExcel(filtrados, `vouchers_${dataFormatada}`);
      setShowDatePicker(false);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao gerar vouchers.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => setShowDatePicker(false);

  const formatarData = (data) => {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className={styles.exportWrapper}>
      {showDatePicker ? (
        <div className={styles.datePickerPopup}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.dateInput}
          />
          <button
            onClick={handleExport}
            disabled={loading}
            className={styles.exportConfirmBtn}
          >
            <FileSpreadsheet size={16} />
            {loading ? "Gerando..." : "Exportar"}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className={styles.exportCancelBtn}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowDatePicker(true)}
          disabled={disabled}
          className={styles.exportBtn}
          title="Exportar Vouchers em Excel"
        >
          <FileSpreadsheet size={16} />
          Exportar Vouchers
        </button>
      )}
    </div>
  );
}