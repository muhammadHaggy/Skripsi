import { SelectColumnFilter } from '../../../components/BaseTable';
import React, { useEffect, useState } from 'react';
import { Loading } from '../../../components/Loading';
import axiosAuthInstance from '../../../utils/axios-auth-instance';
import { BaseTablePagination } from '../../../components/BaseTablePagination';

function ViewAllProdukAdmin() {
  const [dataProduk, setDataProduk] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (page, limit) => {
    setLoading(true);
    try {
      const response = await axiosAuthInstance.get(`/products?skip=${(page - 1) * limit}&limit=${limit}`);
      const { product, total } = response.data.data;
      setDataProduk(product || []);
      setTotalPages(Math.ceil(total / limit));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, pageSize);
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

  const columns = React.useMemo(
    () => [
      {
        Header: 'No',
        accessor: 'id',
        Filter: SelectColumnFilter,
        filter: 'includes'
      },
      {
        Header: 'Nama Produk',
        accessor: 'name',
        Filter: SelectColumnFilter,
        filter: 'includes'
      },
      {
        Header: 'Kategori Produk',
        accessor: 'product_category',
        Filter: SelectColumnFilter,
        filter: 'includes'
      },
      {
        Header: 'Tipe Produk',
        accessor: 'product_type',
        Filter: SelectColumnFilter,
        filter: 'includes'
      }
    ],
    []
  );

  return (
    <div className="h-full min-h-full justify-center">
      <Loading visibility={loading} />
      <div className={`${loading ? 'hidden' : 'visible pt-10 px-10'}`}>
          <BaseTablePagination
            columns={columns}
            data={dataProduk}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
            judul={'Daftar Product'}
          />
      </div>
    </div>
  );
}

export default ViewAllProdukAdmin;