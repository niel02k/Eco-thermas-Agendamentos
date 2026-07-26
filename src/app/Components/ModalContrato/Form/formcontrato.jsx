// src/app/Components/Comp_Contrato/FormContrato/FormContrato.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Save, X, Plus, Trash2, UserPlus, CreditCard,
  FileText, AlertCircle, ArrowRight, ArrowLeft, Pencil
} from "lucide-react";
import styles from "./FormContrato.module.css";
import { useConsultores } from "@/app/hooks/useConsultores";
import { useContratosActions } from "@/app/hooks/contratos/useContratosActions";
import { 
  PAGAMENTO, PAGAMENTO_LABELS, 
  COBRANCA, COBRANCA_LABELS, 
  STATUS_CONTRATO, STATUS_CONTRATO_LABELS
} from "@/lib/constats.js";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                     */
/* -------------------------------------------------------------------------- */

const formatCPF = (value) => {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length <= 3) return cpf;
  if (cpf.length <= 6) return cpf.replace(/(\d{3})(\d+)/, "$1.$2");
  if (cpf.length <= 9) return cpf.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, "$1.$2.$3-$4");
};

const formatPhone = (value) => {
  const tel = value.replace(/\D/g, "");
  if (tel.length <= 10) return tel.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return tel.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

const formatCurrency = (value) => {
  if (!value) return "";
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/* -------------------------------------------------------------------------- */
/* COMPONENTE                                                                  */
/* -------------------------------------------------------------------------- */

export default function FormContrato({ 
  contrato = null,
  onClose, 
  onSuccess 
}) {
  const isEdicao = !!contrato;
  const [step, setStep] = useState(1);
  const { consultores, loading: carregandoConsultores } = useConsultores();
  const { criar, editar, loading, erro, setErro } = useContratosActions();
  
  const [formData, setFormData] = useState({
    vendedor_id: "",
    tipo_contrato: "PADRAO",
    titular_nome: "",
    titular_cpf: "",
    titular_email: "",
    titular_telefone: "",
    titular_idade: "",
    cidade: "",
    valor_total: "",
    forma_pagamento: PAGAMENTO?.PIX || "PIX",
    tipo_cobranca: "",
    parcelas: "1",
    status: STATUS_CONTRATO?.PENDENTE || "PENDENTE",
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: "",
    observacoes: ""
  });

  const [dependentes, setDependentes] = useState([]);
  const [amount, setAmount] = useState(0);
  const [currentDependente, setCurrentDependente] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedDependentes, setConfirmedDependentes] = useState(false);
  const [sucesso, setSucesso] = useState(null);

  const idadeTitular = Number(formData.titular_idade);

  // ── Preencher dados na edição ────────────────────────────────
  useEffect(() => {
    if (isEdicao && contrato) {
      setFormData({
        vendedor_id: contrato.vendedor_id || "",
        tipo_contrato: contrato.tipo_contrato || "PADRAO",
        titular_nome: contrato.titular_nome || "",
        titular_cpf: formatCPF(contrato.titular_cpf || ""),
        titular_email: contrato.titular_email || "",
        titular_telefone: contrato.titular_telefone || "",
        titular_idade: contrato.titular_idade || "",
        cidade: contrato.cidade || "",
        valor_total: formatCurrency(contrato.valor_total) || "",
        forma_pagamento: contrato.forma_pagamento || PAGAMENTO?.PIX || "PIX",
        tipo_cobranca: contrato.tipo_cobranca || "",
        parcelas: String(contrato.parcelas || 1),
        status: contrato.status || STATUS_CONTRATO?.PENDENTE || "PENDENTE",
        data_inicio: contrato.data_inicio || new Date().toISOString().split('T')[0],
        data_fim: contrato.data_fim || "",
        observacoes: contrato.observacoes || ""
      });
      
      const deps = (contrato.dependentes || []).map(dep => ({
        nome: dep.nome || "",
        cpf: dep.cpf ? formatCPF(dep.cpf) : "",
        idade: dep.idade || ""
      }));
      setDependentes(deps);
      setAmount(deps.length);
      setCurrentDependente(0);
    }
  }, [isEdicao, contrato]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "titular_cpf") formattedValue = formatCPF(value);
    else if (name === "titular_telefone") formattedValue = formatPhone(value);
    else if (name === "titular_idade") formattedValue = value.replace(/\D/g, "").slice(0, 3);
    else if (name === "parcelas") formattedValue = value.replace(/\D/g, "").slice(0, 2);

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  }, []);

  const handleAmount = useCallback((e) => {
    const qtd = Number(e.target.value);
    const qtdAnterior = dependentes.length;

    if (qtd > qtdAnterior) {
      const novos = Array.from({ length: qtd - qtdAnterior }, () => ({
        nome: "", cpf: "", idade: ""
      }));
      setDependentes(prev => [...prev, ...novos]);
    } else {
      setDependentes(prev => prev.slice(0, qtd));
    }
    
    setAmount(qtd);
    if (currentDependente >= qtd) {
      setCurrentDependente(Math.max(0, qtd - 1));
    }
  }, [dependentes, currentDependente]);

  const handleDependenteChange = useCallback((field, value) => {
    const list = [...dependentes];
    if (field === "nome") value = value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
    if (field === "idade") value = value.replace(/\D/g, "").slice(0, 3);
    if (field === "cpf") value = formatCPF(value);
    list[currentDependente][field] = value;
    setDependentes(list);
  }, [dependentes, currentDependente]);

  // ── Validações ───────────────────────────────────────────────
  const formValid =
    formData.vendedor_id !== "" &&
    formData.titular_nome.trim() !== "" &&
    formData.titular_cpf.replace(/\D/g, "").length === 11 &&
    formData.titular_idade !== "" &&
    Number(formData.titular_idade) >= 18 &&
    formData.cidade.trim() !== "";

  const dependentesValid =
    dependentes.length === 0 ||
    dependentes.every(dep => dep.nome.trim().length >= 3);

  const step2Valid =
    formData.valor_total !== "" &&
    parseFloat(String(formData.valor_total).replace(/[^\d,]/g, '').replace(',', '.')) > 0 &&
    formData.forma_pagamento !== "" &&
    formData.data_inicio !== "";

  // ── Submit ───────────────────────────────────────────────────
  const handleFinalizar = useCallback(async () => {
    setErro(null);
    setSucesso(null);

    try {
      const dadosContrato = {
        vendedor_id: formData.vendedor_id,
        tipo_contrato: formData.tipo_contrato,
        titular_nome: formData.titular_nome.trim(),
        titular_cpf: formData.titular_cpf.replace(/\D/g, ""),
        titular_email: formData.titular_email || null,
        titular_telefone: formData.titular_telefone || null,
        titular_idade: Number(formData.titular_idade) || 0,
        cidade: formData.cidade.trim(),
        valor_total: parseFloat(String(formData.valor_total).replace(/[^\d,]/g, '').replace(',', '.')) || 0,
        forma_pagamento: formData.forma_pagamento,
        tipo_cobranca: formData.tipo_cobranca || null,
        parcelas: parseInt(formData.parcelas) || 1,
        status: formData.status,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim || null,
        observacoes: formData.observacoes || null,
        dependentes: dependentes.map(d => ({
          nome: d.nome,
          cpf: d.cpf?.replace(/\D/g, '') || null,
          idade: Number(d.idade) || 0
        }))
      };

      if (isEdicao && contrato?.id) {
        await editar(contrato.id, dadosContrato);
        setSucesso("Contrato atualizado com sucesso!");
      } else {
        await criar(dadosContrato);
        setSucesso("Contrato criado com sucesso!");
      }
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1500);

    } catch (error) {
      setErro(error.message || `Erro ao ${isEdicao ? 'atualizar' : 'criar'} contrato`);
    }
  }, [formData, dependentes, isEdicao, contrato, criar, editar, setErro, onSuccess, onClose]);

  // ── Tela de Sucesso ──────────────────────────────────────────
  if (sucesso) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <div>
              <h2>✅ {isEdicao ? "Contrato Atualizado!" : "Contrato Criado!"}</h2>
              <p>O contrato foi {isEdicao ? "atualizado" : "registrado"} com sucesso.</p>
            </div>
          </div>
          <div className={styles.body}>
            <div className={styles.successBox}>
              <h3>Resumo do Contrato</h3>
              <p><strong>Titular:</strong> {formData.titular_nome}</p>
              <p><strong>CPF:</strong> {formData.titular_cpf}</p>
              <p><strong>Valor:</strong> R$ {formatCurrency(formData.valor_total)}</p>
              <p><strong>Status:</strong> {STATUS_CONTRATO_LABELS?.[formData.status] || formData.status}</p>
              {dependentes.length > 0 && (
                <p><strong>Dependentes:</strong> {dependentes.length}</p>
              )}
            </div>
          </div>
          <div className={styles.footer}>
            <button className={styles.saveButton} onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render Principal ─────────────────────────────────────────
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {erro && <div className={styles.errorBanner}>⚠️ {erro}</div>}

        {/* ═══════════ STEP 1 ═══════════ */}
        {step === 1 && (
          <>
            <div className={styles.header}>
              <div>
                <h2>{isEdicao ? "Editar Contrato" : "Novo Contrato"}</h2>
                <p>{isEdicao ? "Atualize os dados do contrato." : "Preencha os dados do titular e dependentes."}</p>
              </div>
            </div>

            <div className={styles.body}>
              {/* Consultor + Tipo */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Consultor *</label>
                  <select
                    name="vendedor_id"
                    value={formData.vendedor_id}
                    onChange={handleChange}
                    className={styles.select}
                    required
                    disabled={carregandoConsultores}
                  >
                    <option value="">
                      {carregandoConsultores ? "Carregando..." : "Selecione um consultor"}
                    </option>
                    {Array.isArray(consultores) && consultores.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label>Tipo de Contrato</label>
                  <select
                    name="tipo_contrato"
                    value={formData.tipo_contrato}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="PADRAO">Padrão</option>
                    <option value="EFV">EFV</option>
                    <option value="PM">PM</option>
                    <option value="GD">GD</option>
                  </select>
                </div>
              </div>

              {/* Titular: Nome + CPF */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Nome do Titular *</label>
                  <input
                    type="text"
                    name="titular_nome"
                    value={formData.titular_nome}
                    onChange={handleChange}
                    placeholder="Nome completo"
                    maxLength={100}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>CPF *</label>
                  <input
                    type="text"
                    name="titular_cpf"
                    value={formData.titular_cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                  />
                </div>
              </div>

              {/* Titular: Idade + Cidade */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Idade * (mín. 18 anos)</label>
                  <input
                    type="text"
                    name="titular_idade"
                    value={formData.titular_idade}
                    onChange={handleChange}
                    placeholder="Ex: 35"
                    maxLength={3}
                    required
                  />
                  {formData.titular_idade && Number(formData.titular_idade) < 18 && (
                    <span className={styles.error}>Titular deve ser maior de idade</span>
                  )}
                </div>
                <div className={styles.field}>
                  <label>Cidade *</label>
                  <input
                    type="text"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    placeholder="Cidade"
                    maxLength={30}
                    required
                  />
                </div>
              </div>

              {/* Titular: Email + Telefone */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Email</label>
                  <input
                    type="email"
                    name="titular_email"
                    value={formData.titular_email}
                    onChange={handleChange}
                    placeholder="email@exemplo.com"
                    maxLength={100}
                  />
                </div>
                <div className={styles.field}>
                  <label>Telefone</label>
                  <input
                    type="text"
                    name="titular_telefone"
                    value={formData.titular_telefone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    maxLength={20}
                  />
                </div>
              </div>

              {/* Confirmação Step 1 */}
              <div className={styles.confirmArea}>
                <input
                  type="checkbox"
                  id="confirm"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                <label htmlFor="confirm">
                  Declaro que revisei todas as informações acima e confirmo que estão corretas.
                </label>
              </div>
            </div>

            <div className={styles.footer}>
              <button className={styles.cancelButton} onClick={onClose}>Cancelar</button>
              <button
                className={styles.saveButton}
                disabled={!formValid || !confirmed}
                onClick={() => setStep(2)}
              >
                Continuar
              </button>
            </div>
          </>
        )}

        {/* ═══════════ STEP 2 ═══════════ */}
        {step === 2 && (
          <>
            <div className={styles.header}>
              <div>
                <h2>Dependentes</h2>
                <p>Adicione os dependentes do contrato.</p>
              </div>
            </div>

            <div className={styles.body}>
              {/* Seletor de quantidade */}
              <div className={styles.peopleSelect}>
                <label>Dependentes</label>
                <select
                  value={amount}
                  onChange={handleAmount}
                  className={styles.peopleSelectInput}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>
                      {num} Dependente{num !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Card do dependente atual */}
              {dependentes.length > 0 && (
                <div className={styles.cardPerson}>
                  <h3>Dependente {currentDependente + 1} de {dependentes.length}</h3>
                  
                  <div className={styles.field}>
                    <label>Nome</label>
                    <input
                      type="text"
                      value={dependentes[currentDependente]?.nome || ""}
                      onChange={(e) => handleDependenteChange("nome", e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>
                  
                  <div className={styles.cardRow}>
                    <div className={styles.field}>
                      <label>Idade</label>
                      <input
                        type="text"
                        value={dependentes[currentDependente]?.idade || ""}
                        onChange={(e) => handleDependenteChange("idade", e.target.value)}
                        placeholder="Ex: 10"
                        maxLength={3}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>CPF</label>
                      <input
                        type="text"
                        value={dependentes[currentDependente]?.cpf || ""}
                        onChange={(e) => handleDependenteChange("cpf", e.target.value)}
                        placeholder="000.000.000-00"
                        maxLength={14}
                      />
                    </div>
                  </div>

                  {/* Navegação entre dependentes */}
                  {dependentes.length > 1 && (
                    <div className={styles.navigationButtons}>
                      <button
                        type="button"
                        className={styles.navButton}
                        disabled={currentDependente === 0}
                        onClick={() => setCurrentDependente(prev => prev - 1)}
                      >
                        Anterior
                      </button>
                      <span className={styles.pageIndicator}>
                        {currentDependente + 1} / {dependentes.length}
                      </span>
                      <button
                        type="button"
                        className={styles.navButton}
                        disabled={currentDependente === dependentes.length - 1}
                        onClick={() => setCurrentDependente(prev => prev + 1)}
                      >
                        Próximo
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Confirmação Step 2 */}
              <div className={styles.confirmArea}>
                <input
                  type="checkbox"
                  id="confirmDeps"
                  checked={confirmedDependentes}
                  onChange={(e) => setConfirmedDependentes(e.target.checked)}
                />
                <label htmlFor="confirmDeps">
                  Declaro que revisei os dados dos dependentes e confirmo que estão corretos.
                </label>
              </div>
            </div>

            <div className={styles.footer}>
              <button
                className={styles.cancelButton}
                onClick={() => { setStep(1); setConfirmed(false); }}
              >
                Voltar
              </button>
              <button
                className={styles.saveButton}
                disabled={!dependentesValid || !confirmedDependentes}
                onClick={() => setStep(3)}
              >
                Continuar
              </button>
            </div>
          </>
        )}

        {/* ═══════════ STEP 3 ═══════════ */}
        {step === 3 && (
          <>
            <div className={styles.header}>
              <div>
                <h2>Dados do Contrato</h2>
                <p>Informe os valores e condições do contrato.</p>
              </div>
            </div>

            <div className={styles.body}>
              {/* Status + Forma Pagamento */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={styles.select}
                    required
                  >
                    {Object.entries(STATUS_CONTRATO || {}).map(([key, value]) => (
                      <option key={key} value={value}>
                        {STATUS_CONTRATO_LABELS?.[key] || value}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label>Forma de Pagamento *</label>
                  <select
                    name="forma_pagamento"
                    value={formData.forma_pagamento}
                    onChange={handleChange}
                    className={styles.select}
                    required
                  >
                    {Object.entries(PAGAMENTO || {}).map(([key, value]) => (
                      <option key={key} value={value}>
                        {PAGAMENTO_LABELS?.[key] || value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Valor + Tipo Cobrança */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Valor Total *</label>
                  <input
                    type="text"
                    name="valor_total"
                    value={formData.valor_total}
                    onChange={handleChange}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>Tipo de Cobrança</label>
                  <select
                    name="tipo_cobranca"
                    value={formData.tipo_cobranca}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="">Não definido</option>
                    {Object.entries(COBRANCA || {}).map(([key, value]) => (
                      <option key={key} value={value}>
                        {COBRANCA_LABELS?.[key] || value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Parcelas */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Parcelas</label>
                  <input
                    type="text"
                    name="parcelas"
                    value={formData.parcelas}
                    onChange={handleChange}
                    placeholder="1"
                    maxLength={2}
                  />
                </div>
              </div>

              {/* Datas */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Data de Início *</label>
                  <input
                    type="date"
                    name="data_inicio"
                    value={formData.data_inicio}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>Data de Término</label>
                  <input
                    type="date"
                    name="data_fim"
                    value={formData.data_fim}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Observações */}
              <div className={styles.field}>
                <label>Observações</label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Observações sobre o contrato..."
                />
              </div>

              {/* Confirmação Step 3 */}
              <div className={styles.confirmArea}>
                <input
                  type="checkbox"
                  id="confirm3"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                <label htmlFor="confirm3">
                  Declaro que revisei os dados do contrato e confirmo que estão corretos.
                </label>
              </div>
            </div>

            <div className={styles.footer}>
              <button
                className={styles.cancelButton}
                onClick={() => { setStep(2); setConfirmed(false); }}
              >
                Voltar
              </button>
              <button
                className={styles.saveButton}
                disabled={!step2Valid || !confirmed || loading}
                onClick={handleFinalizar}
              >
                {loading ? "Salvando..." : isEdicao ? "Atualizar Contrato" : "Criar Contrato"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}