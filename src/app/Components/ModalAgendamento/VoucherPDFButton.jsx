"use client";

import React from "react";
import { Eye, Copy, Check, Image as ImageIcon } from "lucide-react";
import { visualizarPDF, copiarVoucherComoImagem } from "@/app/services/voucherPDFService";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";

export default function VoucherPDFButton({ agendamento, disabled = false }) {
  const [copyState, setCopyState] = React.useState("idle"); // idle, copying, success, error

  if (!agendamento) return null;

  const handleCopyImage = async () => {
    setCopyState("copying");
    const success = await copiarVoucherComoImagem(agendamento);
    
    if (success) {
      setCopyState("success");
      setTimeout(() => setCopyState("idle"), 2000);
    } else {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 3000);
    }
  };

  return (
    <div className={styles.voucherActions} style={{ display: 'flex', gap: '8px' }}>
      
      
      <button
        onClick={handleCopyImage}
        disabled={disabled || copyState === "copying"}
        className={styles.voucherBtn}
        style={{ 
          backgroundColor: copyState === "success" ? '#3CC83C' : (copyState === "error" ? '#ef4444' : '#FA643C'),
          color: 'white',
          border: 'none',
          padding: '4px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          minWidth: '75px',
          justifyContent: 'center'
        }}
        title="Copiar Voucher como Imagem para o WhatsApp"
        type="button"
      >
        {copyState === "copying" ? (
          <span className={styles.spinner} style={{ width: '10px', height: '10px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
        ) : (
          copyState === "success" ? <Check size={16} /> : <ImageIcon size={16} />
        )}
        
        {copyState === "copying" ? 'Gerando...' : (copyState === "success" ? 'Voucher Copiado!' : (copyState === "error" ? 'Erro ao copiar' : ''))}
      </button>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
