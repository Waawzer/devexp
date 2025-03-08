import { useState, useEffect } from 'react';

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
}

interface TreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  githubUrl: string;
}

function renderTree(node: TreeNode, level = 0): string {
  const indent = '  '.repeat(level);
  const prefix = node.type === 'directory' ? '📁 ' : '📄 ';
  let result = `${indent}${prefix}${node.name}\n`;
  
  if (node.children) {
    result += node.children
      .map(child => renderTree(child, level + 1))
      .join('');
  }
  
  return result;
}

export default function TreeModal({ isOpen, onClose, githubUrl }: TreeModalProps) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('TreeModal - Props reçues:', { isOpen, githubUrl });
    
    const fetchTreeData = async () => {
      if (!isOpen || !githubUrl) {
        console.log('TreeModal - Modal fermé ou URL manquante');
        return;
      }
      
      console.log('TreeModal - Début du chargement');
      setLoading(true);
      setError(null);
      
      try {
        console.log('TreeModal - Envoi de la requête API:', githubUrl);
        const response = await fetch('/api/github-tree', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ githubUrl }),
        });
        
        console.log('TreeModal - Statut de la réponse:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('TreeModal - Erreur API:', errorData);
          throw new Error(errorData.error || 'Erreur lors de la récupération de l\'arborescence');
        }
        
        const data = await response.json();
        console.log('TreeModal - Données reçues:', data);
        setTreeData(data.tree);
      } catch (error) {
        console.error('TreeModal - Erreur:', error);
        setError('Impossible de récupérer l\'arborescence du projet');
      } finally {
        setLoading(false);
        console.log('TreeModal - Chargement terminé');
      }
    };

    fetchTreeData();
  }, [isOpen, githubUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] shadow-2xl overflow-hidden">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 sticky top-0 z-10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Arborescence du projet
          </h2>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* État de chargement */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500">Chargement de l'arborescence...</p>
            </div>
          )}
          
          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {/* Arborescence */}
          {!loading && !error && treeData.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed">
                <code className="text-gray-100">
                  {treeData.map(node => renderTree(node)).join('')}
                </code>
              </pre>
            </div>
          )}

          {/* Pas de données */}
          {!loading && !error && treeData.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 