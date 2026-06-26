import React from 'react';
import { Bell } from 'lucide-react'; // Ícone de fallback caso o principal falhe
import styles from './Card.module.css';

/**
 * Componente individual de notificação com proteção contra erro de renderização
 */
const Notification = ({ title, description, time, icon: Icon, iconColor, isUnread }) => {
  // Proteção: Se o Icon for undefined por algum motivo, usa o ícone de Bell como padrão
  const RenderIcon = Icon || Bell;

  return (
    <div className={`${styles.notificationItem} ${isUnread ? styles.unread : ''}`}>
      <div 
        className={styles.iconWrapper} 
        style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
      >
        <RenderIcon size={18} />
      </div>
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles.description}>{description}</span>
        <span className={styles.time}>{time}</span>
      </div>
    </div>
  );
};

export default Notification;
