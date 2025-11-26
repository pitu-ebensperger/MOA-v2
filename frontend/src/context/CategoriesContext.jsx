import { useEffect, useState } from "react";
import { createStrictContext } from "@/context/createStrictContext.js"
import { productsApi } from "@/services/products.api.js"

// ============================================
// CONTEXTO Y HOOK
// ============================================

export const [CategoriesContext, useCategoriesContext] = createStrictContext("Categories", {
  displayName: "CategoriesContext",
  errorMessage: "useCategoriesContext debe usarse dentro de CategoriesProvider",
});

// ============================================
// PROVIDER
// ============================================

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    productsApi.listCategories().then(setCategories).catch(console.error);
  }, []);

  return <CategoriesContext.Provider value={categories}>{children}</CategoriesContext.Provider>;
};
