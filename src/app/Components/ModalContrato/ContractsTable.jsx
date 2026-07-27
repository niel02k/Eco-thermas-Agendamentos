// src/app/(sua-rota)/contratos/components/ContractsTable.jsx
"use client";

import React from "react";
import ContractRow from "./ContractRow";
import ContractsPagination from "./ContractsPagination";
import styles from "@/app/Components/ModalContrato/Contracts.module.css";

const COLUMNS = ["#", "Cliente", "Cidade", "Consultor", "Valor", "Status", "Ações"];

export default function ContractsTable({
  contratos, loading, total, pagina, totalPaginas, busca,
  onPageChange, onVisualizar, onEditar, onExcluir
}) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableTop}>
        <h3>Lista de Contratos</h3>
        <span className={styles.tableCount}>{total} contrato{total !== 1 ? "s" : ""}</span>
      </div>

      {loading ? (
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <span>Carregando contratos...</span>
        </div>
      ) : contratos.length === 0 ? (
        <div className={styles.emptyBox}>
          <p>Nenhum contrato encontrado</p>
          <span>{busca ? "Tente ajustar os termos da busca" : "Comece criando um novo contrato"}</span>
        </div>
      ) : (
        <>
          {/* Cabeçalho */}
          <div className={styles.tableHead}>
            {COLUMNS.map((col) => (
              <span key={col}>{col}</span>
            ))}
          </div>

          {/* Linhas */}
          <div className={styles.tableBody}>
            {contratos.map((c) => (
              <ContractRow
                key={c.id}
                contrato={c}
                onVisualizar={onVisualizar}
                onEditar={onEditar}
                onExcluir={onExcluir}
              />
            ))}
          </div>

          {totalPaginas > 1 && (
            <ContractsPagination
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