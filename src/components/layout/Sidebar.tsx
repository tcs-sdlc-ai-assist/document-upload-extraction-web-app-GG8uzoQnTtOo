import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_MENU_ITEMS, NavMenuItem } from '@/constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function getIcon(icon: string): React.ReactNode {
  switch (icon) {
    case 'dashboard':
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
          />
        </svg>
      );
    case 'upload':
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
      );
    case 'history':
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      );
  }
}

function NavItem({ item, onClick }: { item: NavMenuItem; onClick: () => void }) {
  return (
    <li>
      <NavLink
        to={item.path}
        end={item.path === '/'}
        onClick={onClick}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
            isActive
              ? 'bg-brand-100 text-brand-700'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
          }`
        }
        aria-current={undefined}
      >
        {({ isActive }) => (
          <>
            <span className={isActive ? 'text-brand-600' : 'text-neutral-400'}>
              {getIcon(item.icon)}
            </span>
            <span>{item.label}</span>
          </>
        )}
      </NavLink>
    </li>
  );
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-neutral-900/50 lg:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        role="navigation"
        aria-label="Main navigation"
        onKeyDown={handleKeyDown}
        className={`fixed top-0 left-0 z-40 h-full w-68 bg-white border-r border-neutral-200 pt-18 transition-transform duration-250 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full px-4 py-6 overflow-y-auto scrollbar-thin">
          <nav>
            <ul className="space-y-1" role="list">
              {NAV_MENU_ITEMS.map((item) => (
                <NavItem key={item.path} item={item} onClick={onClose} />
              ))}
            </ul>
          </nav>

          <div className="mt-auto pt-6 border-t border-neutral-200">
            <p className="px-4 text-2xs text-neutral-400">
              © {new Date().getFullYear()} Docupex
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;