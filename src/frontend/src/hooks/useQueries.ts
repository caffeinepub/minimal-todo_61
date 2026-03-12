import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Todo } from "../backend.d";
import { useActor } from "./useActor";

export function useTodos() {
  const { actor, isFetching } = useActor();
  return useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTodo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addTodo(text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useToggleTodo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.toggleTodo(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useDeleteTodo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteTodo(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
