import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for long-running screening

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Save uploaded file to temp directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hackathon-'));
    const csvPath = path.join(tempDir, 'upload.csv');
    await fs.writeFile(csvPath, buffer);

    // Run Python screening script
    const pythonDir = path.join(process.cwd(), 'api', 'python');
    const screeningScript = path.join(pythonDir, 'screening_api.py');

    const results = await runPythonScreening(screeningScript, csvPath);

    // Clean up temp file
    await fs.rm(tempDir, { recursive: true, force: true });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Screening error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

function runPythonScreening(scriptPath: string, csvPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', [scriptPath, csvPath]);
    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${stderr}`));
        return;
      }

      try {
        const results = JSON.parse(stdout);
        resolve(results);
      } catch (error) {
        reject(new Error(`Failed to parse results: ${error}`));
      }
    });

    python.on('error', (error) => {
      reject(new Error(`Failed to run Python script: ${error.message}`));
    });
  });
}
