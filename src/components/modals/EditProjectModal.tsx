"use client";

import { useState } from "react";
import { ProjectStatus } from '@/models/Project';

interface EditProjectModalProps {
  project: {
    _id: string;
    title: string;
    description: string;
    skills: string[];
    img: string;
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
    githubUrl: project.githubUrl || '',
    status: project.status || 'en développement'
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>(project.skills || []);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl mb-4">Modifier le projet</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Titre</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows={4}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Compétences</label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_SKILLS.map((skill) => (
                <label key={skill} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                    className="rounded text-blue-500"
                  />
                  <span className="text-sm">{skill}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lien GitHub
            </label>
            <input
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/username/repository"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              État du projet
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 