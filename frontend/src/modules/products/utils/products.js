import { toNum } from "@/utils/number.js"

// Precio num o null
export const resolveProductPrice = (product) => {
  const n = toNum(product?.price);
  return n;
};

export { buildProductCategoryPool } from "./productCategory.js";
export {
  matchesText,
  createCategoryMatcher,
  matchesPrice,
  matchesStatus,
} from "./productsFilter.js";
