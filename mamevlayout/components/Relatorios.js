'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import styles from '@/styles/Relatorios.module.css'

export default function Relatorios() {
  const [vendas, setVendas] = useState([])
  const [produtos, setProdutos] = useState([])
  const [filtro, setFiltro] = useState({
    dataInicio: '',
    dataFim: '',
    vendedor: '',
  })
  const [vendedores, setVendedores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Carregar vendas
      const vendasRef = collection(db, 'vendas')
      const vendasSnap = await getDocs(vendasRef)
      const vendasData = vendasSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setVendas(vendasData)

      // Carregar produtos
      const produtosRef = collection(db, 'produtos')
      const produtosSnap = await getDocs(produtosRef)
      const produtosData = produtosSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setProdutos(produtosData)

      // Carregar vendedores
      const usuariosRef = collection(db, 'usuarios')
      const usuariosSnap = await getDocs(usuariosRef)
      const vendedoresData = usuariosSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.cargo === 'vendedor')
      setVendedores(vendedoresData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVendas = vendas.filter(venda => {
    const dataVenda = venda.data?.toDate ? venda.data.toDate() : new Date(venda.data)
    
    if (filtro.dataInicio) {
      const inicio = new Date(filtro.dataInicio)
      if (dataVenda < inicio) return false
    }
    
    if (filtro.dataFim) {
      const fim = new Date(filtro.dataFim)
      fim.setHours(23, 59, 59)
      if (dataVenda > fim) return false
    }
    
    if (filtro.vendedor && venda.vendedorId !== filtro.vendedor) {
      return false
    }
    
    return true
  })

  const totalVendas = filteredVendas.reduce((acc, v) => acc + (v.total || 0), 0)
  const ticketMedio = filteredVendas.length > 0 ? totalVendas / filteredVendas.length : 0
  const totalItens = filteredVendas.reduce((acc, v) => acc + (v.itens?.length || 0), 0)

  // Vendas por forma de pagamento
  const vendasPorPagamento = filteredVendas.reduce((acc, venda) => {
    const forma = venda.formaPagamento || 'outros'
    acc[forma] = (acc[forma] || 0) + (venda.total || 0)
    return acc
  }, {})

  // Produtos mais vendidos
  const produtosMaisVendidos = filteredVendas
    .flatMap(v => v.itens || [])
    .reduce((acc, item) => {
      const existing = acc.find(p => p.produtoId === item.produtoId)
      if (existing) {
        existing.quantidade += item.quantidade
        existing.total += item.subtotal || 0
      } else {
        acc.push({
          produtoId: item.produtoId,
          nome: item.nome,
          quantidade: item.quantidade,
          total: item.subtotal || 0,
        })
      }
      return acc
    }, [])
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5)

  // Dados para o gráfico (últimos 7 dias)
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    date.setHours(0, 0, 0, 0)
    return date
  })

  const vendasPorDia = last7Days.map(date => {
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    
    const total = filteredVendas
      .filter(v => {
        const dataVenda = v.data?.toDate ? v.data.toDate() : new Date(v.data)
        return dataVenda >= date && dataVenda < nextDay
      })
      .reduce((acc, v) => acc + (v.total || 0), 0)
    
    return {
      date,
      total,
      label: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date),
    }
  })

  const maxVenda = Math.max(...vendasPorDia.map(d => d.total), 1)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
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
      <div className={styles.header}>
        <h1 className={styles.title}>Relatórios</h1>
        <p className={styles.subtitle}>Analise o desempenho das vendas</p>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Data Início</label>
          <input
            type="date"
            value={filtro.dataInicio}
            onChange={(e) => setFiltro({ ...filtro, dataInicio: e.target.value })}
            className={styles.filterInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Data Fim</label>
          <input
            type="date"
            value={filtro.dataFim}
            onChange={(e) => setFiltro({ ...filtro, dataFim: e.target.value })}
            className={styles.filterInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Vendedor</label>
          <select
            value={filtro.vendedor}
            onChange={(e) => setFiltro({ ...filtro, vendedor: e.target.value })}
            className={styles.filterSelect}
          >
            <option value="">Todos</option>
            {vendedores.map(v => (
              <option key={v.id} value={v.id}>{v.nome}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => setFiltro({ dataInicio: '', dataFim: '', vendedor: '' })}
          className={styles.generateButton}
        >
          Limpar Filtros
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total em Vendas</p>
          <p className={styles.statValue}>{formatCurrency(totalVendas)}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Quantidade de Vendas</p>
          <p className={styles.statValue}>{filteredVendas.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Ticket Médio</p>
          <p className={styles.statValue}>{formatCurrency(ticketMedio)}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Itens Vendidos</p>
          <p className={styles.statValue}>{totalItens}</p>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Vendas - Últimos 7 Dias</h2>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.chartContainer}>
            <div className={styles.chartBars}>
              {vendasPorDia.map((dia, idx) => (
                <div key={idx} className={styles.chartBarWrapper}>
                  <span className={styles.chartBarValue}>
                    {dia.total > 0 ? formatCurrency(dia.total) : '-'}
                  </span>
                  <div 
                    className={styles.chartBar}
                    style={{ height: `${(dia.total / maxVenda) * 200}px` }}
                  />
                  <span className={styles.chartLabel}>{dia.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Produtos Mais Vendidos</h2>
          </div>
          <div className={styles.sectionContent}>
            {produtosMaisVendidos.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center' }}>Nenhum dado disponível</p>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Qtd. Vendida</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosMaisVendidos.map((produto, idx) => (
                      <tr key={idx}>
                        <td>{produto.nome}</td>
                        <td>{produto.quantidade}</td>
                        <td>{formatCurrency(produto.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Vendas por Forma de Pagamento</h2>
          </div>
          <div className={styles.sectionContent}>
            {Object.keys(vendasPorPagamento).length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center' }}>Nenhum dado disponível</p>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Forma de Pagamento</th>
                      <th>Total</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(vendasPorPagamento).map(([forma, valor]) => (
                      <tr key={forma}>
                        <td>{formatPayment(forma)}</td>
                        <td>{formatCurrency(valor)}</td>
                        <td>{((valor / totalVendas) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
