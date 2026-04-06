import { useState, useEffect } from "react";
import { getItem, setItem } from "@services/storage";
import { showAlert } from "@components/Alerts";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FormAddSupplier from "@components/FormAddSupplier/FormAddSupplier";
import fornecedoresData from "@data/fornecedores.json";

import styles from "@components/Table/Table.module.css";
import stylesComponent from "./Fornecedores.module.css";

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
    <div className={`${styles.container} ${stylesComponent.page}`}>
      <div className={stylesComponent.head}>
        <div>
          <h2>Fornecedores</h2>
          <div className={stylesComponent.subtitle}>
            Gerencie os fornecedores da sua empresa
          </div>
        </div>

        <div className={stylesComponent.actionsArea}>
          <span className={stylesComponent.badgeCount}>
            {fornecedores.length} Fornecedores
          </span>

          <button
            type="button"
            className={stylesComponent.btn}
            onClick={() => setOpen(true)}
          >
            <AddIcon fontSize="small" />
            Novo Fornecedor
          </button>
        </div>
      </div>

      <div className={stylesComponent.tableWrapper}>
        <table className={stylesComponent.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Contato</th>
              <th>Endereço</th>
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
                    className={stylesComponent.actionBtn}
                    onClick={() => handleRemoveSupplier(fornecedor.id)}
                  >
                    <DeleteOutlineIcon fontSize="small" />
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
