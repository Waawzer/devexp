"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  FaProjectDiagram, 
  FaEnvelope, 
  FaTasks, 
  FaUserTie, 
  FaChevronLeft, 
  FaChevronRight,
  FaHome,
  FaChevronDown,
  FaPlus,
  FaList,
  FaUsers,
  FaHandshake
} from 'react-icons/fa';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [missionsOpen, setMissionsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  // Fonction pour gérer les clics sur les menus déroulants
  const toggleDropdown = (dropdown: 'projects' | 'missions') => {
    if (collapsed) {
      setCollapsed(false);
      setTimeout(() => {
        if (dropdown === 'projects') setProjectsOpen(true);
        if (dropdown === 'missions') setMissionsOpen(true);
      }, 150);
    } else {
      if (dropdown === 'projects') setProjectsOpen(!projectsOpen);
      if (dropdown === 'missions') setMissionsOpen(!missionsOpen);
    }
  };

  if (!session) return null;

  return (
    <div 
      className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 ease-in-out h-screen sticky top-0 flex flex-col ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="p-6 flex justify-between items-center border-b border-gray-700/50">
        {!collapsed && (
          <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            DevExp
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-full hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      <nav className="flex-1 py-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <ul className="space-y-2 px-3">
          <li>
            <Link 
              href="/" 
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                pathname === '/' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <FaHome className={`${collapsed ? 'mx-auto text-xl' : 'mr-3'}`} />
              {!collapsed && <span>Accueil</span>}
            </Link>
          </li>

          {/* Menu déroulant Projets */}
          <li className="relative">
            <button 
              onClick={() => toggleDropdown('projects')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive('/projects') 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <FaProjectDiagram className={`${collapsed ? 'mx-auto text-xl' : 'mr-3'}`} />
                {!collapsed && <span>Projets</span>}
              </div>
              {!collapsed && (
                <FaChevronDown className={`transition-transform duration-200 ${projectsOpen ? 'rotate-180' : ''}`} />
              )}
            </button>
            
            {/* Sous-menu Projets */}
            {!collapsed && projectsOpen && (
              <ul className="mt-1 ml-7 space-y-1 border-l-2 border-gray-700/50 pl-4">
                <li>
                  <Link 
                    href="/projects" 
                    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                      pathname === '/projects' 
                        ? 'bg-blue-600/20 text-blue-300' 
                        : 'text-gray-400 hover:bg-gray-800/30 hover:text-gray-200'
                    }`}
                  >
                    <FaList className="mr-2 text-sm" />
                    <span className="text-sm">Voir tous les projets</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/projects/my-projects" 
                    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                      pathname === '/projects/my-projects' 
                        ? 'bg-blue-600/20 text-blue-300' 
                        : 'text-gray-400 hover:bg-gray-800/30 hover:text-gray-200'
                    }`}
                  >
                    <FaUsers className="mr-2 text-sm" />
                    <span className="text-sm">Mes projets</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/projects/my-collaborations" 
                    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                      pathname === '/projects/my-collaborations' 
                        ? 'bg-blue-600/20 text-blue-300' 
                        : 'text-gray-400 hover:bg-gray-800/30 hover:text-gray-200'
                    }`}
                  >
                    <FaHandshake className="mr-2 text-sm" />
                    <span className="text-sm">Mes collaborations</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link 
              href="/messages" 
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive('/messages') 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <FaEnvelope className={`${collapsed ? 'mx-auto text-xl' : 'mr-3'}`} />
              {!collapsed && (
                <div className="flex justify-between items-center w-full">
                  <span>Messages</span>
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Nouveau</span>
                </div>
              )}
              {collapsed && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full"></span>
              )}
            </Link>
          </li>

          {/* Menu déroulant Missions */}
          <li className="relative">
            <button 
              onClick={() => toggleDropdown('missions')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive('/mission') 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <FaTasks className={`${collapsed ? 'mx-auto text-xl' : 'mr-3'}`} />
                {!collapsed && <span>Missions</span>}
              </div>
              {!collapsed && (
                <FaChevronDown className={`transition-transform duration-200 ${missionsOpen ? 'rotate-180' : ''}`} />
              )}
            </button>
            
            {/* Sous-menu Missions */}
            {!collapsed && missionsOpen && (
              <ul className="mt-1 ml-7 space-y-1 border-l-2 border-gray-700/50 pl-4">
                <li>
                  <Link 
                    href="/mission" 
                    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                      pathname === '/mission' 
                        ? 'bg-blue-600/20 text-blue-300' 
                        : 'text-gray-400 hover:bg-gray-800/30 hover:text-gray-200'
                    }`}
                  >
                    <FaList className="mr-2 text-sm" />
                    <span className="text-sm">Voir toutes les missions</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/mission/my-missions" 
                    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                      pathname === '/mission/my-missions' 
                        ? 'bg-blue-600/20 text-blue-300' 
                        : 'text-gray-400 hover:bg-gray-800/30 hover:text-gray-200'
                    }`}
                  >
                    <FaPlus className="mr-2 text-sm" />
                    <span className="text-sm">Mes missions</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/mission/assigned" 
                    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                      pathname === '/mission/assigned' 
                        ? 'bg-blue-600/20 text-blue-300' 
                        : 'text-gray-400 hover:bg-gray-800/30 hover:text-gray-200'
                    }`}
                  >
                    <FaTasks className="mr-2 text-sm" />
                    <span className="text-sm">Missions assignées</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link 
              href="/profile" 
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive('/profile') 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <FaUserTie className={`${collapsed ? 'mx-auto text-xl' : 'mr-3'}`} />
              {!collapsed && <span>Freelances</span>}
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-6 border-t border-gray-700/50 text-xs text-gray-500">
        {!collapsed ? (
          <div className="space-y-2">
            <p>DevExp © {new Date().getFullYear()}</p>
            <p className="text-gray-600">Connectez-vous avec des développeurs talentueux</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span>©</span>
          </div>
        )}
      </div>
    </div>
  );
} 