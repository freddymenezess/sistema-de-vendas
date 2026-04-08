'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { CATEGORIAS } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import styles from '@/styles/Estoque.module.css'
import modalStyles from '@/styles/Modal.module.css'

export default function Estoque({ readOnly = false }) {
  const { isVendedor } = useAuth()
  const [produtos, setProdutos] = useState([])
  const [filteredProdutos, setFilteredProdutos] = useState([])
  const [search, setSearch] = useState('')
  const [categoria, setCategoria] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduto, setEditingProduto] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    preco: '',
    precoCusto: '',
    quantidade: '',
    codigoBarras: '',
    descricao: '',
  })

  useEffect(() => {
    loadProdutos()
  }, [])

  useEffect(() => {
    filterProdutos()
  }, [search, categoria, produtos])

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
    } finally {
      setLoading(false)
    }
  }

  const filterProdutos = () => {
    let filtered = [...produtos]
    
    if (search) {
      filtered = filtered.filter(p => 
        p.nome?.toLowerCase().includes(search.toLowerCase()) ||
        p.codigoBarras?.includes(search)
      )
    }
    
    if (categoria) {
      filtered = filtered.filter(p => p.categoria === categoria)
    }
    
    setFilteredProdutos(filtered)
  }

  const openModal = (produto = null) => {
    if (produto) {
      setEditingProduto(produto)
      setFormData({
        nome: produto.nome || '',
        categoria: produto.categoria || '',
        preco: produto.preco?.toString() || '',
        precoCusto: produto.precoCusto?.toString() || '',
        quantidade: produto.quantidade?.toString() || '',
        codigoBarras: produto.codigoBarras || '',
        descricao: produto.descricao || '',
      })
    } else {
      setEditingProduto(null)
      setFormData({
        nome: '',
        categoria: '',
        preco: '',
        precoCusto: '',
        quantidade: '',
        codigoBarras: '',
        descricao: '',
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduto(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const produtoData = {
      nome: formData.nome,
      categoria: formData.categoria,
      preco: parseFloat(formData.preco) || 0,
      precoCusto: parseFloat(formData.precoCusto) || 0,
      quantidade: parseInt(formData.quantidade) || 0,
      codigoBarras: formData.codigoBarras,
      descricao: formData.descricao,
      updatedAt: new Date(),
    }

    try {
      if (editingProduto) {
        await updateDoc(doc(db, 'produtos', editingProduto.id), produtoData)
      } else {
        produtoData.createdAt = new Date()
        await addDoc(collection(db, 'produtos'), produtoData)
      }
      
      closeModal()
      loadProdutos()
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return
    
    try {
      await deleteDoc(doc(db, 'produtos', id))
      loadProdutos()
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const canEdit = !readOnly && !isVendedor

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {readOnly ? 'Consulta de Estoque' : 'Gestão de Estoque'}
        </h1>
        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todas categorias</option>
            {CATEGORIAS.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {canEdit && (
            <button onClick={() => openModal()} className={styles.addButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Adicionar
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.emptyState}>Carregando...</div>
      ) : (
        <div className={styles.grid}>
          {filteredProdutos.map((produto) => (
            <div key={produto.id} className={styles.productCard}>
              <div className={styles.productImage}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </div>
              <div className={styles.productContent}>
                <div className={styles.productCategory}>{produto.categoria}</div>
                <h3 className={styles.productName}>{produto.nome}</h3>
                <div className={styles.productMeta}>
                  <span className={styles.productPrice}>{formatCurrency(produto.preco || 0)}</span>
                  <span className={`${styles.productStock} ${produto.quantidade < 10 ? styles.stockLow : ''}`}>
                    {produto.quantidade || 0} un.
                  </span>
                </div>
                {canEdit && (
                  <div className={styles.productActions}>
                    <button 
                      onClick={() => openModal(produto)} 
                      className={styles.actionButton}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(produto.id)} 
                      className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredProdutos.length === 0 && (
            <div className={styles.emptyState}>
              Nenhum produto encontrado
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className={modalStyles.overlay} onClick={closeModal}>
          <div className={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={modalStyles.header}>
              <h2 className={modalStyles.title}>
                {editingProduto ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button onClick={closeModal} className={modalStyles.closeButton}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={modalStyles.content}>
                <div className={modalStyles.form}>
                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>Nome do Produto</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className={modalStyles.input}
                      required
                    />
                  </div>
                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>Categoria</label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                      className={modalStyles.select}
                      required
                    >
                      <option value="">Selecione...</option>
                      {CATEGORIAS.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className={modalStyles.fieldRow}>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Preço Venda</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.preco}
                        onChange={(e) => setFormData({...formData, preco: e.target.value})}
                        className={modalStyles.input}
                        required
                      />
                    </div>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Preço Custo</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.precoCusto}
                        onChange={(e) => setFormData({...formData, precoCusto: e.target.value})}
                        className={modalStyles.input}
                      />
                    </div>
                  </div>
                  <div className={modalStyles.fieldRow}>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Quantidade</label>
                      <input
                        type="number"
                        value={formData.quantidade}
                        onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                        className={modalStyles.input}
                        required
                      />
                    </div>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Código de Barras</label>
                      <input
                        type="text"
                        value={formData.codigoBarras}
                        onChange={(e) => setFormData({...formData, codigoBarras: e.target.value})}
                        className={modalStyles.input}
                      />
                    </div>
                  </div>
                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>Descrição</label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                      className={modalStyles.textarea}
                    />
                  </div>
                </div>
              </div>
              <div className={modalStyles.footer}>
                <button type="button" onClick={closeModal} className={modalStyles.cancelButton}>
                  Cancelar
                </button>
                <button type="submit" className={modalStyles.submitButton}>
                  {editingProduto ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
