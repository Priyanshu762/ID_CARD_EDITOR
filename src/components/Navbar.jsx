import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CreditCard, Edit, FolderOpen, Users } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🪪 ID Card System
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/print"
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                isActive('/print') || isActive('/')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CreditCard size={18} />
              ID Print
            </Link>

            <Link
              to="/users"
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                isActive('/users')
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users size={18} />
              Users
            </Link>

            <Link
              to="/templates"
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                isActive('/templates')
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FolderOpen size={18} />
              Templates
            </Link>

            <Link
              to="/template-editor/new"
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                isActive('/template-editor')
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Edit size={18} />
              Template Editor
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
