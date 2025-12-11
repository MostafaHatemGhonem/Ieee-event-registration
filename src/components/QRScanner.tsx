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
      if (isScanning.current) return;

      try {
        await scanner.start(
          { facingMode: "environment" }, // Use back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Success callback
            onScan(decodedText);
          },
          (errorMessage) => {
            // Error callback (usually just no QR detected)
            // We don't need to show this error
          }
        );
        isScanning.current = true;
      } catch (err: any) {
        console.error("Failed to start scanner:", err);
        if (onError) {
          onError(err?.message || "Failed to start camera");
        }
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && isScanning.current) {
        scannerRef.current
          .stop()
          .then(() => {
            isScanning.current = false;
          })
          .catch((err) => console.error("Failed to stop scanner:", err));
      }
    };
  }, [onScan, onError]);

  return (
    <div id="qr-reader" style={{ width: '100%' }}></div>
  );
}
