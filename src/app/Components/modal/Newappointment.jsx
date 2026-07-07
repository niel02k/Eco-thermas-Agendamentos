"use client";

import styles from "./modal.module.css";
import {useState} from 'react';

export default function NewAppointment({ onClose }) {
  const [time, setTime] = useState("");
  const [errorTime, setErrorTime] = useState('');
      const handleHorario = (e) => {
      const value = e.target.value;

      if (value < "10:00" || value > "17:00") {
        setErrorTime('O parque não funciuona neste horario.')
      } else {
        setErrorTime('');
      }

      setTime(value);
    };
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

          </button>
        </div>

        <div className={styles.body}>

          {/* Linha 1 */}
          <div className={styles.rowCode}>
            <div className={`${styles.field} ${styles.codeField}`}>
              <label>Código</label>
              <input
                type="text"
                placeholder="AGD-0001"
                maxLength={20}
              />
            </div>

            <div className={styles.field}>
              <label>Cliente</label>
              <input
                type="text"
                placeholder="Pesquisar cliente..."
                maxLength={100}
              />
            </div>
          </div>

          {/* Linha 2 */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Data de Nascimento</label>
              <input 
                type="date" 
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className={styles.field}>
              <label>CPF</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>
          </div>

          {/* Linha 3 */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Data da Visita</label>
              <input 
                type="date" 
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className={styles.field}>
              <label>Horário</label>
              <input 
                type="time" 
                value={time}
                onChange={handleHorario}
              />

              {errorTime && (
                <span className={styles.error}>
                  {errorTime}
                </span>
              )}
            </div>
          </div>

          {/* Linha 4 */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Vendedor</label>
              <input
                type="text"
                placeholder="Pesquisar vendedor..."
                maxLength={100}
              />
            </div>

            <div className={styles.field}>
              <label>Cidade</label>
              <input
                type="text"
                placeholder="Cidade"
                maxLength={40}
              />
            </div>
          </div>

          {/* Observações */}
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