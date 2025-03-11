'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaSearch, FaPaperPlane, FaSpinner, FaUser } from 'react-icons/fa';

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [newUserData, setNewUserData] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(true);
  
  // Utiliser le hook useMessages
  const {
    messages,
    conversations,
    loading,
    error,
    sendMessage,
    refreshMessages,
    refreshConversations
  } = useMessages(selectedUser?._id);

  // Fonction pour charger les données d'un utilisateur par son ID
  const fetchUserById = async (userId: string) => {
    setLoadingUser(true);
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        return userData.user;
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
    } finally {
      setLoadingUser(false);
    }
    return null;
  };

  // Gérer l'ouverture d'une conversation depuis une notification ou un profil
  useEffect(() => {
    const userId = searchParams.get('user');
    if (!userId) return;

    // Vérifier d'abord si l'utilisateur est dans les conversations existantes
    if (conversations.length > 0) {
      const existingConversation = conversations.find(conv => conv.user._id === userId);
      if (existingConversation) {
        setSelectedUser(existingConversation.user);
        return;
      }
    }

    // Si l'utilisateur n'est pas dans les conversations existantes, charger ses données
    const loadNewUser = async () => {
      const userData = await fetchUserById(userId);
      if (userData) {
        setNewUserData(userData);
        setSelectedUser(userData);
      }
    };

    loadNewUser();
  }, [searchParams, conversations]);

  // Filtrer les conversations par le terme de recherche
  const filteredConversations = conversations.filter(conv => 
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gérer le scroll automatique
  useEffect(() => {
    if (shouldScroll && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, shouldScroll]);

  // Gérer le scroll manuel
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldScroll(isNearBottom);
    }
  }, []);

  // Gérer l'envoi d'un message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !selectedUser) return;
    
    setSending(true);
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
      // Rafraîchir les messages et les conversations
      refreshMessages();
      setTimeout(() => {
        refreshConversations();
      }, 500);
    }
    setSending(false);
  };

  useEffect(() => {
    // Marquer les messages comme lus lorsqu'on ouvre une conversation
    if (selectedUser?._id && messages.length > 0) {
      const unreadMessages = messages.filter(
        msg => !msg.read && msg.sender._id === selectedUser._id
      );
      
      if (unreadMessages.length > 0) {
        // Rafraîchir les conversations après avoir lu les messages
        setTimeout(() => {
          refreshConversations();
        }, 500);
      }
    }
  }, [selectedUser, messages, refreshConversations]);

  // Naviguer vers le profil de l'utilisateur
  const navigateToUserProfile = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-20">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        {/* Liste des conversations */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-full max-h-full">
          <div className="p-4 border-b sticky top-0 bg-white z-10">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
            {loading && !selectedUser ? (
              <div className="flex justify-center items-center h-32">
                <FaSpinner className="animate-spin text-blue-500 text-2xl" />
              </div>
            ) : filteredConversations.length === 0 && !newUserData ? (
              <div className="text-center text-gray-500 py-8">
                <p>Aucune conversation trouvée</p>
              </div>
            ) : (
              <>
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.user._id}
                    onClick={() => setSelectedUser(conv.user)}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      selectedUser?._id === conv.user._id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                          {conv.user.image ? (
                            <Image 
                              src={conv.user.image} 
                              alt={conv.user.name} 
                              width={48} 
                              height={48} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg">
                              {conv.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{conv.user.name}</h3>
                        <p className="text-sm text-gray-500 truncate">
                          {conv.lastMessage.sender === 'me' ? 'Vous: ' : ''}
                          {conv.lastMessage.content}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Afficher le nouvel utilisateur s'il n'est pas dans les conversations existantes */}
                {newUserData && !conversations.some(conv => conv.user._id === newUserData._id) && (
                  <div
                    onClick={() => setSelectedUser(newUserData)}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      selectedUser?._id === newUserData._id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                        {newUserData.image ? (
                          <Image 
                            src={newUserData.image} 
                            alt={newUserData.name} 
                            width={48} 
                            height={48} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg">
                            {newUserData.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{newUserData.name}</h3>
                        <p className="text-sm text-blue-500 truncate">
                          Nouvelle conversation
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Zone de chat */}
        <div className="md:col-span-2 h-full">
          {selectedUser ? (
            <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b flex items-center gap-3 sticky top-0 bg-white z-10">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  {selectedUser.image ? (
                    <Image 
                      src={selectedUser.image} 
                      alt={selectedUser.name} 
                      width={40} 
                      height={40} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <Link 
                  href={`/profile/${selectedUser._id}`}
                  className="font-medium hover:text-blue-600 transition-colors"
                >
                  {selectedUser.name}
                </Link>
              </div>
              
              {/* Messages */}
              <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="overflow-y-auto p-4 space-y-4"
                style={{ maxHeight: 'calc(100vh - 400px)' }}
              >
                {loading && messages.length === 0 ? (
                  <div className="flex justify-center items-center h-32">
                    <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 py-8">
                    <p>{error}</p>
                    <button 
                      onClick={refreshMessages}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>Aucun message. Commencez la conversation!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div 
                        key={msg._id} 
                        className={`flex ${msg.sender._id === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs p-3 rounded-lg ${
                          msg.sender._id === session?.user?.id 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender._id === session?.user?.id 
                              ? 'text-blue-100' 
                              : 'text-gray-500'
                          }`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
              
              {/* Input */}
              <div className="p-4 border-t bg-white sticky bottom-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaPaperPlane />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-lg shadow-md flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">Sélectionnez une conversation</p>
                <p className="text-sm">ou commencez-en une nouvelle</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

