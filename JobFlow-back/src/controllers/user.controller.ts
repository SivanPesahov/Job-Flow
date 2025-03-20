import type { Request, Response } from "express";
import User from "../models/user.model";
import type { AuthRequest } from "../types/authTypes";

export async function getUser(req: Request, res: Response) {
  const userId = (req as AuthRequest).userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log(`user.controller: Not found `, userId);
      return res.status(401).json("No user found");
    }

    const { password, ...userWithoutPassword } = user.toJSON();

    res.status(200).json({
      ...userWithoutPassword,
    });
  } catch (error) {
    console.log(`user.controller: `, (error as Error).message);
    res.status(500).json("Server error getting user");
  }
}

interface UserChanges {
  resume_link: string;
}
export async function editUser(
  req: Request<unknown, unknown, UserChanges, unknown>,
  res: Response
) {
  const userId = (req as AuthRequest).userId;
  const { resume_link } = req.body;
  try {
    const user = await User.findById(userId);

    if (!user) {
      console.log(`auth.controller: user not found`);
      return res.status(401).json("User not found");
    }

    user.resume_link = resume_link;

    user.save();
    res.status(200).json("User details changed");
  } catch (error) {
    console.log(`user.controller: `, (error as Error).message);
    if ((error as Error).name === "ValidationError") {
      res.status(400).json((error as Error).message);
    } else {
      res.status(500).json({ message: "Server error while updating user" });
    }
  }
}

export async function deleteUser(req: Request, res: Response) {
  const userId = (req as AuthRequest).userId;
  try {
    const deletedUser = await User.findOneAndDelete({
      _id: userId,
    });

    if (!deletedUser) {
      console.log(`user.controller: `, userId);
      res.status(404).json("No user found");
    }
    res.status(200).json("User deleted succesfuly");
  } catch (error) {
    console.log(`user.controller: `, (error as Error).message);
    res.status(500).json("Server error deleting user");
  }
}
