import { ProjectInput } from '@/types/project';

export const projectService = {
  async getProjects() {
    const response = await fetch('/api/projects', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

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
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(projectData)
    });

    if (!response.ok) {
      throw new Error('Erreur de création du projet');
    }

    return response.json();
  }
}; 