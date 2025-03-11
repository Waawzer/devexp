"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { FaTimes, FaPlus } from "react-icons/fa";

interface CreateMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMissionCreated: () => void;
}

const PRIORITY_OPTIONS = [
  { value: "basse", label: "Basse", color: "bg-green-100 text-green-800" },
  { value: "moyenne", label: "Moyenne", color: "bg-blue-100 text-blue-800" },
  { value: "haute", label: "Haute", color: "bg-orange-100 text-orange-800" },
  { value: "urgente", label: "Urgente", color: "bg-red-100 text-red-800" },
];

export default function CreateMissionModal({
  isOpen,
  onClose,
  onMissionCreated,
}: CreateMissionModalProps) {
  const { data: session } = useSession();
  const [mission, setMission] = useState({
    title: "",
    description: "",
    skills: [] as string[],
    priority: "moyenne",
    deadline: "",
    estimatedHours: 0,
    projectId: "",
    assignedTo: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && session?.user) {
      fetchProjects();
      fetchUsers();
    }
  }, [isOpen, session]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects/my-projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      setError("Vous devez être connecté pour créer une mission");
      return;
    }

    if (!mission.title || !mission.description) {
      setError("Le titre et la description sont obligatoires");
      return;
    }
    
    // Formatez correctement les données
    const missionData = {
      title: mission.title,
      description: mission.description,
      skills: mission.skills,
      priority: mission.priority,
      // Convertir la date en format ISO si elle existe
      ...(mission.deadline ? { deadline: new Date(mission.deadline).toISOString() } : {}),
      // N'inclure estimatedHours que s'il est > 0
      ...(mission.estimatedHours > 0 ? { estimatedHours: mission.estimatedHours } : {}),
      // N'inclure projectId et assignedTo que s'ils ne sont pas vides
      ...(mission.projectId ? { projectId: mission.projectId } : {}),
      ...(mission.assignedTo ? { assignedTo: mission.assignedTo } : {})
    };
    
    console.log("Données à envoyer:", missionData);
    
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/missions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(missionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Réponse d'erreur:", errorData);
        throw new Error(errorData.message || "Erreur lors de la création de la mission");
      }
      
      const data = await response.json();
      toast.success("Mission créée avec succès");
      resetForm();
      onMissionCreated();
      onClose();
    } catch (error) {
      console.error("Erreur détaillée:", error);
      setError((error as Error).message);
      toast.error("Impossible de créer la mission");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMission({
      title: "",
      description: "",
      skills: [],
      priority: "moyenne",
      deadline: "",
      estimatedHours: 0,
      projectId: "",
      assignedTo: "",
    });
    setSkillInput("");
  };

  const addSkill = () => {
    if (skillInput.trim() && !mission.skills.includes(skillInput.trim())) {
      setMission({
        ...mission,
        skills: [...mission.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setMission({
      ...mission,
      skills: mission.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl w-[600px] max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-700">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 sticky top-0 z-10 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400 flex items-center gap-3">
              <FaPlus className="text-indigo-400" />
              <span>Créer une nouvelle mission</span>
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-indigo-400 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titre */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={mission.title}
              onChange={(e) => setMission({ ...mission, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900
                       text-gray-100 placeholder-gray-500
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                       transition-all duration-200"
              placeholder="Ex: Développement d'une API REST"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={mission.description}
              onChange={(e) => setMission({ ...mission, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900
                       text-gray-100 placeholder-gray-500
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                       transition-all duration-200"
              placeholder="Décrivez la mission en détail..."
              rows={4}
              required
            />
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priorité
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`
                    flex items-center justify-center p-3 rounded-xl cursor-pointer
                    border-2 transition-all duration-200 text-center
                    ${mission.priority === option.value
                      ? `${option.color} border-current`
                      : 'border-gray-700 text-gray-400 hover:border-indigo-500 hover:text-indigo-400'}
                  `}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={option.value}
                    checked={mission.priority === option.value}
                    onChange={(e) => setMission({ ...mission, priority: e.target.value })}
                    className="sr-only"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date d'échéance et heures estimées */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-2">
                Date d'échéance
              </label>
              <input
                type="date"
                id="deadline"
                value={mission.deadline}
                onChange={(e) => setMission({ ...mission, deadline: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900
                         text-gray-100
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                         transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-300 mb-2">
                Heures estimées
              </label>
              <input
                type="number"
                id="estimatedHours"
                value={mission.estimatedHours}
                onChange={(e) => setMission({ ...mission, estimatedHours: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900
                         text-gray-100
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                         transition-all duration-200"
                placeholder="0"
              />
            </div>
          </div>

          {/* Projet associé */}
          <div>
            <label htmlFor="projectId" className="block text-sm font-medium text-gray-300 mb-2">
              Projet associé
            </label>
            <select
              id="projectId"
              value={mission.projectId}
              onChange={(e) => setMission({ ...mission, projectId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900
                       text-gray-100
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                       transition-all duration-200"
            >
              <option value="">Sélectionner un projet</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          {/* Assigné à */}
          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-300 mb-2">
              Assigné à
            </label>
            <select
              id="assignedTo"
              value={mission.assignedTo}
              onChange={(e) => setMission({ ...mission, assignedTo: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900
                       text-gray-100
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                       transition-all duration-200"
            >
              <option value="">Sélectionner un utilisateur</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Compétences */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Compétences requises
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {mission.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg 
                           bg-gray-700 text-gray-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <FaTimes size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-700 bg-gray-900
                         text-gray-100 placeholder-gray-500
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                         transition-all duration-200"
                placeholder="Ajouter une compétence..."
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500
                         text-white font-medium hover:from-indigo-600 hover:to-blue-600
                         transition-all duration-200 shadow-lg shadow-indigo-500/20"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4">
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
              disabled={loading}
              className={`
                px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500
                text-white font-medium hover:from-indigo-600 hover:to-blue-600
                transition-all duration-200 shadow-lg shadow-indigo-500/20
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2
              `}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Création en cours...
                </>
              ) : (
                'Créer la mission'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 