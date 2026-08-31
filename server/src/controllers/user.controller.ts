import { Request,Response } from "express";
import {prisma} from "../lib/prisma.js"
export async function createUser(req:Request, res:Response) {
  try {
    const {username} =req.body;
    if(!username){
      return res.status(400).json({
        message:"username is required bruv"
      });
    }

    const user= await prisma.user.create({
      data:{username}
    });

    return res.status(200).json(user);
  } catch (error) {
      console.log(error);
      return res.status(500).json({
        message:"user couldnt be created bruv"
      });
  }
}