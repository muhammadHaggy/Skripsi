import { SelectColumnFilter } from '../../../components/BaseTable'
import React, { useEffect, useState } from 'react'
import { Loading } from '../../../components/Loading'
import axiosAuthInstance from '../../../utils/axios-auth-instance'
import { BaseTablePagination } from '../../../components/BaseTablePagination'

function ViewAllShipment() {
    const [dataShipment, setDataShipment] = useState([])
    const [showLoading, setShowLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    const [totalPages, setTotalPages] = useState(0)

    const fetchShipment = async (page, limit) => {
        setShowLoading(true)
        try{
            const response = await axiosAuthInstance.get(`/administrator/shipments?skip=${(page - 1) * limit}&limit=${limit}`)            
            const { shipment, total } = response.data.data
            setDataShipment(shipment)
            setTotalPages(Math.ceil(total / limit))
            setShowLoading(false)
        } catch (error) {
            console.error('Error fetching trucks:', error)
            setShowLoading(false)
        }
    }
    useEffect(() => {
        fetchShipment(currentPage, pageSize)   
    }, [currentPage, pageSize])
    
    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page)
        }
    }
    const handlePageSizeChange = (size) => {
        setPageSize(size)
        setCurrentPage(1) 
    }
    
    const columns = React.useMemo(
        () => [
            {
                Header: 'ID Pengiriman',
                accessor: 'shipment_num',
                Filter: SelectColumnFilter,
                filter: 'includes'
            },
            {
                Header: 'Tanggal Pengiriman',
                accessor: 'atd',        
                Filter: SelectColumnFilter,
                filter: 'includes'
            },
            {
            Header: 'Truk',
            accessor: 'truck.plate_number',        
            Filter: SelectColumnFilter,
            filter: 'includes'
            },
            {
            Header: 'Jumlah DO',
            accessor: '_count.ShipmentDO',        
            Filter: SelectColumnFilter,
            filter: 'includes'
            },
            {
            Header: 'Status',
            accessor: 'status',        
            Filter: SelectColumnFilter,
            filter: 'includes'
            },
            {
            Header: 'ETA',
            accessor: 'eta',        
            Filter: SelectColumnFilter,
            filter: 'includes'
            },
        ],
    [])
    
    return (
      <>
          <Loading visibility={showLoading} />
          <div className={`px-[50px] py-[30px] ${showLoading ? 'hidden' : 'visible'}`}>
              <BaseTablePagination
                  columns={columns}
                  data={dataShipment}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  loading={showLoading}
                  judul={'Riwayat Pengiriman'}
                  showVisualisasiButton={true}
              />
          </div>
      </>
  );
}

export default ViewAllShipment
