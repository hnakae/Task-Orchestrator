import { Check, Trash2, GripVertical } from "lucide-react";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  estimatedPomodoros?: number;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdatePomodoros: (id: string, count: number) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onUpdatePomodoros }: TodoItemProps) {
  return (
    <div className="group flex items-center gap-3 px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="text-gray-400 cursor-move">
        <GripVertical size={16} />
      </div>
      
      <button
        onClick={() => onToggle(todo.id)}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          todo.completed
            ? "bg-gray-400 border-gray-400"
            : "border-gray-400 hover:border-gray-500"
        }`}
      >
        {todo.completed && <Check size={14} className="text-white" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm transition-all ${
            todo.completed
              ? "line-through text-gray-400"
              : "text-gray-800"
          }`}
        >
          {todo.text}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdatePomodoros(todo.id, Math.max(0, (todo.estimatedPomodoros || 0) - 1))}
            className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs transition-colors"
          >
            −
          </button>
          <span className="text-xs text-gray-600 min-w-[20px] text-center">
            {todo.estimatedPomodoros || 0}
          </span>
          <button
            onClick={() => onUpdatePomodoros(todo.id, (todo.estimatedPomodoros || 0) + 1)}
            className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs transition-colors"
          >
            +
          </button>
        </div>

        <button
          onClick={() => onDelete(todo.id)}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
