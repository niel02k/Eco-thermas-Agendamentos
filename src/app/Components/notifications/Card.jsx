"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, UserCheck, CreditCard, AlertCircle,Bell,CheckCheck,FileCheck2,} from 'lucide-react';
import Notification from './Notification';
import styles from './Card.module.css';
import { useRouter } from 'next/navigation';

/**
 * Componente principal do Card de Notificações com Gerenciamento de Estado
 */

const router = useRouter

const CardNotification = () => {
  // Dados iniciais mockados
  const [notifications, setNotifications] = useState([
   { id: 1, title: "Novo Agendamento", description: "Carlos Mendes confirmou para amanhã às 14h.", time: "2 min atrás", icon: CalendarCheck, iconColor: "#1E6EBE", isUnread: true, category: "agendamento" },
    { id: 2, title: "Contrato Assinado", description: "Ana Paula assinou o contrato de fidelidade.", time: "15 min atrás", icon: UserCheck, iconColor: "#3CC83C", isUnread: true, category: "contrato" },
    { id: 3, title: "Pagamento Pendente", description: "O boleto de Bruno Leite vence hoje.", time: "1h atrás", icon: CreditCard, iconColor: "#FA643C", isUnread: false, category: "financeiro" },
    { id: 4, title: "Alerta de Capacidade", description: "O parque atingiu 85% da capacidade permitida.", time: "3h atrás", icon: AlertCircle, iconColor: "#FAD228", isUnread: false, category: "alerta" },
    { id: 5, title: "Novo Cliente", description: "Juliana Silva se cadastrou via site.", time: "5h atrás", icon: UserCheck, iconColor: "#1E6EBE", isUnread: false, category: "cadastro" },
    { id: 6, title: "Revisão de Contrato", description: "O contrato #442 precisa de revisão manual.", time: "1 dia atrás", icon: FileCheck2, iconColor: "#991094", isUnread: false, category: "contrato" },
  ]);

  // Função para marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  // Função para marcar uma individual como lida
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isUnread: false } : n
    ));
  };

  const notificacoes = () => { // ✅ const adicionado
    router.push('/notifications'); // ✅ router com os ()
  };

  const unreadCount = notifications.filter(n => n.isUnread).length;

  return (
    <div className={styles.cardContainer}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h3>Notificações</h3>
          {unreadCount > 0 && <span className={styles.unreadBadge}>{unreadCount} novas</span>}
        </div>
        {unreadCount > 0 && (
          <button className={styles.markReadBtn} onClick={markAllAsRead}>
            <CheckCheck size={14} />
            Marcar todas como lidas
          </button>
        )}
      </div>
      
      <div className={styles.notificationList}>
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div key={notif.id} onClick={() => markAsRead(notif.id)}>
              <Notification {...notif} />
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <Bell size={32} />
            <p>Nenhuma notificação por aqui.</p>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <Link href="/notifications" onClick={notificacoes} className={styles.viewAll}>
          Ver todas as notificações
        </Link>
      </div>
    </div>
  );
};

export default CardNotification;
