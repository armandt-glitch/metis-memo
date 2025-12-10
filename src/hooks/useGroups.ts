import { useState, useEffect } from 'react';
import { Group, GROUP_COLORS } from '@/types/flashcard';

const STORAGE_KEY = 'memo-groups';

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored).map((group: any) => ({
        ...group,
        createdAt: new Date(group.createdAt),
      }));
      setGroups(parsed);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }, [groups]);

  const addGroup = (name: string, color?: string) => {
    const newGroup: Group = {
      id: generateId(),
      name,
      color: color || GROUP_COLORS[groups.length % GROUP_COLORS.length].value,
      createdAt: new Date(),
    };
    setGroups((prev) => [...prev, newGroup]);
    return newGroup;
  };

  const deleteGroup = (id: string) => {
    setGroups((prev) => prev.filter((group) => group.id !== id));
  };

  const updateGroup = (id: string, name: string, color: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === id ? { ...group, name, color } : group
      )
    );
  };

  const getGroup = (id: string) => {
    return groups.find((group) => group.id === id);
  };

  return {
    groups,
    addGroup,
    deleteGroup,
    updateGroup,
    getGroup,
  };
};
