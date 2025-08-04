import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { ApiClient } from "./api-client";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Try to use offline-capable API client for supported endpoints
  try {
    if (method === 'POST' && url.includes('/api/tasks')) {
      const result = await ApiClient.createTask(data as any);
      return { json: () => Promise.resolve(result) } as Response;
    }
    
    if (method === 'PATCH' && url.includes('/api/tasks/')) {
      const id = url.split('/').pop()!;
      const result = await ApiClient.updateTask(id, data as any);
      return { json: () => Promise.resolve(result) } as Response;
    }
    
    if (method === 'DELETE' && url.includes('/api/tasks/')) {
      const id = url.split('/').pop()!;
      await ApiClient.deleteTask(id);
      return { json: () => Promise.resolve() } as Response;
    }
    
    if (method === 'POST' && url.includes('/api/water-intake')) {
      const result = await ApiClient.createOrUpdateWaterIntake(data as any);
      return { json: () => Promise.resolve(result) } as Response;
    }
    
    if (method === 'PATCH' && url.includes('/api/streak')) {
      const result = await ApiClient.updateStreak(data as any);
      return { json: () => Promise.resolve(result) } as Response;
    }
    
  } catch (error) {
    console.log('Falling back to server API:', error);
  }

  // Fallback to server API
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const endpoint = queryKey.join("/") as string;
    
    // Use offline-capable API client for common endpoints
    try {
      if (endpoint.includes('/api/tasks')) {
        const params = new URLSearchParams(endpoint.split('?')[1] || '');
        const date = params.get('date') || undefined;
        return await ApiClient.getTasks(date);
      }
      
      if (endpoint.includes('/api/water-intake')) {
        const params = new URLSearchParams(endpoint.split('?')[1] || '');
        const date = params.get('date');
        if (date) {
          return await ApiClient.getWaterIntake(date);
        }
      }
      
      if (endpoint.includes('/api/exercises')) {
        const params = new URLSearchParams(endpoint.split('?')[1] || '');
        const date = params.get('date') || undefined;
        const isWeekly = params.get('isWeekly') ? params.get('isWeekly') === 'true' : undefined;
        return await ApiClient.getExercises(date, isWeekly);
      }
      
      if (endpoint.includes('/api/mind-activities')) {
        const params = new URLSearchParams(endpoint.split('?')[1] || '');
        const date = params.get('date') || undefined;
        return await ApiClient.getMindActivities(date);
      }
      
      if (endpoint.includes('/api/routine-items')) {
        const params = new URLSearchParams(endpoint.split('?')[1] || '');
        const type = params.get('type') || undefined;
        return await ApiClient.getRoutineItems(type);
      }
      
      if (endpoint.includes('/api/goals')) {
        const params = new URLSearchParams(endpoint.split('?')[1] || '');
        const type = params.get('type') || undefined;
        return await ApiClient.getGoals(type);
      }
      
      if (endpoint.includes('/api/performance')) {
        const params = new URLSearchParams(endpoint.split('?')[1] || '');
        const date = params.get('date') || undefined;
        return await ApiClient.getPerformance(date);
      }
      
      if (endpoint.includes('/api/streak')) {
        return await ApiClient.getStreak();
      }
    } catch (error) {
      console.log('Falling back to server for query:', endpoint);
    }
    
    // Fallback to server API
    const res = await fetch(endpoint, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
