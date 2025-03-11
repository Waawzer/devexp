import toast from 'react-hot-toast';
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Notification {
  type: string;
  message: string;
  from: string;
  projectId?: string;
  messageId?: string;
  _id?: string;
}

export const useNotifications = () => {
  const showNotification = (notification: Notification) => {
    const { type, message, from, projectId, messageId, _id } = notification;

    const commonToastOptions = {
      duration: 10000, // 10 secondes
      position: 'top-right' as const,
      id: _id, // Utiliser l'ID de la notification comme ID du toast
    };

    switch (type) {
      case 'mission_proposal':
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {from}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {message}
                    </p>
                    <button
                      onClick={() => {
                        if (projectId && _id) {
                          window.location.href = `/projects/${projectId}?notification=${_id}`;
                        }
                      }}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                    >
                      Voir la proposition
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ),
          commonToastOptions
        );
        break;

      case 'application':
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-purple-50 border-l-4 border-purple-500 p-4 shadow-lg rounded-lg pointer-events-auto`}
              onClick={() => {
                if (projectId) {
                  window.location.href = `/projects/${projectId}?tab=applications`;
                }
                toast.dismiss(t.id);
              }}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-purple-700">
                    Nouvelle candidature
                  </p>
                  <p className="text-xs text-purple-500 mt-1">{message}</p>
                  <p className="text-xs text-purple-400 mt-1">De: {from}</p>
                </div>
              </div>
            </div>
          ),
          commonToastOptions
        );
        break;

      case 'new_message':
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {from}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {message}
                    </p>
                    <div className="mt-2 flex space-x-3">
                      <button
                        onClick={() => {
                          if (messageId) {
                            // Marquer comme lu et rediriger
                            fetch(`/api/messages/${messageId}/read`, {
                              method: 'PUT',
                            }).then(() => {
                              window.location.href = `/messages?user=${notification.from}`;
                              toast.dismiss(t.id);
                            });
                          }
                        }}
                        className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Répondre
                      </button>
                      <button
                        onClick={() => toast.dismiss(t.id)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Ignorer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ),
          commonToastOptions
        );
        break;

      default:
        toast(message, commonToastOptions);
    }
  };

  return { showNotification };
}; 