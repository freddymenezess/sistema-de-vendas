import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { getItem } from "@services/storage";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import styles from "./Estoque.module.css";

const CATEGORIAS = [
  "Perfumes",
  "Cremes",
  "Maquiagem",
  "Cabelos",
  "Corpo",
  "Outros",
];

function Estoque() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");

  const loadProducts = () => {
    const data = getItem("products") || [];
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
    const handleStorage = () => loadProducts();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.includes(search);
    const matchCategoria = !categoria || p.categoria === categoria;
    return matchSearch && matchCategoria;
  });

  return <h2>Estoque</h2>;
}

export default Estoque;
