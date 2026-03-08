"use client";

import { useState, useEffect } from "react";
import { TodoItem, Todo } from "./TodoItem";
import { Plus, Sparkles } from "lucide-react";

const STORAGE_KEY = "pomofocus-todos";

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: inputValue.trim(),
        completed: false,
        estimatedPomodoros: 1,
      };
      setTodos([...todos, newTodo]);
      setInputValue("");
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const updatePomodoros = (id: string, count: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, estimatedPomodoros: count } : todo,
      ),
    );
  };

  const autoPrioritize = () => {
    const prioritized = [...todos].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      if (!a.completed && !b.completed) {
        const pomodorosA = a.estimatedPomodoros ?? 0;
        const pomodorosB = b.estimatedPomodoros ?? 0;
        if (pomodorosA !== pomodorosB) {
          return pomodorosA - pomodorosB;
        }
      }
      return 0;
    });
    setTodos(prioritized);
  };

  const incompleteTasks = todos.filter((t) => !t.completed).length;
  const totalPomodoros = todos
    .filter((t) => !t.completed)
    .reduce((sum, t) => sum + (t.estimatedPomodoros || 0), 0);

  return (
    <div className="min-h-[60vh] bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 flex items-center justify-center p-4 -m-5 rounded-lg">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl text-gray-800 dark:text-gray-200 mb-2">
            Tasks
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {incompleteTasks}{" "}
            {incompleteTasks === 1 ? "task" : "tasks"} remaining •{" "}
            {totalPomodoros} estimated pomodoros
          </p>
        </div>

        {/* Todo Container */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Input Section */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTodo()}
                placeholder="What are you working on?"
                className="flex-1 px-4 py-2.5 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-rose-400 dark:focus:border-rose-500 bg-transparent text-foreground"
              />
              <button
                type="button"
                onClick={addTodo}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>

          {/* Auto Prioritize Button */}
          {todos.length > 1 && (
            <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={autoPrioritize}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 border-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 rounded-lg transition-all flex items-center justify-center gap-2 hover:border-purple-400 dark:hover:border-purple-500"
              >
                <Sparkles size={16} />
                <span className="text-sm">Auto Prioritize</span>
              </button>
            </div>
          )}

          {/* Todo List */}
          <div className="max-h-[500px] overflow-y-auto">
            {todos.length === 0 ? (
              <div className="p-12 text-center text-gray-400 dark:text-gray-500">
                <p>No tasks yet. Add one to get started!</p>
              </div>
            ) : (
              todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onUpdatePomodoros={updatePomodoros}
                />
              ))
            )}
          </div>

          {/* Footer Stats */}
          {todos.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>
                {todos.filter((t) => t.completed).length} / {todos.length}{" "}
                completed
              </span>
              <button
                type="button"
                onClick={() =>
                  setTodos(todos.filter((t) => !t.completed))
                }
                className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              >
                Clear completed
              </button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-black/20 backdrop-blur rounded-lg p-4">
          <p className="mb-1">
            <strong>Tip:</strong> Use the pomodoro counter to estimate task
            duration
          </p>
          <p className="text-xs">
            Auto prioritize sorts tasks by completion status and estimated time
          </p>
        </div>
      </div>
    </div>
  );
}
