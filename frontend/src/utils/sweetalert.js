export const alerts = {
  info(title, text) {
    // eslint-disable-next-line no-console
    console.info(`[INFO] ${title}:`, text);
  },
  success(title, text) {
    // eslint-disable-next-line no-console
    console.log(`[SUCCESS] ${title}:`, text);
  },
  error(title, text) {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${title}:`, text);
  },
};
