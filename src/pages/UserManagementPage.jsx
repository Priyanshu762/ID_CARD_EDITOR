import React, { useState } from 'react';
import { Users, Search, Trash2, Eye, RefreshCw, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useUsers, useDeleteUser } from '../hooks/useUsers';
import ConfirmModal from '../components/ConfirmModal';

const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTemplate, setFilterTemplate] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Fetch users using React Query
  const { data: usersData, isLoading, refetch } = useUsers();
  console.log('====================================');
  console.log("user data",usersData);
  console.log('====================================');
  const users = usersData?.data || [];

  // Delete user mutation
  const deleteUserMutation = useDeleteUser({
    onSuccess: () => {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    },
  });

  // Get unique template names for filter
  const templateNames = [...new Set(users.map(user => user.templateName).filter(Boolean))];

  // Filter users based on search and template filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      JSON.stringify(user.userData).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.templateName && user.templateName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTemplate = filterTemplate === '' || user.templateName === filterTemplate;
    
    return matchesSearch && matchesTemplate;
  });

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      await deleteUserMutation.mutateAsync(userToDelete._id);
    }
  };

  const handleViewUser = (user) => {
    // Create a modal or detailed view of user data
    const userDataString = JSON.stringify(user.userData, null, 2);
    toast((t) => (
      <div className="max-w-md">
        <div className="font-bold text-lg mb-2">User Details</div>
        <div className="text-sm mb-2">
          <strong>Template:</strong> {user.templateName || 'N/A'}
        </div>
        <div className="text-sm mb-2">
          <strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}
        </div>
        <div className="text-xs bg-gray-100 p-2 rounded max-h-60 overflow-auto">
          <pre>{userDataString}</pre>
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="mt-3 w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    ), {
      duration: Infinity,
      style: { maxWidth: '500px' }
    });
  };

  const formatUserDisplayName = (user) => {
    // Try to get a meaningful name from userData
    const userData = user.userData || {};
    return userData.Name || userData['Employee ID'] || userData.Email || `User ${user._id.slice(-6)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Users size={32} className="text-blue-600" />
                  User Management
                </h1>
                <p className="text-gray-600 mt-1">Manage all ID card users</p>
              </div>
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md transition-all"
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, ID, or any field..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Template Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={filterTemplate}
                    onChange={(e) => setFilterTemplate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">All Templates</option>
                    {templateNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-3 text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </div>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg mb-2">
                {users.length === 0 ? 'No users found' : 'No users match your filters'}
              </p>
              <p className="text-gray-500 text-sm">
                {users.length === 0 
                  ? 'Create users from the ID Card Printer page'
                  : 'Try adjusting your search or filter criteria'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Template
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatUserDisplayName(user)}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user._id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.templateName || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-all"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-all"
                              title="Delete User"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete this user? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
};

export default UserManagementPage;
