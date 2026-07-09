"use client";

import styles from "./modal.module.css";
import { useState } from 'react';

export default function NewAppointment({ onClose }) {
  const [errorTime, setErrorTime] = useState('');
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(0);
  const [companions, setCompanions] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedCompanions, setConfirmedCompanions] = useState(false);
  const [currentCompanion, setCurrentCompanion] = useState(0);
  const [form, setForm] = useState({
    codigo: "",
    cliente: "",
    nascimento: "",
    cpf: "",
    dataVisita: "",
    horario: "",
    vendedor: "",
    cidade: "",
  });
  const formValid =
    form.codigo.trim() !== "" &&
    form.cliente.trim() !== "" &&
    form.nascimento !== "" &&
    form.cpf.replace(/\D/g, "").length === 11 &&
  form.dataVisita !== "" &&
    form.horario !== "" &&
    form.vendedor.trim() !== "" &&
    form.cidade.trim() !== "" &&
    errorTime === "";

  const companionsValid =
    companions.length === 0 ||
    companions.every((person) =>
      person.nome.trim().length >= 3 &&
      person.nascimento !== "" &&
      person.cpf.replace(/\D/g, "").length === 11
    );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHorario = (e) => {
    const value = e.target.value;

    if (value < "10:00" || value > "17:00") {
      setErrorTime("O parque não funciona neste horário.");

      setForm((prev) => ({
        ...prev,
        horario: "",
      }));

      return;
    }

    setErrorTime("");

    setForm((prev) => ({
      ...prev,
      horario: value,
    }));
  };

  const handleAmount = (e) => {
    const qtd = Number(e.target.value);

    setAmount(qtd);

    setCompanions(
      Array.from({ length: qtd }, () => ({
        nome: "",
        nascimento: "",
        cpf: "",
      }))
    );

    setCurrentCompanion(0);
  };

  const handleCompanionChange = (field, value) => {
    const list = [...companions];

    if (field === "nome") {
      value = value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
    }

    if (field === "cpf") {
      value = value.replace(/\D/g, "");
      value = value.slice(0, 11);

      value = value
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2");
    }

    list[currentCompanion][field] = value;

    setCompanions(list);
  };

  const handleLettersOnly = (e) => {
    const { name, value } = e.target;

    const onlyLetters = value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");

    setForm((prev) => ({
      ...prev,
      [name]: onlyLetters,
    }));
  };

  const handleCpf = (e) => {
    let cpf = e.target.value.replace(/\D/g, "");

    cpf = cpf.slice(0, 11);

    cpf = cpf
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");

    setForm((prev) => ({
      ...prev,
      cpf,
    }));
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
                    name="codigo"
                    value={form.codigo}
                    onChange={handleChange}
                    placeholder="AGD-0001"
                    maxLength={20}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>Cliente</label>
                  <input
                    type="text"
                    name="cliente"
                    value={form.cliente}
                    onChange={handleLettersOnly}
                    placeholder="Pesquisar cliente..."
                    maxLength={100}
                    required
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Data de Nascimento</label>
                  <input
                    type="date"
                    name="nascimento"
                    value={form.nascimento}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>CPF</label>
                  <input
                    type="text"
                    name="cpf"
                    value={form.cpf}
                    onChange={handleCpf}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Data da Visita</label>
                  <input
                    type="date"
                    name="dataVisita"
                    value={form.dataVisita}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>Horário</label>
                  <input
                    type="time"
                    name="horario"
                    value={form.horario}
                    onChange={handleHorario}
                    required
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
                    name="vendedor"
                    value={form.vendedor}
                    onChange={handleLettersOnly}
                    placeholder="Pesquisar vendedor..."
                    maxLength={100}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>Cidade</label>
                  <input
                    type="text"
                    name="cidade"
                    value={form.cidade}
                    onChange={handleLettersOnly}
                    placeholder="Cidade"
                    maxLength={40}
                    required
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

              <div className={styles.confirmArea}>
                <input
                  type="checkbox"
                  id="confirm"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />

                <label htmlFor="confirm">
                  Declaro que revisei todas as informações acima e confirmo que estão corretas.
                </label>
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
                disabled={!formValid || !confirmed}
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
              <div className={styles.peopleSelect}>
                <label>Acompanhantes</label>

                <select
                  value={amount}
                  onChange={handleAmount}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <option key={num} value={num}>
                      {num} Acompanhante{num !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {companions.length > 0 && (
                <div className={styles.cardPerson}>
                  <h3>
                    Acompanhante {currentCompanion + 1} de {companions.length}
                  </h3>

                  <div className={styles.field}>
                    <label>Nome</label>
                    <input
                      type="text"
                      value={companions[currentCompanion].nome}
                      onChange={(e) =>
                        handleCompanionChange("nome", e.target.value)
                      }
                      placeholder="Nome completo"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Data de Nascimento</label>
                    <input
                      type="date"
                      value={companions[currentCompanion].nascimento}
                      onChange={(e) =>
                        handleCompanionChange("nascimento", e.target.value)
                      }
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>CPF</label>
                    <input
                      type="text"
                      value={companions[currentCompanion].cpf}
                      onChange={(e) =>
                        handleCompanionChange("cpf", e.target.value)
                      }
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>

                  <div className={styles.navigationButtons}>
                    <button
                      type="button"
                      className={styles.navButton}
                      disabled={currentCompanion === 0}
                      onClick={() =>
                        setCurrentCompanion((prev) => prev - 1)
                      }
                    >
                      Anterior
                    </button>

                    <span className={styles.pageIndicator}>
                      {currentCompanion + 1} / {companions.length}
                    </span>

                    <button
                      type="button"
                      className={styles.navButton}
                      disabled={currentCompanion === companions.length - 1}
                      onClick={() =>
                        setCurrentCompanion((prev) => prev + 1)
                      }
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.confirmArea}>
                <input
                  type="checkbox"
                  id="confirmCompanions"
                  checked={confirmedCompanions}
                  onChange={(e) => setConfirmedCompanions(e.target.checked)}
                />

                <label htmlFor="confirmCompanions">
                  Declaro que revisei os dados dos acompanhantes e confirmo que estão corretos.
                </label>
              </div>

            </div>

            <div className={styles.footer}>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setStep(1);
                  setConfirmed(false);
                }}
              >
                Voltar
              </button>

              <button
                className={styles.saveButton}
                disabled={!companionsValid || !confirmedCompanions}
              >
                Finalizar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}