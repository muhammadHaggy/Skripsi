import BaseTable, { SelectColumnFilter, StatusPill } from '../../../components/BaseTable'
import React, { useEffect, useState } from 'react'
import { Loading } from '../../../components/Loading'
import axiosAuthInstance from '../../../utils/axios-auth-instance'
import jwtDecode from 'jwt-decode'

function ViewAllRoleAdmin() {
  const [dataRole, setDataRole] = useState([])
  const [showLoading, setShowLoading] = useState(true)
  const [userRole, setUserRole] = useState(false)

  useEffect(() => {
    const tokenFromSession = sessionStorage.getItem('token')
    if (tokenFromSession) {
      const decodedToken = jwtDecode(tokenFromSession)
      setUserRole(decodedToken.role.name)

      if (decodedToken.role.name === 'Super' && dataRole.length === 0) {
        axiosAuthInstance.get('administrator/roles').then((response) => {
          setDataRole(response.data.data)
          setShowLoading(false)
        })
      }
    }
  }, [userRole, dataRole.length])

  const columns = React.useMemo(
    () => [
      {
        Header: 'Nama Role',
        accessor: 'name',
        Filter: SelectColumnFilter,
        filter: 'includes'
      },
      {
        Header: 'Pengiriman',
        accessor: 'is_allowed_shipment',
        Cell: (props) => {
          return (
            <>
              <div className="items-start">{StatusPill({ value: props.value, type: 'Role' })}</div>{' '}
            </>
          )
        }
      },
      {
        Header: 'Truk',
        accessor: 'is_allowed_truck',
        Cell: (props) => {
          return (
            <>
              <div className="items-start">{StatusPill({ value: props.value, type: 'Role' })}</div>{' '}
            </>
          )
        }
      },
      {
        Header: 'Lokasi',
        accessor: 'is_allowed_location',
        Cell: (props) => {
          return (
            <>
              <div className="items-start">{StatusPill({ value: props.value, type: 'Role' })}</div>{' '}
            </>
          )
        }
      },
      {
        Header: 'Order',
        accessor: 'is_allowed_order',
        Cell: (props) => {
          return (
            <>
              <div className="items-start">{StatusPill({ value: props.value, type: 'Role' })}</div>{' '}
            </>
          )
        }
      }
    ],
    []
  )

  return (
    <>
      <Loading visibility={showLoading} />
      <div className={`px-[50px] py-[30px] ${showLoading ? 'hidden' : 'visible'}`}>
        <BaseTable columns={columns} data={dataRole} dataLength={dataRole.length} judul={`Role`} disablePagination={true} />
      </div>
    </>
  )
}

export default ViewAllRoleAdmin