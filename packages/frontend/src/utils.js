/**
 * Build a Request object.
 */

export const buildRequest = (url, method, data) => {
  return new Request(url, {
    method: method,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
