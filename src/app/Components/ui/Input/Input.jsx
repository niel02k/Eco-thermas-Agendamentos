import React from 'react';
import styles from './Input.module.css';

/**
 * Componente de Input reutilizável para o projeto Eco Manager.
 * 
 * @param {Object} props
 * @param {string} props.label - Rótulo do campo
 * @param {string} props.id - ID único do input
 * @param {string} props.type - Tipo do input (text, email, password, etc.)
 * @param {string} props.placeholder - Texto de ajuda
 * @param {any} props.value - Valor do campo
 * @param {Function} props.onChange - Função de mudança
 * @param {React.ReactNode} props.icon - Ícone do Lucide React
 * @param {React.ReactNode} [props.rightElement] - Elemento opcional à direita (ex: toggle de senha)
 * @param {boolean} [props.required] - Se o campo é obrigatório
 */
const Input = ({ label, id, type = 'text', placeholder, value, onChange, icon: Icon, rightElement,required = false }) => {
  return (
    <div className={styles.inputGroup}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={styles.inputWrapper}>
        {Icon && <Icon className={styles.inputIcon} size={20} />}
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          className={styles.input}
          value={value}
          onChange={onChange}
          required={required}
        />
        {rightElement && (
          <div className={styles.rightElement}>
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;