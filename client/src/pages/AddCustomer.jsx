import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import CustomerForm from '../components/CustomerForm';
import customerService from '../services/customerService';
import { useToast } from '../context/ToastContext';

const AddCustomer = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (form) => {
    try {
      const customer = await customerService.createCustomer(form);
      showToast('Customer added successfully', 'success');
      navigate(`/customers/${customer._id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add customer', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Customer</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create a new customer record.</p>
      </div>
      <CustomerForm onSubmit={handleSubmit} submitLabel="Add Customer" showNotesField />
    </DashboardLayout>
  );
};

export default AddCustomer;
