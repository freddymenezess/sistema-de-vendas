'use client'

import { useState, useEffect } from 'react'
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import styles from '@/styles/Dashboard.module.css'

export default function Dashboard() {
  const { userData } = useAuth()
  const [stats, setStats] = useState({
    vendasHoje: 0,
    totalHoje: 0,
    produtosEstoque: 0,
    funcionariosAtivos: 0,
  })
  const [vendasRecentes, setVendasRecentes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      // Vendas de hoje
      const vendasRef = collection(db, 'vendas')
      const vendasSnap = await getDocs(vendasRef)
      let vendasHoje = 0
      let totalHoje = 0
      const todasVendas = []

      vendasSnap.forEach((doc) => {
        const venda = { id: doc.id, ...doc.data() }
        todasVendas.push(venda)
        const dataVenda = venda.data?.toDate ? venda.data.toDate() : new Date(venda.data)
        if (dataVenda >= hoje) {
          vendasHoje++
          totalHoje += venda.total || 0
        }
      })

      // Produtos em estoque
      const produtosRef = collection(db, 'produtos')
      const produtosSnap = await getDocs(produtosRef)
      
      // Funcionários
      const usuariosRef = collection(db, 'usuarios')
      const usuariosSnap = await getDocs(usuariosRef)

      setStats({
        vendasHoje,
        totalHoje,
        produtosEstoque: produtosSnap.size,
        funcionariosAtivos: usuariosSnap.size,
      })

      // Vendas recentes
      const recentes = todasVendas
        .sort((a, b) => {
          const dateA = a.data?.toDate ? a.data.toDate() : new Date(a.data)
          const dateB = b.data?.toDate ? b.data.toDate() : new Date(b.data)
          return dateB - dateA
        })
        .slice(0, 5)
      
      setVendasRecentes(recentes)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date) => {
    if (!date) return '-'
    const d = date?.toDate ? date.toDate() : new Date(date)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d)
  }

  return (
    <div className={styles.container}>
      <div className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>
          Olá, {userData?.nome?.split(' ')[0] || 'Usuário'}!
        </h1>
        <p className={styles.welcomeSubtitle}>
          Confira o resumo das atividades de hoje
        </p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPink}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Vendas Hoje</p>
            <p className={styles.statValue}>{stats.vendasHoje}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Faturamento Hoje</p>
            <p className={styles.statValue}>{formatCurrency(stats.totalHoje)}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Produtos</p>
            <p className={styles.statValue}>{stats.produtosEstoque}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Funcionários</p>
            <p className={styles.statValue}>{stats.funcionariosAtivos}</p>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Vendas Recentes</h2>
        </div>
        <div className={styles.sectionContent}>
          {loading ? (
            <div className={styles.emptyState}>Carregando...</div>
          ) : vendasRecentes.length === 0 ? (
            <div className={styles.emptyState}>
              <svg className={styles.emptyStateIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p>Nenhuma venda registrada ainda</p>
            </div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Vendedor</th>
                    <th>Itens</th>
                    <th>Pagamento</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasRecentes.map((venda) => (
                    <tr key={venda.id}>
                      <td>{formatDate(venda.data)}</td>
                      <td>{venda.vendedorNome || '-'}</td>
                      <td>{venda.itens?.length || 0} itens</td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgeBlue}`}>
                          {venda.formaPagamento?.replace('_', ' ') || '-'}
                        </span>
                      </td>
                      <td><strong>{formatCurrency(venda.total || 0)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
