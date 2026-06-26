import React from 'react';
import Button from '@/app/Components/Button/Button.jsx';
import styles from './PageHeader.module.css';

/**
 * 
 * 
 * @param {Object} props
 * @param {string} props.title - Título principal da página
 * @param {string} props.subtitle - Subtítulo descritivo
 * @param {Object} [props.badge] - Objeto com texto e tipo do badge
 * @param {string} [props.actionLabel] - Texto do botão de ação
 * @param {React.ElementType} [props.actionIcon] - Ícone do botão de ação
 * @param {Function} [props.onAction] - Função chamada ao clicar no botão
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  badge, 
  actionLabel, 
  actionIcon, 
  onAction 
}) => {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      
      <div className={styles.actionsContainer}>
        {badge && (
          <div className={`${styles.badge} ${styles[badge.type || 'success']}`}>
            <div className={styles.badgeDot}></div>
            <span>{badge.text}</span>
          </div>
        )}
        
        {actionLabel && (
          <Button 
            icon={actionIcon} 
            onClick={onAction}
            className={styles.actionBtn}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;