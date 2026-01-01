
import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/dbService';
import { Project } from '../types';

export const useProjects = (onProjectSwitched?: () => void) => {
  const [currentProjectId, setCurrentProjectId] = useState('default-project');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    const all = await db.projects.toArray();
    setProjects(all.sort((a, b) => b.updatedAt - a.updatedAt));
  }, []);

  useEffect(() => {
    const init = async () => {
      const lastProjSetting = await db.settings.get('tessy-current-project');
      if (lastProjSetting) {
        setCurrentProjectId(lastProjSetting.value);
      }
      await loadProjects();
    };
    init();
  }, [loadProjects]);

  const switchProject = useCallback(async (id: string) => {
    setCurrentProjectId(id);
    await db.settings.put({ key: 'tessy-current-project', value: id });
    if (onProjectSwitched) onProjectSwitched();
    await loadProjects();
  }, [onProjectSwitched, loadProjects]);

  const openProjectModal = useCallback((id: string | null = null) => {
    setEditingProjectId(id);
    setIsProjectModalOpen(true);
  }, []);

  const closeProjectModal = useCallback(() => {
    setIsProjectModalOpen(false);
    setEditingProjectId(null);
    loadProjects();
  }, [loadProjects]);

  return {
    currentProjectId,
    projects,
    isProjectModalOpen,
    editingProjectId,
    switchProject,
    openProjectModal,
    closeProjectModal,
    loadProjects
  };
};
