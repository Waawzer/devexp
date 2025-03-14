"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

const AVAILABLE_SKILLS = [
  "JavaScript",
  "Python",
  "React",
  "Node.js",
  "TypeScript",
  "HTML/CSS",
  "Front-end",
  "Back-end",
  "Base de données",
  "DevOps",
];

export default function CreateProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
}: CreateProjectModalProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    githubUrl: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [specifications, setSpecifications] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [projectType, setProjectType] = useState<'personnel' | 'collaboratif'>('personnel');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setError("Vous devez être connecté pour créer un projet");
      return;
    }

    setError("");
    setLoading(true);
    setIsGenerating(true);

    try {
      // Utiliser un timeout côté client pour éviter les attentes trop longues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout to match server limit
      
      try {
        // Afficher un message d'attente
        setError("Génération en cours... Cela peut prendre jusqu'à une minute.");
        
        const genResponse = await fetch("/api/ai-services", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "generate-project-content",
            data: {
              title,
              description,
              skills: selectedSkills.length > 0 ? selectedSkills.join(', ') : ''
            }
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!genResponse.ok) {
          // Vérifier si la réponse est du JSON valide
          const contentType = genResponse.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await genResponse.json();
            throw new Error(errorData.message || "Erreur lors de la génération du contenu");
          } else {
            // Si ce n'est pas du JSON, récupérer le texte brut
            const errorText = await genResponse.text();
            console.error("Réponse non-JSON reçue:", errorText);
            throw new Error("Erreur lors de la génération du contenu. Vérifiez les logs pour plus de détails.");
          }
        }

        const genData = await genResponse.json();
        console.log("Contenu généré avec succès");
        
        // Deuxième étape : Création du projet
        console.log("Création du projet...");
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            skills: selectedSkills, // Ici on garde le tableau pour la création du projet
            specifications: genData.specifications,
            img: genData.imageUrl,
            githubUrl: formData.githubUrl,
            projectType,
            visibility,
          }),
        });

        if (!response.ok) {
          // Vérifier si la réponse est du JSON valide
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erreur lors de la création du projet");
          } else {
            // Si ce n'est pas du JSON, récupérer le texte brut
            const errorText = await response.text();
            console.error("Réponse non-JSON reçue:", errorText);
            throw new Error("Erreur lors de la création du projet. Vérifiez les logs pour plus de détails.");
          }
        }

        // Réinitialiser le formulaire et fermer le modal
        setTitle("");
        setDescription("");
        setSelectedSkills([]);
        setFormData({ githubUrl: '' });
        setSpecifications(null);
        setProjectType('personnel');
        setVisibility('public');
        onProjectCreated();
        onClose();
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.error("La requête a été interrompue après le délai d'attente");
          setError(
            "La génération du contenu a pris trop de temps. Essayez avec une description plus courte ou réessayez plus tard quand le service sera moins chargé."
          );
        } else {
          throw fetchError;
        }
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl w-[600px] max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-700">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Créer un nouveau projet
          </h2>
        </div>

        {/* Barre de progression */}
        {loading && (
          <div className="relative w-full h-1 bg-gray-700">
            <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500 animate-gradient-x" 
                 style={{ width: isGenerating ? '60%' : '90%', transition: 'width 0.5s ease-in-out' }}>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Titre du projet
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 
                         text-gray-100 placeholder-gray-500
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                         transition-all duration-200"
                placeholder="Ex: Application de gestion de tâches"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 
                         text-gray-100 placeholder-gray-500
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                         transition-all duration-200"
                rows={4}
                placeholder="Décrivez votre projet en quelques phrases..."
                required
              />
            </div>
          </div>

          {/* Type de projet */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">
              Type de projet
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`
                relative flex flex-col items-center p-4 rounded-xl cursor-pointer
                border-2 transition-all duration-200
                ${projectType === 'personnel' 
                  ? 'border-indigo-500 bg-indigo-900/20' 
                  : 'border-gray-700 hover:border-indigo-600/50'}
              `}>
                <input
                  type="radio"
                  value="personnel"
                  checked={projectType === 'personnel'}
                  onChange={(e) => setProjectType(e.target.value as 'personnel' | 'collaboratif')}
                  className="sr-only"
                />
                <svg className="w-8 h-8 text-indigo-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium text-gray-100">Personnel</span>
                <span className="text-xs text-gray-400 text-center mt-1">
                  Projet individuel sans recrutement
                </span>
              </label>

              <label className={`
                relative flex flex-col items-center p-4 rounded-xl cursor-pointer
                border-2 transition-all duration-200
                ${projectType === 'collaboratif' 
                  ? 'border-indigo-500 bg-indigo-900/20' 
                  : 'border-gray-700 hover:border-indigo-600/50'}
              `}>
                <input
                  type="radio"
                  value="collaboratif"
                  checked={projectType === 'collaboratif'}
                  onChange={(e) => setProjectType(e.target.value as 'personnel' | 'collaboratif')}
                  className="sr-only"
                />
                <svg className="w-8 h-8 text-indigo-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium text-gray-100">Collaboratif</span>
                <span className="text-xs text-gray-400 text-center mt-1">
                  Ouvert aux collaborations
                </span>
              </label>
            </div>
          </div>

          {/* Visibilité du projet */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">
              Visibilité du projet
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`
                relative flex flex-col items-center p-4 rounded-xl cursor-pointer
                border-2 transition-all duration-200
                ${visibility === 'public' 
                  ? 'border-indigo-500 bg-indigo-900/20' 
                  : 'border-gray-700 hover:border-indigo-600/50'}
              `}>
                <input
                  type="radio"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                  className="sr-only"
                />
                <svg className="w-8 h-8 text-indigo-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
                <span className="font-medium text-gray-100">Public</span>
                <span className="text-xs text-gray-400 text-center mt-1">
                  Visible par tous les utilisateurs
                </span>
              </label>

              <label className={`
                relative flex flex-col items-center p-4 rounded-xl cursor-pointer
                border-2 transition-all duration-200
                ${visibility === 'private' 
                  ? 'border-indigo-500 bg-indigo-900/20' 
                  : 'border-gray-700 hover:border-indigo-600/50'}
              `}>
                <input
                  type="radio"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                  className="sr-only"
                />
                <svg className="w-8 h-8 text-indigo-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-medium text-gray-100">Privé</span>
                <span className="text-xs text-gray-400 text-center mt-1">
                  Visible uniquement par vous
                </span>
              </label>
            </div>
          </div>

          {/* Compétences requises */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">
              Compétences requises
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                    ${selectedSkills.includes(skill)
                      ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-500'
                      : 'bg-gray-700 text-gray-300 border border-gray-600 hover:border-indigo-500/50'
                    }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Lien GitHub */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lien GitHub (optionnel)
            </label>
            <input
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 
                       text-gray-100 placeholder-gray-500
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                       transition-all duration-200"
              placeholder="https://github.com/username/project"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-900/50 border border-red-700 rounded-xl text-red-200">
              {error}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-gray-100 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`
                px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 
                text-white rounded-xl font-medium
                hover:from-indigo-600 hover:to-blue-600 
                focus:ring-2 focus:ring-indigo-500/20 
                transform transition-all duration-200 
                hover:-translate-y-0.5
                disabled:opacity-50 disabled:cursor-not-allowed
                ${loading ? 'relative overflow-hidden' : ''}
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2">
                    {isGenerating ? 'Génération en cours' : 'Création en cours'}
                  </span>
                  <span className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </span>
                </span>
              ) : 'Créer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}