import { useState } from "react";
import { handleAddProduct } from "@services/productService";
import { showAlert } from "@components/Alerts";
import styles from "./FormAddProduct.module.css";

function FormAddProduct({ onClose, onProductAdded }) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    stock: "",
    minStock: "",
    price: "",
    categoria: "",
    src: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = handleAddProduct(form);
    showAlert(result.message, result.type === "update" ? "info" : "success");

    onProductAdded?.();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label}>Codigo</label>
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Nome do Produto</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Quantidade</label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Stock minimo</label>
          <input
            type="number"
            name="minStock"
            value={form.minStock}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Preco</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Categoria</label>
          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="">Selecione...</option>
            <option value="Perfumes">Perfumes</option>
            <option value="Cremes">Cremes</option>
            <option value="Maquiagem">Maquiagem</option>
            <option value="Cabelos">Cabelos</option>
            <option value="Corpo">Corpo</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        <div className={styles.fullWidth}>
          <div className={styles.field}>
            <label className={styles.label}>Imagem (URL)</label>
            <input
              type="text"
              name="src"
              value={form.src}
              onChange={handleChange}
              className={styles.input}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>
        </div>

        <div className={styles.fullWidth}>
          <div className={styles.field}>
            <label className={styles.label}>Descricao</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={styles.textarea}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onClose} className={styles.cancelButton}>
          Cancelar
        </button>
        <button type="submit" className={styles.submitButton}>
          Salvar Produto
        </button>
      </div>
    </form>
  );
}

export default FormAddProduct;
