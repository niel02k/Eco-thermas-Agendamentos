"use client";

import styles from "./modal.module.css";

export default function NewAppointment({ onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <h2>Novo Agendamento</h2>
            <p>Cadastre um novo agendamento para um visitante.</p>
          </div>

          <button
            className={styles.closeButton}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <div className={`${styles.field} ${styles.codigoField}`}>
            <label>Código</label>
            <input
              type="text"
              placeholder="AGD-0001"
              maxLength={20}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Cliente</label>
              <input
                type="text"
                placeholder="Pesquisar cliente..."
                maxLength={100}
              />
            </div>

            <div className={styles.field}>
              <label>Vendedor</label>
              <input
                type="text"
                placeholder="Pesquisar vendedor..."
                maxLength={100}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Data da visita</label>
              <input type="date" />
            </div>

            <div className={styles.field}>
              <label>Horário</label>
              <input type="time" />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Cidade</label>
              <input
                type="text"
                placeholder="Cidade"
                maxLength={40}
              />
            </div>

            <div className={styles.field}>
              <label>Quantidade de Pessoas</label>
              <input
                type="number"
                min="1"
                max="8"
                defaultValue="1"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Observações</label>

            <textarea
              rows="4"
              placeholder="Digite alguma observação..."
              maxLength={500}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
          >
            Cancelar
          </button>

          <button className={styles.saveButton}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}