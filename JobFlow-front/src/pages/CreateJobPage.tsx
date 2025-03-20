import { Button } from "@/components/ui/button.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { cn } from "@/lib/utils.ts";
import { useAddJob } from "@/mutations/job.mutations.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { MdWorkOutline } from "react-icons/md";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ScrollArea } from "../components/ui/scroll-area";

import MinimalTiptapEditor from "@/components/minimal-tiptap/minimal-tiptap";
import { useGetLinkedinJobDetails } from "@/queries/linkedin.query";
import { useEffect, useState } from "react";
import { z } from "zod";

export type JobValues = z.infer<typeof formSchema>;
const formSchema = z.object({
  position: z.string().min(2, "Title must be at least 2 characters long"),
  company: z.string().min(2, "Company must be at least 2 characters long"),
  company_logo: z.string().url("Must be a valid URL").optional(),
  location: z.string().min(2, "Location must be at least 2 characters long"),
  description: z
    .string()
    .min(2, "Description must be at least 2 characters long"),
  salary: z.number().min(0, "Salary must be a positive number").optional(),
  link: z.string().url("Must be a valid URL"),
  status: z.string(),
  interview_date: z.date().optional(),
});

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") || "0";
  const form = useForm<JobValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position: "",
      company: "",
      company_logo: "",
      location: "",
      description: "",
      salary: undefined,
      link: searchParams.get("linkedIn")
        ? `https://www.linkedin.com/jobs/view/${searchParams.get("linkedIn")}`
        : "",
      status: initialStatus,
      interview_date: undefined,
    },
  });

  const link = useWatch({ control: form.control, name: "link" });
  const status = useWatch({ control: form.control, name: "status" });
  const company_logo = useWatch({
    control: form.control,
    name: "company_logo",
  });

  const addJob = useAddJob();

  useEffect(() => {
    addJob.isSuccess && navigate("/dashboard");
  }, [addJob.isSuccess]);

  function onSubmit(values: JobValues) {
    console.log(`CreateJobPage: `, values);
    addJob.mutate(values);
  }

  const [linkedinJobId, setLinkedinJobId] = useState("");
  const { data: linkedinJobDetails, isFetching: linkedinJobDetailsLoading } =
    useGetLinkedinJobDetails(linkedinJobId);

  useEffect(() => {
    if (linkedinJobDetails) {
      form.setValue("position", linkedinJobDetails["position"]);
      form.setValue("company", linkedinJobDetails["company"]);
      form.setValue("company_logo", linkedinJobDetails["company_logo"]);
      form.setValue("location", linkedinJobDetails["location"]);
      form.setValue("description", linkedinJobDetails["description"]);
    }
  }, [linkedinJobDetails]);

  function fillDetails() {
    const jobId = link.replace(/\/$/, "").split("/").pop().split("-").pop();
    setLinkedinJobId(jobId);
  }

  return (
    <Dialog open onOpenChange={(open) => !open && navigate("..")}>
      <DialogContent className="lg:max-w-2xl lg:w-full h-[80vh] p-6 bg-gradient-to-br from-white via-pink-100 to-pink-200 dark:from-gray-900 dark:via-gray-800 dark:to-black shadow-xl rounded-2xl overflow-hidden transition-colors duration-300 ease-in-out">
        <DialogHeader>
          <DialogTitle className="text-gray-800 flex items-center gap-3 dark:text-gray-100">
            Create Job <MdWorkOutline className="text-orange-600" />
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center overflow-hidden px-8">
          <ScrollArea className="h-full w-full p-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="col-span-2 flex gap-4 justify-between items-end">
                    <FormField
                      control={form.control}
                      name="link"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-gray-700 dark:text-gray-300">
                            Link
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-2 focus:border-pink-500 dark:focus:border-indigo-500 focus-visible:ring-0 rounded-lg transition-colors duration-200"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {link.startsWith("https://www.linkedin.com/jobs/view") && (
                      <Button
                        onClick={(event) => {
                          fillDetails();
                          event.preventDefault();
                        }}
                        className="bg-gradient-to-r from-pink-500 to-orange-500 dark:from-indigo-600 dark:to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out"
                      >
                        {linkedinJobDetailsLoading
                          ? "Loading..."
                          : "Fill Details"}
                      </Button>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">
                          Position
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-2 focus:border-pink-500 dark:focus:border-indigo-500 focus-visible:ring-0 rounded-lg transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">
                          Location
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-2 focus:border-pink-500 dark:focus:border-indigo-500 focus-visible:ring-0 rounded-lg transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">
                          Company
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-2 focus:border-pink-500 dark:focus:border-indigo-500 focus-visible:ring-0 rounded-lg transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">
                          Company Logo Link
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-2 items-center">
                            {company_logo && (
                              <img
                                src={company_logo}
                                className="h-10 w-10 rounded-md"
                              />
                            )}
                            <Input
                              {...field}
                              className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-2 focus:border-pink-500 dark:focus:border-indigo-500 focus-visible:ring-0 rounded-lg transition-colors duration-200"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-gray-700 dark:text-gray-300">
                          Description
                        </FormLabel>
                        <FormControl>
                          <MinimalTiptapEditor
                            {...field}
                            className="w-full bg-background"
                            editorContentClassName="p-5"
                            output="html"
                            placeholder="Type your description here..."
                            autofocus={false}
                            editable={true}
                            editorClassName="focus:outline-none"
                            throttleDelay={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Salary Field */}
                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">
                          Salary
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-2 focus:border-pink-500 dark:focus:border-indigo-500 focus-visible:ring-0 rounded-lg transition-colors duration-200"
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Status Field */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">
                          Status
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-pink-500 dark:focus:ring-indigo-500 rounded-lg transition-colors duration-200">
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Wishlist</SelectItem>
                              <SelectItem value="1">Applied</SelectItem>
                              <SelectItem value="2">Interview</SelectItem>
                              <SelectItem value="3">Offer</SelectItem>
                              <SelectItem value="4">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {status === "2" && (
                    <FormField
                      control={form.control}
                      name="interview_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 mt-[0.1em]  dark:text-gray-300">
                            Interview Date
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 mt-0 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  if (date) {
                                    field.onChange(date);
                                  }
                                }}
                                disabled={(date) =>
                                  date < new Date() &&
                                  date.getTime() < new Date().getTime()
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {status === "3"}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-500 dark:from-indigo-700 dark:to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out"
                >
                  Submit
                </Button>

                {form.formState.errors.root && (
                  <div className="text-red-600">
                    {form.formState.errors.root.message}
                  </div>
                )}
              </form>
            </Form>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
