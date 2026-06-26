"use client";

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import Input from '@/app/Components/Input/Input.jsx';
import Button from '@/app/Components/Button/Button.jsx';
import styles from './Login.module.css';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const router = useRouter();

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
 

    console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    if (error) {
      setError('E-mail ou senha incorretos.');
      setIsLoading(false);
      return;
    }

    router.push('/Dashboard');
  };


  return (
    <div className={styles.loginContainer}>
      {/* Lado Esquerdo - Branding & Experience */}
      <section className={styles.brandingSection}>
        <div className={styles.logoContainer}>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>ECO MANAGER</span>
            <span className={styles.logoSubtitle}>SISTEMA DE GESTÃO</span>
          </div>
        </div>
        
        <div className={styles.brandingContent}>
          <h1 className={styles.brandingTitle}>Eco Thermas Tupã</h1>
          <p className={styles.brandingDescription}>
            Transforme dados em decisões e agendamentos em experiências inesquecíveis para os visitantes do Eco Thermas.
          </p>
        </div>

        <footer className={styles.brandingFooter}>
          <p>© 2026 Eco Thermas Tupã</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} />
            <span>Ambiente Seguro</span>
          </div>
        </footer>
      </section>

      {/* Lado Direito - Login Form */}
           <main className={styles.formSection}>
        <div className={styles.formWrapper}>
          <div className={styles.mobileLogo}>
            <img src="/Logo.png" alt="Logo" className={styles.logoImg} />
          </div>

          <header className={styles.formHeader}>
            <h2 className={styles.formTitle}>Bem-vindo!</h2>
            <p className={styles.formSubtitle}>Acesse o painel Comercial</p>
          </header>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="E-mail"
              id="email"
              type="email"
              placeholder="admin@ecothermas.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Senha"
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
            />

            {/* Mensagem de erro */}
            {error && (
              <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '-8px' }}>
                {error}
              </p>
            )}

            <div className={styles.formOptions}>
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  className={styles.checkbox}
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe" className={styles.checkboxLabel}>Lembrar de mim</label>
              </div>
              <a href="/forgot-password" className={styles.forgotPassword}>Esqueci minha senha</a>
            </div>

            <Button
              type="submit"
              icon={LogIn}
              isLoading={isLoading}
            >
              Entrar no Painel
            </Button>
          </form>

          <footer className={styles.formFooter}>
            <p>
              Novo por aqui?
              <a href="/suporte" className={styles.formFooterLink}>Solicitar acesso</a>
            </p>
          </footer>
        </div>
      </main>
    </div>

  );
};

export default Login;