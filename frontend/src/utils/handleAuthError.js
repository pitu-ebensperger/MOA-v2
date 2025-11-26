export function handleAuthError(err, onExpired) {
  const status = err?.response?.status;
  const code = err?.response?.data?.code;
  if (status === 401 || code === 'TOKEN_EXPIRED') {
    if (typeof onExpired === 'function') onExpired();
    return true;
  }
  return false;
}
