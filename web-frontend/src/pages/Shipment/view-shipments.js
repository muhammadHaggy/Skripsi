import React, { useEffect, useState } from 'react';
import { Loading } from '../../components/Loading';
import axiosAuthInstance from '../../utils/axios-auth-instance';
import { BaseTablePagination } from '../../components/BaseTablePagination';
import { ModalSelectPriority } from '../../components/Modal';

function ViewShipments() {
    const [dataShipment, setDataShipment] = useState([]);
    const [showLoading, setShowLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchShipment = async (page, limit) => {
        setShowLoading(true);
        try {
            const response = await axiosAuthInstance.get(`/shipments?skip=${(page - 1) * limit}&limit=${limit}`);
            const { shipment, total } = response.data.data;
            setDataShipment(shipment);
            setTotalPages(Math.ceil(total / limit));
            setShowLoading(false);
        } catch (error) {
            console.error('Error fetching shipments:', error);
            setShowLoading(false);
        }
    };

    useEffect(() => {
        fetchShipment(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const openModalSelectPriority = () => {
        setIsModalOpen(true);
    };

    const columns = React.useMemo(
        () => [
            {
                Header: 'ID Pengiriman',
                accessor: 'shipment_num',
            },
            {
                Header: 'Tanggal Pengiriman',
                accessor: 'atd',
            },
            {
                Header: 'Truk',
                accessor: 'truck.plate_number',
            },
            {
                Header: 'Jumlah DO',
                accessor: '_count.ShipmentDO',
            },
            {
                Header: 'Status',
                accessor: 'status',
            },
            {
                Header: 'ETA',
                accessor: 'eta',
            },
            {
                Header: 'Action',
                accessor: 'action',
            },
        ],
        []
    );

    return (
        <>
            <Loading visibility={showLoading} />
            <div className={`px-[50px] py-[30px] ${showLoading ? 'hidden' : 'visible'}`}>
                <div className="flex flex-wrap space-x-4 mb-4 items-center">
                    <button
                        className="flex items-center px-4 py-2 bg-white text-primary-hover border border-primary-hover rounded-lg shadow-md"
                        onClick={openModalSelectPriority}
                    >
                        <span className="mr-2 text-lg">+</span> Atur Pengiriman
                    </button>
                </div>

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

            <ModalSelectPriority
                isOpen={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
            />
        </>
    );
}

export default ViewShipments;
