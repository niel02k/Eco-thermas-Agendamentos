"use client";

import styles from "./modal.module.css";
import { useState, useEffect, useMemo } from 'react';
import { useConsultores } from "@/app/hooks/useConsultores";
import { useDisponibilidadeParque } from "@/app/hooks/useDisponibilidadeParque";

export default function NewAppointment({ 
  onClose, 
  onSubmit, 
  loading = false, 
  erro = null,
  sucesso = false,
  agendamentoCriado = null,
  dadosEdicao = null
}) {
  const { consultores, loading: loadingConsultores } = useConsultores();
  const { diasAbertos, loading: loadingDias, formatarDataDisponivel } = useDisponibilidadeParque();
  
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
    nascimento: "",
    cpf: "",
    dataVisita: "",
    horario: "",
    vendedor_id: "",
    cidade: "",
    observacoes: "",
    status: "PENDENTE",
  });

  // ── Datas disponíveis formatadas ──────────────────────────────
  const datasDisponiveis = useMemo(() => {
    return diasAbertos.map(data => ({
      value: data,
      label: formatarDataDisponivel(data),
    }));
  }, [diasAbertos, formatarDataDisponivel]);

  // ── Gerar código temporário para preview ──────────────────────
  useEffect(() => {
    if (!dadosEdicao) {
      const hoje = new Date();
      const ano = String(hoje.getFullYear()).slice(-2);
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const dia = String(hoje.getDate()).padStart(2, '0');
      const prefixo = `${ano}${mes}${dia}`;
      setForm(prev => ({ ...prev, codigo: `${prefixo}XXX` }));
    }
  }, [dadosEdicao]);

  // ── Mostrar código real após criação ──────────────────────────
  useEffect(() => {
    if (sucesso && agendamentoCriado) {
      setForm(prev => ({ ...prev, codigo: agendamentoCriado.codigo }));
    }
  }, [sucesso, agendamentoCriado]);

  // ── Preencher formulário se estiver editando ──────────────────
  useEffect(() => {
    if (dadosEdicao) {
      setForm({
        codigo: dadosEdicao.codigo || "",
        cliente_id: dadosEdicao.cliente_id || "",
        cliente: dadosEdicao.cliente?.nome || "",
        nascimento: dadosEdicao.cliente?.data_nascimento || "",
        cpf: dadosEdicao.cliente?.cpf || "",
        dataVisita: dadosEdicao.data_visita || "",
        horario: dadosEdicao.horario_visita?.slice(0, 5) || "",
        vendedor_id: dadosEdicao.vendedor_id || "",
        cidade: dadosEdicao.cidade || "",
        observacoes: dadosEdicao.observacoes || "",
        status: dadosEdicao.status || "PENDENTE",
      });

      if (dadosEdicao.dependentes?.length > 0) {
        setAmount(dadosEdicao.dependentes.length);
        setCompanions(
          dadosEdicao.dependentes.map(dep => ({
            nome: dep.nome || "",
            nascimento: dep.data_nascimento || "",
            cpf: dep.cpf || "",
          }))
        );
      }
    }
  }, [dadosEdicao]);

  // ── Validações ─────────────────────────────────────────────────
  const formValid =
    form.cliente.trim() !== "" &&
    form.nascimento !== "" &&
    form.cpf.replace(/\D/g, "").length === 11 &&
    form.dataVisita !== "" &&
    form.horario !== "" &&
    form.cidade.trim() !== "" &&
    errorTime === "";

  const companionsValid =
    companions.length === 0 ||
    companions.every((person) =>
      person.nome.trim().length >= 3 &&
      person.cpf.replace(/\D/g, "").length === 11
    );

  // ── Handlers ───────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmount = (e) => {
    const qtd = Number(e.target.value);
    setAmount(qtd);
    setCompanions(
      Array.from({ length: qtd }, () => ({
        nome: "", nascimento: "", cpf: "",
      }))
    );
    setCurrentCompanion(0);
  };

  const handleCompanionChange = (field, value) => {
    const list = [...companions];
    if (field === "nome") value = value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
    if (field === "cpf") {
      value = value.replace(/\D/g, "").slice(0, 11);
      value = value.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1-$2");
    }
    list[currentCompanion][field] = value;
    setCompanions(list);
  };

  const handleLettersOnly = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value.replace(/[^A-Za-zÀ-ÿ\s]/g, "") }));
  };

  const handleCpf = (e) => {
    let cpf = e.target.value.replace(/\D/g, "").slice(0, 11);
    cpf = cpf.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1-$2");
    setForm((prev) => ({ ...prev, cpf }));
  };

  const calcularIdade = (dataNasc) => {
    if (!dataNasc) return 0;
    const hoje = new Date();
    const nasc = new Date(dataNasc + "T00:00:00");
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mes = hoje.getMonth() - nasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  };

  // ── Finalizar (chamado pelo step 2) ───────────────────────────
  const handleFinalizar = async () => {
    const dados = {
      cliente_id: form.cliente_id,
      vendedor_id: form.vendedor_id || null,
      data_visita: form.dataVisita,
      horario_visita: form.horario,
      quantidade_pessoas: 1 + companions.length,
      observacoes: form.observacoes || null,
      cidade: form.cidade || "Não informada",
      status: form.status || "PENDENTE",
      dependentes: companions.map(c => ({
        nome: c.nome,
        idade: calcularIdade(c.nascimento),
        cpf: c.cpf || null,
      })),
    };

    await onSubmit(dados);
  };

  // ── Tela de Sucesso ────────────────────────────────────────────
  if (sucesso && agendamentoCriado) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <div>
              <h2>✅ {dadosEdicao ? "Agendamento Atualizado!" : "Agendamento Criado!"}</h2>
              <p>O agendamento foi {dadosEdicao ? "atualizado" : "registrado"} com sucesso.</p>
            </div>
          </div>
          <div className={styles.body}>
            <div className={styles.successBox}>
              <h3>Código: <strong>{agendamentoCriado.codigo || form.codigo}</strong></h3>
              <p><strong>Cliente:</strong> {form.cliente}</p>
              <p><strong>Data:</strong> {new Date(form.dataVisita + "T00:00:00").toLocaleDateString("pt-BR")}</p>
              <p><strong>Horário:</strong> {form.horario}</p>
              <p><strong>Pessoas:</strong> {1 + companions.length}</p>
              <p><strong>Status:</strong> {form.status}</p>
            </div>
          </div>
          <div className={styles.footer}>
            <button className={styles.saveButton} onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render Principal ───────────────────────────────────────────
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {erro && <div className={styles.errorBanner}>⚠️ {erro}</div>}

        {step === 1 && (
          <>
            <div className={styles.header}>
              <div>
                <h2>{dadosEdicao ? "Editar Agendamento" : "Novo Agendamento"}</h2>
                <p>{dadosEdicao ? "Atualize os dados do agendamento." : "Cadastre um novo agendamento para um visitante."}</p>
              </div>
            </div>

            <div className={styles.body}>
              {/* Código + Cliente */}
              <div className={styles.rowCode}>
                <div className={`${styles.field} ${styles.codeField}`}>
                  <label>Código</label>
                  <input type="text" name="codigo" value={form.codigo} readOnly className={styles.readOnlyInput} placeholder="Gerado automaticamente" />
                  <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    {dadosEdicao ? "Código do agendamento" : "Gerado automaticamente ao salvar"}
                  </small>
                </div>
                <div className={styles.field}>
                  <label>Cliente</label>
                  <input type="text" name="cliente" value={form.cliente} onChange={handleLettersOnly} placeholder="Pesquisar cliente..." maxLength={100} required />
                </div>
              </div>

              {/* Nascimento + CPF */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Data de Nascimento</label>
                  <input type="date" name="nascimento" value={form.nascimento} onChange={handleChange} max={new Date().toISOString().split("T")[0]} required />
                </div>
                <div className={styles.field}>
                  <label>CPF</label>
                  <input type="text" name="cpf" value={form.cpf} onChange={handleCpf} placeholder="000.000.000-00" maxLength={14} required />
                </div>
              </div>

              {/* Data + Horário */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Data da Visita</label>
                  {loadingDias ? (
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', padding: '0.5rem 0' }}>Carregando datas disponíveis...</p>
                  ) : (
                    <select name="dataVisita" value={form.dataVisita} onChange={handleChange} className={styles.select} required>
                      <option value="">Selecione uma data...</option>
                      {datasDisponiveis.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className={styles.field}>
                  <label>Horário</label>
                  <select name="horario" value={form.horario} onChange={(e) => { setErrorTime(""); setForm(prev => ({ ...prev, horario: e.target.value })); }} className={styles.select} required>
                    <option value="">Selecione...</option>
                    {["09:30", "10:00", "10:30", "11:00", "11:30"].map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  {errorTime && <span className={styles.error}>{errorTime}</span>}
                </div>
              </div>

              {/* Consultor + Cidade */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Consultor</label>
                  <select name="vendedor_id" value={form.vendedor_id} onChange={handleChange} className={styles.select}>
                    <option value="">Nenhum (opcional)</option>
                    {consultores.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Cidade</label>
                  <input type="text" name="cidade" value={form.cidade} onChange={handleLettersOnly} placeholder="Cidade" maxLength={40} required />
                </div>
              </div>

              {/* Status (só na edição) */}
              {dadosEdicao && (
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange} className={styles.select}>
                      <option value="PENDENTE">Pendente</option>
                      <option value="CONFIRMADO">Confirmado</option>
                      <option value="REALIZADO">Realizado</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Observações */}
              <div className={styles.field}>
                <label>Observações</label>
                <textarea name="observacoes" value={form.observacoes} onChange={handleChange} rows="4" placeholder="Digite alguma observação..." maxLength={500} />
              </div>

              {/* Confirmação */}
              <div className={styles.confirmArea}>
                <input type="checkbox" id="confirm" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
                <label htmlFor="confirm">Declaro que revisei todas as informações acima e confirmo que estão corretas.</label>
              </div>
            </div>

            <div className={styles.footer}>
              <button className={styles.cancelButton} onClick={onClose}>Cancelar</button>
              <button className={styles.saveButton} disabled={!formValid || !confirmed} onClick={() => setStep(2)}>
                Continuar
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className={styles.header}>
              <div>
                <h2>Acompanhantes</h2>
                <p>Informe os acompanhantes do cliente.</p>
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
                  <div className={styles.field}><label>Nome</label><input type="text" value={companions[currentCompanion].nome} onChange={(e) => handleCompanionChange("nome", e.target.value)} placeholder="Nome completo" /></div>
                  <div className={styles.field}><label>Data de Nascimento</label><input type="date" value={companions[currentCompanion].nascimento} onChange={(e) => handleCompanionChange("nascimento", e.target.value)} max={new Date().toISOString().split("T")[0]} /></div>
                  <div className={styles.field}><label>CPF</label><input type="text" value={companions[currentCompanion].cpf} onChange={(e) => handleCompanionChange("cpf", e.target.value)} placeholder="000.000.000-00" maxLength={14} /></div>
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
                {loading ? "Salvando..." : dadosEdicao ? "Atualizar" : "Finalizar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}