/**
 * Build a Request object.
 */

export const buildRequest = (url, method, data, token) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return new Request(url, {
    method: method,
    body: data && JSON.stringify(data),
    headers
  });
};
