import express, { Request, Response } from "express";
import mongoose, { mongo } from "mongoose";

const dbConn = mongoose.connect("mongodb://localhost/comm-test");
const schema = new mongoose.Schema({
  time: Number,
});
const Model = mongoose.model("Model", schema);

const app = express();

app.set("port", process.env.PORT || 3000);

app.get("/", (req: Request, res: Response) => {
  const stuff = new Model({ time: Date.now() });
  stuff.save();
  res.send("Hello World!");
});

export default app;
