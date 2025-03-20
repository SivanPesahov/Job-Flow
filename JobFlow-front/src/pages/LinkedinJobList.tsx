import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetLinkedinJobList } from "@/queries/linkedin.query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export interface LinkedInJob {
  id: string;
  position: string;
  company: string;
  location: string;
  date: string;
  job_url: string;
  company_logo: string;
  ago_time: string;
}

export default function LinkedinJobList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: jobs } = useGetLinkedinJobList(
    searchParams.get("keywords"),
    searchParams.get("location"),
    searchParams.get("sortBy")
  );
  return (
    <>
      <Dialog open onOpenChange={(open) => !open && navigate("..")}>
        <DialogContent className="content-start lg:max-w-2xl lg:w-full h-[80vh] p-6 bg-gradient-to-br from-white via-pink-100 to-pink-200 dark:from-gray-900 dark:via-gray-800 dark:to-black shadow-xl rounded-2xl overflow-hidden transition-colors duration-300 ease-in-out">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Search LinkedIn Jobs
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-4">
            <Input
              placeholder="Enter keywords"
              value={searchParams.get("keywords") || ""}
              onChange={(e) =>
                setSearchParams((prev) => {
                  prev.set("keywords", e.target.value);
                  return prev;
                })
              }
              className="mb-4 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            />
            <Input
              placeholder="Enter location"
              value={searchParams.get("location") || ""}
              onChange={(e) =>
                setSearchParams((prev) => {
                  prev.set("location", e.target.value);
                  return prev;
                })
              }
              className="mb-4 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            />
          </div>

          <ScrollArea className="h-full w-full px-4 ">
            <div className="grid gap-4">
              {jobs?.map((job, index) => (
                <Card className="shadow-lg border border-gray-200 rounded-lg dark:bg-gray-700 ">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold dark:text-gray-200 text-gray-800">
                      {job.position}
                    </CardTitle>
                    <CardDescription>{job.location}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="flex flex-row items-center justify-start gap-2">
                        {job.company_logo && (
                          <img
                            src={job.company_logo}
                            className="w-12 h-12 rounded-sm"
                          />
                        )}
                        <p>{job.company}</p>
                      </div>
                      <p>Posted {job.ago_time}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <div className="flex gap-4">
                      <Link
                        to={`https://www.linkedin.com/jobs/view/${job.id}`}
                        target="_blank"
                      >
                        <Button
                          className="border-pink-500 dark:indigo-600 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r from-pink-500 to-orange-500 dark:from-indigo-600 dark:to-purple-600"
                          variant={"outline"}
                        >
                          View Job
                        </Button>
                      </Link>
                      <Link to={`/dashboard/create?linkedIn=${job.id}`}>
                        <Button className="bg-gradient-to-r from-pink-500 to-orange-500 dark:from-indigo-600 dark:to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out">
                          Add Job
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
