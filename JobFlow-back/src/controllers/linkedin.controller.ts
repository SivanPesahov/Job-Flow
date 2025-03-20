import { Request, Response } from "express";
import path from "path";
import { runPythonScript } from "../utils/python.utils";

// function parseJobList(jobData: string) {
//   const $ = load(jobData);
//   const jobs = $("li");

//   const jobObjects = jobs
//     .map((index: number, element: any) => {
//       const job = $(element);
//       const position = job.find(".base-search-card__title").text().trim() || "";
//       const company =
//         job.find(".base-search-card__subtitle").text().trim() || "";
//       const location =
//         job.find(".job-search-card__location").text().trim() || "";
//       const date = job.find("time").attr("datetime") || "";
//       const salary =
//         job
//           .find(".job-search-card__salary-info")
//           .text()
//           .trim()
//           .replace(/\n/g, "")
//           .replaceAll(" ", "") || "";
//       const jobUrl = job.find(".base-card__full-link").attr("href") || "";
//       const companyLogo =
//         job.find(".artdeco-entity-image").attr("data-delayed-url") || "";
//       const agoTime =
//         job.find(".job-search-card__listdate").text().trim() || "";
//       return {
//         position: position,
//         company: company,
//         companyLogo: companyLogo,
//         location: location,
//         date: date,
//         agoTime: agoTime,
//         salary: salary,
//         jobUrl: jobUrl,
//       };
//     })
//     .get();

//   return jobObjects;
// }

// type QueryOptions = {
//   host?: string;
//   keyword?: string;
//   location?: string;
//   dateSincePosted?: "past month" | "past week" | "24hr";
//   jobType?:
//     | ""
//     | "internship"
//     | "full time"
//     | "full-time"
//     | "part time"
//     | "part-time"
//     | "contract"
//     | "temporary"
//     | "volunteer";
//   remoteFilter?: string;
//   salary?: string;
//   experienceLevel?:
//     | "internship"
//     | "entry level"
//     | "associate"
//     | "senior"
//     | "director"
//     | "executive";
//   sortBy?: string;
//   limit?: number;
// };

// // Helper functions to get query parameters
// const getDateSincePosted = (
//   dateSincePosted: "past month" | "past week" | "24hr"
// ): string => {
//   const dateRange = {
//     "past month": "r2592000",
//     "past week": "r604800",
//     "24hr": "r86400",
//   };
//   return dateRange[dateSincePosted];
// };

// const getExperienceLevel = (
//   experienceLevel:
//     | "internship"
//     | "entry level"
//     | "associate"
//     | "senior"
//     | "director"
//     | "executive"
// ): string => {
//   const experienceRange = {
//     internship: "1",
//     "entry level": "2",
//     associate: "3",
//     senior: "4",
//     director: "5",
//     executive: "6",
//   };
//   return experienceRange[experienceLevel];
// };

// const getJobType = (
//   jobType:
//     | ""
//     | "internship"
//     | "full time"
//     | "full-time"
//     | "part time"
//     | "part-time"
//     | "contract"
//     | "temporary"
//     | "volunteer" = ""
// ): string => {
//   if (jobType === "") {
//     return "";
//   }

//   const jobTypeRange = {
//     "full time": "F",
//     "full-time": "F",
//     "part time": "P",
//     "part-time": "P",
//     contract: "C",
//     temporary: "T",
//     volunteer: "V",
//     internship: "I",
//   };

//   return jobTypeRange[jobType];
// };

// const getRemoteFilter = (remoteFilter: string = ""): string => {
//   const remoteFilterRange = {
//     "on-site": "1",
//     "on site": "1",
//     remote: "2",
//     hybrid: "3",
//   };

//   return (
//     remoteFilterRange[
//       remoteFilter.toLowerCase() as keyof typeof remoteFilterRange
//     ] ?? ""
//   );
// };

// const getSalary = (salary: string = ""): string => {
//   const salaryRange = {
//     40000: "1",
//     60000: "2",
//     80000: "3",
//     100000: "4",
//     120000: "5",
//   };

//   const salaryNumber = Number(salary) as unknown as
//     | 40000
//     | 60000
//     | 80000
//     | 100000
//     | 120000;
//   return salaryRange[salaryNumber] ?? "";
// };
// // Main function to construct the URL
// const buildQueryUrl = (queryObj: QueryOptions, start: number): string => {
//   const host = queryObj.host || "www.linkedin.com";
//   const keyword = queryObj.keyword?.trim().replace(" ", "+") || "";
//   const location = queryObj.location?.trim().replace(" ", "+") || "";
//   const dateSincePosted = queryObj.dateSincePosted || "";
//   const jobType = queryObj.jobType || "";
//   const remoteFilter = queryObj.remoteFilter || "";
//   const salary = queryObj.salary || "";
//   const experienceLevel = queryObj.experienceLevel || "";
//   const sortBy = queryObj.sortBy || "";

