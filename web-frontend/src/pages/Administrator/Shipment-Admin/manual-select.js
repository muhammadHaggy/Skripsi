import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { BaseTablePagination, ActionButtonsPagination, BaseTablePaginationShipment } from '../../../components/BaseTablePagination'
import BaseTable, { SelectColumnFilter, StatusPill, ActionButtons } from '../../../components/BaseTable'
import React, { useEffect, useState } from 'react'
import { Loading } from '../../../components/Loading'
import axiosAuthInstance from '../../../utils/axios-auth-instance'
import jwtDecode from 'jwt-decode'

function DoSelectManualAdmin() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTruck, setSelectedTruck] = useState('');
    const [showLoading, setShowLoading] = useState(false);
    const [dataDO, setDataDO] = useState([]);
    const [pageSize, setPageSize] = useState(5);    
    const [dataTruk, setDataTruk] = useState([]);
    const dummyData = [
        {
        
          orderNumber: 'UUA1234567',
          eta: '10-10-2023',
          origin: 'DC Jakarta Selatan',
          destination: 'Transmart Cilandak KKO',
          volume: 5,
          id:1
        },
        {
          orderNumber: 'UUA1234567',
          eta: '10-10-2023',
          origin: 'DC Jakarta Selatan',
          destination: 'Transmart Cilandak KKO',
          volume: 5,
          id:2
        },
        {
          orderNumber: 'UUA1234567',
          eta: '10-10-2023',
          origin: 'DC Jakarta Selatan',
          destination: 'Transmart Cilandak KKO',
          volume: 5,
          id:3
        },
        {
          orderNumber: 'UUA1234567',
          eta: '10-10-2023',
          origin: 'DC Jakarta Selatan',
          destination: 'Transmart Cilandak KKO',
          volume: 5,
          id:4
        },
        {
          orderNumber: 'UUA1234567',
          eta: '10-10-2023',
          origin: 'DC Jakarta Selatan',
          destination: 'Transmart Cilandak KKO',
          volume: 5,
          id:5
        },
      ];
      const truckData = [
        { id: 1, name: 'Truk A - 10 Ton' },
        { id: 2, name: 'Truk B - 15 Ton' },
        { id: 3, name: 'Truk C - 20 Ton' },
        { id: 4, name: 'Truk D - 25 Ton' },
    ];
      useEffect(() => {
        setDataDO(dummyData)
        setDataTruk(truckData)
    }, [])

      const columns = React.useMemo(
        () => [
          {
            Header: 'Checkbox',
            accessor: (row) => [ 'Delivery Order', row.id ], // Make sure this returns the expected structure
            Cell: ({ value }) => <ActionButtonsPagination value={value} /> // Pass value directly to the component
        },
        {
            Header: 'Nomor Order',
            accessor: 'orderNumber',
            Filter: SelectColumnFilter,
            filter: 'includes'
        },
        {
            Header: 'ETA',
            accessor: 'eta',        
            Filter: SelectColumnFilter,
            filter: 'includes'
        },
        {
          Header: 'Asal',
          accessor: 'origin',        
          Filter: SelectColumnFilter,
          filter: 'includes'
        },
        {
          Header: 'Destinasi',
          accessor: 'destination',        
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
          Header: 'Volume',
          accessor: 'volume',        
          Filter: SelectColumnFilter,
          filter: 'includes'
        },
        ],
        []
    )



    return (
    <>
<div className="w-full max-w-4xl mx-auto space-y-5 mt-4">
    {/* Section 1: Atur Tanggal Pengiriman */}
    <div className="w-full bg-white border rounded-lg shadow-md">
        <div className="bg-primary-hover text-white px-4 py-3 rounded-t-lg">
            <h2 className="text-lg font-semibold">Atur Tanggal Pengiriman</h2>
        </div>
        <div className="px-4 py-3">
            <p className="mb-2">Pilih tanggal pengiriman yang akan dilakukan.</p>
            <div className="mt-4">
                <p className="font-bold">Tanggal Pengiriman</p>
                <div className="relative w-full">
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="dd/MM/yyyy"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        className="border rounded-lg p-2 w-full"
                        placeholderText="Pilih tanggal"
                    />
                </div>
            </div>
        </div>
    </div>
    {/* Section 2: Pilih Truk */}
    <div className="w-full bg-white border rounded-lg shadow-md">
        <div className="bg-primary-hover text-white px-4 py-3 rounded-t-lg">
            <h2 className="text-lg font-semibold">Pilih Truk Bertugas</h2>
        </div>
        <div className="px-4 py-3">
            <p className="mb-2">Pilih tanggal pengiriman yang akan dilakukan.</p>
            <div className="mt-4">
                <p className="font-bold">Pilih truk yang ditugaskan untuk melakukan pengiriman</p>
                <div className="relative w-full">
                    <select
                        value={selectedTruck}
                        onChange={(e) => setSelectedTruck(e.target.value)}
                        className="border rounded-lg p-2 " // Mengatur lebar ke 50% dari kontainer
                    >
                        <option value="" disabled>
                            Pilih truk
                        </option>
                        {truckData.map((truck) => (
                            <option key={truck.id} value={truck.id}>
                                {truck.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    </div>


    {/* Section 3: Daftar Delivery Order */}
    <div className="w-full bg-white border rounded-lg shadow-md">
        {/* Header */}
        <div className="bg-primary-hover text-white px-4 py-3 rounded-t-lg">
            <h2 className="text-lg font-semibold">Daftar Delivery Order</h2>
        </div>
        

            
        {/* Content */}
        <div className="px-4 py-1">
        <p className="mb-3 mt-3">Pilih DO yang ingin dimasukkan ke dalam pengirman pada tanggal di atas.</p>

            {/* <Loading visibility={showLoading} /> */}
            <div className={`${showLoading ? 'hidden' : 'visible'}`}>
                <BaseTablePaginationShipment
                    columns={columns}
                    data={dataDO}
                    currentPage={1}
                    totalPages={1}
                    pageSize={pageSize}
                    loading={showLoading}
                    judul={'Daftar Delivery Order'}
                />
            </div>
        </div>
    </div>



</div>



    </>
)
}

export default DoSelectManualAdmin
