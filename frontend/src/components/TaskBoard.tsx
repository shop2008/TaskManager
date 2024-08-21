import React, { useState } from "react";
import { Task } from "../Task";
import { motion } from "framer-motion";
import { TASK_STATUSES } from "../constants";

interface TaskBoardProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const onDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = (column: Task["status"]) => {
    if (draggedTask && draggedTask.status !== column) {
      onUpdateTask(draggedTask._id, { status: column });
    }
    setDraggedTask(null);
  };

  const startEditing = (task: Task) => {
    setEditingTask({ ...task });
  };

  const saveEdit = async () => {
    if (editingTask) {
      await onUpdateTask(editingTask._id, editingTask);
      setEditingTask(null);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Task Board</h2>
      <div className="flex space-x-4">
        {TASK_STATUSES.map((column) => (
          <div
            key={column}
            className="flex-1 bg-gray-100 p-4 rounded-lg"
            onDragOver={onDragOver}
            onDrop={() => onDrop(column)}
          >
            <h3 className="text-xl font-semibold mb-4 capitalize">
              {column.replace("-", " ")}
            </h3>
            <ul className="space-y-3">
              {tasks
                .filter((task) => task.status === column)
                .map((task) => (
                  <motion.li
                    key={task._id}
                    draggable={!editingTask}
                    onDragStart={() => onDragStart(task)}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-move"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {editingTask && editingTask._id === task._id ? (
                      <div>
                        <input
                          type="text"
                          value={editingTask.title}
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              title: e.target.value,
                            })
                          }
                          className="font-semibold text-gray-800 mb-2 w-full border rounded px-2 py-1"
                        />
                        <textarea
                          value={editingTask.description}
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              description: e.target.value,
                            })
                          }
                          className="text-gray-600 text-sm mb-3 w-full border rounded px-2 py-1"
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={saveEdit}
                            className="bg-green-500 text-white px-2 py-1 rounded-md text-sm hover:bg-green-600 transition-colors duration-200"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingTask(null)}
                            className="bg-gray-500 text-white px-2 py-1 rounded-md text-sm hover:bg-gray-600 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-semibold text-gray-800 mb-2">
                          {task.title}
                        </h4>
                        <p className="text-gray-600 text-sm mb-3">
                          {task.description}
                        </p>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => startEditing(task)}
                            className="bg-blue-500 text-white px-2 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteTask(task._id)}
                            className="bg-red-500 text-white px-2 py-1 rounded-md text-sm hover:bg-red-600 transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </motion.li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskBoard;
