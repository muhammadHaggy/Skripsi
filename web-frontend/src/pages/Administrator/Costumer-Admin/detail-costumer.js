import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axiosAuthInstance from '../../../utils/axios-auth-instance';
import { Loading } from '../../../components/Loading';

function CustomerDetailPage() {
  const { customerId } = useParams(); // Get customerId from URL parameters
  const location = useLocation(); // Access location state
  const [customer, setCustomer] = useState(location.state?.customer || null); // Initial data from state if available
  const [loading, setLoading] = useState(!location.state?.customer); // Show loading only if data not in state
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch customer details only if not available in state
    if (!customer) {
      const fetchCustomerDetails = async () => {
        setLoading(true);
        try {
          const response = await axiosAuthInstance.get(`/customer/${customerId}`);
          setCustomer(response.data.data);
        } catch (error) {
          setError('Failed to load customer details.');
          console.error('Error fetching customer details:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchCustomerDetails();
      
    }
  }, [customerId, customer]);
  console.log(customer)

  if (loading) return <Loading visibility={true} />; // Show loading spinner if fetching
  if (error) return <p>{error}</p>; // Display error message if fetch failed

  return (
    <div class="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md my-8">
    <h1 class="text-2xl font-bold mb-6">Informasi Customer</h1>
    <div class="mb-4">
      <label class="block text-sm font-semibold mb-1">Nama</label>
      <div class="w-full p-2 border border-gray-300 rounded-md bg-gray-50">
        {customer.name || 'N/A'}
      </div>
    </div>
    <div class="mb-4">
      <label class="block text-sm font-semibold mb-1">Email</label>
      <div class="w-full p-2 border border-gray-300 rounded-md bg-gray-50">
        {customer.email || 'N/A'}
      </div>
    </div>
    <div class="mb-4">
      <label class="block text-sm font-semibold mb-1">Nomor</label>
      <div class="w-full p-2 border border-gray-300 rounded-md bg-gray-50">
        {customer.phone || 'N/A'}
      </div>
    </div>
    <div class="mb-4">
      <label class="block text-sm font-semibold mb-1">Nomor Genggam</label>
      <div class="w-full p-2 border border-gray-300 rounded-md bg-gray-50">
        {customer.mobile || 'N/A'}
      </div>
    </div>
    <div class="mb-4">
      <label class="block text-sm font-semibold mb-1">NPWP</label>
      <div class="w-full p-2 border border-gray-300 rounded-md bg-gray-50">
        {customer.npwp || 'N/A'}
      </div>
    </div>
</div>

  );
  
}

export default CustomerDetailPage;
