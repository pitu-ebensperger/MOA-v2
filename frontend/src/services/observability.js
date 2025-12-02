// Simple error logging
const captureException = (error, context) => {
  console.error('[Error]', error, context || '');
};

const captureMessage = (message, context) => {
  console.info('[Info]', message, context || '');
};

export const observability = {
  captureException,
  captureMessage,
};
