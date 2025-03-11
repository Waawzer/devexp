"use client";

import { useState } from "react";
import Image from "next/image";
import { ProjectStatus } from '@/models/Project';

interface ProjectImage {
  url: string;
  caption?: string;
}

interface EditProjectModalProps {
  project: {
    _id: string;
    title: string;
    description: string;
    skills: string[];
    img: string;
    images?: ProjectImage[];
    githubUrl?: string;
    status: ProjectStatus;
    projectType: 'personnel' | 'collaboratif';
    visibility: 'public' | 'private';
  };
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated: () => void;
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

const PROJECT_STATUSES: ProjectStatus[] = [
  'en développement',
  'en production',
  'en pause',
  'abandonné'
];

export default function EditProjectModal({ project, isOpen, onClose, onProjectUpdated }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    skills: project.skills,
    img: project.img,
    images: project.images || [],
    githubUrl: project.githubUrl || '',
    status: project.status || 'en développement',
    projectType: project.projectType || 'personnel',
    visibility: project.visibility || 'public',
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>(project.skills || []);
  const [newImage, setNewImage] = useState<{ url: string; caption: string }>({
    url: '',
    caption: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`/api/projects/${project._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...formData,
          skills: selectedSkills,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la modification du projet");
      }

      onProjectUpdated();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/projects/project-services', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Erreur lors du téléchargement');
      
      const { url } = await response.json();
      setNewImage(prev => ({ ...prev, url }));
    } catch (error) {
      console.error('Erreur upload:', error);
      setError('Erreur lors du téléchargement de l\'image');
    }
  };

  const addImage = () => {
    if (newImage.url) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
      setNewImage({ url: '', caption: '' });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateDescription = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch('/api/ai-services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-project-description',
          data: {
            description: formData.description,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la description');
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        description: data.description,
      }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl w-[800px] max-h-[85vh] overflow-hidden shadow-2xl border border-gray-700">
        {/* En-tête fixe */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 sticky top-0 z-10 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400 flex items-center gap-3">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier le projet
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-indigo-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] bg-gray-800">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informations principales */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900
                           text-gray-100 placeholder-gray-500
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                           transition-all duration-200"
                  required
                />
              </div>

              {/* Type de projet */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Type de projet</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`
                    relative flex flex-col items-center p-4 rounded-xl cursor-pointer
                    border-2 transition-all duration-200
                    ${formData.projectType === 'personnel' 
                      ? 'border-indigo-500 bg-indigo-900/20' 
                      : 'border-gray-700 hover:border-indigo-600/50'}
                  `}>
                    <input
                      type="radio"
                      name="projectType"
                      value="personnel"
                      checked={formData.projectType === 'personnel'}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        projectType: e.target.value as 'personnel' | 'collaboratif' 
                      }))}
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
                    ${formData.projectType === 'collaboratif' 
                      ? 'border-indigo-500 bg-indigo-900/20' 
                      : 'border-gray-700 hover:border-indigo-600/50'}
                  `}>
                    <input
                      type="radio"
                      name="projectType"
                      value="collaboratif"
                      checked={formData.projectType === 'collaboratif'}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        projectType: e.target.value as 'personnel' | 'collaboratif' 
                      }))}
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
                <label className="block text-sm font-medium text-gray-300">Visibilité du projet</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`
                    relative flex flex-col items-center p-4 rounded-xl cursor-pointer
                    border-2 transition-all duration-200
                    ${formData.visibility === 'public' 
                      ? 'border-indigo-500 bg-indigo-900/20' 
                      : 'border-gray-700 hover:border-indigo-600/50'}
                  `}>
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={formData.visibility === 'public'}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        visibility: e.target.value as 'public' | 'private' 
                      }))}
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
                    ${formData.visibility === 'private' 
                      ? 'border-indigo-500 bg-indigo-900/20' 
                      : 'border-gray-700 hover:border-indigo-600/50'}
                  `}>
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={formData.visibility === 'private'}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        visibility: e.target.value as 'public' | 'private' 
                      }))}
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

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <div className="relative">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900
                             text-gray-100 placeholder-gray-500
                             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                             transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGenerating}
                    className="absolute bottom-3 right-3 px-3 py-1.5 bg-gradient-to-r 
                             from-indigo-500 to-blue-500 text-white text-sm rounded-lg 
                             hover:from-indigo-600 hover:to-blue-600 transition-all duration-200 
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? 'Génération...' : 'Améliorer avec l\'IA'}
                  </button>
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

              {/* Statut du projet */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Statut du projet
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900
                           text-gray-100
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                           transition-all duration-200"
                >
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900
                           text-gray-100 placeholder-gray-500
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                           transition-all duration-200"
                  placeholder="https://github.com/username/project"
                />
              </div>

              {/* Images du projet */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Images du projet</label>
                
                {/* Liste des images existantes */}
                <div className="grid grid-cols-2 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video rounded-xl overflow-hidden border border-gray-700">
                        <Image
                          src={image.url}
                          alt={image.caption || `Image ${index + 1}`}
                          width={400}
                          height={225}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg 
                                 opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {image.caption && (
                        <p className="mt-1 text-sm text-gray-400 truncate">{image.caption}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Ajout d'une nouvelle image */}
                <div className="space-y-4 p-4 border border-gray-700 rounded-xl bg-gray-900/50">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ajouter une image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-400
                               file:mr-4 file:py-2 file:px-4
                               file:rounded-full file:border-0
                               file:text-sm file:font-medium
                               file:bg-indigo-900/50 file:text-indigo-300
                               hover:file:bg-indigo-900/70"
                    />
                  </div>
                  {newImage.url && (
                    <div className="space-y-4">
                      <div className="aspect-video rounded-xl overflow-hidden border border-gray-700">
                        <Image
                          src={newImage.url}
                          alt="Nouvelle image"
                          width={400}
                          height={225}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-4">
                        <input
                          type="text"
                          value={newImage.caption}
                          onChange={(e) => setNewImage(prev => ({ ...prev, caption: e.target.value }))}
                          placeholder="Légende de l'image (optionnel)"
                          className="flex-1 px-4 py-2 rounded-xl border border-gray-700 bg-gray-900
                                   text-gray-100 placeholder-gray-500
                                   focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                                   transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={addImage}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 
                                   text-white rounded-xl font-medium
                                   hover:from-indigo-600 hover:to-blue-600 
                                   transition-all duration-200"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                {error}
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-gray-700 text-gray-400
                         hover:bg-gray-700 hover:text-gray-200
                         transition-all duration-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500
                         text-white font-medium hover:from-indigo-600 hover:to-blue-600
                         transition-all duration-200 shadow-lg shadow-indigo-500/20"
              >
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 