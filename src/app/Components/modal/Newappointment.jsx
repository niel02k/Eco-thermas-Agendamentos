"use client";

import styles from "./modal.module.css";
import { useState } from 'react';

export default function NewAppointment({ onClose }) {
  const [time, setTime] = useState("");
  const [errorTime, setErrorTime] = useState('');
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(1);
  const [companions, setCompanions] = useState([]);
  const [from, setFrom] = useState({
    codigo: "",
    cliente: "",
    nascimento: "",
    cpf: "",
    dataVisita: "",
    horario: "",
    vendedor: "",
    cidade: "",
    observacoes: "",
  });
  const handleHorario = (e) => {
    const value = e.target.value;

    if (value < "10:00" || value > "17:00") {
      setErrorTime('O parque não funciuona neste horario.')
    } else {
      setErrorTime('');
    }

    setTime(value);
  };

  const handleAmount = (e) => {
    const qtd = Number(e.target.value);

    setAmount(qtd);

    setCompanions(
      Array.from({ length: qtd - 1 }, () => ({
        nome: '',
        cpf: '',
      }))
    );
  };
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >

        {step === 1 && (
          <>
            <div className={styles.header}>
              <div>
                <h2>Novo Agendamento</h2>
                <p>Cadastre um novo agendamento para um visitante.</p>
              </div>
            </div>

            <div className={styles.body}>

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

              <button
                className={styles.saveButton}
                onClick={() => setStep(2)}
              >
                Continuar
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className={styles.header}>
              <div>
                <h2>Acompanhantes</h2>
                <p>Informe os acompanhantes do cliente.</p>
              </div>
            </div>

            <div className={styles.body}>
              <div className={styles.field}>
                <label>Quantidade de Pessoas</label>

                <select
                  value={amount}
                  onChange={handleAmount}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num} Pessoa{num > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {companions.map((person, index) => (
                <div
                  key={index}
                  className={styles.cardPerson}
                >
                  <h3>Acompanhante {index + 1}</h3>

                  <div className={styles.field}>
                    <label>Nome</label>

                    <input
                      type="text"
                      placeholder="Nome completo"
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
              ))}
            </div>

            <div className={styles.footer}>
              <button
                className={styles.cancelButton}
                onClick={() => setStep(1)}
              >
                Voltar
              </button>

              <button className={styles.saveButton}>
                Finalizar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}