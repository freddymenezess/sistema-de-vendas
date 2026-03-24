import { createContext, useState, useContext } from "react";
import { getItem, setItem } from "@services/storage.js";
import prodsStorage from "@data/products.json";

const storedProducts = getItem("products");

if (!storedProducts) {
  setItem("products", prodsStorage);
}

const SelectedProductContext = createContext();

export const SelectedProductProvider = ({ children }) => {
  const [products, setProducts] = useState(getItem("products") || prodsStorage);
  const [selectedId, setSelectedId] = useState(1);

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
      }}
    >
      {children}
    </SelectedProductContext.Provider>
  );
};

export const useSelectedProduct = () => useContext(SelectedProductContext);
