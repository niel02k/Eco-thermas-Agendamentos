"use client";

import React, { useEffect, useState } from "react";
import {Plus,CalendarCheck,CircleDollarSign,CheckCircle2,CalendarDays,Eye,Pencil,XCircle,Trash2,Clock3} from "lucide-react";

import PageHeader from "@/app/Components/PageHeader/PageHeader.jsx";
import StatCard from "@/app/Components/StatCard/StatCard.jsx";
import styles from "./Appointments.module.css";

/* -------------------------------------------------------------------------- */
/* MOCK DATA                                                                   */
/* -------------------------------------------------------------------------- */

const weekData = [
  { day: "Seg", total: 42 },
  { day: "Ter", total: 58 },
  { day: "Qua", total: 65 },
  { day: "Qui", total: 49 },
  { day: "Sex", total: 87 },
  { day: "Sab", total: 124 },
  { day: "Dom", total: 138 },
];

const bookings = [
  {
    id: 1,
    client: "João Silva",
    date: "22/06/2026",
    people: 5,
    phone: "(14) 99999-1111",
    status: "Confirmado",
  },
  {
    id: 2,
    client: "Maria Souza",
    date: "22/06/2026",
    people: 3,
    phone: "(14) 99999-2222",
    status: "Pendente",
  },
  {
    id: 3,
    client: "Carlos Mendes",
    date: "23/06/2026",
    people: 8,
    phone: "(14) 99999-3333",
    status: "Confirmado",
  },
  {
    id: 4,
    client: "Fernanda Costa",
    date: "24/06/2026",
    people: 2,
    phone: "(14) 99999-4444",
    status: "Cancelado",
  },
  {
    id: 5,
    client: "Ricardo Lima",
    date: "25/06/2026",
    people: 6,
    phone: "(14) 99999-5555",
    status: "Concluído",
  },
];

const recentActivities = [
  {
    id: 1,
    name: "João Silva",
    action: "Agendamento confirmado",
    time: "Hoje • 14:32",
    color: "#3CC83C",
  },
  {
    id: 2,
    name: "Maria Souza",
    action: "Novo agendamento criado",
    time: "Hoje • 13:10",
    color: "#1E6EBE",
  },
  {
    id: 3,
    name: "Carlos Mendes",
    action: "Pagamento recebido",
    time: "Hoje • 11:25",
    color: "#FA643C",
  },
  {
    id: 4,
    name: "Fernanda Costa",
    action: "Agendamento cancelado",
    time: "Ontem • 18:40",
    color: "#EF4444",
  },
];

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                    */
/* -------------------------------------------------------------------------- */

