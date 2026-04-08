'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'
import { CARGOS } from '@/lib/types'
import styles from '@/styles/Funcionarios.module.css'
import modalStyles from '@/styles/Modal.module.css'

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingFuncionario, setEditingFuncionario] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cargo: 'vendedor',
    telefone: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadFuncionarios()
  }, [])

  const loadFuncionarios = async () => {
    try {
      const usuariosRef = collection(db, 'usuarios')
      const snapshot = await getDocs(usuariosRef)
      const funcionariosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setFuncionarios(funcionariosData)
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFuncionarios = funcionarios.filter(f =>
    f.nome?.toLowerCase().includes(search.toLowerCase()) ||
    f.email?.toLowerCase().includes(search.toLowerCase())
  )

  const openModal = (funcionario = null) => {
    if (funcionario) {
      setEditingFuncionario(funcionario)
      setFormData({
        nome: funcionario.nome || '',
        email: funcionario.email || '',
        senha: '',
        cargo: funcionario.cargo || 'vendedor',
        telefone: funcionario.telefone || '',
      })
    } else {
      setEditingFuncionario(null)
      setFormData({
        nome: '',
        email: '',
        senha: '',
        cargo: 'vendedor',
        telefone: '',
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingFuncionario(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingFuncionario) {
        // Atualizar funcionário existente
        const updateData = {
          nome: formData.nome,
          cargo: formData.cargo,
          telefone: formData.telefone,
          updatedAt: new Date(),
        }
        await updateDoc(doc(db, 'usuarios', editingFuncionario.id), updateData)
      } else {
        // Criar novo usuário no Firebase Auth
        if (!formData.senha || formData.senha.length < 6) {
          alert('A senha deve ter pelo menos 6 caracteres')
          setSubmitting(false)
          return
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.senha
        )

        // Criar documento do usuário no Firestore
        await addDoc(collection(db, 'usuarios'), {
          uid: userCredential.user.uid,
          nome: formData.nome,
          email: formData.email,
          cargo: formData.cargo,
          telefone: formData.telefone,
          createdAt: new Date(),
          ativo: true,
        })
      }

      closeModal()
      loadFuncionarios()
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error)
      if (error.code === 'auth/email-already-in-use') {
        alert('Este email já está em uso')
      } else {
        alert('Erro ao salvar funcionário: ' + error.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este funcionário?')) return

    try {
      await deleteDoc(doc(db, 'usuarios', id))
      loadFuncionarios()
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  const getBadgeClass = (cargo) => {
    switch (cargo) {
      case 'admin': return styles.badgeAdmin
      case 'gerente': return styles.badgeGerente
      default: return styles.badgeVendedor
    }
  }

  const formatDate = (date) => {
    if (!date) return '-'
    const d = date?.toDate ? date.toDate() : new Date(date)
    return new Intl.DateTimeFormat('pt-BR').format(d)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Funcionários</h1>
        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Buscar funcionário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <button onClick={() => openModal()} className={styles.addButton}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Adicionar
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          Carregando...
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredFuncionarios.map((funcionario) => (
            <div key={funcionario.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>{getInitials(funcionario.nome)}</div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.name}>{funcionario.nome}</h3>
                  <p className={styles.email}>{funcionario.email}</p>
                </div>
                <span className={`${styles.badge} ${getBadgeClass(funcionario.cargo)}`}>
                  {funcionario.cargo}
                </span>
              </div>
              <div className={styles.cardMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Telefone</span>
                  <span className={styles.metaValue}>{funcionario.telefone || '-'}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Cadastro</span>
                  <span className={styles.metaValue}>{formatDate(funcionario.createdAt)}</span>
                </div>
              </div>
              <div className={styles.cardActions}>
                <button onClick={() => openModal(funcionario)} className={styles.actionButton}>
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(funcionario.id)} 
                  className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
          {filteredFuncionarios.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Nenhum funcionário encontrado
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className={modalStyles.overlay} onClick={closeModal}>
          <div className={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={modalStyles.header}>
              <h2 className={modalStyles.title}>
                {editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}
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
                    <label className={modalStyles.label}>Nome Completo</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className={modalStyles.input}
                      required
                    />
                  </div>
                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={modalStyles.input}
                      required
                      disabled={!!editingFuncionario}
                    />
                  </div>
                  {!editingFuncionario && (
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Senha</label>
                      <input
                        type="password"
                        value={formData.senha}
                        onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                        className={modalStyles.input}
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                    </div>
                  )}
                  <div className={modalStyles.fieldRow}>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Cargo</label>
                      <select
                        value={formData.cargo}
                        onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                        className={modalStyles.select}
                        required
                      >
                        <option value="vendedor">Vendedor</option>
                        <option value="gerente">Gerente</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Telefone</label>
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        className={modalStyles.input}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className={modalStyles.footer}>
                <button type="button" onClick={closeModal} className={modalStyles.cancelButton}>
                  Cancelar
                </button>
                <button type="submit" className={modalStyles.submitButton} disabled={submitting}>
                  {submitting ? 'Salvando...' : editingFuncionario ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
