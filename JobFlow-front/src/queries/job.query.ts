import api from "@/lib/api.ts";
import { IJob } from "@/types/job.types.ts";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

export function useGetFilteredJobs(filter: string) {
  const select = useCallback(
    (data: IJob[][]) =>
      data.map((jobs) =>
        jobs
          ? jobs.filter((job) =>
              job.position.toLowerCase().includes(filter.toLowerCase())
            )
          : []
      ),
    [filter]
  );
  return useGetAllJobs(select);
}

export function useGetAllJobs<T>(select: (data: IJob[][]) => T) {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<IJob[][]>("job", { signal });
      return data;
    },
    select,
  });
}

export function useGetJob(jobId: string) {
  return useQuery({
    queryKey: ["job", { jobId }],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<IJob>(`job/${jobId}`, { signal });
      return data;
    },
  });
}
