import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, TrendingUp, UserCircle,
  LogOut, GraduationCap, Menu, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/member', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/member/materials', label: 'Semua Materi', icon: BookOpen },
  { path: '/member/progress', label: 'Progress Belajar', icon: TrendingUp },
  { path: '/member/profile', label: 'Profil', icon: UserCircle },
];

const MemberLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Berhasil logout');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </div>
              <span className="text-gray-900 dark:text-white font-bold hidden sm:block">LMS Bimbingan Bisnis</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(({ path, label, icon: Icon, exact }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={exact}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                    }`
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Right: User & Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{user?.name}</span>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/10 transition-all"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 px-4 py-3 space-y-1">
            {navItems.map(({ path, label, icon: Icon, exact }) => (
              <NavLink
                key={path}
                to={path}
                end={exact}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default MemberLayout;
