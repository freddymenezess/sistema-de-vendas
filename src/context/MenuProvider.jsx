import { createContext, useContext, useState, useRef } from "react";

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const navRef = useRef(null);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <MenuContext.Provider
      value={{
        isOpen,
        navRef,
        openMenu,
        closeMenu,
        toggleMenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error("useMenu must be used within MenuProvider");
  }

  return context;
}
