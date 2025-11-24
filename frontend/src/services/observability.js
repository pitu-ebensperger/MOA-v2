const isBrowser = typeof window !== 'undefined';
const isProd = import.meta.env?.PROD;

const getSentryClient = () => {
  if (!isBrowser) return null;
  return window.Sentry || window.__SENTRY__ || null;
};

const getLogRocketClient = () => {
  if (!isBrowser) return null;
  return window.LogRocket || null;
};

const normalizeError = (error, fallbackMessage = 'Unexpected error') => {
  if (error instanceof Error) return error;
  if (!error) return new Error(fallbackMessage);
  if (typeof error === 'string') return new Error(error);
  const normalizedMessage = error.message ?? fallbackMessage;
  const normalizedError = new Error(normalizedMessage);
  if (error.stack) normalizedError.stack = error.stack;
  return normalizedError;
};

const withCommonContext = (context = {}) => {
  if (!isBrowser) return context;
  return {
    url: window.location?.href,
    userAgent: window.navigator?.userAgent,
    ...context,
  };
};

const captureException = (error, context) => {
  if (!isProd) return;
  const normalizedError = normalizeError(error);
  const enrichedContext = withCommonContext(context);

  const sentry = getSentryClient();
  if (sentry?.captureException) {
    sentry.captureException(normalizedError, { extra: enrichedContext });
  }

  const logRocket = getLogRocketClient();
  if (logRocket?.captureException) {
    logRocket.captureException(normalizedError, enrichedContext);
  } else if (logRocket?.log) {
    logRocket.log('error', { error: normalizedError, context: enrichedContext });
  }
};

const captureMessage = (message, context) => {
  if (!isProd) return;
  const enrichedContext = withCommonContext(context);
  const sentry = getSentryClient();
  if (sentry?.captureMessage) {
    sentry.captureMessage(message, { level: 'info', extra: enrichedContext });
  }
  const logRocket = getLogRocketClient();
  if (logRocket?.log) {
    logRocket.log('info', { message, ...enrichedContext });
  }
};

const addBreadcrumb = (breadcrumb) => {
  if (!isProd) return;
  const sentry = getSentryClient();
  if (sentry?.addBreadcrumb) {
    sentry.addBreadcrumb(breadcrumb);
  }
};

const identifyUser = (user) => {
  if (!isProd || !user) return;
  const sentry = getSentryClient();
  if (sentry?.setUser) {
    sentry.setUser({
      id: user.id || user.usuario_id || user.email,
      email: user.email,
      username: user.nombre || user.name,
    });
  }

  const logRocket = getLogRocketClient();
  if (logRocket?.identify) {
    logRocket.identify(user.id || user.usuario_id || user.email, {
      name: user.nombre || user.name,
      email: user.email,
      role: user.role_code || user.roleCode || 'CLIENT',
    });
  }
};

const clearUser = () => {
  if (!isProd) return;
  const sentry = getSentryClient();
  if (sentry?.setUser) {
    sentry.setUser(null);
  }
  const logRocket = getLogRocketClient();
  if (logRocket?.identify) {
    logRocket.identify(null);
  }
};

export const observability = {
  captureException,
  captureMessage,
  addBreadcrumb,
  identifyUser,
  clearUser,
};
