import api from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useCreateAIResume() {
  return useMutation({
    mutationFn: async (description: string) => {
      const { data: blob } = await api.post(
        "openai/job-matcher",
        {
          description,
        },
        {
          responseType: "blob",
        }
      );
      return blob;
    },
  });
}
