const CATEGORY_VALUE_KEYS = ["fk_category_id"];

export const buildProductCategoryPool = (product) => {
  const pool = [];
  for (const key of CATEGORY_VALUE_KEYS) {
    const val = product?.[key];
    if (val !== undefined && val !== null) pool.push(val);
  }
  return pool;
};