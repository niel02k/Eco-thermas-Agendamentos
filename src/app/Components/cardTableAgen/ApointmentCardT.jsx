"use client";
import styles from "./ApointmentCardT.module.css";

import {
  Eye,
  Pencil,
  Trash2,
  X
} from "lucide-react";




export default function ApointmentCardT({
  agendamento,
  onClose,
  onVisualizar,
  onEditar,
  onExcluir
}) {

  if (!agendamento) return null;


  return (

    <div className={styles.overlay}>

      <div className={styles.card}>


        <button 
          className={styles.close}
          onClick={onClose}
        >
          <X size={20}/>
        </button>


        <h2>
          Agendamento #{agendamento.codigo}
        </h2>


        <div className={styles.info}>

          <p>
            <strong>Cliente:</strong>
            {agendamento.cliente?.nome}
          </p>


          <p>
            <strong>Telefone:</strong>
            {agendamento.cliente?.telefone || "—"}
          </p>


          <p>
            <strong>Cidade:</strong>
            {agendamento.cidade}
          </p>


          <p>
            <strong>Data:</strong>
            {agendamento.data_visita}
          </p>


          <p>
            <strong>Horário:</strong>
            {agendamento.horario_visita}
          </p>


          <p>
            <strong>Pessoas:</strong>
            {agendamento.quantidade_pessoas}
          </p>


          <p>
            <strong>Status:</strong>
            {agendamento.status}
          </p>


        </div>


        <div className={styles.actions}>


          <button
            onClick={() => onVisualizar(agendamento.codigo)}
          >
            <Eye size={18}/>
            Ver
          </button>



          <button
            onClick={() => onEditar(agendamento.codigo)}
          >
            <Pencil size={18}/>
            Editar
          </button>



          <button
            onClick={() => onExcluir(agendamento.codigo)}
          >
            <Trash2 size={18}/>
            Excluir
          </button>


        </div>


      </div>

    </div>

  );
}