"use client";

import React, { useState } from 'react';
import { Plus, CalendarCheck, UserCheck, CreditCard, AlertCircle,Bell,CheckCheck,Search,Filter,Trash2, FileCheck } from 'lucide-react';

import Sidebar from '@/app/Components/Sidebar/Sidebar.jsx';
import Headers from '@/app/Components/Header/Header.jsx';
import PageHeader from '@/app/Components/PageHeader/PageHeader.jsx';
import Notification from '@/app/Components/notifications/Notification.jsx';

import styles from './Notifications.module.css';

const NotificationsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Novo Agendamento", description: "Carlos Mendes confirmou para amanhã às 14h.", time: "2 min atrás", icon: CalendarCheck, iconColor: "#1E6EBE", isUnread: true, category: "agendamento" },
    { id: 2, title: "Contrato Assinado", description: "Ana Paula assinou o contrato de fidelidade.", time: "15 min atrás", icon: UserCheck, iconColor: "#3CC83C", isUnread: true, category: "contrato" },
    { id: 3, title: "Pagamento Pendente", description: "O boleto de Bruno Leite vence hoje.", time: "1h atrás", icon: CreditCard, iconColor: "#FA643C", isUnread: false, category: "financeiro" },
    { id: 4, title: "Alerta de Capacidade", description: "O parque atingiu 85% da capacidade permitida.", time: "3h atrás", icon: AlertCircle, iconColor: "#FAD228", isUnread: false, category: "alerta" },
    { id: 5, title: "Novo Cliente", description: "Juliana Silva se cadastrou via site.", time: "5h atrás", icon: UserCheck, iconColor: "#1E6EBE", isUnread: false, category: "cadastro" },
    { id: 6, title: "Revisão de Contrato", description: "O contrato #442 precisa de revisão manual.", time: "1 dia atrás", icon: FileCheck, iconColor: "#991094", isUnread: false, category: "contrato" },
  ]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => n.isUnread).length;

  return (
    <div className={styles.container}>
      <Sidebar activeItem="notificacoes" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={styles.mainContent}>
        <Headers 
          userName="Marcos Daniel" 
          userRole="Administrador" 
          initials="RM" 
          onMenuOpen={() => setIsSidebarOpen(true)}
        />

        <div className={styles.content}>
          <PageHeader
            title="Todas as Notificações"
            subtitle="Gerencie alertas e atualizações do sistema"
            badge={{ text: `${unreadCount} novas`, type: unreadCount > 0 ? "success" : "neutral" }}
            actionLabel="Marcar todas como lidas"
            actionIcon={CheckCheck}
            onAction={markAllAsRead}
          />

          <div className={styles.filterBar}>
            <div className={styles.search}>
              <Search size={18} />
              <input type="text" placeholder="Filtrar notificações..." />
            </div>
            <div className={styles.filters}>
              <button className={styles.filterBtn}><Filter size={16} /> Todos</button>
              <button className={styles.filterBtn}>Não lidas</button>
              <button className={styles.filterBtn}>Agendamentos</button>
            </div>
          </div>

          <div className={styles.notificationGrid}>
            {notifications.length > 0 ? (
              notifications.map(notif => (
                <div key={notif.id} className={styles.notificationWrapper}>
                  <Notification {...notif} />
                  <button 
                    className={styles.deleteBtn} 
                    onClick={() => deleteNotification(notif.id)}
                    title="Excluir notificação"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <Bell size={48} />
                <h3>Tudo limpo por aqui!</h3>
                <p>Você não tem nenhuma notificação no momento.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;
