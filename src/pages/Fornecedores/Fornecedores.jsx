import { useState, useEffect } from "react";
import { Users, UserPlus, Trash2, Phone, MapPin } from "lucide-react";
import { getItem, setItem } from "@services/storage";
import { showAlert } from "@components/Alerts";
import FormAddSupplier from "@components/FormAddSupplier/FormAddSupplier";
import fornecedoresData from "@data/fornecedores.json";

import styles from "./Fornecedores.module.css";

function Fornecedores() {
  const [open, setOpen] = useState(false);
  const [fornecedores, setFornecedores] = useState([]);

  useEffect(() => {
    let stored = getItem("fornecedores");
    if (!stored || stored.length === 0) {
      stored = fornecedoresData;
      setItem("fornecedores", stored);
    }
    setFornecedores(stored);
  }, []);

  function handleNewSupplier(newSupplier) {
    const updated = [...fornecedores, newSupplier];
    setFornecedores(updated);
    setItem("fornecedores", updated);
    setOpen(false);
    showAlert("Fornecedor adicionado com sucesso", "success");
  }

  function handleRemoveSupplier(id) {
    const updated = fornecedores.filter((f) => f.id !== id);
    setFornecedores(updated);
    setItem("fornecedores", updated);
    showAlert("Fornecedor removido com sucesso!", "success");
  }

  function getInitials(name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleArea}>
            <div className={styles.iconWrapper}>
              <Users size={24} />
            </div>
            <div>
              <h1>Fornecedores</h1>
              <p>Gerencie os fornecedores da sua empresa</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <span className={styles.badge}>{fornecedores.length} Fornecedores</span>
            <button
              type="button"
              className={styles.addBtn}
              onClick={() => setOpen(true)}
            >
              <UserPlus size={18} />
              Novo Fornecedor
            </button>
          </div>
        </div>
      </header>

      {/* Suppliers Grid */}
      <section className={styles.suppliersSection}>
        {fornecedores.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={64} />
            <h3>Nenhum fornecedor encontrado</h3>
            <p>Adicione fornecedores para comecar a gerenciar suas parcerias</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {fornecedores.map((fornecedor) => (
              <div key={fornecedor.id} className={styles.supplierCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.avatar}>
                    {getInitials(fornecedor.nome)}
                  </div>
                  <div className={styles.supplierInfo}>
                    <h3>{fornecedor.nome}</h3>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleRemoveSupplier(fornecedor.id)}
                    title="Remover fornecedor"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.infoRow}>
                    <Phone size={16} />
                    <span>{fornecedor.contato}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <MapPin size={16} />
                    <span>{fornecedor.endereco}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {open && (
        <FormAddSupplier
          setOpen={setOpen}
          handleNewSupplier={handleNewSupplier}
        />
      )}
    </div>
  );
}

export default Fornecedores;
