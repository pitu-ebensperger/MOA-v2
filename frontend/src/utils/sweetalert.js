export const alerts = {
  info(title, text) {
    console.info(`[INFO] ${title}:`, text);
  },
  success(title, text) {
    console.log(`[SUCCESS] ${title}:`, text);
  },
  error(title, text) {
    console.error(`[ERROR] ${title}:`, text);
  },
};