//   let query = `https://${host}/jobs-guest/jobs/api/seeMoreJobPostings/search?`;
//   if (keyword !== "") query += `keywords=${keyword}`;
//   if (location !== "") query += `&location=${location}`;
//   if (dateSincePosted && getDateSincePosted(dateSincePosted) !== "")
//     query += `&f_TPR=${getDateSincePosted(dateSincePosted)}`;
//   if (getSalary(salary) !== "") query += `&f_SB2=${getSalary(salary)}`;
//   if (experienceLevel && getExperienceLevel(experienceLevel) !== "")
//     query += `&f_E=${getExperienceLevel(experienceLevel)}`;
//   if (getRemoteFilter(remoteFilter) !== "")
//     query += `&f_WT=${getRemoteFilter(remoteFilter)}`;
//   if (jobType && getJobType(jobType) !== "")
//     query += `&f_JT=${getJobType(jobType)}`;
//   query += `&start=${start}`;
//   if (sortBy === "recent" || sortBy === "relevant") {
//     let sortMethod = "R";
//     if (sortBy === "recent") sortMethod = "DD";
//     query += `&sortBy=${sortMethod}`;
//   }
//   return encodeURI(query);
// };

// const isValidExperienceLevel = (
//   value: any
// ): value is QueryOptions["experienceLevel"] => {
//   const validExperienceLevels: QueryOptions["experienceLevel"][] = [
//     "internship",
//     "entry level",
//     "associate",
//     "senior",
//     "director",
//     "executive",
//   ];
//   return validExperienceLevels.includes(value);
// };

// async function getJobs(req: Request, res: Response): Promise<void> {
//   const queryOptions: QueryOptions = {
//     keyword: (req.query.keyword as string) || "",
//     location: (req.query.location as string) || "",
//     dateSincePosted:
//       (req.query.dateSincePosted as "past month" | "past week" | "24hr") || "",
//     jobType:
//       (req.query.jobType as
//         | ""
//         | "internship"
//         | "full time"
//         | "full-time"
//         | "part time"
//         | "part-time"
//         | "contract"
//         | "temporary"
//         | "volunteer") || "",
//     remoteFilter: (req.query.remoteFilter as string) || "",
//     salary: (req.query.salary as string) || "",
//     experienceLevel: isValidExperienceLevel(req.query.experienceLevel)
//       ? (req.query.experienceLevel as QueryOptions["experienceLevel"])
//       : undefined,
//     sortBy: (req.query.sortBy as string) || "",
//     limit: parseInt(req.query.limit as string, 10) || 10, // Default to 10 if not provided
//   };

//   const MAX_RETRIES = 3;
//   const RETRY_DELAY_MS = 3000; // 3 seconds

//   let attempt = 0;

//   while (attempt < MAX_RETRIES) {
//     try {
//       const { data: html } = await axios.get(buildQueryUrl(queryOptions, 0));

//       // Ensure the response is a string (HTML)
//       if (typeof html !== "string") {
//         throw new Error("Expected HTML data but received something else.");
//       }
//       console.log(`linkedin.controller: `, html);
//       // Load HTML into cheerio
//       const jobs = parseJobList(html);

//       res.json({ jobs });
//       return;
//     } catch (error: any) {
//       console.error("Error querying LinkedIn jobs:", error.message);

//       if (error.response?.status === 429 && attempt < MAX_RETRIES - 1) {
//         attempt++;
//         console.log(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
//         await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
//       } else {
//         const statusCode = error.response?.status || 500;
//         const errorMessage =
//           error.response?.data?.error || "Failed to fetch job postings";
//         res.status(statusCode).json({ error: errorMessage });
//         return;
//       }
//     }
//   }
// }

export async function getLinkedInJobsList(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const commandLineArgs = [];
    for (const [key, value] of Object.entries(req.query)) {
      commandLineArgs.push(`--${key}`);
      commandLineArgs.push(value as string);
    }

    const pyScraper = path.join(
      path.resolve(__dirname, ".."),
      "python",
      "linkedin_scraper.py"
    );

    const data = await runPythonScript(pyScraper, ["list", ...commandLineArgs]);
    const jobs = JSON.parse(data);
    res.status(200).json(jobs);
  } catch (error) {
    console.log(`linkedin.controller: `, error);
    res.status(500).json("Error on server");
  }
}

export async function getLinkedInJobDetails(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { jobId } = req.params;

    const pyScraper = path.join(
      path.resolve(__dirname, ".."),
      "python",
      "linkedin_scraper.py"
    );

    const data = await runPythonScript(pyScraper, ["details", jobId]);
    const details = JSON.parse(data);
    res.status(200).json(details);
  } catch (error) {
    console.log(`linkedin.controller: `, error);
    res.status(500).json("Error on server");
  }
}
