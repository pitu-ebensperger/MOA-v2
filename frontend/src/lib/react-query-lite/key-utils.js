const isPlainObject = (value) =>
  Object.prototype.toString.call(value) === "[object Object]";

const normalizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }
  if (isPlainObject(value)) {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalizeValue(value[key]);
        return acc;
      }, {});
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "function") {
    return value.toString();
  }
  if (typeof value === "undefined") {
    return "__undefined__";
  }
  if (Number.isNaN(value)) {
    return "__nan__";
  }
  return value;
};

export const stableStringify = (value) =>
  JSON.stringify(normalizeValue(value ?? "__null__"));

export const toArrayKey = (key) => {
  if (Array.isArray(key)) return key;
  if (key === undefined) return ["__default__"];
  return [key];
};

export const hashQueryKey = (queryKey) => stableStringify(toArrayKey(queryKey));

export const deepEqual = (a, b) => stableStringify(a) === stableStringify(b);

export const queryKeyMatches = (targetKey, partialKey, exact = false) => {
  if (!partialKey) return true;
  const target = toArrayKey(targetKey);
  const partial = toArrayKey(partialKey);
  if (partial.length > target.length) return false;
  for (let i = 0; i < partial.length; i += 1) {
    if (!deepEqual(target[i], partial[i])) {
      return false;
    }
  }
  return exact ? target.length === partial.length : true;
};
