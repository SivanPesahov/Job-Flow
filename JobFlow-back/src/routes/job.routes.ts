import { Router } from "express";
import {
  createJob,
  deleteJob,
  editJob,
  getJob,
  getJobs,
  updateJobOrders,
} from "../controllers/job.controller";

const router = Router();

router.get("/", getJobs);
router.get("/:jobId", getJob);
router.post("/", createJob);
router.patch("/order", updateJobOrders);
router.patch("/:jobId", editJob);
router.delete("/:jobId", deleteJob);

export default router;
