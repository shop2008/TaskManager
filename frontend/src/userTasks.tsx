import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useMsal } from "@azure/msal-react";
import { Task } from "./Task";
import { API_URL } from "./constants";
import { apiRequest } from "./config/authConfig";
import { PublicClientApplication } from "@azure/msal-browser";

// Initialize MSAL client
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "",
    authority: `https://login.microsoftonline.com/${
      import.meta.env.VITE_AZURE_TENANT_ID
    }/v2.0`,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { instance, accounts } = useMsal();

  const getAccessToken = useCallback(async () => {
    if (accounts[0]) {
      try {
        const response = await instance.acquireTokenSilent({
          ...apiRequest,
          account: accounts[0],
        });
        return response.accessToken;
      } catch (error) {
        // If silent token acquisition fails, try interactive method
        const response = await instance.acquireTokenPopup(apiRequest);
        return response.accessToken;
      }
    }
    return null;
  }, [instance, accounts]);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      setError("Error fetching tasks. Please try again later.");
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  const addTask = useCallback(
    async (task: Omit<Task, "_id">) => {
      setIsLoading(true);
      setError(null);
      try {
        const token = await getAccessToken();
        await axios.post(API_URL, task, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchTasks();
      } catch (error) {
        setError("Error adding task. Please try again later.");
        console.error("Error adding task:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchTasks, getAccessToken]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      setIsLoading(true);
      setError(null);
      try {
        const token = await getAccessToken();
        await axios.put(`${API_URL}/${id}`, updates, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchTasks();
      } catch (error) {
        setError("Error updating task. Please try again later.");
        console.error("Error updating task:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchTasks, getAccessToken]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const token = await getAccessToken();
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchTasks();
      } catch (error) {
        setError("Error deleting task. Please try again later.");
        console.error("Error deleting task:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchTasks, getAccessToken]
  );

  useEffect(() => {
    const initializeMsal = async () => {
      await msalInstance.initialize();
      fetchTasks();
    };
    initializeMsal();
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
