// src/utils.js

export const decodeToken = (token) => {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decodedToken = JSON.parse(jsonPayload);
    console.log(decodedToken.role)
    console.log(jsonPayload)
    return {
      ...decodedToken,
      role: decodedToken.role || 'usuario' // Valor predeterminado 'usuario' si no hay rol
    };
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
};
