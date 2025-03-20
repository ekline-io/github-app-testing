import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';
import { File as FormidableFile } from 'formidable';

export const dynamic = 'force-dynamic';

// Helper function to parse form data
const parseForm = async (
  req: NextRequest
): Promise<{ fields: Record<string, string>; files: Record<string, FormidableFile> }> => {
  return new Promise((resolve, reject) => {
    const arrayBuffer = req.arrayBuffer();
    arrayBuffer.then(async (buffer) => {
      const blob = new Blob([buffer]);
      const formData = new FormData();
      
      const form = new IncomingForm({
        uploadDir: path.join(process.cwd(), 'public/uploads'),
        keepExtensions: true,
      });
      
      // Convert NextRequest to Node's IncomingMessage-like object
      const requestAsReadable = {
        headers: Object.fromEntries(req.headers.entries()),
        method: req.method,
        url: req.url,
        // @ts-ignore - we need to provide a ReadableStream for formidable
        pipe: (destination: any) => {
          // This is a simplified approach
          destination.end(Buffer.from(buffer));
          return destination;
        },
      };
      
      // @ts-ignore - workaround for formidable with NextRequest
      form.parse(requestAsReadable, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });
  });
};

export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseForm(req);
    const file = files.file as unknown as FormidableFile;
    
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }
    
    // Get the file details
    const originalFilename = file.originalFilename || 'unknown';
    const newFilename = file.newFilename || 'unknown';
    const fileSize = file.size;
    
    // Return success response with file details
    return NextResponse.json({
      success: true,
      file: {
        name: originalFilename,
        size: fileSize,
        path: `/uploads/${newFilename}`,
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, message: 'Error uploading file' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const files = await fs.readdir(uploadDir);
    
    const fileDetails = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(uploadDir, filename);
        const stats = await fs.stat(filePath);
        
        return {
          name: filename,
          path: `/uploads/${filename}`,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      })
    );
    
    return NextResponse.json({ success: true, files: fileDetails });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { success: false, message: 'Error listing files' },
      { status: 500 }
    );
  }
} 
