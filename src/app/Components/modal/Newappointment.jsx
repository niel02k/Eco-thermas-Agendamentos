"use client";

import styles from "./modal.module.css";

export default function NovoAgendamento({ onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Novo Agendamento</h2>

        <input type="text" placeholder="Cliente" />
        <input type="date" />
        <input type="time" />

        <div className={styles.buttons}>
          <button>Salvar</button>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}