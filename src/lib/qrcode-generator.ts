import QRCode from 'qrcode';

/**
 * Generate QR Code as base64 data URL
 * @param attendeeId - The unique attendee ID
 * @returns Promise<string> - Base64 data URL of the QR code
 */
export async function generateQRCodeBase64(attendeeId: string): Promise<string> {
  try {
    // Create unique QR data with format: IEEE-BSU-{nationalId}
    // attendeeId is already unique (nationalId or nationalId-timestamp)
    const qrData = `IEEE-BSU-${attendeeId}`;
    
    // Generate QR code as base64 data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: {
        dark: '#00629B', // IEEE Blue
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H' // High error correction
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR Code as Blob for file upload
 * @param attendeeId - The unique attendee ID
 * @returns Promise<Blob> - QR code image as Blob
 */
export async function generateQRCodeBlob(attendeeId: string): Promise<Blob> {
  try {
    // attendeeId is already unique (nationalId or nationalId-timestamp)
    const qrData = `IEEE-BSU-${attendeeId}`;
    
    // Generate QR code as canvas
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, qrData, {
      width: 400,
      margin: 2,
      color: {
        dark: '#00629B',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      }, 'image/png');
    });
  } catch (error) {
    console.error('Error generating QR code blob:', error);
    throw new Error('Failed to generate QR code blob');
  }
}

/**
 * Extract attendee ID from scanned QR data
 * @param qrData - Scanned QR code data
 * @returns string | null - Extracted attendee ID (nationalId or nationalId-timestamp) or null if invalid
 */
export function extractAttendeeIdFromQR(qrData: string): string | null {
  try {
    // Expected format: IEEE-BSU-{nationalId} or IEEE-BSU-{nationalId-timestamp}
    // Extract everything after 'IEEE-BSU-'
    const match = qrData.match(/^IEEE-BSU-(.+)$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting ID from QR:', error);
    return null;
  }
}

/**
 * Validate QR code format
 * @param qrData - QR code data to validate
 * @returns boolean - True if valid IEEE QR code format
 */
export function isValidIEEEQRCode(qrData: string): boolean {
  // Accept format: IEEE-BSU-{nationalId} or IEEE-BSU-{nationalId-timestamp}
  return /^IEEE-BSU-.+$/.test(qrData);
}
