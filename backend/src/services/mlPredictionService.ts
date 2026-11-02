import path from 'path';
import { spawn } from 'child_process';
import { query } from '../config/db';
import { StudentAssessmentContext } from './careerScoringService';

export interface MLPredictionTopItem {
  career: string;
  probability: number;
}

export interface MLPredictionResponse {
  model_version: string;
  predicted_career: string;
  top_predictions: MLPredictionTopItem[];
  career_node_scores: Record<string, number>;
  disclaimer: string;
}

// Path to ml/ directory and predict module
const ML_DIR = path.resolve(__dirname, '../../../ml');
const PREDICT_SCRIPT = path.join(ML_DIR, 'src', 'predict.py');

/**
 * Transforms StudentAssessmentContext into Python preprocessor feature payload
 */
export function buildPredictionPayload(context: StudentAssessmentContext): Record<string, any> {
  const payload: Record<string, any> = {};

  const isClass10 = context.currentClass <= 10;
  const subjects = context.enrolledSubjects || [];

  if (isClass10) {
    // Populate Class 10 core marks from enrolled subjects
    for (const sub of subjects) {
      const name = sub.subject_name.toLowerCase();
      const pct = sub.maximum_marks > 0 ? (sub.marks_obtained / sub.maximum_marks) * 100 : sub.marks_obtained;

      if (name.includes('math')) {
        payload['Class10_Maths'] = Math.round(pct);
      } else if (name.includes('scien')) {
        payload['Class10_Science'] = Math.round(pct);
      } else if (name.includes('sst') || name.includes('social')) {
        payload['Class10_SST'] = Math.round(pct);
      } else if (name.includes('eng')) {
        payload['Class10_English'] = Math.round(pct);
      } else {
        payload['Class10_Fifth_Subject'] = sub.subject_name;
        payload['Class10_Fifth_Marks'] = Math.round(pct);
      }
    }

    if (subjects.length > 0) {
      const totalMarks = subjects.reduce((acc, s) => acc + s.marks_obtained, 0);
      const totalMax = subjects.reduce((acc, s) => acc + s.maximum_marks, 0);
      payload['Class10_Percentage'] = totalMax > 0 ? Number(((totalMarks / totalMax) * 100).toFixed(2)) : 75.0;
    }

    // Default neutral stream for Class 10
    payload['Class12_Stream'] = 'None';
  } else {
    // Class 11 / 12 Student
    const stream = context.stream || 'PCM';
    let canonicalStream = 'PCM';
    const sUpper = stream.toUpperCase();
    if (sUpper.includes('PCMB')) canonicalStream = 'PCMB';
    else if (sUpper.includes('PCB')) canonicalStream = 'PCB';
    else if (sUpper.includes('COMMERCE')) canonicalStream = 'Commerce';
    else if (sUpper.includes('HUMANITIES') || sUpper.includes('ARTS')) canonicalStream = 'Arts';

    payload['Class12_Stream'] = canonicalStream;

    // Subject slots (Class12_Subject1_Name / Marks)
    subjects.slice(0, 5).forEach((sub, idx) => {
      const slotNum = idx + 1;
      const pct = sub.maximum_marks > 0 ? (sub.marks_obtained / sub.maximum_marks) * 100 : sub.marks_obtained;
      payload[`Class12_Subject${slotNum}_Name`] = sub.subject_name;
      payload[`Class12_Subject${slotNum}_Marks`] = Math.round(pct);
    });

    if (subjects.length > 0) {
      const totalMarks = subjects.reduce((acc, s) => acc + s.marks_obtained, 0);
      const totalMax = subjects.reduce((acc, s) => acc + s.maximum_marks, 0);
      payload['Class12_Percentage'] = totalMax > 0 ? Number(((totalMarks / totalMax) * 100).toFixed(2)) : 78.0;
    }
  }

  return payload;
}

function getPythonCommand(): string {
  if (process.env.PYTHON_PATH) return process.env.PYTHON_PATH;
  const fs = require('fs');
  const candidates = [
    path.join(process.env.LOCALAPPDATA || '', 'Python', 'bin', 'python.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python314', 'python.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python312', 'python.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python311', 'python.exe'),
    'python',
    'python3',
    'py',
  ];
  for (const c of candidates) {
    try {
      if (c && fs.existsSync(c)) return c;
    } catch {
      // Ignore filesystem access check errors
    }
  }
  return 'python';
}

/**
 * Invokes Python ML prediction subprocess asynchronously
 */
export async function invokePythonPredictor(
  payload: Record<string, any>,
  timeoutMs: number = 8000
): Promise<MLPredictionResponse | null> {
  return new Promise((resolve) => {
    try {
      const payloadStr = JSON.stringify(payload);
      const pythonCmd = getPythonCommand();
      const pythonProcess = spawn(pythonCmd, ['-m', 'src.predict', '--input-json', payloadStr], {
        cwd: ML_DIR,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
        },
      });

      let stdoutData = '';
      let stderrData = '';
      let isTimedOut = false;

      const timer = setTimeout(() => {
        isTimedOut = true;
        try {
          pythonProcess.kill();
        } catch {
          // Ignore kill error
        }
        console.warn(`[ML Prediction Service] Python prediction timed out after ${timeoutMs}ms. Using heuristic fallback.`);
        resolve(null);
      }, timeoutMs);

      pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        clearTimeout(timer);
        if (isTimedOut) return;

        if (code !== 0) {
          console.warn(`[ML Prediction Service] Python exited with code ${code}. Stderr: ${stderrData.slice(0, 300)}`);
          resolve(null);
          return;
        }

        try {
          // Parse JSON from stdout (ignoring any leading log lines)
          const jsonStart = stdoutData.indexOf('{');
          const jsonEnd = stdoutData.lastIndexOf('}');
          if (jsonStart === -1 || jsonEnd === -1) {
            console.warn('[ML Prediction Service] No JSON output found from Python stdout.');
            resolve(null);
            return;
          }

          const rawJson = stdoutData.substring(jsonStart, jsonEnd + 1);
          const parsed = JSON.parse(rawJson) as MLPredictionResponse;
          resolve(parsed);
        } catch (err: any) {
          console.warn(`[ML Prediction Service] Failed to parse Python prediction output: ${err.message}`);
          resolve(null);
        }
      });

      pythonProcess.on('error', (err) => {
        clearTimeout(timer);
        console.warn(`[ML Prediction Service] Failed to start Python process: ${err.message}`);
        resolve(null);
      });
    } catch (err: any) {
      console.warn(`[ML Prediction Service] Subprocess invocation error: ${err.message}`);
      resolve(null);
    }
  });
}

/**
 * Retrieves existing ML predictions or calculates them dynamically via Python ML model
 */
export async function getOrComputeMLPredictions(
  context: StudentAssessmentContext
): Promise<Record<string, number>> {
  // If already populated in context, return cached
  if (context.mlPredictions && Object.keys(context.mlPredictions).length > 0) {
    return context.mlPredictions;
  }

  // Build input payload and invoke model
  const payload = buildPredictionPayload(context);
  const result = await invokePythonPredictor(payload);

  if (result && result.career_node_scores && Object.keys(result.career_node_scores).length > 0) {
    const scores = result.career_node_scores;

    // Cache in PostgreSQL student_profiles if user_id present
    if (context.userId) {
      try {
        await query(
          `UPDATE student_profiles
           SET ml_predictions = $1,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $2`,
          [scores, context.userId]
        );
      } catch (dbErr: any) {
        console.warn(`[ML Prediction Service] Could not cache ML predictions in database: ${dbErr.message}`);
      }
    }

    return scores;
  }

  return {};
}
