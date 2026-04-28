import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Package, X, AlertTriangle, Upload, Image } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@services/firebase";
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

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

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
  const [loading, setLoading] = useState(true);
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
      // Se o produto ja tem preco com IVA, calcular o preco base (sem IVA)
      const precoComIva = produto.preco || 0;
      const precoBase = produto.precoBase || (precoComIva / 1.14);
      setFormData({
        name: produto.name || "",
        categoria: produto.categoria || "",
        preco: precoBase.toFixed(2), // Mostrar preco sem IVA no formulario
        precoCusto: produto.precoCusto?.toString() || "",
        stock: produto.stock?.toString() || "",
        minStock: produto.minStock?.toString() || "",
        code: produto.code || "",
        descricao: produto.descricao || "",
        src: produto.src || "",
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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      showWarning("Arquivo inválido", "Por favor, selecione uma imagem.");
      return;
    }

    // Validar tamanho (max 2MB)
    if (file.size > MAX_FILE_SIZE) {
      showWarning("Arquivo muito grande", "A imagem deve ter no máximo 2MB.");
      return;
    }

    setUploading(true);

    try {
      // Criar preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload para Firebase Storage
      const fileName = `produtos/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      setFormData({ ...formData, src: downloadUrl });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      showError(
        "Erro no upload",
        "Não foi possível fazer upload da imagem. Tente novamente.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Preco inserido e o preco base (sem IVA)
    // Preco final = preco base + 14% IVA
    const precoBase = parseFloat(formData.preco) || 0;
    const precoComIva = precoBase * 1.14; // Adiciona 14% de IVA

    const produtoData = {
      name: formData.name,
      categoria: formData.categoria,
      precoBase: precoBase, // Preco sem IVA
      preco: precoComIva, // Preco com IVA (preco de venda)
      price: precoComIva, // Alias para compatibilidade
      precoCusto: parseFloat(formData.precoCusto) || 0,
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
          {readOnly ? "Consulta de Estoque" : "Gestão de Estoque"}
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
                  className={`${styles.productStock} ${(produto.stock || 0) <= (produto.minStock || 0) ? styles.stockLow : ""}`}
                >
                  {produto.stock || 0} un.
                </span>
              </div>
              {produto.minStock > 0 &&
                (produto.stock || 0) <= produto.minStock &&
                (
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
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Preco Base (sem IVA)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.preco}
                        onChange={(e) =>
                          setFormData({ ...formData, preco: e.target.value })
                        }
                        className={modalStyles.input}
                        placeholder="Preco final = base + 14% IVA"
                        required
                      />
                      {formData.preco && (
                        <small className={styles.ivaHint}>
                          Preco de venda: {handleFormatCoin(parseFloat(formData.preco) * 1.14)} (com IVA 14%)
                        </small>
                      )}
                    </div>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Preco de Custo</label>
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
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stock: e.target.value,
                          })
                        }
                        className={modalStyles.input}
                        required
                      />
                    </div>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Stock Minimo</label>
                      <input
                        type="number"
                        value={formData.minStock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minStock: e.target.value,
                          })
                        }
                        className={modalStyles.input}
                        placeholder="Alerta quando atingir"
                      />
                    </div>
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
