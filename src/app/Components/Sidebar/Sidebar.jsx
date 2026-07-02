import React from 'react';
import { 
  LayoutDashboard, 
  CalendarRange, 
  FileText, 
  Users, 
  Ticket, 
  Map, 
  DollarSign, 
  BarChart3, 
  Settings,
  X
} from 'lucide-react';
import styles from './Sidebar.module.css';

/**
 * Sidebar Responsiva - Eco Manager
 * 
 * @param {Object} props
 * @param {string} props.activeItem - Item de menu ativo
 * @param {boolean} props.isOpen - Estado do menu em mobile
 * @param {Function} props.onClose - Função para fechar o menu em mobile
 */
const Sidebar = ({ activeItem = 'dashboard', isOpen = false, onClose }) => {
  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'Appointments', label: 'Agendamentos', icon: CalendarRange },
    { id: 'Contracts', label: 'Contratos', icon: FileText },
    { id: 'Reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'Settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Overlay para fechar o menu ao clicar fora em mobile */}
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <img src="/Logo.png" alt="Logo" className={styles.logoImg} />
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>ECO</span>
              <span className={styles.logoSubtitle}>MANAGER</span>
            </div>
          </div>
          
          {/* Botão de fechar visível apenas em mobile */}
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <a 
              key={item.id} 
              href={`/${item.id}`} 
              className={`${styles.navItem} ${activeItem === item.id ? styles.active : ''}`}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
            >
              <item.icon size={22} className={styles.icon} />
              <span className={styles.label}>{item.label}</span>
              {activeItem === item.id && <div className={styles.activeIndicator} />}
            </a>
          ))}
        </nav>

        <div className={styles.footer}>
          <span className={styles.version}>v2.4.1 — Parque Aquático</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;