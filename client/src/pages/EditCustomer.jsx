import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import CustomerForm from '../components/CustomerForm';
import customerService from '../services/customerService';
import { useToast } from '../context/ToastContext';

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerService
      .getCustomerById(id)
      .then(setCustomer)
      .catch((err) => showToast(err.response?.data?.message || 'Failed to load customer', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (form) => {
    try {
      await customerService.updateCustomer(id, form);
      showToast('Customer updated successfully', 'success');
      navigate(`/customers/${id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update customer', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Customer</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update customer information.</p>
      </div>
      {loading ? (
        <div className="skeleton h-64 max-w-2xl rounded-xl" />
      ) : (
        customer && <CustomerForm initialValues={customer} onSubmit={handleSubmit} submitLabel="Save Changes" />
      )}
    </DashboardLayout>
  );
};

export default EditCustomer;
