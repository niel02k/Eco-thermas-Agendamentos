"use client";

import { useState } from "react";
import styles from "./CardSettings.module.css";

export default function CardEdSettings() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function validate() {
    let newErrors = {};

    if (!form.name) newErrors.name = "Nome é obrigatório";

    if (!form.email) {
      newErrors.email = "Email é obrigatório";
    } else if (!form.email.includes("@")) {
      newErrors.email = "Email inválido";
    }

    if (!form.phone) newErrors.phone = "Telefone é obrigatório";

    if (!form.role) newErrors.role = "Selecione o tipo de usuário";

    if (!form.password) newErrors.password = "Senha é obrigatória";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (validate()) {
      alert("Formulário enviado com sucesso!");
    }
  }

  return (
    <form className={styles.cardSettings} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Editar Perfil</h2>

      {/* Nome */}
      <div className={styles.formGroup}>
        <label>Nome do Funcionário</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          type="text"
          placeholder="Digite o nome"
        />
        {errors.name && <span className={styles.error}>{errors.name}</span>}
      </div>

      {/* Email */}
      <div className={styles.formGroup}>
        <label>Email</label>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          type="email"
          placeholder="Digite o email"
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </div>

      {/* Telefone */}
      <div className={styles.formGroup}>
        <label>Telefone</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          type="tel"
          placeholder="Digite o telefone"
        />
        {errors.phone && <span className={styles.error}>{errors.phone}</span>}
      </div>

      {/* Select de tipo de usuário */}
      <div className={styles.formGroup}>
        <label>Tipo de Usuário</label>

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="">Selecione o tipo</option>
          <option value="admin">Administrador</option>
          <option value="funcionario">Funcionário</option>
        </select>

        {errors.role && <span className={styles.error}>{errors.role}</span>}
      </div>

      {/* Senha */}
      <div className={styles.formGroup}>
        <label>Senha</label>

        <div className={styles.inputIconBox}>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha"
          />

          <span
            className={styles.icon}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {errors.password && (
          <span className={styles.error}>{errors.password}</span>
        )}
      </div>

      <button className={styles.btnSave} type="submit">
        Salvar Alterações
      </button>
    </form>
  );
}