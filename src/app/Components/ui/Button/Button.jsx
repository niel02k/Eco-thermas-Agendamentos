import React from 'react';
import styles from './Button.module.css';

/**
 * Componente de Botão reutilizável para o projeto Eco Manager.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Conteúdo do botão (texto, ícones)
 * @param {string} [props.type="button"] - Tipo do botão (button, submit, reset)
 * @param {string} [props.variant="primary"] - Variante visual (primary, secondary, outline)
 * @param {boolean} [props.isLoading=false] - Estado de carregamento
 * @param {boolean} [props.disabled=false] - Estado desabilitado
 * @param {Function} [props.onClick] - Função de clique
 * @param {React.ReactNode} [props.icon] - Ícone opcional do Lucide React
 * @param {string} [props.className] - Classes CSS adicionais
 */
const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  isLoading = false, 
  disabled = false, 
  onClick, 
  icon: Icon,
  className = ''
}) => {
  const buttonClasses = `${styles.button} ${styles[variant]} ${className}`;

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <div className={styles.loader}></div>
      ) : (
        <>
          {Icon && <Icon size={20} className={styles.icon} />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;