'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { FORMAS_PAGAMENTO } from '@/lib/types'
import Fatura from './Fatura'
import styles from '@/styles/Vendas.module.css'

export default function PDV() {
  const { user, userData } = useAuth()
  const [produtos, setProdutos] = useState([])
  const [search, setSearch] = useState('')
  const [carrinho, setCarrinho] = useState([])
  const [formaPagamento, setFormaPagamento] = useState('dinheiro')
  const [loading, setLoading] = useState(false)
  const [caixaAberto, setCaixaAberto] = useState(null)

  useEffect(() => {
    loadProdutos()
    checkCaixaAberto()
  }, [])

  const loadProdutos = async () => {
    try {
      const produtosRef = collection(db, 'produtos')
      const snapshot = await getDocs(produtosRef)
      const produtosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setProdutos(produtosData)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  const checkCaixaAberto = async () => {
    try {
      const caixasRef = collection(db, 'caixas')
      const snapshot = await getDocs(caixasRef)
      const caixaAtivo = snapshot.docs.find(doc => {
        const data = doc.data()
        return data.vendedorId === user?.uid && data.status === 'aberto'
      })
      
      if (caixaAtivo) {
        setCaixaAberto({ id: caixaAtivo.id, ...caixaAtivo.data() })
      }
    } catch (error) {
      console.error('Erro ao verificar caixa:', error)
    }
  }

  const filteredProdutos = produtos.filter(p => 
    p.nome?.toLowerCase().includes(search.toLowerCase()) ||
    p.codigoBarras?.includes(search)
  )

  const addToCart = (produto) => {
    if (produto.quantidade < 1) {
      alert('Produto sem estoque!')
      return
    }

    const existing = carrinho.find(item => item.id === produto.id)
    if (existing) {
      if (existing.qtd >= produto.quantidade) {
        alert('Quantidade máxima atingida!')
        return
      }
      setCarrinho(carrinho.map(item => 
        item.id === produto.id 
          ? { ...item, qtd: item.qtd + 1 }
          : item
      ))
    } else {
      setCarrinho([...carrinho, { ...produto, qtd: 1 }])
    }
  }

  const updateQuantity = (id, delta) => {
    const produto = produtos.find(p => p.id === id)
    setCarrinho(carrinho.map(item => {
      if (item.id === id) {
        const newQtd = item.qtd + delta
        if (newQtd < 1) return item
        if (newQtd > produto.quantidade) {
          alert('Quantidade máxima atingida!')
          return item
        }
        return { ...item, qtd: newQtd }
      }
      return item
    }))
  }

  const removeFromCart = (id) => {
    setCarrinho(carrinho.filter(item => item.id !== id))
  }

  const clearCart = () => {
    setCarrinho([])
  }

  const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0)
  const total = subtotal

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      alert('Carrinho vazio!')
      return
    }

    if (!caixaAberto) {
      alert('Você precisa ter um caixa aberto para realizar vendas!')
      return
    }

    setLoading(true)

    try {
      // Criar venda
      const vendaData = {
        vendedorId: user.uid,
        vendedorNome: userData?.nome || 'Vendedor',
        caixaId: caixaAberto.id,
        itens: carrinho.map(item => ({
          produtoId: item.id,
          nome: item.nome,
          quantidade: item.qtd,
          precoUnitario: item.preco,
          subtotal: item.preco * item.qtd,
        })),
        subtotal,
        total,
        formaPagamento,
        data: new Date(),
        status: 'concluida',
      }

      await addDoc(collection(db, 'vendas'), vendaData)

      // Atualizar estoque
      for (const item of carrinho) {
        const produtoRef = doc(db, 'produtos', item.id)
        const produtoDoc = await getDoc(produtoRef)
        if (produtoDoc.exists()) {
          const novaQtd = (produtoDoc.data().quantidade || 0) - item.qtd
          await updateDoc(produtoRef, { quantidade: Math.max(0, novaQtd) })
        }
      }

      // Atualizar total do caixa
      const caixaRef = doc(db, 'caixas', caixaAberto.id)
      await updateDoc(caixaRef, {
        totalVendas: (caixaAberto.totalVendas || 0) + total,
        quantidadeVendas: (caixaAberto.quantidadeVendas || 0) + 1,
      })

      alert('Venda finalizada com sucesso!')
      setCarrinho([])
      loadProdutos()
      checkCaixaAberto()
    } catch (error) {
      console.error('Erro ao finalizar venda:', error)
      alert('Erro ao finalizar venda')
    } finally {
      setLoading(false)
    }
  }

  if (!caixaAberto) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Ponto de Venda</h1>
        </div>
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          background: '#fff', 
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" style={{ margin: '0 auto 1rem' }}>
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          <h2 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Caixa Fechado</h2>
          <p style={{ color: '#6b7280' }}>
            Seu caixa precisa estar aberto para realizar vendas.
            <br />
            Solicite a abertura do caixa ao gerente.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Ponto de Venda</h1>
      </div>

      <div className={styles.pdvLayout}>
        <div className={styles.productsSection}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Buscar produto por nome ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.productsList}>
            {filteredProdutos.map((produto) => (
              <div 
                key={produto.id} 
                className={styles.productItem}
                onClick={() => addToCart(produto)}
              >
                <div className={styles.productItemName}>{produto.nome}</div>
                <div className={styles.productItemPrice}>{formatCurrency(produto.preco || 0)}</div>
                <div className={styles.productItemStock}>Estoque: {produto.quantidade || 0}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.cartSection}>
          <div className={styles.cartHeader}>
            <h2 className={styles.cartTitle}>
              Carrinho
              {carrinho.length > 0 && (
                <span className={styles.cartBadge}>{carrinho.length}</span>
              )}
            </h2>
            {carrinho.length > 0 && (
              <button onClick={clearCart} className={styles.clearButton}>
                Limpar
              </button>
            )}
          </div>

          <div className={styles.cartItems}>
            {carrinho.length === 0 ? (
              <div className={styles.cartEmpty}>
                <svg className={styles.cartEmptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <p>Carrinho vazio</p>
              </div>
            ) : (
              carrinho.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.cartItemInfo}>
                    <div className={styles.cartItemName}>{item.nome}</div>
                    <div className={styles.cartItemPrice}>{formatCurrency(item.preco)}</div>
                  </div>
                  <div className={styles.quantityControl}>
                    <button 
                      className={styles.quantityButton}
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      -
                    </button>
                    <span className={styles.quantity}>{item.qtd}</span>
                    <button 
                      className={styles.quantityButton}
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className={styles.cartItemTotal}>
                    {formatCurrency(item.preco * item.qtd)}
                  </div>
                  <button 
                    className={styles.removeButton}
                    onClick={() => removeFromCart(item.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          <div className={styles.cartFooter}>
            <div className={styles.cartTotals}>
              <div className={styles.cartRow}>
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className={`${styles.cartRow} ${styles.cartRowTotal}`}>
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              className={styles.paymentSelect}
            >
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="pix">PIX</option>
            </select>

            <button 
              onClick={finalizarVenda}
              disabled={carrinho.length === 0 || loading}
              className={styles.checkoutButton}
            >
              {loading ? 'Processando...' : 'Finalizar Venda'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
