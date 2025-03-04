"use client";

import { useState } from "react";
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

  const generateProjectContent = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/projects/project-services", {
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

      if (!response.ok) {
        throw new Error("Erreur lors de la génération du contenu");
      }

      const data = await response.json();
      setSpecifications(data.specifications);
      setFormData(prev => ({
        ...prev,
        img: data.imageUrl
      }));
    } catch (error) {
      console.error("Erreur:", error);
      setError("Erreur lors de la génération du contenu");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setError("Vous devez être connecté pour créer un projet");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          skills: selectedSkills.join(','),
          specifications,
          img: formData.img,
          githubUrl: formData.githubUrl
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
      onProjectCreated();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Créer un nouveau projet</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compétences requises (séparées par des virgules)
            </label>
            <input
              type="text"
              value={selectedSkills.join(', ')}
              onChange={(e) => setSelectedSkills(e.target.value.split(',').map(skill => skill.trim()))}
              className="w-full p-2 border rounded"
              placeholder="React, Node.js, TypeScript"
              required
            />
          </div>
          <div className="mb-4">
            <button
              type="button"
              onClick={generateProjectContent}
              disabled={isGenerating || !title || !description || selectedSkills.length === 0}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isGenerating ? "Génération en cours..." : "Générer le contenu"}
            </button>
          </div>
          {specifications && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Cahier des charges généré
              </h3>
              <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded text-sm">
                {specifications}
              </div>
            </div>
          )}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}