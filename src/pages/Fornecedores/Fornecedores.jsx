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
    <h2>Fornecedores</h2>
  );
}

export default Fornecedores;
