import { useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@services/firebase";
import {
  Plus,
  X,
  Search,
  User,
  CreditCard,
  Star,
  Gift,
  Printer,
} from "lucide-react";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import { showError, showSuccess, showDeleteConfirm } from "@utils/sweetAlert";
import styles from "./Clientes.module.css";
import modalStyles from "./Modal.module.css";

const CLIENTES_COLLECTION = "clientes";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const cardRef = useRef(null);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    nif: "",
    endereco: "",
    dataNascimento: "",
    pontos: 0,
    totalCompras: 0,
    nivelFidelidade: "bronze",
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const clientesRef = collection(db, CLIENTES_COLLECTION);
      const snapshot = await getDocs(clientesRef);
      const clientesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClientes(clientesData);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClientes = clientes.filter(
    (c) =>
      c.nome?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.telefone?.includes(search) ||
      c.nif?.includes(search),
  );

  const openModal = (cliente = null) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nome: cliente.nome || "",
        email: cliente.email || "",
        telefone: cliente.telefone || "",
        nif: cliente.nif || "",
        endereco: cliente.endereco || "",
        dataNascimento: cliente.dataNascimento || "",
        pontos: cliente.pontos || 0,
        totalCompras: cliente.totalCompras || 0,
        nivelFidelidade: cliente.nivelFidelidade || "bronze",
      });
    } else {
      setEditingCliente(null);
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        nif: "",
        endereco: "",
        dataNascimento: "",
        pontos: 0,
        totalCompras: 0,
        nivelFidelidade: "bronze",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCliente(null);
  };

  const openCardModal = (cliente) => {
    setSelectedCliente(cliente);
    setShowCardModal(true);
  };

  const closeCardModal = () => {
    setShowCardModal(false);
    setSelectedCliente(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingCliente) {
        await updateDoc(doc(db, CLIENTES_COLLECTION, editingCliente.id), {
          ...formData,
          updatedAt: new Date(),
        });
      } else {
        const clienteRef = doc(collection(db, CLIENTES_COLLECTION));
        await setDoc(clienteRef, {
          ...formData,
          id: clienteRef.id,
          numeroCartao: generateCardNumber(),
          createdAt: new Date(),
        });
      }

      closeModal();
      loadClientes();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      showError("Erro ao salvar", "Erro ao salvar cliente: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await showDeleteConfirm(
      "Esta ação não pode ser desfeita. O cliente será removido do sistema.",
    );
    if (!result.isConfirmed) return;

    try {
      await deleteDoc(doc(db, CLIENTES_COLLECTION, id));
      loadClientes();
      showSuccess("Sucesso!", "Cliente excluído com êxito.");
    } catch (error) {
      showError("Erro", "Não foi possível excluir o cliente.");
      console.error("Erro ao excluir cliente:", error);
    }
  };

  const generateCardNumber = () => {
    const prefix = "MAMEV";
    const random = Math.floor(Math.random() * 1000000000)
      .toString()
      .padStart(9, "0");
    return `${prefix}${random}`;
  };

  const getNivelBadgeClass = (nivel) => {
    switch (nivel) {
      case "ouro":
        return styles.badgeOuro;
      case "prata":
        return styles.badgePrata;
      default:
        return styles.badgeBronze;
    }
  };

  const getNivelLabel = (nivel) => {
    switch (nivel) {
      case "ouro":
        return "Ouro";
      case "prata":
        return "Prata";
      default:
        return "Bronze";
    }
  };

  const getInitials = (name) => {
    if (!name) return "C";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = date?.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat("pt-BR").format(d);
  };

  const handlePrintCard = () => {
    const printContent = cardRef.current;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Cartão de Fidelização - ${selectedCliente?.nome}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
              margin: 0;
              background: #f0f0f0;
            }
            .card {
              width: 350px;
              height: 200px;
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              border-radius: 16px;
              padding: 24px;
              color: white;
              position: relative;
              box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }
            .card-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 20px;
            }
            .card-logo {
              font-size: 20px;
              font-weight: bold;
              letter-spacing: 2px;
            }
            .card-badge {
              padding: 4px 12px;
              background: rgba(255,255,255,0.2);
              border-radius: 20px;
              font-size: 12px;
              text-transform: uppercase;
            }
            .card-number {
              font-size: 18px;
              letter-spacing: 3px;
              margin-bottom: 20px;
            }
            .card-info {
              display: flex;
              justify-content: space-between;
            }
            .card-name {
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .card-points {
              text-align: right;
            }
            .card-points-value {
              font-size: 24px;
              font-weight: bold;
            }
            .card-points-label {
              font-size: 10px;
              opacity: 0.8;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="card-header">
              <div class="card-logo">MAMEV</div>
              <div class="card-badge">${getNivelLabel(selectedCliente?.nivelFidelidade)}</div>
            </div>
            <div class="card-number">${selectedCliente?.numeroCartao || "MAMEV000000000"}</div>
            <div class="card-info">
              <div class="card-name">${selectedCliente?.nome}</div>
              <div class="card-points">
                <div class="card-points-value">${selectedCliente?.pontos || 0}</div>
                <div class="card-points-label">PONTOS</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Clientes</h1>
          <p className={styles.subtitle}>
            Gerencie seus clientes e programa de fidelização
          </p>
        </div>
        <div className={styles.actions}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button onClick={() => openModal()} className={styles.addButton}>
            <Plus size={20} />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <User size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total de Clientes</span>
            <strong className={styles.statValue}>{clientes.length}</strong>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconGold}`}>
            <Star size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Clientes Ouro</span>
            <strong className={styles.statValue}>
              {clientes.filter((c) => c.nivelFidelidade === "ouro").length}
            </strong>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSilver}`}>
            <CreditCard size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Cartões Ativos</span>
            <strong className={styles.statValue}>
              {clientes.filter((c) => c.numeroCartao).length}
            </strong>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconGift}`}>
            <Gift size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total de Pontos</span>
            <strong className={styles.statValue}>
              {clientes.reduce((acc, c) => acc + (c.pontos || 0), 0)}
            </strong>
          </div>
        </div>
      </div>

      {/* Clientes Grid */}
      <div className={styles.grid}>
        {loading ? (
          <div className={styles.emptyState}>Carregando clientes...</div>
        ) : filteredClientes.length === 0 ? (
          <div className={styles.emptyState}>
            <User size={48} className={styles.emptyIcon} />
            <p>Nenhum cliente encontrado</p>
          </div>
        ) : (
          filteredClientes.map((cliente) => (
            <div key={cliente.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>{getInitials(cliente.nome)}</div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.name}>{cliente.nome}</h3>
                  <p className={styles.email}>{cliente.email || "-"}</p>
                </div>
                <span
                  className={`${styles.badge} ${getNivelBadgeClass(cliente.nivelFidelidade)}`}
                >
                  {getNivelLabel(cliente.nivelFidelidade)}
                </span>
              </div>

              <div className={styles.cardMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Telefone</span>
                  <span className={styles.metaValue}>
                    {cliente.telefone || "-"}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Pontos</span>
                  <span className={styles.metaValue}>
                    {cliente.pontos || 0}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Total Compras</span>
                  <span className={styles.metaValue}>
                    {handleFormatCoin(cliente.totalCompras || 0)}
                  </span>
                </div>
              </div>

              {cliente.numeroCartao && (
                <div className={styles.cardNumber}>
                  <CreditCard size={14} />
                  <span>{cliente.numeroCartao}</span>
                </div>
              )}

              <div className={styles.cardActions}>
                <button
                  onClick={() => openCardModal(cliente)}
                  className={styles.actionButton}
                >
                  <CreditCard size={14} />
                  Cartão
                </button>
                <button
                  onClick={() => openModal(cliente)}
                  className={styles.actionButton}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(cliente.id)}
                  className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Novo/Editar Cliente */}
      {showModal && (
        <div className={modalStyles.overlay} onClick={closeModal}>
          <div
            className={modalStyles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={modalStyles.header}>
              <h2 className={modalStyles.title}>
                {editingCliente ? "Editar Cliente" : "Novo Cliente"}
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

                  <div className={modalStyles.fieldRow}>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className={modalStyles.input}
                      />
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
                        placeholder="(+244) 912 345 678"
                      />
                    </div>
                  </div>

                  <div className={modalStyles.fieldRow}>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>NIF</label>
                      <input
                        type="text"
                        value={formData.nif}
                        onChange={(e) =>
                          setFormData({ ...formData, nif: e.target.value })
                        }
                        className={modalStyles.input}
                      />
                    </div>
                    <div className={modalStyles.field}>
                      <label className={modalStyles.label}>
                        Data de Nascimento
                      </label>
                      <input
                        type="date"
                        value={formData.dataNascimento}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dataNascimento: e.target.value,
                          })
                        }
                        className={modalStyles.input}
                      />
                    </div>
                  </div>

                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>Endereço</label>
                    <input
                      type="text"
                      value={formData.endereco}
                      onChange={(e) =>
                        setFormData({ ...formData, endereco: e.target.value })
                      }
                      className={modalStyles.input}
                      placeholder="Endereço completo"
                    />
                  </div>

                  {editingCliente && (
                    <>
                      <div className={modalStyles.fieldRow}>
                        <div className={modalStyles.field}>
                          <label className={modalStyles.label}>Pontos</label>
                          <input
                            type="number"
                            value={formData.pontos}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pontos: parseInt(e.target.value) || 0,
                              })
                            }
                            className={modalStyles.input}
                          />
                        </div>
                        <div className={modalStyles.field}>
                          <label className={modalStyles.label}>
                            Nível de Fidelidade
                          </label>
                          <select
                            value={formData.nivelFidelidade}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                nivelFidelidade: e.target.value,
                              })
                            }
                            className={modalStyles.select}
                          >
                            <option value="bronze">Bronze</option>
                            <option value="prata">Prata</option>
                            <option value="ouro">Ouro</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
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
                    : editingCliente
                      ? "Salvar"
                      : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cartão de Fidelização */}
      {showCardModal && selectedCliente && (
        <div className={modalStyles.overlay} onClick={closeCardModal}>
          <div
            className={`${modalStyles.modal} ${modalStyles.modalMedium}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={modalStyles.header}>
              <h2 className={modalStyles.title}>Cartão de Fidelização</h2>
              <button
                onClick={closeCardModal}
                className={modalStyles.closeButton}
              >
                <X size={20} />
              </button>
            </div>
            <div className={modalStyles.content}>
              <div ref={cardRef} className={styles.fidelityCard}>
                <div className={styles.fidelityCardHeader}>
                  <span className={styles.fidelityCardLogo}>MAMEV</span>
                  <span
                    className={`${styles.fidelityCardBadge} ${getNivelBadgeClass(selectedCliente.nivelFidelidade)}`}
                  >
                    {getNivelLabel(selectedCliente.nivelFidelidade)}
                  </span>
                </div>
                <div className={styles.fidelityCardNumber}>
                  {selectedCliente.numeroCartao || "MAMEV000000000"}
                </div>
                <div className={styles.fidelityCardInfo}>
                  <div className={styles.fidelityCardName}>
                    {selectedCliente.nome}
                  </div>
                  <div className={styles.fidelityCardPoints}>
                    <span className={styles.fidelityCardPointsValue}>
                      {selectedCliente.pontos || 0}
                    </span>
                    <span className={styles.fidelityCardPointsLabel}>
                      PONTOS
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.cardRules}>
                <h4>Regras do Programa de Fidelização</h4>
                <ul>
                  <li>A cada 1.000 Kz em compras, ganhe 10 pontos</li>
                  <li>Bronze (0-499 pontos): Descontos de 2%</li>
                  <li>Prata (500-999 pontos): Descontos de 5%</li>
                  <li>Ouro (1000+ pontos): Descontos de 10%</li>
                  <li>Pontos são válidos por 12 meses</li>
                </ul>
              </div>
            </div>
            <div className={modalStyles.footer}>
              <button
                type="button"
                onClick={closeCardModal}
                className={modalStyles.cancelButton}
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handlePrintCard}
                className={modalStyles.submitButton}
              >
                <Printer size={18} />
                Imprimir Cartão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clientes;
