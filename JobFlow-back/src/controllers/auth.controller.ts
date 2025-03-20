import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import jwt, { type Secret } from "jsonwebtoken";
import mongoose, { Error } from "mongoose";
import User from "../models/user.model";

const { JWT_SECRET } = process.env;

export async function register(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName } = req.body;
    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
    });
    await newUser.save();
    res.status(201).json("User registed succesfully");
  } catch (error) {
    console.log(`auth.controller: `, (error as Error).message);
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      return res.status(400).json("User already exists");
    }
    res.status(500).json("Registration failed");
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`auth.controller: user not found`);
      return res.status(401).json("Email or password are incorrect");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      console.log(`auth.controller: password incorrect`);
      return res.status(401).json("Email or password are incorrect");
    }

    const { _id } = user.toJSON();

    const token = jwt.sign({ _id }, JWT_SECRET as Secret, { expiresIn: "1d" });
    res.status(200).json(token);
  } catch (error) {
    console.log(`auth.controller: `, (error as Error).message);
    res.status(500).json("Login failed");
  }
}
