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

      const response = await fetch('/api/projects/project-services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'generate-description',
          description: formData.description,
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
      <div className="bg-white rounded-2xl w-[800px] max-h-[85vh] overflow-hidden shadow-2xl">
        {/* En-tête fixe */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 sticky top-0 z-10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier le projet
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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informations principales */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                           transition-all duration-200"
                  required
                />
              </div>

              {/* Type de projet */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Type de projet</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`
                    relative flex flex-col items-center p-4 rounded-xl cursor-pointer
                    border-2 transition-all duration-200
                    ${formData.projectType === 'personnel' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-200'}
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
                    ${formData.projectType === 'collaboratif' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-200'}
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <div className="space-y-3">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                             transition-all duration-200"
                    rows={4}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGenerating || !formData.description}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium 
                             text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 
                             focus:outline-none focus:ring-2 focus:ring-offset-2 
                             focus:ring-blue-500 disabled:opacity-50 
                             disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" 
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" 
                                  stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" 
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        Améliorer la description
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Compétences */}
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

            {/* État et liens */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lien GitHub
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État du projet
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    status: e.target.value as ProjectStatus 
                  }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                           transition-all duration-200"
                >
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Images du projet</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden 
                                          border border-gray-200 bg-gray-50 p-3">
                    <div className="relative h-40 w-full mb-3">
                      <Image
                        src={image.url}
                        alt={image.caption || `Image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                                  transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 
                                   transform transition-all duration-200 hover:scale-110"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={image.caption || ''}
                      onChange={(e) => {
                        const newImages = [...formData.images];
                        newImages[index].caption = e.target.value;
                        setFormData(prev => ({ ...prev, images: newImages }));
                      }}
                      placeholder="Légende de l'image"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg 
                               focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                               transition-all duration-200"
                    />
                  </div>
                ))}
              </div>

              {/* Upload de nouvelle image */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500 
                             file:mr-4 file:py-2 file:px-4 file:rounded-full 
                             file:border-0 file:text-sm file:font-semibold
                             file:bg-blue-50 file:text-blue-700 
                             hover:file:bg-blue-100 
                             transition-all duration-200"
                  />
                  {newImage.url && (
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={newImage.caption}
                          onChange={(e) => setNewImage(prev => ({ 
                            ...prev, 
                            caption: e.target.value 
                          }))}
                          placeholder="Légende (optionnel)"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 
                                   focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                                   transition-all duration-200"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addImage}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 
                                 text-white rounded-xl font-medium hover:from-blue-600 
                                 hover:to-indigo-600 transition-all duration-200 
                                 transform hover:-translate-y-0.5"
                      >
                        Ajouter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3 pt-6 border-t">
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
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 
                         text-white rounded-xl font-medium hover:from-blue-600 
                         hover:to-indigo-600 transition-all duration-200 
                         transform hover:-translate-y-0.5"
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