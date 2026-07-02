"use client";

import styles from "./modal.module.css";

export default function NovoAgendamento({ onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Novo Agendamento</h2>
          <p>Crie seu novo agendamento aqui!</p>
        </div>

        <input
          placeholder="Código"
          type="text"
        />

        <select>
          <option>Cliente</option>
        </select>

        <select>
          <option>Vendedor</option>
        </select>

        <div className={styles.row}>
          <input type="date" />
          
          <input type="time"  />
        </div>

        <div className={styles.row}>
          <input
            placeholder="Cidade"
            type="text"
          />

          <input
            placeholder="Quant_Pessoas"
            type="number"
            min={1}
            max={8}
          />
        </div>

        <textarea
          placeholder="Observações"
        />

        <div className={styles.buttons}>
          <button>Salvar</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

//