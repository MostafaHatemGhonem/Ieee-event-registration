import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Unique ID for the container to avoid conflicts
    const qrcodeRegionId = "html5qr-code-full-region";
    
    // Cleanup function to handle strict mode double-mount
    let isMounted = true;

    const startScanner = async () => {
      try {
        // If scanner instance exists, clear it first
        if (scannerRef.current) {
          try {
            await scannerRef.current.stop();
            await scannerRef.current.clear();
          } catch (e) {
            // Ignore stop errors
          }
        }

        const scanner = new Html5Qrcode(qrcodeRegionId);
        scannerRef.current = scanner;

        // Mobile-friendly config
        const config = {
          fps: 10,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            // Logic to have a square box that fits well
            const minEdgePercentage = 0.7; // 70%
            const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
            return {
              width: qrboxSize,
              height: qrboxSize,
            };
          },
          aspectRatio: 1.0,
          formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ]
        };

        if (!isMounted) return;

        await scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (isMounted) {
              onScan(decodedText);
            }
          },
          (errorMessage) => {
            // access errors or read errors
            // console.warn(errorMessage);
          }
        );
      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to start scanner:", err);
          const msg = err?.message || "Failed to access camera";
          setError(msg);
          if (onError) onError(msg);
        }
      }
    };

    // Small timeout to ensure DOM is ready and previous instances are cleaned
    const timer = setTimeout(() => {
        startScanner();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [onScan, onError]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted text-destructive text-center p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div 
      id="html5qr-code-full-region" 
      style={{ 
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
}
