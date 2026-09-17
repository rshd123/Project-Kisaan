import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { generativeModel, supabase } from '../utils/vertex.js';
import { lookupDisease } from '../utils/diseaseLookup.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const STRUCTURED_PROMPT = `You are a crop disease expert helping farmers in Karnataka, India.

Analyze this plant leaf image and return a JSON response with the following structure:
{
  "disease_name": "Name of the disease (in English)",
  "crop_type": "Name of the crop (in English)",
  "confidence": "high or medium or low",
  "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "description": "Brief explanation of what you observe on the leaf and what disease it indicates"
}

Rules:
- Return ONLY valid JSON, no markdown, no explanation outside the JSON
- If you cannot identify a disease, set disease_name to "Unknown" and confidence to "low"
- List 3-5 visible symptoms from the image
- Keep description under 100 words
- Be specific about the disease name (e.g., "Late Blight" not just "blight")`;

router.post('/', upload.single('image'), async (req, res) => {
  const { farmerName } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  if (!farmerName) {
    return res.status(400).json({ error: 'Farmer name is required' });
  }

  const imagePath = req.file.path;

  try {
    console.log('Reading image file:', imagePath);
    const fileData = fs.readFileSync(imagePath);
    console.log('Image file read successfully, size:', fileData.length);

    // Convert image to base64 for Google AI SDK
    const imageBase64 = fileData.toString('base64');

    console.log('Calling Google AI with structured prompt...');
    const result = await generativeModel.generateContent([
      STRUCTURED_PROMPT,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      }
    ]);

    console.log('Google AI response received');
    const responseText = result.response.text();

    // Parse the structured JSON response
    let diagnosis;
    try {
      diagnosis = JSON.parse(responseText);
    } catch {
      diagnosis = {
        disease_name: 'Unknown',
        crop_type: 'Unknown',
        confidence: 'low',
        symptoms: [],
        description: responseText
      };
    }

    console.log('AI diagnosis:', diagnosis);

    // Look up disease in local knowledge base
    let kbData = lookupDisease(diagnosis.disease_name);
    if (kbData) {
      console.log('Knowledge base match found:', kbData.name);
    } else {
      console.log('No knowledge base match for:', diagnosis.disease_name);
    }

    // Merge AI response with knowledge base data
    const mergedDiagnosis = {
      disease_name: diagnosis.disease_name || 'Unknown',
      crop_type: diagnosis.crop_type || 'Unknown',
      confidence: diagnosis.confidence || 'low',
      symptoms: diagnosis.symptoms || [],
      description: diagnosis.description || '',
      treatment: kbData
        ? kbData.treatments
        : [{ name: 'Consult local agricultural officer', dosage: 'N/A', cost: 'N/A', frequency: 'N/A' }],
      prevention: kbData
        ? kbData.prevention
        : ['Consult local agricultural officer for prevention methods'],
      severity: kbData ? kbData.severity : 'unknown',
      cause: kbData ? kbData.cause : 'Unable to determine from image alone',
      season: kbData ? kbData.season : 'N/A',
      government_scheme: kbData
        ? kbData.government_scheme
        : 'Visit your nearest agricultural office for available schemes'
    };

    console.log('Saving to Supabase...');
    const { error } = await supabase
      .from('diagnosis')
      .insert({
        farmer: farmerName,
        disease_name: mergedDiagnosis.disease_name,
        crop_type: mergedDiagnosis.crop_type,
        severity: mergedDiagnosis.severity,
        confidence: mergedDiagnosis.confidence,
        diagnosis: mergedDiagnosis.description,
        treatment: mergedDiagnosis.treatment,
        prevention: mergedDiagnosis.prevention,
        image: req.file.originalname
      });

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error('Failed to save diagnosis to database');
    }

    console.log('Data saved to Supabase successfully');
    res.json({ success: true, diagnosis: mergedDiagnosis });
  } catch (err) {
    console.error('Diagnosis error:', err);
    res.status(500).json({ error: 'Failed to process diagnosis request' });
  } finally {
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
});

export default router;
