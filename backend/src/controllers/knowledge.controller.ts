import { Request, Response } from "express";
import { knowledgeImportService } from "../services/knowledge-import.service";

class KnowledgeController {
  async importKnowledge(req: Request, res: Response): Promise<void> {
    const files = this.extractFiles(req);

    if (!files.length) {
      res.status(400).json({ message: "Debe adjuntar al menos un archivo .txt o .md" });
      return;
    }

    const summary = await knowledgeImportService.importFiles(files);

    res.json(summary);
  }

  private extractFiles(req: Request): MulterUploadedFile[] {
    const requestWithFiles = req as RequestWithPossibleFiles;
    const files = requestWithFiles.files;

    if (!files) {
      return [];
    }

    if (Array.isArray(files)) {
      return files;
    }

    return Object.values(files).flat();
  }
}

export const knowledgeController = new KnowledgeController();

type RequestWithPossibleFiles = Request & {
  files?: MulterUploadedFile[] | Record<string, MulterUploadedFile[]>;
};

type MulterUploadedFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};
