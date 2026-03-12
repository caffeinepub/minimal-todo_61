import { Toaster } from "@/components/ui/sonner";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type KeyboardEvent, useRef, useState } from "react";
import { toast } from "sonner";
import type { Todo } from "./backend.d";
import {
  useAddTodo,
  useDeleteTodo,
  useTodos,
  useToggleTodo,
} from "./hooks/useQueries";

type FilterType = "all" | "active" | "completed";

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: todos = [], isLoading } = useTodos();
  const addTodo = useAddTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();

  // Sort newest first
  const sortedTodos = [...todos].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  const filteredTodos = sortedTodos.filter((todo: Todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const activeCount = todos.filter((t: Todo) => !t.completed).length;

  const handleAdd = async () => {
    const text = inputValue.trim();
    if (!text) return;
    try {
      await addTodo.mutateAsync(text);
      setInputValue("");
      inputRef.current?.focus();
    } catch {
      toast.error("Failed to add todo. Please try again.");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdd();
  };

  const handleToggle = async (id: bigint) => {
    try {
      await toggleTodo.mutateAsync(id);
    } catch {
      toast.error("Failed to update todo.");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteTodo.mutateAsync(id);
    } catch {
      toast.error("Failed to delete todo.");
    }
  };

  return (
    <div className="min-h-screen bg-background paper-texture flex flex-col">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="pt-16 pb-8 px-4">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-baseline gap-3 mb-1">
              <h1 className="font-display text-5xl font-semibold tracking-tight text-foreground leading-none">
                My Tasks
              </h1>
              <motion.span
                key={activeCount}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-sans text-sm font-medium text-accent px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20"
              >
                {activeCount} left
              </motion.span>
            </div>
            <p className="font-sans text-sm text-muted-foreground mt-2">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 pb-16">
        <div className="max-w-xl mx-auto space-y-6">
          {/* Input area */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex gap-2"
          >
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                data-ocid="todo.input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What needs to be done?"
                className="w-full h-12 px-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"
                disabled={addTodo.isPending}
                aria-label="New todo text"
              />
            </div>
            <button
              type="button"
              data-ocid="todo.add_button"
              onClick={handleAdd}
              disabled={!inputValue.trim() || addTodo.isPending}
              aria-label="Add todo"
              className="h-12 w-12 rounded-lg bg-accent text-accent-foreground flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              {addTodo.isPending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full"
                />
              ) : (
                <Plus className="w-5 h-5" strokeWidth={2.5} />
              )}
            </button>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex gap-1 bg-muted rounded-lg p-1"
            role="tablist"
            aria-label="Filter todos"
          >
            {FILTERS.map((f) => (
              <button
                type="button"
                key={f.value}
                data-ocid="todo.filter.tab"
                role="tab"
                aria-selected={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={[
                  "flex-1 py-2 px-3 rounded-md text-sm font-medium font-sans transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                  filter === f.value
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {f.label}
              </button>
            ))}
          </motion.div>

          {/* Todo List */}
          {isLoading ? (
            <div
              data-ocid="todo.loading_state"
              className="space-y-3"
              aria-label="Loading todos"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-lg bg-muted animate-pulse"
                  style={{ opacity: 1 - (i - 1) * 0.2 }}
                />
              ))}
            </div>
          ) : (
            <ul data-ocid="todo.list" className="space-y-2">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredTodos.length === 0 ? (
                  <motion.output
                    key="empty"
                    data-ocid="todo.empty_state"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="py-16 text-center block"
                  >
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center">
                      <CheckSquare
                        className="w-7 h-7 text-muted-foreground"
                        strokeWidth={1.5}
                      />
                    </div>
                    <p className="font-display text-lg text-foreground/70">
                      {filter === "completed"
                        ? "No completed tasks yet"
                        : filter === "active"
                          ? "All caught up!"
                          : "Your list is empty"}
                    </p>
                    <p className="font-sans text-sm text-muted-foreground mt-1">
                      {filter === "all" && "Add a task above to get started"}
                    </p>
                  </motion.output>
                ) : (
                  filteredTodos.map((todo: Todo, index: number) => {
                    const position = index + 1;
                    return (
                      <motion.li
                        key={todo.id.toString()}
                        data-ocid={`todo.item.${position}`}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          x: -20,
                          height: 0,
                          marginBottom: 0,
                        }}
                        transition={{
                          layout: { duration: 0.25 },
                          opacity: { duration: 0.2 },
                          y: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                        }}
                        className={[
                          "group flex items-center gap-3 px-4 py-3.5 rounded-lg border bg-card list-none",
                          "hover:shadow-xs transition-shadow",
                          todo.completed ? "opacity-70" : "opacity-100",
                        ].join(" ")}
                      >
                        {/* Checkbox */}
                        <button
                          type="button"
                          data-ocid={`todo.checkbox.${position}`}
                          aria-checked={todo.completed}
                          onClick={() => handleToggle(todo.id)}
                          disabled={toggleTodo.isPending}
                          aria-label={`Mark "${todo.text}" as ${todo.completed ? "incomplete" : "complete"}`}
                          className={[
                            "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                            "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                            "disabled:cursor-not-allowed",
                            todo.completed
                              ? "bg-accent border-accent"
                              : "border-border hover:border-accent/60 bg-transparent",
                          ].join(" ")}
                        >
                          {todo.completed && (
                            <motion.svg
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.15, ease: "backOut" }}
                              viewBox="0 0 12 12"
                              className="w-3 h-3 text-accent-foreground"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M2 6l3 3 5-5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </motion.svg>
                          )}
                        </button>

                        {/* Text */}
                        <span
                          className={[
                            "flex-1 font-sans text-sm leading-relaxed min-w-0 break-words",
                            todo.completed
                              ? "text-muted-foreground line-through decoration-accent/60"
                              : "text-foreground",
                          ].join(" ")}
                        >
                          {todo.text}
                        </span>

                        {/* Delete */}
                        <button
                          type="button"
                          data-ocid={`todo.delete_button.${position}`}
                          onClick={() => handleDelete(todo.id)}
                          disabled={deleteTodo.isPending}
                          aria-label={`Delete "${todo.text}"`}
                          className={[
                            "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center",
                            "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                            "opacity-0 group-hover:opacity-100 transition-all duration-150",
                            "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40",
                            "disabled:cursor-not-allowed",
                          ].join(" ")}
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                      </motion.li>
                    );
                  })
                )}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center border-t border-border/50">
        <p className="font-sans text-xs text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
