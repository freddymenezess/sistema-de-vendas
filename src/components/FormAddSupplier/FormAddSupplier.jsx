import { X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import styles from "./FormAddSupplier.module.css";

function FormAddSupplier({ setOpen, handleNewSupplier }) {
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [endereco, setEndereco] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const newSupplier = {
      id: Date.now(),
      nome,
      contato,
      endereco,
    };

    handleNewSupplier(newSupplier);

    // Reset campos
    setNome("");
    setContato("");
    setEndereco("");

    setOpen(false); // fecha modal
  }

  return createPortal(
    <div className={styles.container}>
      <X className={styles.close} onClick={() => setOpen(false)} />

      <form className={styles.form} onSubmit={handleSubmit}>
        <h3>Cadastre um novo fornecedor</h3>

        <div className={styles.inputGroup}>
          <label htmlFor="nome">Nome</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="contato">Contato</label>
          <input
            type="text"
            id="contato"
            value={contato}
            onChange={(e) => setContato(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="endereco">Endereço</label>
          <input
            type="text"
            id="endereco"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={styles.btn}>
          Adicionar Fornecedor
        </button>
      </form>
    </div>,
    document.body,
  );
}

export default FormAddSupplier;
