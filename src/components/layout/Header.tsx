"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FaUser, FaCaretDown } from 'react-icons/fa';
import Image from 'next/image';
import AuthModal from "@/components/modals/AuthModal";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated" && session?.user;

  return (
    <header className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          DevExp
        </Link>
        <nav className="space-x-4 flex items-center">
          <Link href="/projects" className="hover:text-gray-300">
            Projets
          </Link>
          
          {status === "loading" ? (
            <div className="animate-pulse bg-gray-600 h-8 w-20 rounded" />
          ) : session?.user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 hover:text-gray-300"
              >
                {session.user.image ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden relative">
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full"
                      priority
                    />
                  </div>
                ) : (
                  <FaUser className="w-8 h-8" />
                )}
                <span>{session.user.name}</span>
                <FaCaretDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Mon Profil
                  </Link>
                  <Link
                    href="/projects/my-projects"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Mes Projets
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Connexion
            </button>
          )}
        </nav>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
}