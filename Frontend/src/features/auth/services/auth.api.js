import api from "../../../config/api";

export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', { username, email, password })
        return response.data
    } catch (err) {
        console.error(err)
        throw err
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", { email, password })
        return response.data
    } catch (err) {
        console.error(err)
        throw err
    }
}

export async function logout() {
    try {
        const response = await api.get("/api/auth/logout")
        return response.data
    } catch (err) {
        console.error(err)
        throw err
    }
}

export async function getMe() {
    try {
        // Add a timestamp to bust the cache so we don't fetch stale user data
        const response = await api.get(`/api/auth/get-me?t=${new Date().getTime()}`)
        return response.data
    } catch (err) {
        console.error(err)
        throw err
    }
}