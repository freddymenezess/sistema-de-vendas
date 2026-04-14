import { useState, useEffect } from "react";
import { Plus, Search, Phone, MapPin, Edit2, Trash2, X, Building2 } from "lucide-react";
import {
  getFornecedores,
  initializeFornecedores,
  addFornecedor,
  updateFornecedor,
  deleteFornecedor,
} from "@services/firebaseData.service.js";
import { showAlert } from "@components/Alerts";
import fornecedoresData from "@data/fornecedores.json";
import styles from "./Fornecedores.module.css";
import modalStyles from "./Modal.module.css";

function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nome: "",
    contato: "",
    endereco: "",
    email: "",
    observacoes: "",
  });

  useEffect(() => {
    loadFornecedores();
  }, []);

  const loadFornecedores = async () => {
    try {
      await initializeFornecedores(fornecedoresData);
      const data = await getFornecedores();
      setFornecedores(data);
    } catch (error) {
      console.error("[v0] Erro ao carregar fornecedores:", error);
      showAlert("Erro ao carregar fornecedores", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredFornecedores = fornecedores.filter(
    (f) =>
      f.nome?.toLowerCase().includes(search.toLowerCase()) ||
      f.contato?.toLowerCase().includes(search.toLowerCase()) ||
      f.endereco?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (fornecedor = null) => {
    if (fornecedor) {
      setEditingFornecedor(fornecedor);
      setFormData({
        nome: fornecedor.nome || "",
        contato: fornecedor.contato || "",
        endereco: fornecedor.endereco || "",
        email: fornecedor.email || "",
        observacoes: fornecedor.observacoes || "",
      });
    } else {
      setEditingFornecedor(null);
      setFormData({
        nome: "",
        contato: "",
        endereco: "",
        email: "",
        observacoes: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFornecedor(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingFornecedor) {
        await updateFornecedor(editingFornecedor.id, {
          ...formData,
          updatedAt: new Date().toISOString(),
        });
        const updated = fornecedores.map((f) =>
          f.id === editingFornecedor.id
            ? { ...f, ...formData, updatedAt: new Date().toISOString() }
            : f
        );
        setFornecedores(updated);
        showAlert("Fornecedor atualizado com sucesso!", "success");
      } else {
        const newId = await addFornecedor({
          ...formData,
          createdAt: new Date().toISOString(),
        });
        const newFornecedor = {
          id: newId,
          ...formData,
          createdAt: new Date().toISOString(),
        };
        setFornecedores([...fornecedores, newFornecedor]);
        showAlert("Fornecedor adicionado com sucesso!", "success");
      }
      closeModal();
    } catch (error) {
      console.error("[v0] Erro ao salvar fornecedor:", error);
      showAlert("Erro ao salvar fornecedor", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este fornecedor?"))
      return;

    try {
      await deleteFornecedor(id);
      const updated = fornecedores.filter((f) => f.id !== id);
      setFornecedores(updated);
      showAlert("Fornecedor removido com sucesso!", "success");
    } catch (error) {
      console.error("[v0] Erro ao deletar fornecedor:", error);
      showAlert("Erro ao deletar fornecedor", "error");
    }
  };

  const getInitials = (name) => {
    if (!name) return "F";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Fornecedores</h1>
        <div className={styles.actions}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar fornecedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button onClick={() => openModal()} className={styles.addButton}>
            <Plus size={20} />
            Adicionar
          </button>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Building2 size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{fornecedores.length}</span>
            <span className={styles.statLabel}>Total de Fornecedores</span>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {loading ? (
          <p>Carregando fornecedores...</p>
        ) : filteredFornecedores.length > 0 ? (
          filteredFornecedores.map((fornecedor) => (
            <div key={fornecedor.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>{getInitials(fornecedor.nome)}</div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.name}>{fornecedor.nome}</h3>
                  {fornecedor.email && (
                    <p className={styles.email}>{fornecedor.email}</p>
                  )}
                </div>
              </div>
              <div className={styles.cardMeta}>
                {fornecedor.contato && (
                  <div className={styles.metaItem}>
                    <Phone size={14} className={styles.metaIcon} />
                    <span className={styles.metaValue}>{fornecedor.contato}</span>
                  </div>
                )}
                {fornecedor.endereco && (
                  <div className={styles.metaItem}>
                    <MapPin size={14} className={styles.metaIcon} />
                    <span className={styles.metaValue}>{fornecedor.endereco}</span>
                  </div>
                )}
              </div>
              {fornecedor.observacoes && (
                <p className={styles.observacoes}>{fornecedor.observacoes}</p>
              )}
              <div className={styles.cardActions}>
                <button
                  onClick={() => openModal(fornecedor)}
                  className={styles.actionButton}
                >
                  <Edit2 size={14} />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(fornecedor.id)}
                  className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.empty}>
            <Building2 size={48} />
            <p>Nenhum fornecedor encontrado</p>
          </div>
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
                {editingFornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
              </h2>
              <button onClick={closeModal} className={modalStyles.closeButton}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={modalStyles.content}>
                <div className={modalStyles.form}>
                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>Nome</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      className={modalStyles.input}
                      placeholder="Nome do fornecedor"
                      required
                    />
                  </div>
                  <div className={modalStyles.fieldRow}>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Contato</label>
                      <input
                        type="text"
                        value={formData.contato}
                        onChange={(e) =>
                          setFormData({ ...formData, contato: e.target.value })
                        }
                        className={modalStyles.input}
                        placeholder="Telefone"
                      />
                    </div>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className={modalStyles.input}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>Endereco</label>
                    <input
                      type="text"
                      value={formData.endereco}
                      onChange={(e) =>
                        setFormData({ ...formData, endereco: e.target.value })
                      }
                      className={modalStyles.input}
                      placeholder="Endereco completo"
                    />
                  </div>
                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>Observacoes</label>
                    <textarea
                      value={formData.observacoes}
                      onChange={(e) =>
                        setFormData({ ...formData, observacoes: e.target.value })
                      }
                      className={modalStyles.textarea}
                      placeholder="Observacoes adicionais..."
                      rows={3}
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
                  {editingFornecedor ? "Salvar" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Fornecedores;
