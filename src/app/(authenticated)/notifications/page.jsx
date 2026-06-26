"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  CalendarCheck, UserCheck, CreditCard, AlertCircle,
  Bell, CheckCheck, Search, Trash2, X, Filter, FileCheck2, ChevronDown
} from 'lucide-react';

import PageHeader from '@/app/Components/PageHeader/PageHeader.jsx';
import Notification from '@/app/Components/notifications/Notification.jsx';
import styles from './NotificationsPage.module.css';

const FILTER_TABS = [
  { key: 'todos', label: 'Todos' },
  { key: 'nao-lidas', label: 'Não lidas' },
  { key: 'agendamento', label: 'Agendamentos' },
  { key: 'financeiro', label: 'Financeiro' },
  { key: 'contrato', label: 'Contratos' },
  { key: 'alerta', label: 'Alertas' },
  { key: 'cadastro', label: 'Cadastros' },
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Novo Agendamento", description: "Carlos Mendes confirmou para amanhã às 14h.", time: "2 min atrás", icon: CalendarCheck, iconColor: "#1E6EBE", isUnread: true, category: "agendamento" },
    { id: 2, title: "Contrato Assinado", description: "Ana Paula assinou o contrato de fidelidade.", time: "15 min atrás", icon: UserCheck, iconColor: "#3CC83C", isUnread: true, category: "contrato" },
    { id: 3, title: "Pagamento Pendente", description: "O boleto de Bruno Leite vence hoje.", time: "1h atrás", icon: CreditCard, iconColor: "#FA643C", isUnread: false, category: "financeiro" },
    { id: 4, title: "Alerta de Capacidade", description: "O parque atingiu 85% da capacidade permitida.", time: "3h atrás", icon: AlertCircle, iconColor: "#FAD228", isUnread: false, category: "alerta" },
    { id: 5, title: "Novo Cliente", description: "Juliana Silva se cadastrou via site.", time: "5h atrás", icon: UserCheck, iconColor: "#1E6EBE", isUnread: false, category: "cadastro" },
    { id: 6, title: "Revisão de Contrato", description: "O contrato #442 precisa de revisão manual.", time: "1 dia atrás", icon: FileCheck2, iconColor: "#991094", isUnread: false, category: "contrato" },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));

  const markAsRead = (id) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: false } : n));

  const deleteNotification = (id) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const getCount = (key) => {
    if (key === 'todos') return notifications.length;
    if (key === 'nao-lidas') return notifications.filter(n => n.isUnread).length;
    return notifications.filter(n => n.category === key).length;
  };

  const visibleTabs = FILTER_TABS.filter(t => t.key === 'todos' || getCount(t.key) > 0);

  const activeLabel = FILTER_TABS.find(t => t.key === activeFilter)?.label ?? 'Todos';

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q);
      const matchesFilter =
        activeFilter === 'todos' ||
        (activeFilter === 'nao-lidas' && n.isUnread) ||
        n.category === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [notifications, searchQuery, activeFilter]);

  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <div className={styles.content}>
          <PageHeader
            title="Todas as Notificações"
            subtitle="Gerencie alertas e atualizações do sistema"
            badge={{ text: unreadCount > 0 ? `${unreadCount} novas` : 'Em dia', type: unreadCount > 0 ? 'success' : 'neutral' }}
            actionLabel={unreadCount > 0 ? 'Marcar todas como lidas' : undefined}
            actionIcon={CheckCheck}
            onAction={markAllAsRead}
          />

          <div className={styles.filterBar}>
            {/* Busca */}
            <div className={styles.search}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Buscar notificações..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={styles.clearSearch}
                  title="Limpar busca"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Desktop: tabs normais */}
            <div className={styles.filters}>
              {visibleTabs.map(tab => (
                <button
                  key={tab.key}
                  className={`${styles.filterBtn} ${activeFilter === tab.key ? styles.filterBtnActive : ''}`}
                  onClick={() => setActiveFilter(tab.key)}
                >
                  {tab.key === 'todos' && <Filter size={13} />}
                  {tab.label}
                  <span className={`${styles.filterCount} ${activeFilter === tab.key ? styles.filterCountActive : ''}`}>
                    {getCount(tab.key)}
                  </span>
                </button>
              ))}
            </div>

            {/* Mobile: dropdown */}
            <div className={styles.filterDropdown} ref={dropdownRef}>
              <button
                className={styles.filterDropdownTrigger}
                onClick={() => setDropdownOpen(prev => !prev)}
              >
                <Filter size={14} />
                {activeLabel}
                {activeFilter !== 'todos' && (
                  <span className={styles.filterCountActive} style={{ fontSize: '11px', padding: '1px 6px' }}>
                    {getCount(activeFilter)}
                  </span>
                )}
                <ChevronDown
                  size={14}
                  style={{ marginLeft: 'auto', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {dropdownOpen && (
                <div className={styles.filterDropdownMenu}>
                  {visibleTabs.map(tab => {
                    const isActive = activeFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        className={`${styles.filterDropdownItem} ${isActive ? styles.filterDropdownItemActive : ''}`}
                        onClick={() => { setActiveFilter(tab.key); setDropdownOpen(false); }}
                      >
                        {/* Checkbox visual */}
                        <span className={`${styles.checkbox} ${isActive ? styles.checkboxChecked : ''}`}>
                          {isActive && <CheckCheck size={11} color="#fff" />}
                        </span>
                        {tab.label}
                        <span className={`${styles.filterCount} ${isActive ? styles.filterCountActive : ''}`}
                          style={{ marginLeft: 'auto' }}>
                          {getCount(tab.key)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Lista */}
          <div className={styles.notificationGrid}>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(notif => (
                <div
                  key={notif.id}
                  className={`${styles.notificationWrapper} ${notif.isUnread ? styles.notificationUnread : ''}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <Notification {...notif} />
                  <button
                    className={styles.deleteBtn}
                    onClick={e => { e.stopPropagation(); deleteNotification(notif.id); }}
                    title="Excluir notificação"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <Bell size={40} strokeWidth={1.5} />
                <h3>Nenhuma notificação encontrada</h3>
                <p>
                  {searchQuery
                    ? `Sem resultados para "${searchQuery}"`
                    : 'Não há notificações nesta categoria.'}
                </p>
                {(searchQuery || activeFilter !== 'todos') && (
                  <button
                    onClick={() => { setSearchQuery(''); setActiveFilter('todos'); }}
                    className={styles.clearFiltersBtn}
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {filteredNotifications.length > 0 && (
            <p className={styles.countLabel}>
              Exibindo {filteredNotifications.length} de {notifications.length} notificações
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;