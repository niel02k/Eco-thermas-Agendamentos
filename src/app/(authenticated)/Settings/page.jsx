"use client";

import { useState } from "react";
import styles from "./settings.module.css";

export default function Settings() {
  const [schedule, setSchedule] = useState({
    monday: { open: true, openTime: "08:00", closeTime: "18:00" },
    tuesday: { open: true, openTime: "08:00", closeTime: "18:00" },
    wednesday: { open: true, openTime: "08:00", closeTime: "18:00" },
    thursday: { open: true, openTime: "08:00", closeTime: "18:00" },
    friday: { open: true, openTime: "08:00", closeTime: "18:00" },
    saturday: { open: false, openTime: "09:00", closeTime: "14:00" },
    sunday: { open: false, openTime: "", closeTime: "" },
  });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "Funcionario",
  });

  const handleUserChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const toggleDay = (day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        open: !prev[day].open,
      },
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const dayLabels = {
    monday: "Segunda",
    tuesday: "Terça",
    wednesday: "Quarta",
    thursday: "Quinta",
    friday: "Sexta",
    saturday: "Sábado",
    sunday: "Domingo",
  };

  const saveSettings = () => {
    console.log("Schedule:", schedule);
  };

  const createUser = () => {
    console.log("Novo usuário:", newUser);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Configurações</h1>

      {/* DÍAS E HORÁRIOS */}
      <section className={styles.card}>
        <h2>Dias e Horários de Funcionamento</h2>

        <div className={styles.scheduleGrid}>
          {Object.keys(schedule).map((day) => (
            <div key={day} className={styles.dayCard}>
              <div className={styles.dayHeader}>
                <span>{dayLabels[day]}</span>

                <button
                  onClick={() => toggleDay(day)}
                  className={
                    schedule[day].open
                      ? styles.openBtn
                      : styles.closedBtn
                  }
                >
                  {schedule[day].open ? "Aberto" : "Fechado"}
                </button>
              </div>

              {schedule[day].open && (
                <div className={styles.timeRow}>
                  <input
                    type="time"
                    value={schedule[day].openTime}
                    onChange={(e) =>
                      handleTimeChange(day, "openTime", e.target.value)
                    }
                    className={styles.timeInput}
                  />

                  <span>até</span>

                  <input
                    type="time"
                    value={schedule[day].closeTime}
                    onChange={(e) =>
                      handleTimeChange(day, "closeTime", e.target.value)
                    }
                    className={styles.timeInput}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={saveSettings} className={styles.button}>
          Salvar horários
        </button>
      </section>

      {/* CRIAR USUÁRIO */}
      <section className={styles.card}>
        <h2>Criar Usuário</h2>

        <input
          name="name"
          placeholder="Nome"
          onChange={handleUserChange}
          className={styles.input}
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleUserChange}
          className={styles.input}
        />

        <input
          name="password"
          type="password"
          placeholder="Senha"
          onChange={handleUserChange}
          className={styles.input}
        />

        <select
          name="role"
          onChange={handleUserChange}
          className={styles.select}
        >
          <option value="Administrador">Administrador</option>
          <option value="Funcionario">Funcionário</option>
        </select>

        <button onClick={createUser} className={styles.button}>
          Criar usuário
        </button>
      </section>
      <section className={styles.card}> 
        <h2>Sistema</h2> 
        <label> <input type="checkbox" />Receber notificações </label> 
         <label> <input type="checkbox" /> Exibir telefone </label> 
         <label> <input type="checkbox" /> Permitir contato direto </label> 
      </section>
    </div>
  );
}