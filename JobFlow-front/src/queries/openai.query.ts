import api from "@/lib/api";
import { RecommendedJob } from "@/pages/jobRecommendationsPage";
import { useQuery } from "@tanstack/react-query";

export function useGetJobRecommendations() {
  return useQuery({
    queryKey: ["job-recomendation"],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<RecommendedJob[]>(
        "openai/job-recomendation",
        {
          signal: signal,
        }
      );
      return data;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
