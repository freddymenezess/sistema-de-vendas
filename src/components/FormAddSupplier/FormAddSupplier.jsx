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

    setOpen(false);
  }

  function handleClose() {
    setOpen(false);
  }

  return createPortal(
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Novo Fornecedor</h2>
          <button onClick={handleClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.content}>
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Nome</label>
                <input
                  type="text"
                  placeholder="Nome do fornecedor"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={styles.input}
                  autoFocus
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Contato</label>
                <input
                  type="text"
                  placeholder="Telefone ou email"
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Endereco</label>
                <input
                  type="text"
                  placeholder="Endereco do fornecedor"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={handleClose} className={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default FormAddSupplier;
