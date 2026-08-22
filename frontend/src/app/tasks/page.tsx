"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Clock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function TasksPage() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Follow up with Innovatech regarding proposal", date: "Today, 2:00 PM", completed: false, priority: "high" },
    { id: 2, title: "Prepare Q3 performance report for Acme Corp", date: "Tomorrow", completed: false, priority: "medium" },
    { id: 3, title: "Schedule onboarding call with Globex team", date: "Oct 25, 2023", completed: true, priority: "low" },
  ]);

  // 🚀 Toggle Task Status
  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // 🚀 Delete Task
  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
    toast.success("Task deleted!");
  };

  // 🚀 Add New Task
  const handleAddTask = () => {
    const title = window.prompt("Enter new task:");
    if (!title) return;
    const newTask = {
      id: Date.now(),
      title,
      date: "Just now",
      completed: false,
      priority: "medium"
    };
    setTasks([newTask, ...tasks]);
    toast.success("Task added!");
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white tracking-tight">My Tasks</h2>
        <button onClick={handleAddTask} className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> New Task
        </button>
      </div>

      <div className="bg-[#131825] border border-[#2e364f] rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 bg-[#1a1f2e] border-b border-[#2e364f] flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-200">
            Tasks ({completedCount}/{tasks.length} Completed)
          </h3>
        </div>
        
        <div className="divide-y divide-[#2e364f]">
          {tasks.length === 0 && (
            <p className="p-6 text-center text-gray-500 text-sm">All caught up! No tasks left.</p>
          )}

          {tasks.map((task) => (
            <div key={task.id} className="p-4 flex items-center justify-between hover:bg-[#1a1f2e]/50 transition-colors group">
              
              <div className="flex items-start gap-4 cursor-pointer" onClick={() => toggleTask(task.id)}>
                <button className="mt-0.5 shrink-0">
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-500 hover:text-[#3b82f6] transition-colors" />
                  )}
                </button>
                <div>
                  <p className={`text-sm font-medium transition-colors ${task.completed ? "text-gray-500 line-through" : "text-gray-200"}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-400">{task.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {task.priority === "high" && <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">High</span>}
                {task.priority === "medium" && <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Med</span>}
                
                <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}