import { VertexAI } from '@google-cloud/vertexai';
import { Firestore } from '@google-cloud/firestore';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const project = process.env.PROJECT_ID;
const location = process.env.LOCATION;

if (!project || !location) {
  throw new Error('Missing PROJECT_ID or LOCATION in .env');
}

// Set the service account credentials
const serviceAccountPath = path.join(__dirname, '../project-kisan-key.json');
console.log('Service account path:', serviceAccountPath);

process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountPath;

const firestore = new Firestore({ projectId: project });

const vertexAI = new VertexAI({
  project: project,
  location: location,
});

const generativeModel = vertexAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

export { firestore, generativeModel };
