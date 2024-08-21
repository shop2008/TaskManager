import React, { useState } from "react";
import { Task } from "../Task";
import { motion, AnimatePresence } from "framer-motion";

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [filter, setFilter] = useState<Task["status"] | "all">("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const startEditing = (task: Task) => {
    setEditingTask({ ...task });
  };

  const saveEdit = async () => {
    if (editingTask) {
      await onUpdateTask(editingTask._id, editingTask);
      setEditingTask(null);
    }
  };

  const filteredTasks = tasks.filter(
    (task) => filter === "all" || task.status === filter
  );

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Task List</h2>

      <div className="mb-4">
        <label htmlFor="filter" className="mr-2">
          Filter by status:
        </label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as Task["status"] | "all")}
          className="border rounded-md p-2 text-sm bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
        >
          <option value="all">All</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <AnimatePresence>
        {filteredTasks.map((task) => (
          <motion.div
            key={task._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-md mb-4 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex justify-between items-start">
              {editingTask && editingTask._id === task._id ? (
                <div>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, title: e.target.value })
                    }
                    className="font-semibold text-xl text-gray-800 mb-2 border rounded px-2 py-1"
                  />
                  <textarea
                    value={editingTask.description}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        description: e.target.value,
                      })
                    }
                    className="text-gray-600 mb-4 w-full border rounded px-2 py-1"
                  />
                  <button
                    onClick={saveEdit}
                    className="bg-green-500 text-white px-3 py-2 rounded-md text-sm hover:bg-green-600 transition-colors duration-200 mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingTask(null)}
                    className="bg-gray-500 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold text-xl text-gray-800 mb-2">
                    {task.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{task.description}</p>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <select
                  value={task.status}
                  onChange={(e) =>
                    onUpdateTask(task._id, {
                      status: e.target.value as Task["status"],
                    })
                  }
                  className="border rounded-md p-2 text-sm bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <button
                  onClick={() => onDeleteTask(task._id)}
                  className="bg-red-500 text-white px-3 py-2 rounded-md text-sm hover:bg-red-600 transition-colors duration-200"
                >
                  Delete
                </button>
                <button
                  onClick={() => startEditing(task)}
                  className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors duration-200"
                >
                  Edit
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TaskList;
