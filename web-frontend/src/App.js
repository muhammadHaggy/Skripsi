import './App.css'
import { UserProvider } from './utils/userContext'
import ProtectedRoutes from './ProtectedRoutes'
import { useEffect, useState } from 'react'

function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'))

  useEffect(() => {
    setUserRole(localStorage.getItem('userRole'))
  })

  return (
    <UserProvider>
      <ProtectedRoutes />
    </UserProvider>
  )
}

export default App
