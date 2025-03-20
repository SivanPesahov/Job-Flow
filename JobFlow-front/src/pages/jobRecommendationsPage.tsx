import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetJobRecommendations } from "@/queries/openai.query";
import { motion } from "framer-motion";
import { FaLinkedin } from "react-icons/fa";
import { Link, Outlet } from "react-router-dom";

export interface RecommendedJob {
  title: string;
  description: string;
}

export const JobRecommendationsPage = () => {
  const { data: recommendedJobs, isFetching } = useGetJobRecommendations();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isFetching)
    return <img src="spiner.svg" alt="" className="w-40 my-auto mx-auto" />;

  return (
    <>
      <div className="flex justify-center mt-8 mb-4">
        <h1 className="text-3xl font-semibold text-gray-700">
          <span className="block text-orange-500 dark:text-indigo-600">
            Job Offers
          </span>
          Based on Your CV
        </h1>
      </div>
      {recommendedJobs?.map((job, index) => (
        <motion.div
          key={job.title}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          className="lg:px-[9.8em] px-2"
        >
          <Card className="my-4 border-2 border-orange-200 dark:border-none bg-gradient-to-tr from-orange-50 via-pink-50 to-red-50 dark:from-gray-800 dark:via-gray-900 dark:to-black overflow-y-auto">
            <CardHeader>
              <CardTitle className="mb-4">{job.title}</CardTitle>
              <CardDescription>{job.description}</CardDescription>
            </CardHeader>
            <CardContent></CardContent>
            <CardFooter>
              <Link to={`./linkedin?keywords=${job.title}`}>
                <Button variant="outline">
                  Show result on LinkedIn{" "}
                  <FaLinkedin className="text-blue-700" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
      <Outlet />
    </>
  );
};
