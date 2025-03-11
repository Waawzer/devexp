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
          throw new Error(errorData.error || 'Erreur lors de la récupération de l&apos;arborescence');
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
      <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] shadow-2xl overflow-hidden border border-gray-700">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 sticky top-0 z-10 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Arborescence du projet
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 transition-colors p-2 rounded-lg hover:bg-gray-700/50"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh] bg-gray-800">
          {/* État de chargement */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400">Chargement de l'arborescence...</p>
            </div>
          )}
          
          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-900/20 text-red-200 p-4 rounded-xl flex items-center gap-3 border border-red-800">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}
          
          {/* Arborescence */}
          {!loading && !error && treeData.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto border border-gray-700">
              <pre className="font-mono text-sm leading-relaxed">
                <code className="text-gray-300">
                  {treeData.map(node => renderTree(node)).join('')}
                </code>
              </pre>
            </div>
          )}

          {/* Pas de données */}
          {!loading && !error && treeData.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p className="text-gray-400 font-medium">Aucune donnée disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 