'use client'

import { useAuth } from '@/contexts/AuthContext'
import styles from '@/styles/Sidebar.module.css'

const menuItems = {
  admin: [
    { section: 'Principal', items: [
      { name: 'Dashboard', icon: 'dashboard', page: 'dashboard' },
      { name: 'Vendas', icon: 'sales', page: 'vendas' },
    ]},
    { section: 'Gestão', items: [
      { name: 'Funcionários', icon: 'users', page: 'funcionarios' },
      { name: 'Estoque', icon: 'inventory', page: 'estoque' },
      { name: 'Caixas', icon: 'cash', page: 'caixas' },
    ]},
    { section: 'Análises', items: [
      { name: 'Relatórios', icon: 'reports', page: 'relatorios' },
    ]},
  ],
  gerente: [
    { section: 'Principal', items: [
      { name: 'Dashboard', icon: 'dashboard', page: 'dashboard' },
    ]},
    { section: 'Operações', items: [
      { name: 'Estoque', icon: 'inventory', page: 'estoque' },
      { name: 'Caixas', icon: 'cash', page: 'caixas' },
      { name: 'Relatórios', icon: 'reports', page: 'relatorios' },
    ]},
  ],
  vendedor: [
    { section: 'Principal', items: [
      { name: 'PDV', icon: 'sales', page: 'pdv' },
      { name: 'Meu Caixa', icon: 'cash', page: 'meu-caixa' },
    ]},
    { section: 'Consultas', items: [
      { name: 'Estoque', icon: 'inventory', page: 'estoque-consulta' },
    ]},
  ],
}

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  sales: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  inventory: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  cash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
}

export default function Sidebar({ isOpen, onClose, currentPage, onPageChange }) {
  const { userData, signOut } = useAuth()
  const cargo = userData?.cargo || 'vendedor'
  const menu = menuItems[cargo] || menuItems.vendedor

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <>
      <div 
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={onClose}
      />
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.header}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <span className={styles.brandName}>Mamev Cosméticos</span>
        </div>

        <nav className={styles.nav}>
          {menu.map((section, idx) => (
            <div key={idx} className={styles.navSection}>
              <div className={styles.navSectionTitle}>{section.section}</div>
              {section.items.map((item) => (
                <button
                  key={item.page}
                  className={`${styles.navItem} ${currentPage === item.page ? styles.navItemActive : ''}`}
                  onClick={() => {
                    onPageChange(item.page)
                    onClose()
                  }}
                >
                  {icons[item.icon]}
                  {item.name}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {getInitials(userData?.nome)}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{userData?.nome || 'Usuário'}</div>
              <div className={styles.userRole}>{cargo}</div>
            </div>
          </div>
          <button className={styles.logoutButton} onClick={signOut}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
