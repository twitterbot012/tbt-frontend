import axios from "axios";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = "https://tbt-backend.onrender.com";

const clearTwitterCookies = () => {
    document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.split("=");
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.x.com`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.twitter.com`;
    });
};

// Iniciar sesión con Twitter
export const loginWithTwitter = () => {
    clearTwitterCookies(); // 🔹 Borra las cookies de Twitter antes del login
    setTimeout(() => {
        window.location.href = `${API_URL}/auth/login`; // 🔹 Redirige al backend para hacer login
    }, 500); // 🔹 Da un pequeño delay para asegurar que las cookies se borren
};

export const logout = async () => {
    try {
        await axios.get(`${API_URL}/auth/logout`);
        window.location.href = "https://twitterbot-two.vercel.app/";  // 🔹 Redirige al usuario al inicio
    } catch (error) {
        console.error("❌ Error al cerrar sesión:", error);
    }
};

// Obtener cuentas conectadas
// Obtener cuentas conectadas
export const getAccounts = async () => {
    try {
        console.log("Haciendo petición a:", `o${API_URL}/api/old/accounts`);  // 🔹 Log para depuración
        const response = await axios.get(`${API_URL}/api/old/accounts`);
        return response.data;
    } catch (error) {
        console.error("Error en getAccounts:", error.response?.status, error.response?.data);
        throw error;
    }
};

// Obtener cuentas fuente de una cuenta específica
export const getSourceAccounts = async (userId) => {
    const response = await axios.get(`${API_URL}/sources/${userId}`);
    return response.data;
};

// Agregar una cuenta fuente
export const addSourceAccount = async (userId, username) => {
    await axios.post(`${API_URL}/sources/${userId}`, { username });
};

// Eliminar una cuenta fuente
export const deleteSourceAccount = async (userId, username) => {
    await axios.delete(`${API_URL}/sources/${userId}/${username}`);
};
