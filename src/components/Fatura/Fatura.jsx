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
      cartao_credito: "Cartão de Crédito",
      cartao_debito: "Cartão de Débito",
      pix: "PIX",
      multicaixa: "Multicaixa Express",
    };
    return labels[payment] || payment || "-";
  };

  const empresaInfo = empresa || {
    nome: "Mamev Cosméticos",
    nif: "5417289401",
    endereco: "Luanda, Angola",
    telefone: "+244 923 456 789",
    email: "contato@mamevcos.ao",
  };

  const calcularSubtotal = () => {
    return (venda?.produtos || []).reduce(
      (acc, item) => acc + (item.preco || 0) * (item.quantidade || 1),
      0
    );
  };

  const subtotal = calcularSubtotal();
  const desconto = venda?.desconto || 0;
  const total = venda?.total || subtotal - desconto;

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
            Nº: {venda?.idCompra || venda?.numero || "-"}
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

      {/* Vendedor */}
      <div className={styles.vendedor}>
        <p>
          <strong>Vendedor:</strong> {venda?.vendedorNome || "-"}
        </p>
        <p>
          <strong>Forma de Pagamento:</strong> {formatPayment(venda?.formaPagamento)}
        </p>
      </div>

      {/* Tabela de Produtos */}
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th className={styles.thProduto}>Produto</th>
            <th className={styles.thQtd}>Qtd</th>
            <th className={styles.thPreco}>Preço Unit.</th>
            <th className={styles.thSubtotal}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {(venda?.produtos || []).map((item, index) => (
            <tr key={index}>
              <td className={styles.tdProduto}>{item.name || item.nome}</td>
              <td className={styles.tdQtd}>{item.quantidade || 1}</td>
              <td className={styles.tdPreco}>{handleFormatCoin(item.preco || 0)}</td>
              <td className={styles.tdSubtotal}>
                {handleFormatCoin((item.preco || 0) * (item.quantidade || 1))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totais */}
      <div className={styles.totais}>
        <div className={styles.totalRow}>
          <span>Subtotal:</span>
          <span>{handleFormatCoin(subtotal)}</span>
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

      {/* Nota de Devolução */}
      <div className={styles.notaDevolucao}>
        <h4 className={styles.notaTitulo}>Nota Informativa de Devolução</h4>
        <p className={styles.notaTexto}>
          Aceitamos devoluções apenas em caso de produto danificado ou com defeito de fabrico.
        </p>
        <ul className={styles.notaLista}>
          <li>
            Prazo para devolução: até <strong>7 dias</strong> após a compra
          </li>
          <li>
            Obrigatória a apresentação da <strong>fatura original</strong>
          </li>
          <li>
            O produto deve estar em <strong>condições adequadas para verificação</strong>
          </li>
          <li>
            Produtos abertos ou usados <strong>não são elegíveis</strong>, salvo em caso de
            defeito comprovado
          </li>
        </ul>
        <p className={styles.notaTexto}>
          A empresa reserva-se o direito de <strong>verificar o estado do produto</strong>{" "}
          antes da aprovação da devolução.
        </p>
        <p className={styles.notaTexto}>
          Em caso de validação, poderá ser realizada <strong>troca ou reembolso</strong>,
          conforme aplicável.
        </p>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p className={styles.footerMessage}>Obrigado pela preferência!</p>
        <p className={styles.footerSubtext}>
          {empresaInfo.nome} - Sua beleza, nossa missão
          <br />
          Volte sempre!
        </p>
      </div>
    </div>
  );
});

Fatura.displayName = "Fatura";

export default Fatura;
