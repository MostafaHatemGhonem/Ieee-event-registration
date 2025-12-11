import { useState } from 'react';
import QrScanner from 'react-qr-scanner';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: Error) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const handleScan = (data: any) => {
    if (data && data.text) {
      onScan(data.text);
    }
  };

  const handleError = (error: any) => {
    console.error('QR Scanner Error:', error);
    if (onError) {
      onError(error);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="relative">
      <QrScanner
        delay={300}
        onError={handleError}
        onScan={handleScan}
        constraints={{
          audio: false,
          video: { facingMode: facingMode }
        }}
        style={{ width: '100%' }}
      />
      
      {/* Camera toggle button */}
      <button
        onClick={toggleCamera}
        className="absolute bottom-4 right-4 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
        title="Toggle Camera"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
          <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
          <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      </button>
    </div>
  );
}
