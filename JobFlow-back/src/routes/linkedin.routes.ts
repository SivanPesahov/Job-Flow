import { Router } from "express";
import {
  getLinkedInJobDetails,
  getLinkedInJobsList,
} from "../controllers/linkedin.controller";

const router = Router();

router.get("/list", getLinkedInJobsList);
router.get("/job/:jobId", getLinkedInJobDetails);

export default router;
