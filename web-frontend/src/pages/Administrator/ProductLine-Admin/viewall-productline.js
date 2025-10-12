import { SelectColumnFilter } from '../../../components/BaseTable';
import React, { useEffect, useState } from 'react';
import { Loading } from '../../../components/Loading';
import axiosAuthInstance from '../../../utils/axios-auth-instance';
import { BaseTablePagination } from '../../../components/BaseTablePagination';

function ViewAllProductLineAdmin() {
  const [dataProductLine, setDataProductLine] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProductLine = async (page, limit) => {
    setLoading(true);
    try {
      const response = await axiosAuthInstance.get(`/product-lines?skip=${(page - 1) * limit}&limit=${limit}`);
      const { productLine, total } = response.data.data;
      setDataProductLine(productLine);
      setTotalPages(Math.ceil(total / limit));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductLine(currentPage, pageSize);
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
        Header: 'SO Number',
        accessor: 'delivery_order.so_origin',
        Filter: SelectColumnFilter,
        filter: 'includes'
      },
      {
        Header: 'DO Number',
        accessor: 'delivery_order.delivery_order_num',
        Filter: SelectColumnFilter,
        filter: 'includes'
      },
      {
        Header: 'DO Status',
        accessor: 'delivery_order.status',
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

  return (
    <div className="h-full min-h-full justify-center">
      <Loading visibility={loading} />
      <div className={`${loading ? 'hidden' : 'visible pt-10 px-10'}`}>
          <BaseTablePagination
            columns={columns}
            data={dataProductLine}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
            judul={'Daftar Product Line'}
          />
      </div>
    </div>
  );
}

export default ViewAllProductLineAdmin;