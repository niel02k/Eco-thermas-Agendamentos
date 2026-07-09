"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import CardNotification from '@/app/Components/notifications/Card.jsx';
import styles from './Header.module.css';

/**

 * @param {Object} props
 * @param {string} props.userName - Nome do usuário
 * @param {string} props.userRole - Cargo do usuário
 * @param {string} props.initials - Iniciais para o avatar
 * @param {Function} props.onMenuOpen - Função para abrir o menu em mobile
 */
const Header = ({ 
  userName = "Usuário", 
  userRole = "Colaborador", 
  initials = "U",
  onMenuOpen 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Fechar o card ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        {/* Botão de Menu Hambúrguer (Apenas Mobile) */}
        <button 
          className={styles.menuBtn} 
          onClick={onMenuOpen}
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>

        {/* Barra de Busca */}
        <div className={styles.searchBar}>
          <Search size={20} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            className={styles.searchInput} 
          />
        </div>
      </div>
      
      {/* Ações do Usuário */}
      <div className={styles.userActions}>
        <div className={styles.notificationWrapper} ref={notificationRef}>
          <button 
            className={`${styles.notificationBtn} ${showNotifications ? styles.active : ''}`} 
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notificações"
          >
            <Bell size={22} />
            <span className={styles.notificationBadge}></span>
          </button>

          {/* Renderização condicional do Card */}
          {showNotifications && <CardNotification />}
        </div>
        
        <div className={styles.userProfile}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>{userRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
