"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FaUser, FaCaretDown, FaBell } from 'react-icons/fa';
import Image from 'next/image';
import AuthModal from "@/components/modals/AuthModal";
import { useNotifications } from '@/hooks/useNotifications';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Notification {
  _id: string;
  type: 'mission_proposal' | 'application' | 'new_message';
  from: {
    _id: string;
    name: string;
    image?: string;
  };
  projectId?: {
    _id: string;
    title: string;
  };
  messageId?: string;
  title: string;
  message: string;
  read: boolean;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { showNotification } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/users/me');
          if (response.ok) {
            const userData = await response.json();
            setProfileImage(userData.image || null);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
        }
      }
    };

    fetchUserData();
  }, [session]);

  useEffect(() => {
    if (!session?.user?.id) return;
    
    const seenNotificationIds = new Set();
    
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          const unreadNotifications = data.filter(
            (notif: any) => !notif.read
          );
          
          setNotifications(unreadNotifications);
          
          for (const notif of unreadNotifications) {
            if (!seenNotificationIds.has(notif._id)) {
              seenNotificationIds.add(notif._id);
              
              if (typeof showNotification === 'function') {
                showNotification({
                  type: notif.type,
                  message: notif.message,
                  from: notif.from.name,
                  projectId: notif.projectId?._id,
                  _id: notif._id
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isAuthenticated = status === "authenticated" && session?.user;

  const handleNotificationClick = async (notification: Notification) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId: notification._id,
          status: 'accepted'
        }),
      });

      setNotifications(prev => 
        prev.filter(n => n._id !== notification._id)
      );

      if (notification.type === 'mission_proposal') {
        router.push(`/projects/${notification.projectId?._id}`);
      } else if (notification.type === 'application') {
        router.push(`/projects/${notification.projectId?._id}?tab=applications`);
      } else if (notification.type === 'new_message') {
        if (notification.messageId) {
          await fetch(`/api/messages/${notification.messageId}/read`, {
            method: 'PUT'
          });
        }
        router.push(`/messages?user=${notification.from._id}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour de la notification');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
          DevExp
        </Link>
        <nav className="space-x-4 flex items-center">
          {status === "loading" ? (
            <div className="animate-pulse bg-gray-700 h-8 w-20 rounded" />
          ) : session?.user ? (
            <>
              {/* Icône de notification */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 hover:text-indigo-400 transition-colors relative"
                >
                  <FaBell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Menu déroulant des notifications */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-xl shadow-xl overflow-hidden z-50 border border-gray-700">
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-400">
                          Aucune notification
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-700">
                          {notifications.map((notification) => (
                            <button
                              key={notification._id}
                              onClick={() => handleNotificationClick(notification)}
                              className="w-full text-left p-4 hover:bg-gray-700 transition-colors flex items-start gap-3"
                            >
                              {notification.from.image ? (
                                <Image
                                  src={notification.from.image}
                                  alt=""
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                                  <FaUser className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-100">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(notification.createdAt)}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Menu utilisateur existant */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 hover:text-indigo-400 transition-colors"
                >
                  {profileImage ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden relative border border-gray-700">
                      <Image
                        src={profileImage}
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
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl py-1 z-50 border border-gray-700">
                    <Link
                      href="/profile/my-profile"
                      className="block px-4 py-2 text-gray-100 hover:bg-gray-700 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Mon profil
                    </Link>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        signOut();
                      }}
                      className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition-colors"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl 
                       hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Connexion
            </button>
          )}
        </nav>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}