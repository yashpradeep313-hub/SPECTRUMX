/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { dbStore } from '../db/store';
import { geminiService } from '../services/gemini.service';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 35 * 1024 * 1024 },
});

// GET all scanned documents
router.get('/documents', (req: Request, res: Response) => {
  const documents = dbStore.getDocuments();
  res.json({
    success: true,
    total: documents.length,
    documents,
  });
});

// GET single document by ID
router.get('/documents/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const doc = dbStore.getDocumentById(id);
  if (!doc) {
    return res.status(404).json({ success: false, error: 'Document not found' });
  }
  res.json({ success: true, document: doc });
});

// POST analyze document (supports multipart file or base64/textContent)
router.post('/documents/analyze', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let fileName = 'Uploaded_Document.pdf';
    let fileType = 'application/pdf';
    let buffer: Buffer | undefined;
    let base64Data: string | undefined;
    let textContent: string | undefined;

    if (req.file) {
      fileName = req.file.originalname;
      fileType = req.file.mimetype;
      buffer = req.file.buffer;
    } else {
      fileName = req.body.fileName || 'Uploaded_Document.pdf';
      fileType = req.body.fileType || 'application/pdf';
      base64Data = req.body.base64Data;
      textContent = req.body.textContent;
      if (base64Data) {
        buffer = Buffer.from(base64Data, 'base64');
      }
    }

    const analyzedRecord = await geminiService.analyzeDocument({
      fileName,
      fileType,
      buffer,
      base64Data,
      textContent,
    });

    // Save to persistent database
    dbStore.saveDocument(analyzedRecord);

    res.json({
      success: true,
      document: analyzedRecord,
    });
  } catch (error: any) {
    console.error('[DocumentRoute] Error analyzing document:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST ask question against document
router.post('/documents/qa', async (req: Request, res: Response) => {
  try {
    const { fileName, fileType = 'application/pdf', base64Data, textContent, documentSummary, question } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ success: false, error: 'Question text is required.' });
    }

    const answer = await geminiService.askDocumentQuestion({
      fileName: fileName || 'Document',
      fileType,
      base64Data,
      textContent,
      documentSummary: documentSummary || '',
      question,
    });

    res.json({
      success: true,
      answer,
    });
  } catch (error: any) {
    console.error('[DocumentRoute] Error in document QA:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
