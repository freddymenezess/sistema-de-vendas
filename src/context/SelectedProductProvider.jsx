import { createContext, useState, useContext, useEffect } from "react";
import { getProducts, initializeDefaultProducts } from "@services/firebaseData.service.js";
import prodsStorage from "@data/products.json";

const SelectedProductContext = createContext();

export const SelectedProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState(1);
  const [loading, setLoading] = useState(true);

  // Inicializa produtos do Firebase na montagem do componente
  useEffect(() => {
    const initProducts = async () => {
      try {
        // Inicializa com produtos padrão se não existirem
        await initializeDefaultProducts(prodsStorage);
        // Carrega produtos do Firebase
        const firebaseProducts = await getProducts();
        if (firebaseProducts.length > 0) {
          setProducts(firebaseProducts);
        } else {
          // Fallback para produtos padrão se Firebase estiver vazio
          setProducts(prodsStorage);
        }
      } catch (error) {
        console.error("[v0] Erro ao carregar produtos:", error);
        setProducts(prodsStorage);
      } finally {
        setLoading(false);
      }
    };

    initProducts();
  }, []);

  function handleInc(id) {
    setProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod.id === id ? { ...prod, quantity: (prod.quantity || 0) + 1 } : prod,
      ),
    );
  }

  function handleDec(id) {
    setProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod.id === id && (prod.quantity || 0) > 0
          ? { ...prod, quantity: prod.quantity - 1 }
          : prod,
      ),
    );
  }

  return (
    <SelectedProductContext.Provider
      value={{
        products,
        setProducts,
        selectedId,
        setSelectedId,
        handleInc,
        handleDec,
        loading,
      }}
    >
      {children}
    </SelectedProductContext.Provider>
  );
};

export const useSelectedProduct = () => useContext(SelectedProductContext);
