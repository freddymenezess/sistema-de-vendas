import { getItem, setItem } from "@services/storage";

export function handleAddProduct(newProduct) {
  const products = getItem("products") || [];

  const existingIndex = products.findIndex(
    (prod) => prod.code === newProduct.code,
  );

  // 🔄 Produto já existe → atualizar stock
  if (existingIndex !== -1) {
    products[existingIndex].stock += Number(newProduct.stock);

    setItem("products", products);

    return {
      type: "update",
      message: "Stock atualizado com sucesso!",
    };
  }

  // 🆕 Produto novo
  const newId =
    products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

  const productToInsert = {
    ...newProduct,
    id: newId,
    stock: Number(newProduct.stock),
    minStock: Number(newProduct.minStock),
    price: Number(newProduct.price),
    createdAt: new Date().toISOString().split("T")[0],
  };

  setItem("products", [...products, productToInsert]);

  return {
    type: "create",
    message: "Produto adicionado com sucesso!",
  };
}
