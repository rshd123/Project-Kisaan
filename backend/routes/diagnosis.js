import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { generativeModel, firestore } from '../utils/vertex.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), async (req, res) => {
  const { farmerName } = req.body;
  
  // Validate input
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
    
    console.log('Calling Vertex AI...');
    const result = await generativeModel.generateContent({
      contents: [{
        role: 'user',
        parts: [
          {text: `ನೀವು ಕರ್ನಾಟಕ ರೈತರಿಗೆ ಸಹಾಯ ಮಾಡಿತ್ತಿದ್ದೀರಿ. ಈ ಸಸ್ಯದ ಎಲೆಯ ಚಿತ್ರವನ್ನನ್ನು ನೋಡಿ. 
          ದಯವಿಟ್ಟು ಕರ್ನಾಟಕದ ಹವಾಮಾನ ಮತ್ತು ಕೃಷಿ ಪರಿಸ್ಥಿತಿಯನ್ನ ಆಧಾರಿಸಿ, 
          ಈ ಎಲೆಯಿಲ್ಲಿ ಕಂಡುಬರುವ ರೋಗ ಅಥವಾ ಕೀಟಪೀಡೆ ಯಾವದು ಎ೦ದು ಗುರುತಿಸಿ.Converse in both english and Kannada.`},
          {inlineData: { mimeType: 'image/jpeg', data: fileData.toString('base64') }}
        ]
      }]
    });

    console.log('Vertex AI response received');
    let diagnosis;
    if (result && result.response && result.response.candidates && result.response.candidates[0]) {
      diagnosis = result.response.candidates[0].content.parts[0].text;
    } else if (result && result.candidates && result.candidates[0]) {
      diagnosis = result.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unable to parse diagnosis response from Vertex AI');
    }
    console.log('Diagnosis:', diagnosis);
    
    console.log('Saving to Firestore...');
    await firestore.collection('diagnosis').add({
      farmer: farmerName,
      diagnosis,
      image: req.file.originalname
    });

    console.log('Data saved to Firestore successfully');
    res.json({ success: true, diagnosis });
  } catch (err) {
    console.error('Diagnosis error:', err);
    res.status(500).json({ error: 'Failed to process diagnosis request' });
  } finally {
    // Clean up uploaded file
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
});

export default router;
