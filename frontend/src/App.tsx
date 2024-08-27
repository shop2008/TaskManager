import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import TaskList from "./components/TaskList";
import TaskBoard from "./components/TaskBoard";
import TaskForm from "./components/TaskForm";
import Login from "./components/Login";
import { useTasks } from "./userTasks";
import { auth } from "./firebaseConfig";

const App: React.FC = () => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const { tasks, isLoading, error, addTask, updateTask, deleteTask } =
    useTasks();
  const [user, setUser] = useState<User | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-indigo-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="text-white text-xl font-bold">
                  Task Manager
                </span>
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    to="/"
                    className="text-gray-300 hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    List View
                  </Link>
                  <Link
                    to="/board"
                    className="text-gray-300 hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Board View
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAuthDialog(true)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                  >
                    Login / Register
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                {isLoading && (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                  </div>
                )}
                {error && (
                  <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                    role="alert"
                  >
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}
                {!isLoading && !error && (
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <TaskList
                          tasks={tasks}
                          onUpdateTask={updateTask}
                          onDeleteTask={deleteTask}
                        />
                      }
                    />
                    <Route
                      path="/board"
                      element={
                        <TaskBoard
                          tasks={tasks}
                          onUpdateTask={updateTask}
                          onDeleteTask={deleteTask}
                        />
                      }
                    />
                  </Routes>
                )}
              </div>
            </div>
          </div>
        </main>

        <Login
          auth={auth}
          isOpen={showAuthDialog}
          onClose={() => setShowAuthDialog(false)}
        />

        {showTaskForm && (
          <TaskForm
            onClose={() => setShowTaskForm(false)}
            onAddTask={addTask}
            isLoading={isLoading}
          />
        )}
      </div>
    </Router>
  );
};

export default App;
