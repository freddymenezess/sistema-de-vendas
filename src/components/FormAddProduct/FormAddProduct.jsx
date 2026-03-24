import { useState } from "react";
import { TextField, Button } from "@mui/material";
import { handleAddProduct } from "@services/productService";
import { showAlert } from "@components/Alerts"; // <- showAlert global
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

    // 🚀 Usando showAlert global
    showAlert(result.message, result.type === "update" ? "info" : "success");

    onProductAdded?.();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.grid}>
        <TextField
          label="Código"
          name="code"
          required
          fullWidth
          value={form.code}
          onChange={handleChange}
        />

        <TextField
          label="Nome do Produto"
          name="name"
          required
          fullWidth
          value={form.name}
          onChange={handleChange}
        />

        <TextField
          label="Quantidade"
          name="stock"
          type="number"
          required
          fullWidth
          value={form.stock}
          onChange={handleChange}
        />

        <TextField
          label="Stock mínimo"
          name="minStock"
          type="number"
          fullWidth
          value={form.minStock}
          onChange={handleChange}
        />

        <TextField
          label="Preço"
          name="price"
          type="number"
          required
          fullWidth
          value={form.price}
          onChange={handleChange}
        />

        <TextField
          label="Categoria"
          name="categoria"
          fullWidth
          value={form.categoria}
          onChange={handleChange}
        />

        <div className={styles.fullWidth}>
          <TextField
            label="Imagem (URL)"
            name="src"
            fullWidth
            value={form.src}
            onChange={handleChange}
          />
        </div>

        <div className={styles.fullWidth}>
          <TextField
            label="Descrição"
            name="description"
            multiline
            rows={3}
            fullWidth
            value={form.description}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: "var(--main)",
            "&:hover": { backgroundColor: "#c39263" },
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 500,
            padding: "10px 18px",
            boxShadow: "none",
          }}
        >
          Salvar Produto
        </Button>
      </div>
    </form>
  );
}

export default FormAddProduct;
