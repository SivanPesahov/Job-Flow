import type { Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  resume_link?: string;
}
