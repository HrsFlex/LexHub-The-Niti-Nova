import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Scale, 
  FileText, 
  Newspaper, 
  GitCompare, 
  FileSpreadsheet,
  Settings,
  Menu,
  X
} from 'lucide-react';

const menuItems = [
  { icon: Scale, label: 'Case Research', path: '/cases' },
  { icon: FileText, label: 'Contract Analysis', path: '/contracts' },
  // { icon: Newspaper, label: 'Legal News', path: '/news' },
  { icon: GitCompare, label: 'Document Comparison', path: '/compare' },
  { icon: FileSpreadsheet, label: 'Forms Assistant', path: '/forms' },
  // { icon: LayoutDashboard, label: 'Case Analytics', path: '/dashboard' },
  // { icon: LayoutDashboard, label: 'Find a Lawyer', path: '/find-lawyer' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 bg-slate-900 text-white p-2 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-200 ease-in-out
        w-64 bg-slate-900 text-white p-4 flex flex-col
        overflow-y-auto min-h-screen md:min-h-0
      `}>
        <div 
          className="flex items-center gap-2 mb-8 px-2 cursor-pointer hover:text-blue-400 transition-colors"
          onClick={() => {
            navigate('/');
            setIsOpen(false);
          }}
        >
          <Scale className="w-8 h-8 text-blue-400" />
          <h1 className="text-xl font-bold">LexGPT</h1>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto">
          <button className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors w-full">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}