'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const messagesHashRef = useRef<string>('');
  const conversationsHashRef = useRef<string>('');
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  
  // Polling interval plus long (5 secondes au lieu de 3)
  const POLLING_INTERVAL = 5000;

  // Fonction pour récupérer les messages d'une conversation avec vérification de modificiations
  const fetchMessages = useCallback(async (forceUpdate = false) => {
    if (!recipientId || !session?.user?.id) return;
    
    try {
      const res = await fetch(`/api/messages?withUser=${recipientId}`);
      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des messages');
      }
      
      const data = await res.json();
      const newHash = JSON.stringify(data);
      
      // Ne mettre à jour que si les données ont changé ou si un forceUpdate est demandé
      if (forceUpdate || newHash !== messagesHashRef.current) {
        messagesHashRef.current = newHash;
        setMessages(data);
        setLastUpdate(Date.now());
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  }, [recipientId, session]);

  // Fonction pour récupérer les conversations avec vérification de modificiations
  const fetchConversations = useCallback(async (forceUpdate = false) => {
    if (!session?.user?.id) return;
    
    try {
      const res = await fetch('/api/messages');
      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des conversations');
      }
      
      const data = await res.json();
      const newHash = JSON.stringify(data);
      
      // Ne mettre à jour que si les données ont changé ou si un forceUpdate est demandé
      if (forceUpdate || newHash !== conversationsHashRef.current) {
        conversationsHashRef.current = newHash;
        setConversations(data);
        setLastUpdate(Date.now());
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les conversations');
    } finally {
      setLoading(false);
    }
  }, [session]);

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
      
      // Mettre à jour les messages immédiatement
      setMessages(prev => [...prev, newMessage]);
      
      // Forcer une mise à jour des conversations
      fetchConversations(true);
      
      return true;
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible d\'envoyer le message');
      return false;
    }
  }, [recipientId, session, fetchConversations]);

  // Effet pour charger les données initiales et mettre en place le polling
  useEffect(() => {
    let isActive = true;
    setLoading(true);

    const loadData = async () => {
      if (recipientId) {
        await fetchMessages(true);
      } else {
        await fetchConversations(true);
      }
      
      if (isActive) {
        setLoading(false);
      }
    };

    loadData();

    // Mettre en place le polling avec un intervalle plus long
    const interval = setInterval(() => {
      if (recipientId) {
        fetchMessages();
      } else {
        fetchConversations();
      }
    }, POLLING_INTERVAL);

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
    refreshMessages: () => fetchMessages(true),
    refreshConversations: () => fetchConversations(true)
  };
} 