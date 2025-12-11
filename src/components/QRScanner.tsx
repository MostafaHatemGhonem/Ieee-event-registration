import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanning = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    const startScanner = async () => {
      if (isScanning.current) {
        console.log("Scanner already running, skipping...");
        return;
      }

      try {
        console.log("Requesting camera permissions...");
        
        await scanner.start(
          { facingMode: "environment" }, // Use back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Success callback
            console.log("QR Code detected:", decodedText);
            onScan(decodedText);
          },
          (errorMessage) => {
            // Error callback (usually just no QR detected)
            // We don't need to show this error - it's normal when no QR in view
          }
        );
        
        isScanning.current = true;
        console.log("Camera started successfully!");
      } catch (err: any) {
        console.error("Failed to start scanner:", err);
        const errorMsg = err?.message || err?.toString() || "Failed to start camera";
        console.error("Error details:", errorMsg);
        
        if (onError) {
          onError(errorMsg);
        }
      }
    };

    startScanner();

    return () => {
      console.log("Cleaning up scanner...");
      if (scannerRef.current && isScanning.current) {
        scannerRef.current
          .stop()
          .then(() => {
            isScanning.current = false;
            console.log("Scanner stopped successfully");
          })
          .catch((err) => console.error("Failed to stop scanner:", err));
      }
    };
  }, [onScan, onError]);

  return (
    <div 
      id="qr-reader" 
      style={{ 
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto'
      }}
    ></div>
  );
}
