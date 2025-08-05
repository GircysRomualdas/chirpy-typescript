import { Request, Response } from "express";
import { config } from "../config.js";

export async function handlerMetrics(req: Request, res: Response) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send(`Hits: ${config.fileserverHits}`);
  res.end();
}
