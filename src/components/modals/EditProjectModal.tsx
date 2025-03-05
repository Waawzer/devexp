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
    status: project.status || 'en développement'
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>(project.skills || []);
  const [newImage, setNewImage] = useState<{ url: string; caption: string }>({
    url: '',
    caption: ''
  });
  const [error, setError] = useState<string | null>(null);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Modifier le projet</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations principales */}
          <div className="space-y-4 pb-6 border-b border-gray-200">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Titre</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                required
              />
            </div>
          </div>

          {/* Compétences */}
          <div className="pb-6 border-b border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Compétences requises</label>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_SKILLS.map((skill) => (
                <label key={skill} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md">
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

          {/* Liens et État */}
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-200">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Lien GitHub
              </label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/username/repository"
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                État du projet
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
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
          <div>
            <h3 className="text-lg font-semibold mb-4">Images du projet</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group border rounded-lg p-2 bg-gray-50">
                  <div className="relative h-40 w-full mb-2">
                    <Image
                      src={image.url}
                      alt={image.caption || `Image ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
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
                    className="w-full text-sm p-2 border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <input
                  type="text"
                  value={newImage.caption}
                  onChange={(e) => setNewImage(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Légende (optionnel)"
                  className="flex-1 p-2 border rounded-md"
                />
                <button
                  type="button"
                  onClick={addImage}
                  disabled={!newImage.url}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 