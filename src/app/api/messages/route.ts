import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/services/authService';
import dbConnect from '@/lib/dbConnect';
import Message from '@/models/Message';
import User from '@/models/User';
import { createNotification } from '@/lib/services/notificationService';
import mongoose from 'mongoose';
import { Session } from 'next-auth';

// Récupérer les conversations ou les messages
export async function GET(req: NextRequest) {
  return withAuth(req, async (session: Session) => {
    await dbConnect();
    
    // Récupérer les paramètres de requête
    const { searchParams } = new URL(req.url);
    const withUserId = searchParams.get('withUser');
    
    if (withUserId) {
      // Récupérer les messages d'une conversation spécifique
      const messages = await Message.find({
        $or: [
          { sender: session.user.id, recipient: withUserId },
          { sender: withUserId, recipient: session.user.id }
        ]
      })
        .populate('sender', 'name image')
        .populate('recipient', 'name image')
        .sort({ createdAt: 1 });
      
      // Marquer les messages non lus comme lus
      await Message.updateMany(
        { 
          sender: withUserId, 
          recipient: session.user.id,
          read: false
        },
        { $set: { read: true } }
      );
      
      return NextResponse.json(messages);
    } else {
      // Récupérer la liste des conversations avec optimisation
      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [
              { sender: new mongoose.Types.ObjectId(session.user.id) },
              { recipient: new mongoose.Types.ObjectId(session.user.id) }
            ]
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ["$sender", new mongoose.Types.ObjectId(session.user.id)] },
                "$recipient",
                "$sender"
              ]
            },
            lastMessage: { $first: "$$ROOT" },
            unreadCount: {
              $sum: {
                $cond: [
                  { $and: [
                    { $eq: ["$recipient", new mongoose.Types.ObjectId(session.user.id)] },
                    { $eq: ["$read", false] }
                  ]},
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);
      
      // Récupérer les informations des utilisateurs
      const userIds = conversations.map(conv => conv._id);
      const users = await User.find({ _id: { $in: userIds } })
        .select('name image');
      
      // Combiner les données
      const result = conversations.map(conv => {
        const user = users.find(u => u._id.toString() === conv._id.toString());
        return {
          user,
          lastMessage: {
            content: conv.lastMessage.content,
            createdAt: conv.lastMessage.createdAt,
            read: conv.lastMessage.read,
            sender: conv.lastMessage.sender.toString() === session.user.id ? 'me' : 'other'
          },
          unreadCount: conv.unreadCount
        };
      });
      
      return NextResponse.json(result);
    }
  });
}

// Envoyer un message
export async function POST(req: NextRequest) {
  return withAuth(req, async (session) => {
    await dbConnect();
    const { recipientId, content } = await req.json();
    
    if (!recipientId || !content) {
      return NextResponse.json(
        { message: 'Destinataire et contenu requis' },
        { status: 400 }
      );
    }
    
    // Vérifier si le destinataire existe
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return NextResponse.json(
        { message: 'Destinataire non trouvé' },
        { status: 404 }
      );
    }
    
    // Créer le message
    const message = await Message.create({
      sender: session.user.id,
      recipient: recipientId,
      content,
      createdAt: new Date()
    });
    
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name image')
      .populate('recipient', 'name image');
    
    // Créer une notification pour le destinataire
    await createNotification({
      type: 'new_message',
      from: session.user.id,
      to: recipientId,
      messageId: message._id,
      title: 'Nouveau message',
      message: `${session.user.name} vous a envoyé un message: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
    });
    
    return NextResponse.json(populatedMessage, { status: 201 });
  });
} 