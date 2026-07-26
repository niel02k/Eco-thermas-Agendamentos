// src/app/(sua-rota)/contratos/components/ContractsMobile.jsx
"use client";

import React from "react";
import ContractMobileCard from "./ContractMobileCard";
import styles from "@/app/Components/ModalContrato/Contracts.module.css";

export default function ContractsMobile({
  contratos, loading, busca,
  onVisualizar, onEditar, onExcluir
}) {
  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <div className={styles.spinner} />
        <span>Carregando contratos...</span>
      </div>
    );
  }

  if (contratos.length === 0) {
    return (
      <div className={styles.emptyBox}>
        <p>Nenhum contrato encontrado</p>
        <span>{busca ? "Tente ajustar os termos da busca" : "Comece criando um novo contrato"}</span>
      </div>
    );
  }

  return (
    <div className={styles.mobileCards}>
      {contratos.map((c) => (
        <ContractMobileCard
          key={c.id}
          contrato={c}
          onVisualizar={onVisualizar}
          onEditar={onEditar}
          onExcluir={onExcluir}
        />
      ))}
    </div>
  );
}