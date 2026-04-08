'use client'

import styles from '@/styles/Login.module.css'

export default function SetupInstructions() {
  return (
    <div className={styles.container}>
      <div className={styles.card} style={{ maxWidth: '600px' }}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h1 className={styles.title}>Mamev Cosméticos</h1>
          <p className={styles.subtitle}>Configuração Inicial</p>
        </div>

        <div style={{ textAlign: 'left', fontSize: '0.9375rem', color: '#374151' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>
            Configure o Firebase para começar:
          </h3>
          
          <ol style={{ paddingLeft: '1.25rem', lineHeight: '1.8' }}>
            <li>
              Acesse o <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" style={{ color: '#ec4899' }}>Firebase Console</a>
            </li>
            <li>
              Crie um projeto ou use um existente
            </li>
            <li>
              Ative <strong>Authentication</strong> com Email/Senha
            </li>
            <li>
              Ative o <strong>Cloud Firestore</strong>
            </li>
            <li>
              Crie um usuário admin:
              <ul style={{ marginTop: '0.5rem' }}>
                <li>Authentication {'->'} Add User</li>
                <li>Email: admin@mamev.com</li>
              </ul>
            </li>
            <li>
              No Firestore, crie a collection <code style={{ background: '#f3f4f6', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>usuarios</code>:
              <ul style={{ marginTop: '0.5rem' }}>
                <li>Documento com o UID do usuário</li>
                <li>Campos: nome, email, cargo: &quot;admin&quot;</li>
              </ul>
            </li>
            <li>
              Configure as regras do Firestore para permitir acesso autenticado
            </li>
          </ol>

          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            background: '#fdf2f8', 
            borderRadius: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <strong>Dica:</strong> Após criar o admin, você pode adicionar funcionários e produtos diretamente pelo sistema.
          </div>
        </div>
      </div>
    </div>
  )
}
