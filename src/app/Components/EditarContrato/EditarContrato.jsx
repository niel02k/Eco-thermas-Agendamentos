"use client";

import React, { useState, useEffect } from "react";
import {
  Save, X, Plus, Trash2, UserPlus, CreditCard,
  FileText, AlertCircle, ArrowRight, ArrowLeft
} from "lucide-react";
import styles from "./EditarContrato.module.css";
import { useConsultores } from "@/app/hooks/useConsultores";
import { useContratos } from "@/app/hooks/useContratos";
import { PAGAMENTO, PAGAMENTO_LABELS, COBRANCA, COBRANCA_LABELS, STATUS_CONTRATO, STATUS_CONTRATO_LABELS } from "@/lib/constats";

const formatCPF = (value) => {
  const cpf = value.replace(/\D/g, "");
  return cpf
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const formatPhone = (value) => {
  const tel = value.replace(/\D/g, "");
  if (tel.length <= 10) {
    return tel.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return tel.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

export default function EditarContrato({ contrato, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const { consultores, loading: carregandoConsultores } = useConsultores();
  const { updateContrato, loading, error, setError } = useContratos();
  
  const [formData, setFormData] = useState({
    vendedor_id: "",
    titular_nome: "",
    titular_cpf: "",
    titular_email: "",
    titular_telefone: "",
    titular_data_nascimento: "",
    cidade: "",
    valor_total: "",
    forma_pagamento: PAGAMENTO.PIX,
    tipo_cobranca: "",
    parcelas: "1",
    status: STATUS_CONTRATO.PENDENTE,
    data_inicio: "",
    data_fim: "",
    observacoes: ""
  });

  const [dependentes, setDependentes] = useState([]);
  const [novoDependente, setNovoDependente] = useState({
    nome: "",
    cpf: "",
    data_nascimento: ""
  });

  const [sucesso, setSucesso] = useState(null);

  useEffect(() => {
    if (contrato) {
      setFormData({
        vendedor_id: contrato.vendedor_id || "",
        titular_nome: contrato.titular_nome || "",
        titular_cpf: formatCPF(contrato.titular_cpf || ""),
        titular_email: contrato.titular_email || "",
        titular_telefone: formatPhone(contrato.titular_telefone || ""),
        titular_data_nascimento: contrato.titular_data_nascimento || "",
        cidade: contrato.cidade || "",
        valor_total: contrato.valor_total?.toString().replace('.', ',') || "",
        forma_pagamento: contrato.forma_pagamento || PAGAMENTO.PIX,
        tipo_cobranca: contrato.tipo_cobranca || "",
        parcelas: contrato.parcelas?.toString() || "1",
        status: contrato.status || STATUS_CONTRATO.PENDENTE,
        data_inicio: contrato.data_inicio || "",
        data_fim: contrato.data_fim || "",
        observacoes: contrato.observacoes || ""
      });

      setDependentes(contrato.dependentes || []);
    }
  }, [contrato]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "titular_cpf") {
      formattedValue = formatCPF(value);
    } else if (name === "titular_telefone") {
      formattedValue = formatPhone(value);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleAddDependente = () => {
    if (!novoDependente.nome) {
      setError("Nome do dependente é obrigatório");
      return;
    }

    setDependentes(prev => [...prev, { ...novoDependente }]);
    setNovoDependente({ nome: "", cpf: "", data_nascimento: "" });
    setError(null);
  };

  const handleRemoveDependente = (index) => {
    setDependentes(prev => prev.filter((_, i) => i !== index));
  };

  const validarStep1 = () => {
    const erros = [];
    
    if (!formData.vendedor_id) erros.push("Consultor");
    if (!formData.titular_nome.trim()) erros.push("Nome do titular");
    if (!formData.titular_cpf || formData.titular_cpf.replace(/\D/g, "").length !== 11) {
      erros.push("CPF inválido");
    }
    if (!formData.titular_data_nascimento) erros.push("Data de nascimento");
    if (!formData.cidade.trim()) erros.push("Cidade");

    if (erros.length > 0) {
      setError(`Preencha: ${erros.join(", ")}`);
      return false;
    }
    
    return true;
  };

  const validarStep2 = () => {
    const erros = [];
    
    if (!formData.valor_total) erros.push("Valor total");
    if (!formData.forma_pagamento) erros.push("Forma de pagamento");
    if (!formData.data_inicio) erros.push("Data de início");
    
    if (formData.parcelas && parseInt(formData.parcelas) < 1) {
      erros.push("Parcelas deve ser >= 1");
    }

    if (erros.length > 0) {
      setError(`Preencha: ${erros.join(", ")}`);
      return false;
    }
    
    return true;
  };

  const nextStep = () => {
    setError(null);
    if (step === 1 && validarStep1()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setError(null);
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSucesso(null);

    if (!validarStep2()) return;

    try {
      const dadosContrato = {
        vendedor_id: formData.vendedor_id,
        titular_nome: formData.titular_nome.trim(),
        titular_cpf: formData.titular_cpf.replace(/\D/g, ""),
        titular_email: formData.titular_email || null,
        titular_telefone: formData.titular_telefone || null,
        titular_data_nascimento: formData.titular_data_nascimento,
        cidade: formData.cidade.trim(),
        valor_total: parseFloat(formData.valor_total.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
        forma_pagamento: formData.forma_pagamento,
        tipo_cobranca: formData.tipo_cobranca || null,
        parcelas: parseInt(formData.parcelas) || 1,
        status: formData.status,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim || null,
        observacoes: formData.observacoes || null,
        dependentes: dependentes
      };

      const contratoAtualizado = await updateContrato(contrato.id, dadosContrato);
      
      setSucesso("Contrato atualizado com sucesso!");
      
      setTimeout(() => {
        if (onSuccess) onSuccess(contratoAtualizado);
        if (onClose) onClose();
      }, 1500);

    } catch (error) {
      setError(error.message || "Erro ao atualizar contrato");
    }
  };

  return (
    <div className={styles.modalContainer} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <FileText size={24} />
            Editar Contrato - Etapa {step}/2
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className={styles.alertError}>
            <AlertCircle size={18} />
            <span>{error}</span>
            <button onClick={() => setError(null)}><X size={16} /></button>
          </div>
        )}

        {sucesso && (
          <div className={styles.alertSuccess}>
            <span>{sucesso}</span>
          </div>
        )}

        <div className={styles.stepsIndicator}>
          <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ""}`}>1</div>
          <div className={styles.stepLine} />
          <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ""}`}>2</div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {step === 1 && (
            <>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <UserPlus size={18} />
                  Consultor
                </h3>
                <div className={styles.fieldFull}>
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
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <UserPlus size={18} />
                  Dados do Titular
                </h3>
                
                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label>Nome Completo *</label>
                    <input
                      type="text"
                      name="titular_nome"
                      value={formData.titular_nome}
                      onChange={handleChange}
                      placeholder="Nome do titular"
                      className={styles.input}
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
                      className={styles.input}
                      maxLength={14}
                      required
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label>Data de Nascimento *</label>
                    <input
                      type="date"
                      name="titular_data_nascimento"
                      value={formData.titular_data_nascimento}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Cidade *</label>
                    <input
                      type="text"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      placeholder="Cidade"
                      className={styles.input}
                      maxLength={30}
                      required
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label>Email</label>
                    <input
                      type="email"
                      name="titular_email"
                      value={formData.titular_email}
                      onChange={handleChange}
                      placeholder="email@exemplo.com"
                      className={styles.input}
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
                      className={styles.input}
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <UserPlus size={18} />
                  Dependentes ({dependentes.length})
                </h3>
                
                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label>Nome</label>
                    <input
                      type="text"
                      value={novoDependente.nome}
                      onChange={(e) => setNovoDependente(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Nome do dependente"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>CPF</label>
                    <input
                      type="text"
                      value={novoDependente.cpf}
                      onChange={(e) => setNovoDependente(prev => ({ 
                        ...prev, 
                        cpf: formatCPF(e.target.value) 
                      }))}
                      placeholder="000.000.000-00"
                      className={styles.input}
                      maxLength={14}
                    />
                  </div>
                </div>
                
                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label>Data de Nascimento</label>
                    <input
                      type="date"
                      value={novoDependente.data_nascimento}
                      onChange={(e) => setNovoDependente(prev => ({ 
                        ...prev, 
                        data_nascimento: e.target.value 
                      }))}
                      className={styles.input}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddDependente}
                  className={styles.addButton}
                >
                  <Plus size={16} />
                  Adicionar Dependente
                </button>
              </div>

              {dependentes.length > 0 && (
                <div className={styles.dependentesList}>
                  {dependentes.map((dep, index) => (
                    <div key={index} className={styles.dependenteItem}>
                      <div className={styles.dependenteInfo}>
                        <span className={styles.dependenteNome}>{dep.nome}</span>
                        <span className={styles.dependenteDetalhes}>
                          {dep.cpf && `CPF: ${dep.cpf}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDependente(index)}
                        className={styles.removeButton}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <CreditCard size={18} />
                  Dados do Contrato
                </h3>

                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label>Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={styles.select}
                      required
                    >
                      {Object.entries(STATUS_CONTRATO).map(([key, value]) => (
                        <option key={key} value={value}>
                          {STATUS_CONTRATO_LABELS[key]}
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
                      {Object.entries(PAGAMENTO).map(([key, value]) => (
                        <option key={key} value={value}>
                          {PAGAMENTO_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label>Valor Total *</label>
                    <input
                      type="text"
                      name="valor_total"
                      value={formData.valor_total}
                      onChange={handleChange}
                      placeholder="0,00"
                      className={styles.input}
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
                      {Object.entries(COBRANCA).map(([key, value]) => (
                        <option key={key} value={value}>
                          {COBRANCA_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label>Parcelas</label>
                    <input
                      type="number"
                      name="parcelas"
                      value={formData.parcelas}
                      onChange={handleChange}
                      min="1"
                      max="48"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label>Data de Início *</label>
                    <input
                      type="date"
                      name="data_inicio"
                      value={formData.data_inicio}
                      onChange={handleChange}
                      className={styles.input}
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
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.fieldFull}>
                  <label>Observações</label>
                  <textarea
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    placeholder="Observações sobre o contrato..."
                    className={styles.textarea}
                    rows={3}
                  />
                </div>
              </div>
            </>
          )}

          <div className={styles.formActions}>
            {step === 2 && (
              <button
                type="button"
                onClick={prevStep}
                className={styles.cancelButton}
                disabled={loading}
              >
                <ArrowLeft size={18} />
                Voltar
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              <X size={18} />
              Cancelar
            </button>
            
            {step === 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className={styles.submitButton}
              >
                Próximo
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className={styles.spinner} />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Salvar Alterações
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}