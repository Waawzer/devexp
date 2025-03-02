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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Arborescence du projet</h2>
          <button onClick={onClose}>✕</button>
        </div>
        
        {loading && (
          <div className="text-center py-4">
            Chargement de l'arborescence...
          </div>
        )}
        
        {error && (
          <div className="text-red-500 py-4">
            {error}
          </div>
        )}
        
        {!loading && !error && treeData.length > 0 && (
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto font-mono text-sm">
            {treeData.map(node => renderTree(node)).join('')}
          </pre>
        )}
      </div>
    </div>
  );
} 