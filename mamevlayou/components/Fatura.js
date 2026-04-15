'use client'

import { useRef } from 'react'
import styles from '@/styles/Fatura.module.css'

export default function Fatura({ venda, onClose }) {
  const faturaRef = useRef(null)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getFormaPagamentoLabel = (forma) => {
    const labels = {
      dinheiro: 'Dinheiro',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      pix: 'PIX'
    }
    return labels[forma] || forma
  }

  const handlePrint = () => {
    window.print()
  }

  const gerarNumeroFatura = () => {
    const timestamp = venda.data.getTime().toString().slice(-8)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `FAT-${timestamp}-${random}`
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.faturaContainer} 
        onClick={(e) => e.stopPropagation()}
        ref={faturaRef}
      >
        <div className={styles.faturaContent}>
          {/* Header */}
          <div className={styles.faturaHeader}>
            <div className={styles.logo}>Mamev Cosméticos</div>
            <div className={styles.logoSubtitle}>Beleza que transforma</div>
            <h2 className={styles.faturaTitle}>Comprovante de Venda</h2>
            
            <div className={styles.faturaInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Fatura Nº</span>
                <span className={styles.infoValue}>{gerarNumeroFatura()}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Data/Hora</span>
                <span className={styles.infoValue}>{formatDate(venda.data)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Vendedor</span>
                <span className={styles.infoValue}>{venda.vendedorNome}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Caixa</span>
                <span className={styles.infoValue}>#{venda.caixaId.slice(-4).toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Itens */}
          <div className={styles.faturaItens}>
            <div className={styles.itensHeader}>
              <span>Produto</span>
              <span style={{ textAlign: 'right' }}>Qtd</span>
              <span style={{ textAlign: 'right' }}>Preço</span>
              <span style={{ textAlign: 'right' }}>Total</span>
            </div>
            {venda.itens.map((item, index) => (
              <div key={index} className={styles.itemRow}>
                <span className={styles.itemNome}>{item.nome}</span>
                <span className={styles.itemQtd}>{item.quantidade}</span>
                <span className={styles.itemPreco}>{formatCurrency(item.precoUnitario)}</span>
                <span className={styles.itemSubtotal}>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>

          {/* Totais */}
          <div className={styles.faturaTotais}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Subtotal</span>
              <span className={styles.totalValue}>{formatCurrency(venda.subtotal)}</span>
            </div>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Desconto</span>
              <span className={styles.totalValue}>{formatCurrency(0)}</span>
            </div>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total</span>
              <span className={`${styles.totalValue} ${styles.totalFinal}`}>
                {formatCurrency(venda.total)}
              </span>
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className={styles.pagamento}>
            <svg className={styles.pagamentoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {venda.formaPagamento === 'dinheiro' && (
                <>
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
              {(venda.formaPagamento === 'cartao_credito' || venda.formaPagamento === 'cartao_debito') && (
                <>
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </>
              )}
              {venda.formaPagamento === 'pix' && (
                <>
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </>
              )}
            </svg>
            <span className={styles.pagamentoText}>
              Pago via <span className={styles.pagamentoTipo}>{getFormaPagamentoLabel(venda.formaPagamento)}</span>
            </span>
          </div>

          {/* Nota Informativa de Devolução */}
          <div className={styles.notaDevolucao}>
            <h4 className={styles.notaTitulo}>Nota Informativa de Devolução</h4>
            <p className={styles.notaTexto}>
              Aceitamos devoluções apenas em caso de produto danificado ou com defeito de fabrico.
            </p>
            <ul className={styles.notaLista}>
              <li>Prazo para devolução: até <strong>7 dias</strong> após a compra</li>
              <li>Obrigatória a apresentação da <strong>fatura original</strong></li>
              <li>O produto deve estar em <strong>condições adequadas para verificação</strong></li>
              <li>Produtos abertos ou usados <strong>não são elegíveis</strong>, salvo em caso de defeito comprovado</li>
            </ul>
            <p className={styles.notaTexto}>
              A empresa reserva-se o direito de <strong>verificar o estado do produto</strong> antes da aprovação da devolução.
            </p>
            <p className={styles.notaTexto}>
              Em caso de validação, poderá ser realizada <strong>troca ou reembolso</strong>, conforme aplicável.
            </p>
          </div>

          {/* Footer */}
          <div className={styles.faturaFooter}>
            <p className={styles.footerMessage}>Obrigado pela preferência!</p>
            <p className={styles.footerSubtext}>
              Mamev Cosméticos - Sua beleza, nossa missão
              <br />
              Volte sempre!
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.faturaActions}>
          <button className={styles.btnPrint} onClick={handlePrint}>
            <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Imprimir
          </button>
          <button className={styles.btnClose} onClick={onClose}>
            <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
