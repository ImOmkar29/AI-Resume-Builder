import { Router } from 'express';
import multer from 'multer';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/parse', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File required' });
    const mime = req.file.mimetype;
    let text = '';
    if (mime === 'application/pdf') {
      const data = await pdf(req.file.buffer);
      text = data.text ?? '';
    } else if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mime === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = result.value ?? '';
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }
    res.json({ text });
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? 'Parse failed' });
  }
});

export default router;


