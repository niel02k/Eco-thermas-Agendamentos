// src/app/Components/modal/Newappointment.jsx
"use client";

import styles from "./modal.module.css";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useConsultores } from "@/app/hooks/useConsultores";
import { useDisponibilidadeParque } from "@/app/hooks/useDisponibilidadeParque";
import { useAgendamentosForm } from "@/app/hooks/agendamentos/useAgendamentosForm";

export default function NewAppointment({ 
  onClose, 
  onSubmit,
  dadosEdicao = null
}) {
  const { consultores, loading: loadingConsultores } = useConsultores();
  const { diasAbertos, loading: loadingDias, formatarDataDisponivel } = useDisponibilidadeParque();
  
  const { 
    loading, 
    erro, 
    sucesso, 
    agendamentoSalvo,
    salvar, 
    resetar,
    erroCPF,
    verificandoCPF,
    validarCPF,
  } = useAgendamentosForm(async (agendamento) => {
    if (onSubmit) {
      await onSubmit(agendamento);
    }
  });
  
  const [errorTime, setErrorTime] = useState('');
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(0);
  const [companions, setCompanions] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedCompanions, setConfirmedCompanions] = useState(false);
  const [currentCompanion, setCurrentCompanion] = useState(0);
  const [form, setForm] = useState({
    codigo: "",
    cliente_id: "",
    cliente: "",
    idade: "",
    cpf: "",
    dataVisita: "",
    horario: "",
    vendedor_id: "",
    cidade: "",
    origem: "OUTRO",
    observacoes: "",
    status: "PENDENTE",
    resultado_visita: "PENDENTE",
    resultado_venda: "PENDENTE",
  });

  const isEdicao = !!dadosEdicao;

  const idadeTitular = Number(form.idade);

  const datasDisponiveis = useMemo(() => {
    if (!diasAbertos || diasAbertos.length === 0) return [];
    return diasAbertos.map(data => ({
      value: data,
      label: formatarDataDisponivel(data),
    }));
  }, [diasAbertos, formatarDataDisponivel]);

  useEffect(() => {
    if (!isEdicao) {
      const hoje = new Date();
      const ano = String(hoje.getFullYear()).slice(-2);
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const prefixo = `${ano}${mes}`;
      setForm(prev => ({ ...prev, codigo: `${prefixo}` }));
    }
  }, [isEdicao]);

  useEffect(() => {
    if (sucesso && agendamentoSalvo) {
      setForm(prev => ({ ...prev, codigo: agendamentoSalvo.codigo }));
    }
  }, [sucesso, agendamentoSalvo]);

  useEffect(() => {
    if (dadosEdicao) {
      setForm({
        codigo: dadosEdicao.codigo || "",
        cliente_id: dadosEdicao.cliente_id || "",
        cliente: dadosEdicao.cliente?.nome || "",
        idade: dadosEdicao.cliente?.idade || "",
        cpf: dadosEdicao.cliente?.cpf || "",
        dataVisita: dadosEdicao.data_visita || "",
        horario: dadosEdicao.horario_visita?.slice(0, 5) || "",
        vendedor_id: dadosEdicao.vendedor_id || "",
        cidade: dadosEdicao.cidade || "",
        origem: dadosEdicao.origem || "OUTRO",
        observacoes: dadosEdicao.observacoes || "",
        status: dadosEdicao.status || "PENDENTE",
        resultado_visita: dadosEdicao.resultado_visita || "PENDENTE",
        resultado_venda: dadosEdicao.resultado_venda || "PENDENTE",
      });

      if (dadosEdicao.dependentes && dadosEdicao.dependentes.length > 0) {
        const deps = dadosEdicao.dependentes.map(dep => ({
          nome: dep.nome || "",
          idade: dep.idade || "",
          cpf: dep.cpf || "",
        }));
        setAmount(deps.length);
        setCompanions(deps);
        setCurrentCompanion(0);
      } else {
        setAmount(0);
        setCompanions([]);
        setCurrentCompanion(0);
      }
    }
  }, [dadosEdicao]);

  // Validar CPF duplicado
  useEffect(() => {
    if (form.cpf && form.cpf.replace(/\D/g, '').length === 11 && !isEdicao) {
      validarCPF(form.cpf);
    }
  }, [form.cpf, isEdicao, validarCPF]);

  const idadeValida = idadeTitular >= 18 && idadeTitular < 120;
  const cpfValido = form.cpf.replace(/\D/g, "").length === 11;

  const formValid =
    form.cliente.trim() !== "" &&
    form.idade !== "" &&
    idadeValida &&
    cpfValido &&
    form.dataVisita !== "" &&
    form.horario !== "" &&
    form.cidade.trim() !== "" &&
    errorTime === "" &&
    erroCPF === "" &&
    !verificandoCPF;

  const companionsValid =
    companions.length === 0 ||
    companions.every((person) => {
      const idadeDep = Number(person.idade);
      const depMenor6Anos = idadeDep > 0 && idadeDep < 6;
      const nomeValido = person.nome.trim().length >= 3;
      const idadeDepValida = idadeDep > 0 && idadeDep < 120;
      const cpfValido = depMenor6Anos 
        ? true 
        : person.cpf.replace(/\D/g, "").length === 11;
      return nomeValido && idadeDepValida && cpfValido;
    });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleIdadeChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setForm((prev) => ({ ...prev, idade: value }));
  }, []);

  const handleAmount = useCallback((e) => {
    const novaQuantidade = Number(e.target.value);
    const quantidadeAnterior = companions.length;
    if (novaQuantidade === quantidadeAnterior) return;
    if (novaQuantidade > quantidadeAnterior) {
      const novos = Array.from({ length: novaQuantidade - quantidadeAnterior }, () => ({
        nome: "", idade: "", cpf: "",
      }));
      setCompanions(prev => [...prev, ...novos]);
    } else {
      setCompanions(prev => prev.slice(0, novaQuantidade));
    }
    setAmount(novaQuantidade);
    if (currentCompanion >= novaQuantidade) {
      setCurrentCompanion(Math.max(0, novaQuantidade - 1));
    }
  }, [companions, currentCompanion]);

  const handleCompanionChange = useCallback((field, value) => {
    const list = [...companions];
    if (field === "nome") value = value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
    if (field === "idade") value = value.replace(/\D/g, "").slice(0, 3);
    if (field === "cpf") {
      value = value.replace(/\D/g, "").slice(0, 11);
      value = value.replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2");
    }
    list[currentCompanion][field] = value;
    setCompanions(list);
  }, [companions, currentCompanion]);

  const handleLettersOnly = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value.replace(/[^A-Za-zÀ-ÿ\s]/g, "") }));
  }, []);

  const handleCpf = useCallback((e) => {
    let cpf = e.target.value.replace(/\D/g, "").slice(0, 11);
    cpf = cpf.replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
    setForm((prev) => ({ ...prev, cpf }));
  }, []);

  const handleFinalizar = useCallback(async () => {
    const dados = {
      vendedor_id: form.vendedor_id || null,
      data_visita: form.dataVisita,
      horario_visita: form.horario,
      quantidade_pessoas: 1 + companions.length,
      observacoes: form.observacoes || null,
      cidade: form.cidade || "Não informada",
      origem: form.origem || "OUTRO",
      status: form.status || "PENDENTE",
      resultado_visita: form.resultado_visita || "PENDENTE",
      resultado_venda: form.resultado_venda || "PENDENTE",
      dependentes: companions.map(c => ({
        nome: c.nome,
        idade: Number(c.idade) || 0,
        cpf: Number(c.idade) < 6 ? null : (c.cpf || null),
      })),
    };

    if (isEdicao) {
      dados.codigo = dadosEdicao.codigo;
      dados.cliente_id = dadosEdicao.cliente_id;
    } else {
      dados.cliente = {
        nome: form.cliente,
        cpf: form.cpf,
        idade: Number(form.idade) || null,
      };
    }

    await salvar(dados, isEdicao);
  }, [form, companions, isEdicao, dadosEdicao, salvar]);

  const handleClose = useCallback(() => {
    resetar();
    onClose();
  }, [resetar, onClose]);

  if (sucesso && agendamentoSalvo) {
    return (
      <div className={styles.overlay} onClick={handleClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <div>
              <h2>✅ {isEdicao ? "Agendamento Atualizado!" : "Agendamento Criado!"}</h2>
              <p>O agendamento foi {isEdicao ? "atualizado" : "registrado"} com sucesso.</p>
            </div>
          </div>
          <div className={styles.body}>
            <div className={styles.successBox}>
              <h3>Código: <strong>{agendamentoSalvo.codigo || form.codigo}</strong></h3>
              <p><strong>Cliente:</strong> {form.cliente}</p>
              <p><strong>Idade:</strong> {form.idade} anos</p>
              <p><strong>CPF:</strong> {form.cpf}</p>
              <p><strong>Data:</strong> {new Date(form.dataVisita + "T00:00:00").toLocaleDateString("pt-BR")}</p>
              <p><strong>Horário:</strong> {form.horario}</p>
              <p><strong>Pessoas:</strong> {1 + companions.length}</p>
              <p><strong>Status:</strong> {form.status}</p>
            </div>
          </div>
          <div className={styles.footer}>
            <button className={styles.saveButton} onClick={handleClose}>Fechar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {erro && <div className={styles.errorBanner}>⚠️ {erro}</div>}

        {step === 1 && (
          <>
            <div className={styles.header}>
              <div>
                <h2>{isEdicao ? "Editar Agendamento" : "Novo Agendamento"}</h2>
                <p>{isEdicao ? "Atualize os dados do agendamento." : "Cadastre um novo agendamento para um visitante."}</p>
              </div>
            </div>

            <div className={styles.body}>
              <div className={styles.rowCode}>
                <div className={`${styles.field} ${styles.codeField}`}>
                  <label>Código</label>
                  <input type="text" name="codigo" value={form.codigo} readOnly className={styles.readOnlyInput} placeholder="Gerado automaticamente" />
                </div>
                <div className={styles.field}>
                  <label>Cliente (Titular) *</label>
                  <input type="text" name="cliente" value={form.cliente} onChange={handleLettersOnly} placeholder="Nome do titular..." maxLength={100} required disabled={isEdicao} />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Idade * (mínimo 18 anos)</label>
                  <input type="text" name="idade" value={form.idade} onChange={handleIdadeChange} placeholder="Ex: 35" maxLength={3} required disabled={isEdicao} />
                  {form.idade !== "" && !idadeValida && (
                    <small style={{ color: '#FA643C', fontSize: '0.75rem' }}>O titular deve ser maior de idade (18 anos ou mais)</small>
                  )}
                </div>
                <div className={styles.field}>
                  <label>CPF *</label>
                  <input type="text" name="cpf" value={form.cpf} onChange={handleCpf} placeholder="000.000.000-00" maxLength={14} required disabled={isEdicao} />
                  {verificandoCPF && (
                    <small style={{ color: '#6B7280', fontSize: '0.75rem' }}>Verificando CPF...</small>
                  )}
                  {erroCPF && (
                    <small style={{ color: '#DC2626', fontSize: '0.75rem' }}>{erroCPF}</small>
                  )}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Data da Visita *</label>
                  {loadingDias ? (
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', padding: '0.5rem 0' }}>Carregando datas disponíveis...</p>
                  ) : (
                    <select name="dataVisita" value={form.dataVisita} onChange={handleChange} className={styles.select} required>
                      <option value="">Selecione uma data...</option>
                      {datasDisponiveis.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  )}
                </div>
                <div className={styles.field}>
                  <label>Horário *</label>
                  <select name="horario" value={form.horario} onChange={(e) => { setErrorTime(""); setForm(prev => ({ ...prev, horario: e.target.value })); }} className={styles.select} required>
                    <option value="">Selecione...</option>
                    {["09:30", "10:00", "10:30", "11:00", "11:30"].map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Consultor</label>
                  <select name="vendedor_id" value={form.vendedor_id} onChange={handleChange} className={styles.select} disabled={loadingConsultores}>
                    <option value="">Nenhum (opcional)</option>
                    {Array.isArray(consultores) && consultores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Cidade *</label>
                  <input type="text" name="cidade" value={form.cidade} onChange={handleLettersOnly} placeholder="Cidade" maxLength={40} required />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Origem</label>
                  <select name="origem" value={form.origem} onChange={handleChange} className={styles.select}>
                    <option value="OUTRO">Selecione...</option>
                    <option value="Leads SDR">Leads SDR</option>
                    <option value="Direto">Direto</option>
                    <option value="Orgânico">Orgânico</option>
                    <option value="Day use">Day use</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>

                {isEdicao && (
                  <div className={styles.field}>
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange} className={styles.select}>
                      <option value="PENDENTE">Pendente</option>
                      <option value="CONFIRMADO">Confirmado</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </div>
                )}
              </div>

              {isEdicao && (
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>Resultado Visita</label>
                    <select name="resultado_visita" value={form.resultado_visita} onChange={handleChange} className={styles.select}>
                      <option value="PENDENTE">Pendente</option>
                      <option value="REALIZADO">Realizado</option>
                      <option value="FALTOU">Faltou</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Resultado Venda</label>
                    <select name="resultado_venda" value={form.resultado_venda} onChange={handleChange} className={styles.select}>
                      <option value="PENDENTE">Pendente</option>
                      <option value="VENDA_REALIZADA">Venda Realizada</option>
                      <option value="VENDA_PERDIDA">Venda Perdida</option>
                      <option value="NAO_APLICAVEL">Não Aplicável</option>
                    </select>
                  </div>
                </div>
              )}

              <div className={styles.field}>
                <label>Observações</label>
                <textarea name="observacoes" value={form.observacoes} onChange={handleChange} rows="4" placeholder="Digite alguma observação..." maxLength={500} />
              </div>

              <div className={styles.confirmArea}>
                <input type="checkbox" id="confirm" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
                <label htmlFor="confirm">Declaro que revisei todas as informações acima e confirmo que estão corretas.</label>
              </div>
            </div>

            <div className={styles.footer}>
              <button className={styles.cancelButton} onClick={handleClose}>Cancelar</button>
              <button className={styles.saveButton} disabled={!formValid || !confirmed} onClick={() => setStep(2)}>Continuar</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className={styles.header}>
              <div>
                <h2>Acompanhantes (Dependentes)</h2>
                <p>Informe os acompanhantes. Menores de 6 anos não precisam de CPF.</p>
              </div>
            </div>
            <div className={styles.body}>
              <div className={styles.peopleSelect}>
                <label>Acompanhantes</label>
                <select value={amount} onChange={handleAmount} className={styles.peopleSelectInput}>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <option key={num} value={num}>{num} Acompanhante{num !== 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>

              {companions.length > 0 && (
                <div className={styles.cardPerson}>
                  <h3>Acompanhante {currentCompanion + 1} de {companions.length}</h3>
                  <div className={styles.field}><label>Nome *</label><input type="text" value={companions[currentCompanion]?.nome || ""} onChange={(e) => handleCompanionChange("nome", e.target.value)} placeholder="Nome completo" /></div>
                  <div className={styles.field}><label>Idade *</label><input type="text" value={companions[currentCompanion]?.idade || ""} onChange={(e) => handleCompanionChange("idade", e.target.value)} placeholder="Ex: 10" maxLength={3} /></div>
                  <div className={styles.field}>
                    <label>CPF {Number(companions[currentCompanion]?.idade) >= 6 ? "*" : "(opcional)"}</label>
                    <input type="text" value={companions[currentCompanion]?.cpf || ""} onChange={(e) => handleCompanionChange("cpf", e.target.value)} placeholder={Number(companions[currentCompanion]?.idade) < 6 ? "Opcional para menores de 6 anos" : "000.000.000-00"} maxLength={14} required={Number(companions[currentCompanion]?.idade) >= 6} />
                  </div>
                  <div className={styles.navigationButtons}>
                    <button type="button" className={styles.navButton} disabled={currentCompanion === 0} onClick={() => setCurrentCompanion((prev) => prev - 1)}>Anterior</button>
                    <span className={styles.pageIndicator}>{currentCompanion + 1} / {companions.length}</span>
                    <button type="button" className={styles.navButton} disabled={currentCompanion === companions.length - 1} onClick={() => setCurrentCompanion((prev) => prev + 1)}>Próximo</button>
                  </div>
                </div>
              )}

              <div className={styles.confirmArea}>
                <input type="checkbox" id="confirmCompanions" checked={confirmedCompanions} onChange={(e) => setConfirmedCompanions(e.target.checked)} />
                <label htmlFor="confirmCompanions">Declaro que revisei os dados dos acompanhantes e confirmo que estão corretos.</label>
              </div>
            </div>
            <div className={styles.footer}>
              <button className={styles.cancelButton} onClick={() => { setStep(1); setConfirmed(false); }}>Voltar</button>
              <button className={styles.saveButton} disabled={!companionsValid || !confirmedCompanions || loading} onClick={handleFinalizar}>
                {loading ? "Salvando..." : isEdicao ? "Atualizar" : "Finalizar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}