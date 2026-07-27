"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, UserCheck, CreditCard, AlertCircle, Bell, CheckCheck, FileCheck2, } from 'lucide-react';
import Notification from './Notification';
import styles from './Card.module.css';
import { useRouter } from 'next/navigation';
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getNotifications } from "@/app/services/notificacaoService";


/**
 * Componente principal do Card de Notificações com Gerenciamento de Estado
 */


const CardNotification = () => {
  console.log("CARD DE NOTIFICAÇÕES RENDERIZADO")
  const router = useRouter();
  // Dados iniciais mockados
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getNotifications();

        console.log("Notificações:", data);

        setNotifications(data);
      } catch (err) {
        console.error("ERRO COMPLETO:", err);
        console.error("Mensagem:", err.message);
        console.error("Detalhes:", err);
      }
    }

    loadNotifications();
  }, []);

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
