import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Loading } from '../../../components/Loading';
import axiosAuthInstance from '../../../utils/axios-auth-instance';
import { BaseTablePagination } from '../../../components/BaseTablePagination';
import { SelectColumnFilter } from '../../../components/BaseTable';

function DODetailPageAdmin() {
  const { doId } = useParams();
  const location = useLocation();
  const [dos, setDos] = useState(location.state?.dos || null);
  const [loading, setLoading] = useState(!location.state?.dos);
  const [error, setError] = useState(null);

  const [dataProductLine, setDataProductLine] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProductLine = async (page, limit) => {
    setLoading(true);
    try {
      const response = await axiosAuthInstance.get(`/product-lines?skip=${(page - 1) * limit}&limit=${limit}&delivery_order_id=${doId}`);
      const { productLine, total } = response.data.data;
      setDataProductLine(productLine);
      setTotalPages(Math.ceil(total / limit));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const fetchDoDetail = async () => {
    setLoading(true);
    try {
      const response = await axiosAuthInstance.get(`/delivery-order/${doId}`);
      setDos(response.data.data);
    } catch (error) {
      setError('Failed to load do details.');
      console.error('Error fetching delivery order details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoDetail();
  }, [doId]);

  useEffect(() => {
    fetchProductLine(currentPage, pageSize);
  }, [currentPage, pageSize, doId]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'No',
        accessor: 'id',
        Filter: SelectColumnFilter,
        filter: 'includes'
      },
      {
        Header: 'Product',
        accessor: 'product.name',
        Filter: SelectColumnFilter,
        filter: 'includes'
      },
      {
        Header: 'Volume',
        accessor: 'volume',
        Filter: SelectColumnFilter,
        filter: 'includes',
        uom: 'unit_volume'
      },
      {
        Header: 'Total Price',
        accessor: 'price',
        Filter: SelectColumnFilter,
        filter: 'includes',
        uom: 'unit_price'
      },
      {
        Header: 'Quantity',
        accessor: 'quantity',
        Filter: SelectColumnFilter,
        filter: 'includes',
        uom: 'unit_quantity'
      }
    ],
    []
  );

  if (loading) return <Loading visibility={true} />;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex justify-center items-center px-10 py-10">
      <div className="mx-auto bg-white rounded-lg shadow-md my-8 pt-10 px-10">
        <h1 className="text-2xl font-bold mb-6">Informasi Delivery Order</h1>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Dokumen SO</label>
            <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-50">{dos.so_origin || 'N/A'}</div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Nomor DO</label>
            <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-50">{dos.delivery_order_num || 'N/A'}</div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Status Delivery Order</label>
          <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-green-500 font-bold">{dos.status || 'N/A'}</div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">ETA Target</label>
          <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-50">
            {dos.eta_target
              ? `${new Date(dos.eta_target).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}, ${new Date(dos.eta_target).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })} WIB`
              : 'N/A'}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Asal</label>
          <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-50">{dos.loc_ori.dc.name || 'N/A'}</div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Alamat Asal</label>
          <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-50">{dos.loc_ori.address || 'N/A'}</div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Customer</label>
          <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-50">{dos.loc_dest.customer.name || 'N/A'}</div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Alamat Tujuan</label>
          <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-50">{dos.loc_dest.address || 'N/A'}</div>
        </div>

        <div className="h-full min-h-full flex flex-col items-center w-full pb-10">
            <BaseTablePagination
              columns={columns}
              data={dataProductLine}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={loading}
              judul={'Muatan'}
            />
        </div>
      </div>
    </div>
  );
}

export default DODetailPageAdmin;