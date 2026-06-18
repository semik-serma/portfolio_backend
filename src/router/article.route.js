import express from "express";
import { uploadImage } from "../utils/cloudinary.js";
import {
  createArticle,
  getArticles,
  updateArticle,
  deleteArticle,
  getarticlebyid,
} from "../controller/article.controller.js";
import { Article } from "../models/articleModels.js";

const Articleroute = express.Router();

Articleroute.post("/create", uploadImage.single("image"), createArticle);
Articleroute.get("/displayarticle", getArticles);
Articleroute.get('/display/:id',getarticlebyid);
Articleroute.put("/update/:id", uploadImage.single("image"), updateArticle);
Articleroute.delete("/delete/:id", deleteArticle);

export default Articleroute;
