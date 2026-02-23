import { createContext, useState, useContext } from "react";
import { getItem, setItem } from "@services/storage.js";
import prodsStorage from "@data/products.json";

setItem("products", prodsStorage);

const SelectedProductContext = createContext();
const products = getItem("products");

export const SelectedProductProvider = ({ children }) => {
  const [selectedId, setSelectedId] = useState(1);
  const [qtd, setQtd] = useState(0);

  function handleInc() {
    setQtd(qtd + 1);
  }

  function handleDec() {
    if (qtd > 0) setQtd(qtd - 1);
  }
  return (
    <SelectedProductContext.Provider
      value={{
        products,
        selectedId,
        setSelectedId,
        qtd,
        setQtd,
        handleInc,
        handleDec,
      }}
    >
      {children}
    </SelectedProductContext.Provider>
  );
};

export const useSelectedProduct = () => useContext(SelectedProductContext);
