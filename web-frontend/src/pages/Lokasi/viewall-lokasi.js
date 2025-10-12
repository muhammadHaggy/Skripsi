import { SelectColumnFilter } from '../../components/BaseTable';
import React, { useEffect, useState } from 'react';
import { Loading } from '../../components/Loading';
import axiosAuthInstance from '../../utils/axios-auth-instance';
import { BaseTablePagination } from '../../components/BaseTablePagination';

function ViewAllLokasiAdmin() {
  const [dataLokasi, setDataLokasi] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async (page, limit) => {
    setLoading(true);
    try {
      const response = await axiosAuthInstance.get(`/locations?skip=${(page - 1) * limit}&limit=${limit}`);
      const { locations, total } = response.data.data;
      setDataLokasi(locations);
      setTotalPages(Math.ceil(total / limit));
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations(currentPage, pageSize);
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

  const columns = React.useMemo(() => [
    {
      Header: 'No',
      accessor: 'name',
      Filter: SelectColumnFilter,
      filter: 'includes',
      width: 'min-w-[100px]',
    },
    {
      Header: 'Nama Customer',
      accessor: 'customer.name',
      Filter: SelectColumnFilter,
      filter: 'includes',
      width: 'min-w-[250px]',
    },
    {
      Header: 'Alamat Lokasi',
      accessor: 'address',
      Filter: SelectColumnFilter,
      filter: 'includes',
      width: 'min-w-[250px]',
    },
    {
      Header: 'Provinsi',
      accessor: 'provinsi',
      Filter: SelectColumnFilter,
      filter: 'includes',
    },
    {
      Header: 'Kota/Kabupaten',
      accessor: 'kabupaten_kota',
      Filter: SelectColumnFilter,
      filter: 'includes',
    },
    {
      id: 'id',
      Header: 'Action',
    },
  ], []);

  return (
    <div className="h-full min-h-full justify-center">
      <Loading visibility={loading} />

      <div className={` ${loading ? 'hidden' : 'visible px-10 pt-10'} `}>
        <BaseTablePagination
          columns={columns}
          data={dataLokasi}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          loading={loading}
          judul={'Daftar Lokasi'}
        />
      </div>
    </div>
  );
}

export default ViewAllLokasiAdmin;