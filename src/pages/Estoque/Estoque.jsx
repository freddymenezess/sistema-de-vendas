import { useState, useEffect } from "react";
import { Plus, Package, X } from "lucide-react";
import { getItem, setItem } from "@services/storage";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import styles from "./Estoque.module.css";
import modalStyles from "./Modal.module.css";

const CATEGORIAS = [
  "Perfumes",
  "Cremes",
  "Maquiagem",
  "Cabelos",
  "Corpo",
  "Outros",
];

function Estoque({ readOnly = false }) {
  const [produtos, setProdutos] = useState([]);
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    categoria: "",
    preco: "",
    precoCusto: "",
    quantidade: "",
    code: "",
    descricao: "",
  });

  useEffect(() => {
    loadProdutos();
  }, []);

  useEffect(() => {
    filterProdutos();
  }, [search, categoria, produtos]);

  const loadProdutos = () => {
    const products = getItem("products") || [];
    setProdutos(products);
  };

  const filterProdutos = () => {
    let filtered = [...produtos];

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.code?.includes(search)
      );
    }

    if (categoria) {
      filtered = filtered.filter((p) => p.categoria === categoria);
    }

    setFilteredProdutos(filtered);
  };

  const openModal = (produto = null) => {
    if (produto) {
      setEditingProduto(produto);
      setFormData({
        name: produto.name || "",
        categoria: produto.categoria || "",
        preco: produto.preco?.toString() || "",
        precoCusto: produto.precoCusto?.toString() || "",
        quantidade: produto.quantidade?.toString() || "",
        code: produto.code || "",
        descricao: produto.descricao || "",
      });
    } else {
      setEditingProduto(null);
      setFormData({
        name: "",
        categoria: "",
        preco: "",
        precoCusto: "",
        quantidade: "",
        code: "",
        descricao: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduto(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const produtoData = {
      name: formData.name,
      categoria: formData.categoria,
      preco: parseFloat(formData.preco) || 0,
      precoCusto: parseFloat(formData.precoCusto) || 0,
      quantidade: parseInt(formData.quantidade) || 0,
      code: formData.code,
      descricao: formData.descricao,
      updatedAt: new Date().toISOString(),
    };

    const products = getItem("products") || [];

    if (editingProduto) {
      const updatedProducts = products.map((p) =>
        p.id === editingProduto.id ? { ...p, ...produtoData } : p
      );
      setItem("products", updatedProducts);
    } else {
      produtoData.id = Date.now().toString();
      produtoData.createdAt = new Date().toISOString();
      setItem("products", [...products, produtoData]);
    }

    closeModal();
    loadProdutos();
  };

  const handleDelete = (id) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    const products = getItem("products") || [];
    const updatedProducts = products.filter((p) => p.id !== id);
    setItem("products", updatedProducts);
    loadProdutos();
  };

  const canEdit = !readOnly;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {readOnly ? "Consulta de Estoque" : "Gestao de Estoque"}
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
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {canEdit && (
            <button onClick={() => openModal()} className={styles.addButton}>
              <Plus size={20} />
              Adicionar
            </button>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        {filteredProdutos.map((produto) => (
          <div key={produto.id} className={styles.productCard}>
            <div className={styles.productImage}>
              <Package size={48} />
            </div>
            <div className={styles.productContent}>
              <div className={styles.productCategory}>{produto.categoria}</div>
              <h3 className={styles.productName}>{produto.name}</h3>
              <div className={styles.productMeta}>
                <span className={styles.productPrice}>
                  {handleFormatCoin(produto.preco || 0)}
                </span>
                <span
                  className={`${styles.productStock} ${produto.quantidade < 10 ? styles.stockLow : ""}`}
                >
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
          <div className={styles.emptyState}>Nenhum produto encontrado</div>
        )}
      </div>

      {showModal && (
        <div className={modalStyles.overlay} onClick={closeModal}>
          <div
            className={modalStyles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={modalStyles.header}>
              <h2 className={modalStyles.title}>
                {editingProduto ? "Editar Produto" : "Novo Produto"}
              </h2>
              <button onClick={closeModal} className={modalStyles.closeButton}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={modalStyles.content}>
                <div className={modalStyles.form}>
                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>Nome do Produto</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={modalStyles.input}
                      required
                    />
                  </div>
                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>Categoria</label>
                    <select
                      value={formData.categoria}
                      onChange={(e) =>
                        setFormData({ ...formData, categoria: e.target.value })
                      }
                      className={modalStyles.select}
                      required
                    >
                      <option value="">Selecione...</option>
                      {CATEGORIAS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={modalStyles.fieldRow}>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Preco Venda</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.preco}
                        onChange={(e) =>
                          setFormData({ ...formData, preco: e.target.value })
                        }
                        className={modalStyles.input}
                        required
                      />
                    </div>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Preco Custo</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.precoCusto}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            precoCusto: e.target.value,
                          })
                        }
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quantidade: e.target.value,
                          })
                        }
                        className={modalStyles.input}
                        required
                      />
                    </div>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>
                        Codigo de Barras
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({ ...formData, code: e.target.value })
                        }
                        className={modalStyles.input}
                      />
                    </div>
                  </div>
                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>Descricao</label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) =>
                        setFormData({ ...formData, descricao: e.target.value })
                      }
                      className={modalStyles.textarea}
                    />
                  </div>
                </div>
              </div>
              <div className={modalStyles.footer}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={modalStyles.cancelButton}
                >
                  Cancelar
                </button>
                <button type="submit" className={modalStyles.submitButton}>
                  {editingProduto ? "Salvar" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Estoque;
