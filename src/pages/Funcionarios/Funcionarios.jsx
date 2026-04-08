import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { getItem, setItem } from "@services/storage";
import styles from "./Funcionarios.module.css";
import modalStyles from "./Modal.module.css";

const CARGOS = ["admin", "manager", "seller"];

function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    role: "seller",
    telefone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFuncionarios();
  }, []);

  const loadFuncionarios = () => {
    const users = getItem("users") || [];
    setFuncionarios(users);
  };

  const filteredFuncionarios = funcionarios.filter(
    (f) =>
      f.nome?.toLowerCase().includes(search.toLowerCase()) ||
      f.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (funcionario = null) => {
    if (funcionario) {
      setEditingFuncionario(funcionario);
      setFormData({
        nome: funcionario.nome || "",
        email: funcionario.email || "",
        senha: "",
        role: funcionario.role || "seller",
        telefone: funcionario.telefone || "",
      });
    } else {
      setEditingFuncionario(null);
      setFormData({
        nome: "",
        email: "",
        senha: "",
        role: "seller",
        telefone: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFuncionario(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const users = getItem("users") || [];

      if (editingFuncionario) {
        // Atualizar funcionario existente
        const updatedUsers = users.map((u) =>
          u.id === editingFuncionario.id
            ? {
                ...u,
                nome: formData.nome,
                role: formData.role,
                telefone: formData.telefone,
                updatedAt: new Date().toISOString(),
              }
            : u
        );
        setItem("users", updatedUsers);
      } else {
        // Criar novo funcionario
        if (!formData.senha || formData.senha.length < 6) {
          alert("A senha deve ter pelo menos 6 caracteres");
          setSubmitting(false);
          return;
        }

        // Verificar email existente
        if (users.some((u) => u.email === formData.email)) {
          alert("Este email ja esta em uso");
          setSubmitting(false);
          return;
        }

        const newUser = {
          id: Date.now().toString(),
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          role: formData.role,
          telefone: formData.telefone,
          createdAt: new Date().toISOString(),
          ativo: true,
        };

        setItem("users", [...users, newUser]);
      }

      closeModal();
      loadFuncionarios();
    } catch (error) {
      console.error("Erro ao salvar funcionario:", error);
      alert("Erro ao salvar funcionario");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    if (!confirm("Tem certeza que deseja excluir este funcionario?")) return;

    const users = getItem("users") || [];
    const updatedUsers = users.filter((u) => u.id !== id);
    setItem("users", updatedUsers);
    loadFuncionarios();
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return styles.badgeAdmin;
      case "manager":
        return styles.badgeGerente;
      default:
        return styles.badgeVendedor;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "manager":
        return "Gerente";
      default:
        return "Vendedor";
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return new Intl.DateTimeFormat("pt-BR").format(d);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Funcionarios</h1>
        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Buscar funcionario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <button onClick={() => openModal()} className={styles.addButton}>
            <Plus size={20} />
            Adicionar
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {filteredFuncionarios.map((funcionario) => (
          <div key={funcionario.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.avatar}>
                {getInitials(funcionario.nome)}
              </div>
              <div className={styles.cardInfo}>
                <h3 className={styles.name}>{funcionario.nome}</h3>
                <p className={styles.email}>{funcionario.email}</p>
              </div>
              <span
                className={`${styles.badge} ${getBadgeClass(funcionario.role)}`}
              >
                {getRoleLabel(funcionario.role)}
              </span>
            </div>
            <div className={styles.cardMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Telefone</span>
                <span className={styles.metaValue}>
                  {funcionario.telefone || "-"}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Cadastro</span>
                <span className={styles.metaValue}>
                  {formatDate(funcionario.createdAt)}
                </span>
              </div>
            </div>
            <div className={styles.cardActions}>
              <button
                onClick={() => openModal(funcionario)}
                className={styles.actionButton}
              >
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
          <div className={styles.emptyState}>Nenhum funcionario encontrado</div>
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
                {editingFuncionario ? "Editar Funcionario" : "Novo Funcionario"}
              </h2>
              <button onClick={closeModal} className={modalStyles.closeButton}>
                <X size={20} />
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
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      className={modalStyles.input}
                      required
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
                        onChange={(e) =>
                          setFormData({ ...formData, senha: e.target.value })
                        }
                        className={modalStyles.input}
                        placeholder="Minimo 6 caracteres"
                        required
                      />
                    </div>
                  )}
                  <div className={modalStyles.fieldRow}>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Cargo</label>
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                        className={modalStyles.select}
                        required
                      >
                        <option value="seller">Vendedor</option>
                        <option value="manager">Gerente</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Telefone</label>
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) =>
                          setFormData({ ...formData, telefone: e.target.value })
                        }
                        className={modalStyles.input}
                      />
                    </div>
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
                  disabled={submitting}
                >
                  {submitting
                    ? "Salvando..."
                    : editingFuncionario
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

export default Funcionarios;
