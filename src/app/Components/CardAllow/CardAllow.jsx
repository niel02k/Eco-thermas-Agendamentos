import React from 'react';
import styles from './CardAllow.module.css';

import { FilePenLine, User, Mail, Briefcase, FileText} from 'lucide-react';

const CardAllow = () => {
  return (
    <div className={styles.bottomPage}>
      <div className={styles.bottomCardA}>
       <div className={styles.bottomIR}>
          <div className={styles.iconRequest}>
            <FilePenLine size={40}  color= '#2563EB'/>
          </div>
        </div>

        <div className={styles.request}>
          <h1>Nova Requisição</h1>
          <h5>Preencha os dados abaixo para enviar sua requisição</h5>
        </div>

        <div className={styles.elements}>

          <div className={styles.contName}>
            <label>Nome</label>

            <div className={styles.inputWrapper}>
              <User size={18} color=' #757575' className={styles.inputIcon} />
              <input
                type='text'
                placeholder='Digite seu nome'
                className={styles.nameInput}
              />
            </div>
          </div>

          <div className={styles.contEmail}>
            <label>E-mail</label>

            <div className={styles.inputWrapper}>
              <Mail size={18} color=' #757575' className={styles.inputIcon} />
              <input
                type='email'
                placeholder='Digite seu E-mail'
                className={styles.emailInput}
              />
            </div>
          </div>

          <div className={styles.contPosition}>
            <label>Cargo</label>

            <div className={styles.inputWrapper}>
              <Briefcase size={18} color=' #757575' className={styles.inputIcon} />
              <input
                type='text'
                placeholder='Digite seu cargo'
                className={styles.positionInput}
              />
            </div>
          </div>

          <div className={styles.contDescription}>
            <label>Descrição</label>

            <div className={styles.inputWrapperDescription}>
              <FileText size={18} color=' #757575 ' className={styles.inputIconDescription}  />
              <textarea
                type='text'
                placeholder='Explique o motivo da solicitação'
                className={styles.descriptionInput}
              />
            </div>
          </div>

        </div>
        <div className={styles.contButton}>
          <button className={styles.button}>Enviar Solicitação</button>
        </div>

      </div>
    </div>
  );
};

export default CardAllow;