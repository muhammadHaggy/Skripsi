import BaseTable, { SelectColumnFilter, StatusPill, ActionButtons } from '../../../components/BaseTable'
import React, { useEffect, useState } from 'react'
import { Loading } from '../../../components/Loading'
import axiosAuthInstance from '../../../utils/axios-auth-instance'

function ViewAllTruksAdmin() {
  const [dataTruk, setDataTruk] = useState([])
  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
    axiosAuthInstance
      .get('/administrator/trucks')
      .then((response) => {
        setDataTruk(response.data.data.trucks)
        setShowLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching trucks:', error)
        setShowLoading(false)
      })
  }, [])

  const columns = React.useMemo(
    () => [
      {
        Header: 'Pelat',
        accessor: 'plate_number',
        Filter: SelectColumnFilter,
        filter: 'includes'
      },
      {
        Header: 'Tipe',
        accessor: 'truck_type.name',
        filter: 'includes',
        Cell: ({ value }) => {
          if (value === 'BLIND_VAN') return <div>Blind Van</div>
          if (value === 'CDE') return <div>CDE</div>
          if (value === 'CDD') return <div>CDD</div>
          return <div>{value}</div>
        }
      },
      {
        Header: 'DC',
        accessor: 'dc.name',
        Filter: SelectColumnFilter,
        filter: 'includes'
      },
      {
        Header: () => <div className="flex justify-center items-center text-center">Status</div>,
        accessor: 'first_status',
        Cell: ({ value }) => (
          <div className="flex justify-center items-center">{StatusPill({ value, type: 'Truk' })}</div>
        )
      },
      {
        Header: 'Action',
        accessor: (row) => ['Truk', row.id],
        Cell: ActionButtons
      }
    ],
    []
  )

  return (
    <>
      <Loading visibility={showLoading} />
      <div className={`px-[50px] py-[30px] ${showLoading ? 'hidden' : 'visible'}`}>
        <BaseTable columns={columns} data={dataTruk} dataLength={dataTruk.length} judul="Truk (Admin)" />
      </div>
    </>
  )
}

export default ViewAllTruksAdmin