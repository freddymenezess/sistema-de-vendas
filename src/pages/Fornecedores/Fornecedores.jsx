import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
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

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <h2>Fornecedores</h2>
          <div className={styles.subtitle}>
            Gerencie os fornecedores da sua empresa
          </div>
        </div>

        <div className={styles.actionsArea}>
          <span className={styles.badgeCount}>
            {fornecedores.length} Fornecedores
          </span>

          <button
            type="button"
            className={styles.btn}
            onClick={() => setOpen(true)}
          >
            <Plus size={18} />
            Novo Fornecedor
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Contato</th>
              <th>Endereco</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {fornecedores.map((fornecedor) => (
              <tr key={fornecedor.id}>
                <td>{fornecedor.nome}</td>
                <td>{fornecedor.contato}</td>
                <td>{fornecedor.endereco}</td>
                <td>
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleRemoveSupplier(fornecedor.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
