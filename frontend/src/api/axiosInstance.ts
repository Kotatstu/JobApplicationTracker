import axios from 'axios'

export const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
})

let isRefreshing = false
let refreshPromise: Promise<void> | null = null

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                if (!isRefreshing) {
                    isRefreshing = true
                    refreshPromise = api.post('/auth/refresh').then(() => {
                        isRefreshing = false
                    })
                }

                await refreshPromise
                return api(originalRequest)
            } catch (refreshError) {
                isRefreshing = false
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)