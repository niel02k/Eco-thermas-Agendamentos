import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './StatCard.module.css';

const StatCard = ({ title, value, label, trend, icon: Icon, color = 'blue' }) => {
  const isPositive = trend > 0;
  
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.header}>
        <div className={styles.iconContainer}>
          <Icon size={20} />
        </div>
        <div className={`${styles.trend} ${isPositive ? styles.positive : styles.negative}`}>
          
         
        </div>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.value}>{value}</h3>
        <p className={styles.label}>{label}</p>
      </div>
    </div>
  );
};

export default StatCard;