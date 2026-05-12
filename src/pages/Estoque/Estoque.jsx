import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Package, X, AlertTriangle, Upload, Image } from "lucide-react";
import { uploadImagem } from "@services/supabase";
import { getProducts, updateProducts } from "@services/firebaseData.service.js";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import {
  showError,
  showWarning,
  showDeleteConfirm,
  showSuccess,
} from "@utils/sweetAlert";
import styles from "./Estoque.module.css";
import modalStyles from "./Modal.module.css";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const CATEGORIAS = [
  "Perfumes",
  "Cremes",
  "Maquiagem",
  "Cabelos",
  "Corpo",
  "Outros",
];

const calcularPrecoVenda = (precoCusto, addIva) => {
  const custo = parseFloat(precoCusto) || 0;
  return addIva ? Math.ceil(custo * 1.14) - 0.01 : custo;
};

function Stock({ readOnly = false }) {
  const [produtos, setProdutos] = useState([]);
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    categoria: "",
    preco: "",
    precoCusto: "",
    stock: "",
    minStock: "",
    code: "",
    descricao: "",
    src: "",
    addIva: true,
  });
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProdutos();
  }, []);

  const loadProdutos = async () => {
    try {
      const products = await getProducts();
      setProdutos(products);
    } catch (error) {
      console.error("[v0] Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProdutos = useCallback(() => {
    let filtered = [...produtos];

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.code?.includes(search),
      );
    }

    if (categoria) {
      filtered = filtered.filter((p) => p.categoria === categoria);
    }

    setFilteredProdutos(filtered);
  }, [search, categoria, produtos]);

  useEffect(() => {
    filterProdutos();
  }, [filterProdutos]);

  const openModal = (produto = null) => {
    if (produto) {
      setEditingProduto(produto);

      const hadIva =
        produto.precoCusto > 0 &&
        Math.abs(produto.preco - produto.precoCusto * 1.14) < 0.01;
      const addIva = hadIva;

      setFormData({
        name: produto.name || "",
        categoria: produto.categoria || "",
        preco: produto.preco?.toFixed(2) || "",
        precoCusto: produto.precoCusto?.toString() || "",
        stock: produto.stock?.toString() || "",
        minStock: produto.minStock?.toString() || "",
        code: produto.code || "",
        descricao: produto.descricao || "",
        src: produto.src || "",
        addIva,
      });
      setPreviewUrl(produto.src || "");
    } else {
      setEditingProduto(null);
      setFormData({
        name: "",
        categoria: "",
        preco: "",
        precoCusto: "",
        stock: "",
        minStock: "",
        code: "",
        descricao: "",
        src: "",
        addIva: true,
      });
      setPreviewUrl("");
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduto(null);
    setPreviewUrl("");
  };

  // Atualiza precoCusto e recalcula o preço de venda automaticamente
  const handlePrecoCustoChange = (value) => {
    const precoVenda = calcularPrecoVenda(value, formData.addIva);
    setFormData({
      ...formData,
      precoCusto: value,
      preco: precoVenda > 0 ? precoVenda.toFixed(2) : "",
    });
  };

  // Atualiza o checkbox de IVA e recalcula o preço de venda
  const handleAddIvaChange = (checked) => {
    const precoVenda = calcularPrecoVenda(formData.precoCusto, checked);
    setFormData({
      ...formData,
      addIva: checked,
      preco: precoVenda > 0 ? precoVenda.toFixed(2) : "",
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showWarning("Arquivo inválido", "Por favor, selecione uma imagem.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showWarning("Arquivo muito grande", "A imagem deve ter no máximo 2MB.");
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);

      const url = await uploadImagem(file, "produtos");

      // functional update — evita stale closure
      setFormData((prev) => ({ ...prev, src: url }));
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      showError("Erro no upload", "Não foi possível fazer upload da imagem.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const precoCusto = parseFloat(formData.precoCusto) || 0;
    const precoVenda = calcularPrecoVenda(precoCusto, formData.addIva);

    console.log("src antes de guardar:", formData.src);

    const produtoData = {
      name: formData.name,
      categoria: formData.categoria,
      precoBase: precoCusto, 
      preco: precoVenda, 
      price: precoVenda, 
      precoCusto: precoCusto,
      addIva: formData.addIva,
      stock: parseInt(formData.stock) || 0,
      minStock: parseInt(formData.minStock) || 0,
      code: formData.code,
      descricao: formData.descricao,
      src: formData.src || editingProduto?.src || "",
    };

    try {
      if (editingProduto) {
        const updated = produtos.map((p) =>
          p.id === editingProduto.id
            ? { ...p, ...produtoData, updatedAt: new Date().toISOString() }
            : p,
        );
        await updateProducts(updated);
        setProdutos(updated);
      } else {
        const newProduto = {
          ...produtoData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        };
        const updated = [...produtos, newProduto];
        await updateProducts(updated);
        setProdutos(updated);
      }
      closeModal();
    } catch (error) {
      console.error("[v0] Erro ao salvar produto:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await showDeleteConfirm(
      "Esta ação não pode ser desfeita. O produto será removido do catálogo.",
    );
    if (!result.isConfirmed) return;

    try {
      const updated = produtos.filter((p) => p.id !== id);
      await updateProducts(updated);
      setProdutos(updated);
      showSuccess("Sucesso!", "Produto excluído com êxito.");
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      showError("Erro", "Não foi possível excluir o produto.");
    }
  };

  const canEdit = !readOnly;

  return loading ? (
    <div className={styles.empty}>Carregando produtos...</div>
  ) : (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {readOnly ? "Consulta de Stock" : "Gestão de Stock"}
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
              {produto.src ? (
                <img
                  src={produto.src}
                  alt={produto.name}
                  className={styles.productImg}
                />
              ) : (
                <Package size={48} />
              )}
            </div>
            <div className={styles.productContent}>
              <div className={styles.productCategory}>{produto.categoria}</div>
              <h3 className={styles.productName}>{produto.name}</h3>
              <div className={styles.productMeta}>
                <span className={styles.productPrice}>
                  {handleFormatCoin(produto.preco || 0)}
                </span>
                <span
                  className={`${styles.productStock} ${(produto.stock || 0) <= (produto.minStock || 0) ? styles.stockLow : ""}`}
                >
                  {produto.stock || 0} un.
                </span>
              </div>
              {produto.minStock > 0 &&
                (produto.stock || 0) <= produto.minStock && (
                  <div className={styles.stockAlert}>
                    <AlertTriangle size={14} />
                    <span>Stock baixo (min: {produto.minStock})</span>
                  </div>
                )}
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
                  {/* Imagem do Produto */}
                  <div className={styles.imageUploadSection}>
                    <div
                      className={styles.imageUploadWrapper}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className={styles.imagePreview}
                        />
                      ) : (
                        <div className={styles.imagePlaceholder}>
                          <Image size={32} />
                          <span>Adicionar Imagem</span>
                        </div>
                      )}
                      <div className={styles.imageOverlay}>
                        <Upload size={20} />
                        <span>{uploading ? "Enviando..." : "Alterar"}</span>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className={styles.fileInput}
                    />
                    <p className={styles.imageHint}>Max. 2MB (JPG, PNG)</p>
                  </div>

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
                    {/* Preço de Custo — o gestor insere este valor */}
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Preço</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.precoCusto}
                        onChange={(e) => handlePrecoCustoChange(e.target.value)}
                        className={modalStyles.input}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    {/* Preço de Venda — calculado automaticamente, read-only */}
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>
                        Preço de Venda
                      </label>
                      <input
                        type="number"
                        value={formData.preco}
                        readOnly
                        className={`${modalStyles.input} ${styles.inputReadOnly}`}
                        placeholder="Calculado automaticamente"
                        tabIndex={-1}
                      />
                    </div>
                  </div>

                  {/* Checkbox Adicionar IVA */}
                  <div className={styles.ivaCheckboxWrapper}>
                    <label className={styles.ivaCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.addIva}
                        onChange={(e) => handleAddIvaChange(e.target.checked)}
                        className={styles.ivaCheckbox}
                      />
                      <span className={styles.ivaCheckboxText}>
                        Adicionar IVA (14%)
                      </span>
                    </label>
                  </div>

                  <div className={modalStyles.fieldRow}>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Quantidade</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({ ...formData, stock: e.target.value })
                        }
                        className={modalStyles.input}
                        required
                      />
                    </div>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Stock Mínimo</label>
                      <input
                        type="number"
                        value={formData.minStock}
                        onChange={(e) =>
                          setFormData({ ...formData, minStock: e.target.value })
                        }
                        className={modalStyles.input}
                        placeholder="Alerta quando atingir"
                      />
                    </div>
                  </div>

                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>
                      Código de Barras
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

                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>Descrição</label>
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
                <button
                  type="submit"
                  className={modalStyles.submitButton}
                  disabled={submitting || uploading} // ← adiciona || uploading
                >
                  {uploading
                    ? "A enviar imagem..."
                    : submitting
                      ? editingProduto
                        ? "A guardar..."
                        : "A adicionar..."
                      : editingProduto
                        ? "Salvar"
                        : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stock;
