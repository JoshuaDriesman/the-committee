import express, { Request, Response } from "express";

const app = express();

app.set("port", process.env.PORT || 3000);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

export default app;
