import { Router } from "express";
import multer from "multer";
import { knowledgeController } from "../controllers/knowledge.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/knowledge/import", upload.array("files"), (req, res, next) => {
  knowledgeController
    .importKnowledge(req, res)
    .catch(next);
});

export default router;
