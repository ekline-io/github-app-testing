'use client';

import { useState } from 'react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFileUpload = () => {
    // Trigger a refresh of the file list by changing the key
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-3xl font-bold mb-8 text-center">File Manager</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
          <FileUpload onFileUpload={handleFileUpload} />

          <hr className="my-8 border-gray-200" />
          
          <FileList key={refreshKey} />
        </div>
        
        <footer className="mt-10 text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} File Manager. All rights reserved.
        </footer>
      </div>
    </main>
  );
} 
