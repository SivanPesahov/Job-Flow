import Editable from "@/components/Editable.tsx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input.tsx";

import FileDropzone from "@/components/FileDropZone";
import MinimalTiptapEditor from "@/components/minimal-tiptap/minimal-tiptap";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Adjust the path as needed
import { useAuthContext } from "@/contexts/AuthContext";
import { uploadFile } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";
import {
  useEditJob,
  useRemoveJob,
  useUpdateJob,
} from "@/mutations/job.mutations.ts";
import { useCreateAIResume } from "@/mutations/openai.mutation";
import { useGetJob } from "@/queries/job.query.ts";
import { IJob } from "@/types/job.types";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import saveAs from "file-saver";
import {
  Brush,
  CalendarIcon,
  DollarSign,
  Link,
  MapPin,
  Trash,
} from "lucide-react";
import { useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { columns } from "./DashboardPage";

export const JobDetails = () => {
  const { user } = useAuthContext();
  const params = useParams();
  const { data: job } = useGetJob(params.jobId!);
  const navigate = useNavigate();
  const removeJob = useRemoveJob();
  const editJob = useEditJob();

  const status = columns[job?.status];
  const location = useLocation();

  const positionRef = useRef(null);
  const locationRef = useRef(null);
  const companyRef = useRef(null);
  const salaryRef = useRef(null);
  const descriptionRef = useRef(null);

  const handleRemoveJob = () => {
    if (job) {
      removeJob.mutate(job._id, {
        onSuccess: () => {
          navigate(location.state?.from || "..");
        },
      });
    } else {
      console.error("Job data is undefined, cannot remove the job.");
    }
  };

  const queryClient = useQueryClient();
  const update = useUpdateJob();
  async function handleEditStatus(newStatus: number) {
    const copy = queryClient
      .getQueryData<IJob[][]>(["jobs"])
      ?.map((jobs) => (jobs ? [...jobs] : []));

    const prevStatus = job.status;

    copy[prevStatus].splice(job.order, 1);
    copy[prevStatus] = copy[prevStatus].map((job, index) => ({
      ...job,
      order: index,
    }));

    if (copy[newStatus]) {
      copy[newStatus].push({ ...job, status: newStatus });
    } else {
      copy[newStatus] = [{ ...job, status: newStatus }];
    }
    copy[newStatus] = copy[newStatus].map((job, index) => ({
      ...job,
      order: index,
    }));
    queryClient.setQueryData(["job", { jobId: job._id }], (old: IJob) => {
      return { ...old, status: newStatus };
    });
    await update.mutateAsync(copy[newStatus].concat(copy[prevStatus]));
    queryClient.invalidateQueries({ queryKey: ["job", { jobId: job._id }] });
  }

  const createAIResume = useCreateAIResume();

  async function handleCreation() {
    try {
      createAIResume.mutate(job.description, {
        async onSuccess(data, variables, context) {
          saveAs(data, `${job.position} ${job.company} Resume.docx`);

          const fileUrl = await uploadFile(data);

          editJob.mutate({
            jobId: job._id,
            changes: { custom_resume_link: fileUrl },
          });
        },
      });
    } catch (error: any) {
      console.log(error);
    }
  }
  return (
    <>
      <Dialog open onOpenChange={(open) => !open && navigate("..")}>
        <DialogContent className="lg:max-w-2xl lg:w-full h-[80vh] p-6 bg-gradient-to-br from-whiteto-white dark:from-gray-900 dark:via-gray-800 dark:to-black shadow-xl rounded-2xl overflow-hidden transition-colors duration-300 ease-in-out">
          <DialogHeader>
            <DialogTitle className="text-2xl ">
              <Editable
                text={job?.position}
                inputRef={positionRef}
                onChange={(changes: any) => {
                  editJob.mutate({ jobId: job!._id, changes });
                }}
              >
                <Input
                  ref={positionRef}
                  defaultValue={job?.position}
                  name="position"
                />
              </Editable>
            </DialogTitle>
            <div className=" flex items-center gap-2">
              <Link size={16} />
              <a
                href={job?.link}
                target="_blank"
                rel="noopener noreferrer"
                className=" text-blue-600 dark:text-blue-400 underline"
              >
                {job?.link}
              </a>
            </div>
          </DialogHeader>
          <ScrollArea>
            <div className="grid gap-4 p-4">
              <div className="grid lg:grid-cols-2 grid-cols-1 items-center">
                <div className="flex items-center gap-2">
                  <MapPin
                    size={20}
                    className="text-orange-400 dark:text-orange-300"
                  />
                  <Editable
                    text={job?.location}
                    inputRef={locationRef}
                    onChange={(changes: any) => {
                      editJob.mutate({ jobId: job!._id, changes });
                    }}
                  >
                    <Input
                      ref={locationRef}
                      defaultValue={job?.location}
                      name="location"
                    />
                  </Editable>
                </div>
                <div className=" flex items-center gap-2">
                  <DollarSign
                    size={20}
                    className="text-green-600 dark:text-green-400"
                  />
                  <Editable
                    text={job?.salary}
                    inputRef={salaryRef}
                    placeholder={"Edit Salary"}
                    onChange={(changes: any) => {
                      editJob.mutate({ jobId: job!._id, changes });
                    }}
                  >
                    <Input
                      ref={salaryRef}
                      defaultValue={job?.salary}
                      name="salary"
                    />
                  </Editable>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <strong>Company:</strong>
                <div className="flex flex-row items-center justify-start gap-2">
                  {job?.company_logo && (
                    <img
                      src={job.company_logo}
                      className="w-12 h-12 rounded-sm"
                    />
                  )}
                  <Editable
                    text={job?.company}
                    inputRef={companyRef}
                    onChange={(changes: any) => {
                      editJob.mutate({ jobId: job!._id, changes });
                    }}
                  >
                    <Input
                      ref={companyRef}
                      defaultValue={job?.company}
                      name="company"
                    />
                  </Editable>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <strong>Description:</strong>
                <MinimalTiptapEditor
                  value={job?.description}
                  onChange={(value) => {
                    editJob.mutate({
                      jobId: job!._id,
                      changes: { description: value.toString() },
                    });
                  }}
                  className="w-full"
                  editorContentClassName="p-5"
                  output="html"
                  placeholder="Type your description here..."
                  autofocus={true}
                  editable={true}
                  editorClassName="focus:outline-none"
                  throttleDelay={5000}
                />
              </div>

              <div className="flex flex-col gap-2">
                <strong>Status:</strong>
                <Select
                  onValueChange={(value) => handleEditStatus(parseInt(value))}
                  value={job?.status.toString()}
                >
                  <SelectTrigger className="border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    <SelectItem value="0">Wishlist</SelectItem>
                    <SelectItem value="1">Applied</SelectItem>
                    <SelectItem value="2">Interview</SelectItem>
                    <SelectItem value="3">Offer</SelectItem>
                    <SelectItem value="4">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {job?.status === 2 && (
                <div className="flex flex-col gap-2">
                  <strong>Interview Date</strong>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[280px] justify-start text-left font-normal",
                          !job?.interview_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon />
                        {job?.interview_date ? (
                          format(new Date(job?.interview_date), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={new Date(job?.interview_date)}
                        onSelect={(date) => {
                          editJob.mutate({
                            jobId: job!._id,
                            changes: { interview_date: date.toISOString() },
                          });
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
              {job?.status === 3 && (
                <div className="flex flex-col gap-2">
                  <strong>Contract Link:</strong>
                  <a
                    href={job?.contract_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline"
                  >
                    {job?.contract_link}
                  </a>
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="sm:justify-between items-center flex-row ">
            <Button variant={"ghost"} size="icon" onClick={handleRemoveJob}>
              <Trash className="text-red-600 size-8" />
            </Button>
            {user?.resume_link ? (
              <div className="flex gap-4 items-center">
                {job?.custom_resume_link ? (
                  <Button
                    onClick={() => {
                      saveAs(
                        job?.custom_resume_link,
                        `${job.position} ${job.company} Resume.docx`
                      );
                    }}
                    className="border-pink-500 dark:indigo-600 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r from-pink-500 to-orange-500 dark:from-indigo-600 dark:to-purple-600"
                    variant={"outline"}
                  >
                    Download Resume
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="border-pink-500 dark:indigo-600 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r from-pink-500 to-orange-500 dark:from-indigo-600 dark:to-purple-600"
                        variant={"outline"}
                      >
                        Upload Resume
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Resume</DialogTitle>
                      </DialogHeader>
                      <FileDropzone
                        onFilesChange={async (files) => {
                          const url = await uploadFile(files[0]);
                          editJob.mutate({
                            jobId: job._id,
                            changes: { custom_resume_link: url },
                          });
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                )}
                <Button
                  onClick={handleCreation}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 dark:from-indigo-600 dark:to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out"
                >
                  <Brush />
                  {createAIResume.isPending
                    ? "Editing resume..."
                    : " AI Resume Writer"}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button className="bg-gradient-to-r from-pink-500 to-orange-500 dark:from-indigo-600 dark:to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out">
                  <a href="/create-resume">Create Resume</a>
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
