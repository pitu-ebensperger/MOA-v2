import { useMemo } from "react";
import { createCategoryMatcher } from "@/modules/products/utils/productsFilter.js"

export const useCategoryMatcher = (categories = []) => {
  const matcher = useMemo(() => createCategoryMatcher(categories), [categories]);
  return matcher;
};
