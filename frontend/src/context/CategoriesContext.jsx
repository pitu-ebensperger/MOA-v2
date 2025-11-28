import { createContext, useContext, useEffect, useState } from "react";
import { productsApi } from "@/services/products.api.js"

// Contexto estricto inline
const CONTEXT_NOT_SET = Symbol("STRICT_CONTEXT_NOT_SET");

const createStrictContext = (
  label = "Context",
  { displayName = `${label}Context`, errorMessage } = {},
) => {
  const Context = createContext(CONTEXT_NOT_SET);
  Context.displayName = displayName;

  const useStrictContext = () => {
    const ctx = useContext(Context);
    if (ctx === CONTEXT_NOT_SET) {
      throw new Error(errorMessage ?? `use${label} debe usarse dentro de ${label}Provider`);
    }
    return ctx;
  };

  return [Context, useStrictContext];
};

// Contexto y Hook
export const [CategoriesContext, useCategoriesContext] = createStrictContext("Categories", {
  displayName: "CategoriesContext",
  errorMessage: "useCategoriesContext debe usarse dentro de CategoriesProvider",
});

// Provider
export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    productsApi.listCategories().then(setCategories).catch(console.error);
  }, []);

  return <CategoriesContext.Provider value={categories}>{children}</CategoriesContext.Provider>;
};
