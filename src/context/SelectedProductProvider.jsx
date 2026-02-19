import { createContext, useState, useContext } from "react";
import { getItem, setItem } from "@services/storage.js";
import prodsStorage from "@data/products.json";

setItem("products", prodsStorage)

const SelectedProductContext = createContext();
const products = getItem("products");

export const SelectedProductProvider = ({ children }) => {
  const [selectedId, setSelectedId] = useState(1);
  return (
    <SelectedProductContext.Provider value={{ products, selectedId, setSelectedId }}>
      {children}
    </SelectedProductContext.Provider>
  );
};

export const useSelectedProduct = () => useContext(SelectedProductContext);
