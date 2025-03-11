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
      <div className="bg-white rounded-2xl w-[600px] max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <FaPlus />
              <span>Créer une nouvelle mission</span>
            </h2>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titre */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={mission.title}
              onChange={(e) => setMission({ ...mission, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                       transition-all duration-200"
              placeholder="Ex: Développement d'une API REST"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={mission.description}
              onChange={(e) => setMission({ ...mission, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                       transition-all duration-200"
              placeholder="Décrivez la mission en détail..."
              rows={4}
              required
            />
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priorité
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`
                    flex items-center justify-center p-3 rounded-xl cursor-pointer
                    border transition-all duration-200 text-center
                    ${mission.priority === option.value
                      ? `border-2 ${option.color} border-current`
                      : 'border-gray-200 hover:border-blue-200'}
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
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                Date d'échéance
              </label>
              <input
                type="date"
                id="deadline"
                value={mission.deadline}
                onChange={(e) => setMission({ ...mission, deadline: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                         transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-2">
                Heures estimées
              </label>
              <input
                type="number"
                id="estimatedHours"
                value={mission.estimatedHours}
                onChange={(e) => setMission({ ...mission, estimatedHours: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                         transition-all duration-200"
                min="0"
              />
            </div>
          </div>

          {/* Projet associé */}
          <div>
            <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2">
              Projet associé (optionnel)
            </label>
            <select
              id="projectId"
              value={mission.projectId}
              onChange={(e) => setMission({ ...mission, projectId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                       transition-all duration-200"
            >
              <option value="">Aucun projet</option>
              {projects.length === 0 ? (
                <option disabled>Chargement des projets...</option>
              ) : (
                projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Assigné à */}
          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
              Assigné à (optionnel)
            </label>
            <select
              id="assignedTo"
              value={mission.assignedTo}
              onChange={(e) => setMission({ ...mission, assignedTo: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                       transition-all duration-200"
            >
              <option value="">Non assigné</option>
              {users.length === 0 ? (
                <option disabled>Chargement des utilisateurs...</option>
              ) : (
                users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Compétences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compétences requises
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                         transition-all duration-200"
                placeholder="Ajouter une compétence"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <FaPlus />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {mission.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              ))}
              {mission.skills.length === 0 && (
                <span className="text-gray-500 italic">Aucune compétence ajoutée</span>
              )}
            </div>
          </div>

          {/* Erreur */}
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
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 
                       text-white rounded-xl font-medium hover:from-blue-600 
                       hover:to-indigo-600 transition-all duration-200 
                       disabled:opacity-50 transform hover:-translate-y-0.5 
                       disabled:hover:transform-none flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Création en cours...</span>
                </>
              ) : (
                <>
                  <FaPlus />
                  <span>Créer la mission</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 