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

// GET all PYQs
router.get('/pyqs', (req: Request, res: Response) => {
  const pyqs = dbStore.getPyqs();
  res.json({
    success: true,
    totalPapers: pyqs.length,
    pyqs,
  });
});

// GET PYQ by ID
router.get('/pyqs/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const pyq = dbStore.getPyqById(id);
  if (!pyq) {
    return res.status(404).json({ success: false, error: 'PYQ not found' });
  }
  res.json({ success: true, pyq });
});

// POST upload PYQ PDF (multipart or base64)
router.post('/upload/pyq', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let fileBuffer: Buffer | null = null;
    let fileName = 'Uploaded_PYQ.pdf';

    if (req.file) {
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname;
    } else if (req.body.base64Data) {
      fileBuffer = Buffer.from(req.body.base64Data, 'base64');
      fileName = req.body.fileName || 'Uploaded_PYQ.pdf';
    } else {
      return res.status(400).json({
        success: false,
        error: 'No file provided. Send multipart form-data with key "file" or JSON with "base64Data".',
      });
    }

    // Parse PYQ with 3-tier Gemini architecture
    const newPyq = await geminiService.parsePyq(fileBuffer, fileName);

    // Save to persistent database
    dbStore.savePyq(newPyq);

    res.json({
      success: true,
      message: `Successfully processed PYQ "${fileName}" (${(fileBuffer.length / 1024).toFixed(1)} KB). Extracted ${newPyq.questions.length} questions and marking schemes.`,
      pyq: newPyq,
      totalPyqs: dbStore.getPyqs().length,
    });
  } catch (error: any) {
    console.error('[PyqRoute] Error handling PYQ upload:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process PYQ PDF.',
    });
  }
});

// DELETE PYQ
router.delete('/pyqs/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const deleted = dbStore.deletePyq(id);
  res.json({
    success: deleted,
    message: deleted ? `Removed PYQ ${id}` : `PYQ ${id} not found.`,
    totalPyqs: dbStore.getPyqs().length,
  });
});

export default router;
