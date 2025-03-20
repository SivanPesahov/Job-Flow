import { Schema, model } from "mongoose";
import type { IJob } from "../types/jobTypes";

const jobSchema = new Schema<IJob>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  position: {
    type: Schema.Types.String,
    required: true,
  },
  company: {
    type: Schema.Types.String,
    required: true,
  },
  company_logo: {
    type: Schema.Types.String,
    required: false,
  },
  location: {
    type: Schema.Types.String,
    required: true,
  },
  description: {
    type: Schema.Types.String,
    required: true,
  },
  salary: {
    type: Schema.Types.String,
    required: false,
  },
  link: {
    type: Schema.Types.String,
    required: true,
  },
  status: {
    type: Schema.Types.Number,
    required: true,
  },
  order: {
    type: Schema.Types.Number,
    required: false,
  },
  custom_resume_link: {
    type: Schema.Types.String,
    required: false,
  },
  interview_date: {
    type: Schema.Types.String,
    required: false,
  },
  contract_link: {
    type: Schema.Types.String,
    required: false,
  },
});

jobSchema.pre("save", async function (next) {
  const jobCount = await Job.countDocuments({
    userId: this.userId,
    status: this.status,
  });
  this.order = jobCount;
});

const Job = model<IJob>("Job", jobSchema);
export default Job;
