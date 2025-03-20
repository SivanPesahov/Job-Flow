import type { Request, Response } from "express";
import Job from "../models/job.model";
import { AuthRequest } from "../types/authTypes";
import { IJob } from "../types/jobTypes";

export async function getJobs(req: Request, res: Response) {
  const userId = (req as AuthRequest).userId;
  try {
    const jobs = await Job.find({ userId: userId }).sort({
      status: 1,
      order: 1,
    });
    const sortedJobs = jobs.reduce<IJob[][]>((acc, job) => {
      if (!acc[job.status]) {
        acc[job.status] = [];
      }
      acc[job.status].push(job);
      return acc;
    }, []);

    res.status(200).json(sortedJobs);
  } catch (error) {
    console.log(`job.controller: `, (error as Error).message);
    res.status(500).json("Server error getting all jobs");
  }
}

export async function getJob(req: Request, res: Response) {
  const { jobId } = req.params;
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      console.log(`job.controller: Not found `, jobId);
      return res.status(401).json("No job found");
    }

    res.status(200).json(job);
  } catch (error) {
    console.log(`job.controller: `, (error as Error).message);
    res.status(500).json("Server error getting job");
  }
}

export async function createJob(req: Request, res: Response) {
  const userId = (req as AuthRequest).userId;
  try {
    const newJob = new Job({ ...req.body, userId });
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    error as Error;
    console.log(`job.controller: `, (error as Error).message);
    if ((error as Error).name === "ValidationError") {
      res.status(400).json((error as Error).message);
    } else {
      res.status(500).json("Server error while creating job");
    }
  }
}

export async function editJob(req: Request, res: Response) {
  const { jobId } = req.params;
  try {
    const updatedJob = await Job.findOneAndUpdate(
      { _id: jobId },
      { ...req.body },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedJob) {
      console.log(`job.controller: Not found `, jobId);
      return res.status(401).json("No job found");
    }

    res.status(200).json(updatedJob);
  } catch (error) {
    console.log(`job.controller: `, (error as Error).message);
    if ((error as Error).name === "ValidationError") {
      res.status(400).json((error as Error).message);
    } else {
      res.status(500).json({ message: "Server error while updating job" });
    }
  }
}
export async function updateJobOrders(req: Request, res: Response) {
  try {
    const bulkOps = req.body.jobs.map((obj: any) => {
      const ops = {
        updateOne: {
          filter: {
            _id: obj._id,
          },
          update: {
            order: obj.changes.order,
            status: obj.changes.status,
          },
        },
      };
      return ops;
    });
    const updatedJobs = await Job.bulkWrite(bulkOps);
    if (!updatedJobs) {
      console.log(`job.controller: Not found `);
      return res.status(401).json("No job found");
    }

    res.status(200).json("Updated");
  } catch (error) {
    console.log(`job.controller: error `, (error as Error).message);
    if ((error as Error).name === "ValidationError") {
      res.status(400).json((error as Error).message);
    } else {
      res.status(500).json({ message: "Server error while updating job" });
    }
  }
}

export async function deleteJob(req: Request, res: Response) {
  const { jobId } = req.params;
  try {
    const deletedJob = await Job.findOneAndDelete({
      _id: jobId,
    });

    if (!deletedJob) {
      console.log(`job.controller: Not found `, jobId);
      res.status(404).json("No job found");
    }
    res.status(200).json("Job deleted succesfuly");
  } catch (error) {
    console.log(`job.controller: `, (error as Error).message);
    res.status(500).json("Server error deleting job");
  }
}
