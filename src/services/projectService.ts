import { ProjectInput } from '@/models/Project';

export const projectService = {
  async getProjects() {
    const response = await fetch('/api/projects');

    if (!response.ok) {
      throw new Error('Erreur de récupération des projets');
    }

    return response.json();
  },

  async createProject(projectData: ProjectInput) {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData)
    });

    if (!response.ok) {
      throw new Error('Erreur de création du projet');
    }

    return response.json();
  },

  async getProjectById(id: string) {
    const response = await fetch(`/api/projects/${id}`);

    if (!response.ok) {
      throw new Error('Erreur de récupération du projet');
    }

    return response.json();
  },

  async updateProject(id: string, projectData: Partial<ProjectInput>) {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData)
    });

    if (!response.ok) {
      throw new Error('Erreur de mise à jour du projet');
    }

    return response.json();
  },

  async deleteProject(id: string) {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Erreur de suppression du projet');
    }

    return response.json();
  }
}; 