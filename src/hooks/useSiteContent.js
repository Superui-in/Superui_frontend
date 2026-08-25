import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';

export function useSiteContent(section) {
  return useQuery({
    queryKey: ['content', section],
    queryFn: () => api.get(`/content/${section}`).then(r => r.data.content),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });
}

export function useAllSiteContent() {
  return useQuery({
    queryKey: ['content', 'all'],
    queryFn: () => api.get('/content').then(r => r.data.contents),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });
}

export function useInvalidateContent() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['content'] });
  };
}
