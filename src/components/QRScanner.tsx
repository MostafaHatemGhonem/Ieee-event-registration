import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const qrcodeRegionId = "html5qr-code-full-region";
    let isMounted = true;

    const startScanner = async () => {
      try {
        // If scanner instance exists, clear it first
        if (scannerRef.current) {
          try {
            if (scannerRef.current.isScanning) {
                await scannerRef.current.stop();
            }
            await scannerRef.current.clear();
          } catch (e) {
            console.warn("Cleanup warning:", e);
          }
        }

        const scanner = new Html5Qrcode(qrcodeRegionId);
        scannerRef.current = scanner;

        // Check if cameras are supported
        try {
            await Html5Qrcode.getCameras();
            setHasPermission(true);
        } catch (e) {
            setHasPermission(false);
            throw new Error("Camera permission denied or no cameras found");
        }

        const config = {
          fps: 10,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdgePercentage = 0.7;
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
            // ignore scan errors
          }
        );
      } catch (err: any) {
        if (isMounted) {
          console.error("Scanner error:", err);
          const msg = err?.message || "Failed to access camera. Please allow permissions.";
          setError(msg);
          if (onError) onError(msg);
        }
      }
    };

    // Delay start to ensure DOM is fully rendered
    const timer = setTimeout(() => {
        startScanner();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
            if (scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(e => console.error(e));
            }
            scannerRef.current.clear().catch(e => console.error(e));
        } catch (e) {
            console.error("Unmount error", e);
        }
      }
    };
  }, [onScan, onError]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted text-destructive text-center p-4 rounded-lg border-2 border-destructive/20">
        <p className="font-semibold mb-2">Camera Error</p>
        <p className="text-sm mb-4">{error}</p>
        {!hasPermission && (
            <p className="text-xs text-muted-foreground">
                Please check your browser settings and allow camera access.
            </p>
        )}
      </div>
    );
  }

  return (
    <div 
      id="html5qr-code-full-region" 
      style={{ 
        width: '100%',
        maxWidth: '500px',
        minHeight: '300px', // Force height
        margin: '0 auto',
        backgroundColor: '#000', // Black background while loading
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
}
