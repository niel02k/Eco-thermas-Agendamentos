// src/app/Components/ModalAgendamento/components/ExportVouchersButton.jsx
"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Loader2, Calendar } from "lucide-react";
import { exportarVouchersExcel } from "@/app/services/exportServices";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";

export default function ExportVouchersButton({ agendamentos, disabled = false }) {
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleExport = async () => {
    if (!agendamentos || agendamentos.length === 0) {
      alert("Não há agendamentos para exportar!");
      return;
    }

    // Filtrar por data selecionada
    const filtrados = agendamentos.filter(ag => ag.data_visita === selectedDate);

    if (filtrados.length === 0) {
      alert(`Nenhum agendamento encontrado para a data ${formatarData(selectedDate)}`);
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const dataFormatada = selectedDate.replace(/-/g, "");
      const nomeArquivo = `vouchers_${dataFormatada}`;
      
      await exportarVouchersExcel(filtrados, nomeArquivo);
      setShowDatePicker(false);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao gerar vouchers. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className={styles.exportWrapper}>
      {showDatePicker ? (
        <div className={styles.datePickerPopup}>
          <div className={styles.datePickerHeader}>
            <span>Selecionar data dos vouchers</span>
            <button onClick={() => setShowDatePicker(false)}>✕</button>
          </div>
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
            {loading ? (
              <>
                <Loader2 size={16} className={styles.spinning} />
                Gerando...
              </>
            ) : (
              <>
                <FileSpreadsheet size={16} />
                Exportar {formatarData(selectedDate)}
              </>
            )}
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