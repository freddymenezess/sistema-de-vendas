'use client'

import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Login from '@/components/Login'
import AppLayout from '@/components/AppLayout'
import Dashboard from '@/components/Dashboard'
import Estoque from '@/components/Estoque'
import Funcionarios from '@/components/Funcionarios'
import PDV from '@/components/PDV'
import Caixa from '@/components/Caixa'
import Relatorios from '@/components/Relatorios'
import Vendas from '@/components/Vendas'

function AppContent() {
  const { user, userData, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    // Definir página inicial baseada no cargo
    if (userData?.cargo === 'vendedor') {
      setCurrentPage('pdv')
    } else {
      setCurrentPage('dashboard')
    }
  }, [userData])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #fce7f3',
            borderTopColor: '#ec4899',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }} />
          <p style={{ color: '#6b7280' }}>Carregando...</p>
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  const renderPage = () => {
    const cargo = userData?.cargo

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'vendas':
        return <Vendas />
      case 'funcionarios':
        if (cargo === 'admin') return <Funcionarios />
        return <Dashboard />
      case 'estoque':
        return <Estoque />
      case 'estoque-consulta':
        return <Estoque readOnly />
      case 'caixas':
        if (cargo === 'admin' || cargo === 'gerente') return <Caixa />
        return <Dashboard />
      case 'relatorios':
        if (cargo === 'admin' || cargo === 'gerente') return <Relatorios />
        return <Dashboard />
      case 'pdv':
        return <PDV />
      case 'meu-caixa':
        return <Caixa isVendedorView />
      default:
        return <Dashboard />
    }
  }

  return (
    <AppLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </AppLayout>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
