import api from "@/lib/api";
import { LinkedInJob } from "@/pages/LinkedinJobList";
import { IJob } from "@/types/job.types";
import { useQuery } from "@tanstack/react-query";

export function useGetLinkedinJobDetails(jobId: string) {
  return useQuery({
    queryKey: ["linkedin", "job", { jobId }],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<Partial<IJob>>(`linkedin/job/${jobId}`, {
        signal,
      });
      return data;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useGetLinkedinJobList(
  keywords: string,
  location: string,
  sortBy: string = "recent"
) {
  return useQuery({
    queryKey: ["linkedin", "list", { keywords, location, sortBy }],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<LinkedInJob[]>(`linkedin/list`, {
        params: {
          keywords,
          location,
          sortBy,
        },
        signal,
      });
      return data;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!keywords && !!location,
  });
}
