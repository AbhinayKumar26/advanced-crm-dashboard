"use client";

import { useState, useEffect } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";

export default function DealsPage() {
  const [isMounted, setIsMounted] = useState(false);
  
  // 🚀 Local State for Kanban Board
  const [columns, setColumns] = useState({
    new: {
      id: "new", title: "New Leads", badge: "bg-blue-500/10 text-blue-400",
      items: [
        { id: "d1", title: "Website Redesign", company: "Innovatech Inc.", value: "$12,500" },
        { id: "d2", title: "Cloud Migration", company: "Acme Corp", value: "$8,200" }
      ]
    },
    progress: {
      id: "progress", title: "In Progress", badge: "bg-amber-500/10 text-amber-400",
      items: [
        { id: "d3", title: "Enterprise License", company: "Wayne Enterprises", value: "$45,000" }
      ]
    },
    won: {
      id: "won", title: "Closed Won", badge: "bg-emerald-500/10 text-emerald-400",
      items: [
        { id: "d4", title: "Security Audit", company: "Globex", value: "$18,500" }
      ]
    }
  });

  useEffect(() => setIsMounted(true), []);

  // 🚀 Drag and Drop Logic
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceCol = columns[source.droppableId as keyof typeof columns];
      const destCol = columns[destination.droppableId as keyof typeof columns];
      const sourceItems = [...sourceCol.items];
      const destItems = [...destCol.items];
      const [removed] = sourceItems.splice(source.index, 1);
      
      destItems.splice(destination.index, 0, removed);
      setColumns({ ...columns,
        [source.droppableId]: { ...sourceCol, items: sourceItems },
        [destination.droppableId]: { ...destCol, items: destItems }
      });
      toast.success("Deal moved successfully!");
    } else {
      const column = columns[source.droppableId as keyof typeof columns];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({ ...columns, [source.droppableId]: { ...column, items: copiedItems } });
    }
  };

  const handleAddDeal = () => {
    const title = window.prompt("Enter Deal Name (e.g. Server Upgrade):");
    if (!title) return;
    const value = window.prompt("Enter Deal Value (e.g. $5,000):");
    const newDeal = { id: Date.now().toString(), title, company: "New Client", value: value || "$0" };
    
    setColumns({ ...columns,
      new: { ...columns.new, items: [newDeal, ...columns.new.items] }
    });
    toast.success("Deal added!");
  };

  if (!isMounted) return null;

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white tracking-tight">Deals Pipeline</h2>
        <button onClick={handleAddDeal} className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Add Deal
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
          {Object.entries(columns).map(([colId, column]) => (
            <div key={colId} className="bg-[#131825] border border-[#2e364f] rounded-xl p-4 w-full md:w-[350px] flex flex-col shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-200">{column.title}</h3>
                <span className={`${column.badge} py-0.5 px-2 rounded-md text-xs font-medium`}>{column.items.length} Deals</span>
              </div>

              <Droppable droppableId={colId}>
                {(provided, snapshot) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className={`flex-1 space-y-3 transition-colors rounded-lg ${snapshot.isDraggingOver ? 'bg-[#1a1f2e]/50 p-2' : ''}`}>
                    {column.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                            className={`bg-[#1a1f2e] p-4 rounded-lg border border-[#2e364f] hover:border-[#3b82f6]/50 transition-all ${snapshot.isDragging ? 'shadow-2xl scale-105 opacity-90' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium text-white text-sm">{item.title}</p>
                              <MoreHorizontal className="h-4 w-4 text-gray-500 cursor-pointer" />
                            </div>
                            <p className="text-xs text-gray-400">{item.company}</p>
                            <div className="mt-3 flex items-center justify-between text-xs">
                              <span className="text-[#10b981] font-medium bg-[#10b981]/10 px-2 py-0.5 rounded-sm">{item.value}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}