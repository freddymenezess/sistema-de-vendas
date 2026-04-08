import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createPortal } from "react-dom";
import FormAddProduct from "@components/FormAddProduct/FormAddProduct";
import styles from "./AddProductButton.module.css";

function AddProductButton({ onProductAdded }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className={styles.addButton} onClick={() => setOpen(true)}>
        <Plus size={20} />
        Adicionar Produto
      </button>

      {open &&
        createPortal(
          <div className={styles.overlay} onClick={() => setOpen(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.header}>
                <h2 className={styles.title}>Novo Produto</h2>
                <button
                  onClick={() => setOpen(false)}
                  className={styles.closeButton}
                >
                  <X size={20} />
                </button>
              </div>
              <div className={styles.content}>
                <FormAddProduct
                  onClose={() => setOpen(false)}
                  onProductAdded={onProductAdded}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default AddProductButton;
