import { useCallback } from 'react';
import { Task } from '@/types/blocks';
import { useLocalStorage } from './useLocalStorage';

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('lemoncello-tasks', []);

  const addTask = useCallback((title: string, description: string = '') => {
    const newTask: Task = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      createdAt: new Date(),
      isCompleted: false,
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, [setTasks]);

  const updateTask = useCallback((id: string, updates: Partial<Pick<Task, 'title' | 'description'>>) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ));
  }, [setTasks]);

  const completeTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, isCompleted: true, completedAt: new Date() } : task
    ));
  }, [setTasks]);

  const uncompleteTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, isCompleted: false, completedAt: undefined } : task
    ));
  }, [setTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, [setTasks]);

  const getActiveTasks = useCallback(() => {
    return tasks.filter(task => !task.isCompleted);
  }, [tasks]);

  const getCompletedTasks = useCallback(() => {
    return tasks.filter(task => task.isCompleted);
  }, [tasks]);

  const getTaskById = useCallback((id: string) => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  return {
    tasks,
    addTask,
    updateTask,
    completeTask,
    uncompleteTask,
    deleteTask,
    getActiveTasks,
    getCompletedTasks,
    getTaskById,
  };
}
