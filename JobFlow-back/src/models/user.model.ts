import bcrypt from "bcrypt";
import { model, Schema } from "mongoose";
import type { IUser } from "../types/userTypes";

Schema.ObjectId.get((v) => v.toString());

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    resume_link: { type: String, required: false },
  },
  { toJSON: { virtuals: false, getters: true } }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = model("User", userSchema);
export default User;
