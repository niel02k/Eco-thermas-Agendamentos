import React from 'react';
import styles from './ChartCard.module.css';

/**
 * Componente de Card para Gráficos - Eco Manager
 * 
 * @param {Object} props
 * @param {string} props.title - Título do gráfico
 * @param {string} props.subtitle - Subtítulo descritivo
 * @param {React.ReactNode} [props.badge] - Badge de métrica ou tendência
 * @param {React.ReactNode} props.children - O gráfico ou conteúdo visual
 * @param {string} [props.className] - Classes CSS adicionais
 */
const ChartCard = ({ title, subtitle, badge, children, className = '' }) => {
  return (
    <div className={`${styles.chartCard} ${className}`}>
      <div className={styles.header}>
        <div className={styles.info}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {badge && (
          <div className={styles.badgeContainer}>
            {badge}
          </div>
        )}
      </div>
      
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;