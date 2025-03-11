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
      const genResponse = await fetch("/api/projects/project-services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          skills: selectedSkills.join(', ')
        }),
      });

      if (!genResponse.ok) {
        throw new Error("Erreur lors de la génération du contenu");
      }

      const genData = await genResponse.json();

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          skills: selectedSkills,
          specifications: genData.specifications,
          img: genData.imageUrl,
          githubUrl: formData.githubUrl,
          projectType,
          visibility,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du projet");
      }

      setTitle("");
      setDescription("");
      setSelectedSkills([]);
      setFormData({ githubUrl: '' });
      setSpecifications(null);
      setProjectType('personnel');
      setVisibility('public');
      onProjectCreated();
      onClose();
    } catch (err) {
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
      <div className="bg-white rounded-2xl w-[600px] max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Créer un nouveau projet
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du projet
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                         transition-all duration-200"
                placeholder="Ex: Application de gestion de tâches"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                         transition-all duration-200"
                rows={4}
                placeholder="Décrivez votre projet en quelques phrases..."
                required
              />
            </div>
          </div>

          {/* Type de projet */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Type de projet
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`
                relative flex flex-col items-center p-4 rounded-xl cursor-pointer
                border-2 transition-all duration-200
                ${projectType === 'personnel' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-200'}
              `}>
                <input
                  type="radio"
                  value="personnel"
                  checked={projectType === 'personnel'}
                  onChange={(e) => setProjectType(e.target.value as 'personnel' | 'collaboratif')}
                  className="sr-only"
                />
                <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium text-gray-900">Personnel</span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  Projet individuel sans recrutement
                </span>
              </label>

              <label className={`
                relative flex flex-col items-center p-4 rounded-xl cursor-pointer
                border-2 transition-all duration-200
                ${projectType === 'collaboratif' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-200'}
              `}>
                <input
                  type="radio"
                  value="collaboratif"
                  checked={projectType === 'collaboratif'}
                  onChange={(e) => setProjectType(e.target.value as 'personnel' | 'collaboratif')}
                  className="sr-only"
                />
                <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium text-gray-900">Collaboratif</span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  Ouvert aux collaborations
                </span>
              </label>
            </div>
          </div>

          {/* Visibilité du projet */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Visibilité du projet
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`
                relative flex flex-col items-center p-4 rounded-xl cursor-pointer
                border-2 transition-all duration-200
                ${visibility === 'public' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-200'}
              `}>
                <input
                  type="radio"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                  className="sr-only"
                />
                <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-medium text-gray-900">Public</span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  Visible par tous les utilisateurs
                </span>
              </label>

              <label className={`
                relative flex flex-col items-center p-4 rounded-xl cursor-pointer
                border-2 transition-all duration-200
                ${visibility === 'private' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-200'}
              `}>
                <input
                  type="radio"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                  className="sr-only"
                />
                <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-medium text-gray-900">Privé</span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  Visible uniquement par vous et vos collaborateurs
                </span>
              </label>
            </div>
          </div>

          {/* Compétences requises */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Compétences requises
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AVAILABLE_SKILLS.map((skill) => (
                <label key={skill} className={`
                  flex items-center gap-2 p-3 rounded-xl cursor-pointer
                  border transition-all duration-200
                  ${selectedSkills.includes(skill)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'}
                `}>
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                    className="rounded text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          {/* URL GitHub */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL GitHub (optionnel)
            </label>
            <input
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/username/repository"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                       transition-all duration-200"
            />
          </div>

          {/* États de chargement et erreurs */}
          {(loading || isGenerating) && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>{isGenerating ? "Génération du contenu..." : "Création du projet..."}</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl">
              {error}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 font-medium hover:text-gray-900 
                       transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || isGenerating}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 
                       text-white rounded-xl font-medium hover:from-blue-600 
                       hover:to-indigo-600 transition-all duration-200 
                       disabled:opacity-50 transform hover:-translate-y-0.5 
                       disabled:hover:transform-none"
            >
              {loading || isGenerating ? "Création en cours..." : "Créer le projet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}