// app/(authenticated)/layout.jsx
"use client";

import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/Context/AuthContext';
import Sidebar from '@/app/Components/Sidebar/Sidebar.jsx';
import Headers from '@/app/Components/Header/Header.jsx';
import styles from './authenticated.module.css';

export default function AuthenticatedLayout({ children }) {
  const { usuario, loading } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  const activeItem = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0] || 'dashboard';
    
    const routeMap = {
      'dashboard': 'dashboard',
      'agendamentos': 'agendamentos',
      'clientes': 'clientes',
      'contratos': 'contratos',
      'financeiro': 'financeiro',
      'visitantes': 'visitantes',
      'relatorios': 'relatorios',
      'configuracoes': 'configuracoes',
    };
    
    return routeMap[firstSegment] || firstSegment;
  }, [pathname]);

  if (loading && !usuario) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Sidebar 
        activeItem={activeItem}
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className={styles.mainWrapper}>
        <div className={styles.headers}>
        <Headers
          userName={usuario?.nome ?? '...'}
          userRole={usuario?.cargo ?? '...'}
          initials={usuario?.start ?? '?'}
          onMenuOpen={() => setIsSidebarOpen(true)}
        />
        </div>
        
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}