export default function AppointmentsPage() {
  const [visible, setVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleView = (id) => {
    console.log("Visualizar:", id);
  };

  const handleEdit = (id) => {
    console.log("Editar:", id);
  };

  const handleCancel = (id) => {
    console.log("Cancelar:", id);
  };

  const handleDelete = (id) => {
    console.log("Excluir:", id);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmado":
        return styles.statusConfirmed;

      case "Pendente":
        return styles.statusPending;

      case "Cancelado":
        return styles.statusCanceled;

      case "Concluído":
        return styles.statusFinished;

      default:
        return "";
    }
  };

  return (
    <div className={styles.container}>
      
      <main
        className={`${styles.mainContent} ${
          visible ? styles.mainVisible : ""
        }`}
      >
        <div className={styles.content}>
          <PageHeader
            title="Agendamentos"
            subtitle="Gestão operacional dos visitantes e reservas"
            badge={{
              text: "Sistema Ativo",
              type: "success",
            }}
            actionLabel="Novo Agendamento"
            actionIcon={Plus}
            onAction={() => console.log("Novo agendamento")}
          />

          {/* ---------------------------------------------------------------- */}
          {/* STATS                                                            */}
          {/* ---------------------------------------------------------------- */}

          <div className={styles.statsGrid}>
            {[
              {
                title: "Hoje",
                value: "127",
                label: "Agendamentos Hoje",
                trend: 12,
                icon: CalendarCheck,
                color: "blue",
              },
              {
                title: "Semana",
                value: "842",
                label: "Agendamentos Semana",
                trend: 8,
                icon: CalendarDays,
                color: "green",
              },
              {
                title: "Confirmados",
                value: "91%",
                label: "Taxa de Confirmação",
                trend: 4,
                icon: CheckCircle2,
                color: "green",
              },
              {
                title: "Receita",
                value: "R$ 42.890",
                label: "Receita Prevista",
                trend: 15,
                icon: CircleDollarSign,
                color: "yellow",
              },
            ].map((card, index) => (
              <div
                key={card.title}
                className={styles.cardEntry}
                style={{
                  animationDelay: `${index * 80}ms`,
                }}
              >
                <StatCard {...card} />
              </div>
            ))}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* WEEK + STATUS                                                    */}
          {/* ---------------------------------------------------------------- */}

          <div className={styles.scheduleRow}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>Agenda da Semana</h2>
                  <p>Fluxo previsto de visitantes</p>
                </div>
              </div>

              <div className={styles.weekGrid}>
                {weekData.map((item) => (
                  <div key={item.day} className={styles.dayCard}>
                    <span className={styles.dayName}>{item.day}</span>
                    <strong>{item.total}</strong>
                    <small>Visitantes</small>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>Status</h2>
                  <p>Resumo operacional</p>
                </div>
              </div>

              <div className={styles.statusList}>
                <div className={styles.statusItem}>
                  <div
                    className={styles.statusDot}
                    style={{ background: "#3CC83C" }}
                  />
                  <span>Confirmados</span>
                  <strong>187</strong>
                </div>

                <div className={styles.statusItem}>
                  <div
                    className={styles.statusDot}
                    style={{ background: "#FAD228" }}
                  />
                  <span>Pendentes</span>
                  <strong>23</strong>
                </div>

                <div className={styles.statusItem}>
                  <div
                    className={styles.statusDot}
                    style={{ background: "#FA643C" }}
                  />
                  <span>Cancelados</span>
                  <strong>8</strong>
                </div>

                <div className={styles.statusItem}>
                  <div
                    className={styles.statusDot}
                    style={{ background: "#1E6EBE" }}
                  />
                  <span>Concluídos</span>
                  <strong>351</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* TABLE                                                            */}
          {/* ---------------------------------------------------------------- */}

          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <div>
                <h2>Agendamentos</h2>
                <p>Próximas reservas cadastradas</p>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Pessoas</th>
                    <th>Telefone</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.client}</td>
                      <td>{booking.date}</td>
                      <td>{booking.people}</td>
                      <td>{booking.phone}</td>

                      <td>
                        <span
                          className={`${styles.statusBadge} ${getStatusClass(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>

                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.actionButton}
                            onClick={() => handleView(booking.id)}
                            title="Visualizar"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            className={styles.actionButton}
                            onClick={() => handleEdit(booking.id)}
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className={`${styles.actionButton} ${styles.cancelButton}`}
                            onClick={() => handleCancel(booking.id)}
                            title="Cancelar"
                          >
                            <XCircle size={16} />
                          </button>

                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDelete(booking.id)}
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* RECENT ACTIVITIES                                                */}
          {/* ---------------------------------------------------------------- */}

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Últimos Agendamentos</h2>
                <p>Atividade recente do sistema</p>
              </div>
            </div>

            <div className={styles.activityList}>
              {recentActivities.map((item) => (
                <div key={item.id} className={styles.activityItem}>
                  <div
                    className={styles.activityAvatar}
                    style={{
                      backgroundColor: item.color,
                    }}
                  >
                    <Clock3 size={16} />
                  </div>

                  <div className={styles.activityInfo}>
                    <span className={styles.activityName}>
                      {item.name}
                    </span>

                    <span className={styles.activityAction}>
                      {item.action}
                    </span>
                  </div>

                  <span className={styles.activityTime}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}