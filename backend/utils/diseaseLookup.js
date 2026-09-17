import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const diseasesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/diseases.json'), 'utf-8')
);

const diseases = diseasesData.diseases;

/**
 * Look up a disease by name from the knowledge base.
 * Uses fuzzy matching — tries exact match first, then partial match.
 */
export function lookupDisease(diseaseName) {
  if (!diseaseName) return null;

  const normalizedInput = diseaseName.toLowerCase().trim();

  // Exact match on disease name
  const exactMatch = diseases.find(
    (d) => d.name.toLowerCase() === normalizedInput
  );
  if (exactMatch) return exactMatch;

  // Partial match — input contains disease name or vice versa
  const partialMatch = diseases.find(
    (d) =>
      d.name.toLowerCase().includes(normalizedInput) ||
      normalizedInput.includes(d.name.toLowerCase())
  );
  if (partialMatch) return partialMatch;

  // Fuzzy match — check if most words match
  const inputWords = normalizedInput.split(/\s+/);
  const fuzzyMatch = diseases.find((d) => {
    const diseaseWords = d.name.toLowerCase().split(/\s+/);
    const matchedWords = inputWords.filter((w) =>
      diseaseWords.some((dw) => dw.includes(w) || w.includes(dw))
    );
    return matchedWords.length >= Math.ceil(inputWords.length * 0.6);
  });

  return fuzzyMatch || null;
}

/**
 * Look up diseases by crop name.
 */
export function lookupByCrop(cropName) {
  if (!cropName) return [];

  const normalizedCrop = cropName.toLowerCase().trim();
  return diseases.filter((d) =>
    d.crops.some((c) => c.toLowerCase().includes(normalizedCrop))
  );
}

/**
 * Look up diseases by severity level.
 */
export function lookupBySeverity(severity) {
  return diseases.filter(
    (d) => d.severity.toLowerCase() === severity.toLowerCase()
  );
}

/**
 * Get all unique crops in the knowledge base.
 */
export function getAllCrops() {
  const crops = new Set();
  diseases.forEach((d) => d.crops.forEach((c) => crops.add(c)));
  return [...crops].sort();
}

/**
 * Get all unique disease names.
 */
export function getAllDiseaseNames() {
  return diseases.map((d) => d.name).sort();
}

/**
 * Match multiple diseases and return ranked results with confidence scores.
 */
export function matchDiseases(symptoms, cropType, topN = 3) {
  if (!symptoms || symptoms.length === 0) return [];

  const normalizedSymptoms = symptoms.map((s) => s.toLowerCase().trim());

  const scored = diseases.map((d) => {
    let score = 0;

    // Crop match bonus
    if (cropType) {
      const cropMatch = d.crops.some((c) =>
        c.toLowerCase().includes(cropType.toLowerCase())
      );
      if (cropMatch) score += 30;
    }

    // Symptom match
    normalizedSymptoms.forEach((symptom) => {
      d.symptoms.forEach((dSymptom) => {
        const dWords = dSymptom.toLowerCase().split(/\s+/);
        const sWords = symptom.split(/\s+/);
        const overlap = sWords.filter((w) =>
          dWords.some((dw) => dw.includes(w) || w.includes(dw))
        );
        score += (overlap.length / sWords.length) * 10;
      });
    });

    return { ...d, score };
  });

  return scored
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
