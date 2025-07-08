import express from "express";
import  jwt  from "jsonwebtoken";
import { middleware } from "./middleware";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types";
import { JWT_SECRET } from "@repo/backend-common/config";
import bcrypt from "bcrypt";


const app = express();

app.post("/signup", async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log(parsedData.error);
    return res.status(400).json({ message: "Invalid input fields" });
  }

  const { username, email, password } = parsedData.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prismaClient.user.create({
      data: {
        email,
        password: hashedPassword,
        name: username, 
      }
    });

    res.status(201).json({
      userId: user.id,
      message: "User created successfully"
    });

  } catch (e) {
    console.error(e);
    return res.status(409).json({
      message: "User already exists with this email"
    });
  }
});

app.post("signin", (req, res) =>{


});

app.post("/room", (req, res) => {
 
  
})


app.listen(3000, () => {
  console.log("HTTP server is running on port 3000");
});