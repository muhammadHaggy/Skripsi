import axios from 'axios'

const envBackendUrl = process.env.REACT_APP_BACKEND_URL
const apiBaseUrl = envBackendUrl
  ? `${envBackendUrl.replace(/\/$/, '')}/api/v1`
  : `${window.location.protocol}//${window.location.host}/api/v1`

const axiosAuthInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
})

axiosAuthInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

axiosAuthInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const tokenData = { old_token: sessionStorage.getItem('token') }
        const response = await axiosAuthInstance.post('/refresh-token', tokenData)

        if (response.status === 200) {
          const newToken = response.data.data.refresh_token
          sessionStorage.setItem('token', newToken)
          axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }

        return axios(originalRequest)
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError)
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosAuthInstance
