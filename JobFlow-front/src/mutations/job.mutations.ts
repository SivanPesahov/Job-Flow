import api from "@/lib/api.ts";
import { IJob } from "@/types/job.types.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newJob: Partial<Omit<IJob, "_id">>) => {
      const { data } = await api.post<IJob>("job", newJob);
      return data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobs: IJob[]) => {
      const { data } = await api.patch<string>("job/order", {
        jobs: jobs.map((job) => ({
          _id: job._id,
          changes: { order: job.order, status: job.status },
        })),
      });
      return data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useEditJob() {
  const queryClient = useQueryClient();
  return useMutation<
    IJob,
    Error,
    { jobId: string; changes: Partial<Omit<IJob, "_id">> }
  >({
    mutationFn: async ({ jobId, changes }) => {
      const { data } = await api.patch<IJob>(`job/${jobId}`, changes);
      return data;
    },
    onMutate: ({ jobId, changes }) => {
      const prevJobs = queryClient.getQueryData<IJob[][]>(["jobs"]);
      queryClient.setQueryData(
        ["jobs"],
        prevJobs?.map((jobs) =>
          jobs?.map((job) => (job._id === jobId ? { ...job, ...changes } : job))
        )
      );
      queryClient.setQueryData(["job", { jobId }], (old: IJob) => {
        return { ...old, ...changes };
      });
      return { prevJobs };
    },
    onSettled: (job, error, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ["jobs", "job", jobId] });
    },
  });
}

export function useRemoveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await api.delete<IJob>(`job/${jobId}`);
      return data;
    },
    onMutate: (jobId: string) => {
      const prevJobs = queryClient.getQueryData<IJob[][]>(["jobs"]);
      queryClient.setQueryData(
        ["jobs"],
        prevJobs?.map((jobs) => jobs?.filter((job) => job._id !== jobId))
      );
      return { prevJobs };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
