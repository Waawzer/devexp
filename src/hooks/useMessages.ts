'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    image?: string;
  };
  recipient: {
    _id: string;
    name: string;
    image?: string;
  };
  read: boolean;
  createdAt: string;
}

interface Conversation {
  user: {
    _id: string;
    name: string;
    image?: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    read: boolean;
    sender: 'me' | 'other';
  };
  unreadCount: number;
}

export function useMessages(recipientId?: string) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  // Fonction pour récupérer les messages d'une conversation
  const fetchMessages = useCallback(async () => {
    if (!recipientId || !session?.user?.id) return;
    
    try {
      const res = await fetch(`/api/messages?withUser=${recipientId}`);
      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des messages');
      }
      
      const data = await res.json();
      
      // Comparer les nouveaux messages avec les messages existants
      const hasNewMessages = JSON.stringify(data) !== JSON.stringify(messages);
      if (hasNewMessages) {
        setMessages(data);
        setLastUpdate(Date.now());
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  }, [recipientId, session, messages]);

  // Fonction pour récupérer les conversations
  const fetchConversations = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const res = await fetch('/api/messages');
      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des conversations');
      }
      
      const data = await res.json();
      const hasNewConversations = JSON.stringify(data) !== JSON.stringify(conversations);
      
      if (hasNewConversations) {
        setConversations(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les conversations');
    } finally {
      setLoading(false);
    }
  }, [session, conversations]);

  // Fonction pour envoyer un message
  const sendMessage = useCallback(async (content: string) => {
    if (!recipientId || !content.trim() || !session?.user?.id) {
      return false;
    }
    
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId,
          content
        }),
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }
      
      const newMessage = await res.json();
      setMessages(prev => [...prev, newMessage]);
      
      return true;
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible d\'envoyer le message');
      return false;
    }
  }, [recipientId, session]);

  // Effet pour charger les données initiales et mettre en place le polling
  useEffect(() => {
    let isActive = true;
    setLoading(true);

    const loadData = async () => {
      if (recipientId) {
        await fetchMessages();
      } else {
        await fetchConversations();
      }
      
      if (isActive) {
        setLoading(false);
      }
    };

    loadData();

    // Mettre en place le polling
    const interval = setInterval(() => {
      if (recipientId) {
        fetchMessages();
      } else {
        fetchConversations();
      }
    }, 3000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [recipientId, fetchMessages, fetchConversations]);

  return {
    messages,
    conversations,
    loading,
    error,
    sendMessage,
    refreshMessages: fetchMessages,
    refreshConversations: fetchConversations
  };
} 