import { createStrictContext } from "@/context/createStrictContext.js"

export const [CategoriesContext, useCategoriesContext] = createStrictContext("Categories", {
  displayName: "CategoriesContext",
  errorMessage: "useCategoriesContext debe usarse dentro de CategoriesProvider",
});
