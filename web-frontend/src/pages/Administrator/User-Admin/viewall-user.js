import BaseTable, { SelectColumnFilter, StatusPill, ActionButtons } from '../../../components/BaseTable'
import React, { useEffect, useState } from 'react'
import { Loading } from '../../../components/Loading'
import axiosAuthInstance from '../../../utils/axios-auth-instance'
import jwtDecode from 'jwt-decode'

function ViewAllUserAdmin() {
  const [userRole, setUserRole] = useState('')
  const [dataUser, setDataUser] = useState([])
  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
    const tokenFromSession = sessionStorage.getItem('token')
    if (tokenFromSession) {
      const decodedToken = jwtDecode(tokenFromSession)
      setUserRole(decodedToken.role.name)
    }
  }, []) 

  useEffect(() => {
    
    if (userRole && userRole !== 'Super') {
      try {
        throw {
          status: 401,
          message: 'Unauthorized access'
        }
      } catch (error) {
        console.error(`Error: ${error.status} - ${error.message}`)
      }
    }
  }, [userRole])

  useEffect(() => {
    if (dataUser.length === 0 && userRole === 'Super') {
      axiosAuthInstance.get('administrator/users').then((response) => {
        setDataUser(response.data.data)
        setShowLoading(false)
      })
    }
  }, [dataUser, userRole])

  const columns = React.useMemo(
    () => [
      {
        Header: 'Username',
        accessor: 'username',
        Filter: SelectColumnFilter,
        filter: 'includes'
      },
      {
        Header: 'Email',
        accessor: 'email',
        filter: 'includes'
      },
      {
        Header: 'Role',
        accessor: 'role.name',
        Filter: SelectColumnFilter,
        filter: 'includes'
      }
    ],
    []
  )

  return (
    <>
      <Loading visibility={showLoading} />
      <div className={`px-[50px] py-[30px] ${showLoading ? 'hidden' : 'visible'}`}>
        <BaseTable columns={columns} data={dataUser} dataLength={dataUser.length} judul={`User`} disablePagination={true} />
      </div>
    </>
  )
}

export default ViewAllUserAdmin
