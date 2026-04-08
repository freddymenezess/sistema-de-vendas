'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import styles from '@/styles/Dashboard.module.css'

export default function Vendas() {
  const [vendas, setVendas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    loadVendas()
  }, [])

  const loadVendas = async () => {
    try {
      const vendasRef = collection(db, 'vendas')
      const snapshot = await getDocs(vendasRef)
      const vendasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const dateA = a.data?.toDate ? a.data.toDate() : new Date(a.data)
        const dateB = b.data?.toDate ? b.data.toDate() : new Date(b.data)
        return dateB - dateA
      })
      setVendas(vendasData)
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVendas = vendas.filter(v => {
    if (!filtro) return true
    return v.vendedorNome?.toLowerCase().includes(filtro.toLowerCase()) ||
           v.id.toLowerCase().includes(filtro.toLowerCase())
  })

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d)
  }

  const formatPayment = (payment) => {
    const labels = {
      dinheiro: 'Dinheiro',
      cartao_credito: 'Crédito',
      cartao_debito: 'Débito',
      pix: 'PIX',
    }
    return labels[payment] || payment
  }

  return (
    <div className={styles.container}>
      <div className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>Histórico de Vendas</h1>
        <p className={styles.welcomeSubtitle}>Visualize todas as vendas realizadas</p>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Todas as Vendas</h2>
          <input
            type="text"
            placeholder="Buscar por vendedor ou ID..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              width: '250px',
            }}
          />
        </div>
        <div className={styles.sectionContent}>
          {loading ? (
            <div className={styles.emptyState}>Carregando...</div>
          ) : filteredVendas.length === 0 ? (
            <div className={styles.emptyState}>
              <svg className={styles.emptyStateIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p>Nenhuma venda encontrada</p>
            </div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Vendedor</th>
                    <th>Itens</th>
                    <th>Pagamento</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendas.map((venda) => (
                    <tr key={venda.id}>
                      <td>{formatDate(venda.data)}</td>
                      <td>{venda.vendedorNome || '-'}</td>
                      <td>{venda.itens?.length || 0} itens</td>
                      <td>{formatPayment(venda.formaPagamento)}</td>
                      <td>
                        <span className={`${styles.badge} ${
                          venda.status === 'concluida' ? styles.badgeGreen :
                          venda.status === 'cancelada' ? styles.badgeRed :
                          styles.badgeYellow
                        }`}>
                          {venda.status || 'pendente'}
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
