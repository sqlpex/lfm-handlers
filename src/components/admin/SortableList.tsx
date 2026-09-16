"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, type ReactNode } from "react";

type Props<T extends { id: number }> = {
  items: T[];
  onReorder: (ids: number[]) => void;
  render: (item: T, handle: ReactNode) => ReactNode;
  className?: string;
};

export function SortableList<T extends { id: number }>({ items, onReorder, render, className }: Props<T>) {
  // Local order so the list moves instantly; re-synced whenever the server sends fresh items.
  const [state, setState] = useState({ source: items, order: items.map((i) => i.id) });
  if (state.source !== items) {
    setState({ source: items, order: items.map((i) => i.id) });
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const byId = new Map(items.map((i) => [i.id, i]));
  const ordered = state.order.map((id) => byId.get(id)).filter((x): x is T => Boolean(x));

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = state.order.indexOf(Number(active.id));
    const to = state.order.indexOf(Number(over.id));
    if (from < 0 || to < 0) return;
    const next = arrayMove(state.order, from, to);
    setState({ source: items, order: next });
    onReorder(next);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={state.order} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {ordered.map((item) => (
            <Row key={item.id} id={item.id}>
              {(handle) => render(item, handle)}
            </Row>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function Row({ id, children }: { id: number; children: (handle: ReactNode) => ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const handle = (
    <button
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      type="button"
      aria-label="Drag to reorder"
      className="shrink-0 cursor-grab touch-none select-none rounded px-1 text-[#6d6f78] hover:bg-[#3f4147] hover:text-white active:cursor-grabbing"
    >
      ⋮⋮
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "relative z-10 opacity-70" : undefined}
    >
      {children(handle)}
    </div>
  );
}
