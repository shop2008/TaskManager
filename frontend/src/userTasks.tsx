import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Task } from "./Task";
import { API_URL } from "./constants";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      setError("Error fetching tasks. Please try again later.");
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTask = useCallback(
    async (task: Omit<Task, "_id">) => {
      setIsLoading(true);
      setError(null);
      try {
        await axios.post(API_URL, task);
        fetchTasks();
      } catch (error) {
        setError("Error adding task. Please try again later.");
        console.error("Error adding task:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchTasks]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      setIsLoading(true);
      setError(null);
      try {
        await axios.put(`${API_URL}/${id}`, updates);
        fetchTasks();
      } catch (error) {
        setError("Error updating task. Please try again later.");
        console.error("Error updating task:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchTasks]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchTasks();
      } catch (error) {
        setError("Error deleting task. Please try again later.");
        console.error("Error deleting task:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchTasks]
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
  };
};
