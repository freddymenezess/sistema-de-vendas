'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import styles from '@/styles/Layout.module.css'

const pageTitles = {
  dashboard: 'Dashboard',
  vendas: 'Vendas',
  funcionarios: 'Funcionários',
  estoque: 'Estoque',
  caixas: 'Gestão de Caixas',
  relatorios: 'Relatórios',
  pdv: 'Ponto de Venda',
  'meu-caixa': 'Meu Caixa',
  'estoque-consulta': 'Consulta de Estoque',
}

export default function AppLayout({ children, currentPage, onPageChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={styles.layout}>
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
      
      <div className={styles.header}>
        <button 
          className={styles.menuButton}
          onClick={() => setSidebarOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className={styles.pageTitle}>{pageTitles[currentPage] || 'Mamev'}</h1>
        <div className={styles.headerRight} />
      </div>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
