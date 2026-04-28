import { forwardRef } from "react";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import styles from "./Fatura.module.css";

const Fatura = forwardRef(({ venda, empresa }, ref) => {
  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const formatPayment = (payment) => {
    const labels = {
      dinheiro: "Dinheiro",
      cartao_credito: "Cartao de Credito",
      cartao_debito: "Cartao de Debito",
      pix: "PIX",
      multicaixa: "Multicaixa Express",
    };
    return labels[payment] || payment || "-";
  };

  const empresaInfo = empresa || {
    nome: "Mamev Cosmeticos",
    nif: "5417289401",
    endereco: "Luanda, Angola",
    telefone: "+244 923 456 789",
    email: "contato@mamevcos.ao",
  };

  // Calcular subtotal base (sem IVA)
  const calcularSubtotalBase = () => {
    return (venda?.produtos || []).reduce((acc, item) => {
      const precoBase = item.precoBase || (item.preco / 1.14);
      return acc + precoBase * (item.quantidade || 1);
    }, 0);
  };

  // Calcular IVA total
  const calcularIVA = () => {
    return (venda?.produtos || []).reduce((acc, item) => {
      const precoBase = item.precoBase || (item.preco / 1.14);
      const iva = (item.preco || 0) - precoBase;
      return acc + iva * (item.quantidade || 1);
    }, 0);
  };

  const subtotalBase = calcularSubtotalBase();
  const totalIVA = calcularIVA();
  const desconto = venda?.desconto || 0;
  const total = venda?.total || (subtotalBase + totalIVA - desconto);
  const valorPago = venda?.valorPago || total;
  const troco = venda?.troco || 0;

  return (
    <div ref={ref} className={styles.fatura}>
      {/* Header da Empresa */}
      <div className={styles.header}>
        <div className={styles.empresa}>
          <h1 className={styles.empresaNome}>{empresaInfo.nome}</h1>
          <p className={styles.empresaInfo}>NIF: {empresaInfo.nif}</p>
          <p className={styles.empresaInfo}>{empresaInfo.endereco}</p>
          <p className={styles.empresaInfo}>Tel: {empresaInfo.telefone}</p>
        </div>
        <div className={styles.faturaInfo}>
          <h2 className={styles.faturaTitle}>FATURA</h2>
          <p className={styles.faturaNumero}>
            Nr: {venda?.idCompra || venda?.numero || "-"}
          </p>
          <p className={styles.faturaData}>Data: {formatDate(venda?.data)}</p>
        </div>
      </div>

      {/* Info do Cliente (se houver) */}
      {venda?.cliente && (
        <div className={styles.cliente}>
          <h3 className={styles.sectionTitle}>Cliente</h3>
          <p className={styles.clienteNome}>{venda.cliente.nome}</p>
          {venda.cliente.nif && <p>NIF: {venda.cliente.nif}</p>}
          {venda.cliente.telefone && <p>Tel: {venda.cliente.telefone}</p>}
        </div>
      )}

      {/* Vendedor e Pagamento */}
      <div className={styles.vendedor}>
        <p>
          <strong>Vendedor:</strong> {venda?.vendedorNome || venda?.vendedor || "-"}
        </p>
        <p>
          <strong>Forma de Pagamento:</strong> {formatPayment(venda?.formaPagamento || venda?.pagamento)}
        </p>
      </div>

      {/* Tabela de Produtos */}
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th className={styles.thProduto}>Produto</th>
            <th className={styles.thQtd}>Qtd</th>
            <th className={styles.thPreco}>Preco Unit.</th>
            <th className={styles.thIva}>IVA (14%)</th>
            <th className={styles.thSubtotal}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {(venda?.produtos || []).map((item, index) => {
            const precoBase = item.precoBase || (item.preco / 1.14);
            const ivaUnitario = (item.preco || 0) - precoBase;
            const qtd = item.quantidade || 1;
            
            return (
              <tr key={index}>
                <td className={styles.tdProduto}>{item.name || item.nome}</td>
                <td className={styles.tdQtd}>{qtd}</td>
                <td className={styles.tdPreco}>{handleFormatCoin(precoBase)}</td>
                <td className={styles.tdIva}>{handleFormatCoin(ivaUnitario * qtd)}</td>
                <td className={styles.tdSubtotal}>
                  {handleFormatCoin((item.preco || 0) * qtd)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totais */}
      <div className={styles.totais}>
        <div className={styles.totalRow}>
          <span>Subtotal (sem IVA):</span>
          <span>{handleFormatCoin(subtotalBase)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>IVA (14%):</span>
          <span>{handleFormatCoin(totalIVA)}</span>
        </div>
        {desconto > 0 && (
          <div className={styles.totalRow}>
            <span>Desconto:</span>
            <span className={styles.desconto}>-{handleFormatCoin(desconto)}</span>
          </div>
        )}
        <div className={`${styles.totalRow} ${styles.totalFinal}`}>
          <span>TOTAL:</span>
          <span>{handleFormatCoin(total)}</span>
        </div>
      </div>

      {/* Informacoes de Pagamento */}
      {(venda?.formaPagamento === "dinheiro" || venda?.pagamento === "dinheiro") && (
        <div className={styles.pagamentoInfo}>
          <h4 className={styles.pagamentoTitle}>Informacoes de Pagamento</h4>
          <div className={styles.pagamentoGrid}>
            <div className={styles.pagamentoItem}>
              <span className={styles.pagamentoLabel}>Valor Recebido</span>
              <span className={styles.pagamentoValue}>{handleFormatCoin(valorPago)}</span>
            </div>
            <div className={styles.pagamentoItem}>
              <span className={styles.pagamentoLabel}>Troco</span>
              <span className={`${styles.pagamentoValue} ${styles.trocoValue}`}>
                {handleFormatCoin(troco)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nota de Devolucao */}
      <div className={styles.notaDevolucao}>
        <h4 className={styles.notaTitulo}>Nota Informativa de Devolucao</h4>
        <p className={styles.notaTexto}>
          Aceitamos devolucoes apenas em caso de produto danificado ou com defeito de fabrico.
        </p>
        <ul className={styles.notaLista}>
          <li>
            Prazo para devolucao: ate <strong>7 dias</strong> apos a compra
          </li>
          <li>
            Obrigatoria a apresentacao da <strong>fatura original</strong>
          </li>
          <li>
            O produto deve estar em <strong>condicoes adequadas para verificacao</strong>
          </li>
          <li>
            Produtos abertos ou usados <strong>nao sao elegiveis</strong>, salvo em caso de
            defeito comprovado
          </li>
        </ul>
        <p className={styles.notaTexto}>
          A empresa reserva-se o direito de <strong>verificar o estado do produto</strong>{" "}
          antes da aprovacao da devolucao.
        </p>
        <p className={styles.notaTexto}>
          Em caso de validacao, podera ser realizada <strong>troca ou reembolso</strong>,
          conforme aplicavel.
        </p>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p className={styles.footerMessage}>Obrigado pela preferencia!</p>
        <p className={styles.footerSubtext}>
          {empresaInfo.nome} - A sua beleza, a nossa missao
          <br />
          Volte sempre!
        </p>
      </div>
    </div>
  );
});

Fatura.displayName = "Fatura";

export default Fatura;
