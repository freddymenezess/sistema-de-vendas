import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { secondaryAuth, db } from "@services/firebase";
import { Plus, X } from "lucide-react";
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
    cargo: "seller",
    telefone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFuncionarios();
  }, []);

  const loadFuncionarios = async () => {
    try {
      const usuariosRef = collection(db, "usuarios");
      const snapshot = await getDocs(usuariosRef);
      const funcionariosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFuncionarios(funcionariosData);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFuncionarios = funcionarios.filter(
    (f) =>
      f.nome?.toLowerCase().includes(search.toLowerCase()) ||
      f.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const openModal = (funcionario = null) => {
    if (funcionario) {
      setEditingFuncionario(funcionario);
      setFormData({
        nome: funcionario.nome || "",
        email: funcionario.email || "",
        senha: "",
        cargo: funcionario.cargo || "seller",
        telefone: funcionario.telefone || "",
      });
    } else {
      setEditingFuncionario(null);
      setFormData({
        nome: "",
        email: "",
        senha: "",
        cargo: "seller",
        telefone: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFuncionario(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingFuncionario) {
        // Atualizar funcionário existente
        const updateData = {
          nome: formData.nome,
          cargo: formData.cargo,
          telefone: formData.telefone,
          updatedAt: new Date(),
        }
        await updateDoc(doc(db, 'usuarios', editingFuncionario.id), updateData)
      } else {
        // Criar novo funcionário
        if (!formData.senha || formData.senha.length < 6) {
          alert('A senha deve ter pelo menos 6 caracteres')
          setSubmitting(false)
          return
        }

        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth,
          formData.email,
          formData.senha,
        );

        await secondaryAuth.signOut();

        // Criar documento do usuário no Firestore
        await setDoc(doc(db, "usuarios", userCredential.user.uid), {
          uid: userCredential.user.uid,
          nome: formData.nome,
          email: formData.email,
          cargo: formData.cargo,
          telefone: formData.telefone,
          createdAt: new Date(),
          ativo: true,
        });
      }

      closeModal()
      loadFuncionarios()
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        alert('Este email já está em uso')
      } else {
        alert('Erro ao salvar funcionário: ' + error.message)
      }
    } finally {
      setSubmitting(false)
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este funcionário?')) return

    try {
      await deleteDoc(doc(db, 'usuarios', id))
      loadFuncionarios()
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error)
    }
  }

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getBadgeClass = (cargo) => {
    switch (cargo) {
    case "admin":
      return styles.badgeAdmin;
    case "manager":
      return styles.badgeGerente;
    default:
      return styles.badgeVendedor;
    }
  };

  const getRoleLabel = (cargo) => {
    switch (cargo) {
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
    const d = date?.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat("pt-BR").format(d);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Funcionários</h1>
        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Buscar funcionário..."
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
        {loading ? (
          <div className={styles.emptyState}>Carregando funcionários...</div>
        ) : filteredFuncionarios.length === 0 ? (
          <div className={styles.emptyState}>Nenhum funcionário encontrado</div>
        ) : (
          filteredFuncionarios.map((funcionario) => (
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
                  className={`${styles.badge} ${getBadgeClass(funcionario.cargo)}`}
                >
                  {getRoleLabel(funcionario.cargo)}
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
          ))
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
                        value={formData.cargo}
                        onChange={(e) =>
                          setFormData({ ...formData, cargo: e.target.value })
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
