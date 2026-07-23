import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

const Profile = () => {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your account information.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-card p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-600 text-white flex items-center justify-center text-xl font-semibold">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>

        <dl className="space-y-3 text-sm border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Role</dt>
            <dd className="text-gray-900 dark:text-white font-medium capitalize">{user?.role}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Email</dt>
            <dd className="text-gray-900 dark:text-white font-medium">{user?.email}</dd>
          </div>
        </dl>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
