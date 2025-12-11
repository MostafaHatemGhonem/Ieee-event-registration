import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { getRegistrations, checkInAttendee, findRegistrationByQR } from '@/lib/registration';
import { RegistrationData } from '@/types/registration';
import ieeeLogo from '@/assets/ieee-logo.png';
import { 
  QrCode, CheckCircle2, XCircle, ArrowLeft, 
  User, Clock, Search, Camera
} from 'lucide-react';

const Checkin = () => {
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    registration?: RegistrationData;
    message: string;
  } | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<RegistrationData[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    loadRecentCheckins();
  }, []);

  const loadRecentCheckins = () => {
    const registrations = getRegistrations();
    const checkedIn = registrations
      .filter(r => r.checkedIn)
      .sort((a, b) => new Date(b.checkedInAt || 0).getTime() - new Date(a.checkedInAt || 0).getTime())
      .slice(0, 10);
    setRecentCheckins(checkedIn);
  };

  const handleManualSearch = () => {
    if (!manualCode.trim()) return;

    const registrations = getRegistrations();
    const found = registrations.find(r => 
      r.id === manualCode || 
      r.paymentCode?.toLowerCase() === manualCode.toLowerCase() ||
      r.nationalId === manualCode
    );

    processCheckIn(found);
    setManualCode('');
  };

  const processCheckIn = (registration: RegistrationData | undefined | null) => {
    if (!registration) {
      setScanResult({
        success: false,
        message: 'Registration not found! Please verify the code.'
      });
      return;
    }

    if (registration.status !== 'approved') {
      setScanResult({
        success: false,
        registration,
        message: registration.status === 'pending' 
          ? 'Registration is still pending approval.'
          : 'Registration has been rejected.'
      });
      return;
    }

    if (registration.checkedIn) {
      setScanResult({
        success: false,
        registration,
        message: `Already checked in at ${new Date(registration.checkedInAt || '').toLocaleTimeString()}`
      });
      return;
    }

    // Perform check-in
    if (registration.id) {
      checkInAttendee(registration.id);
      const updated = { ...registration, checkedIn: true, checkedInAt: new Date().toISOString() };
      setScanResult({
        success: true,
        registration: updated,
        message: 'Check-in successful! Welcome to the event.'
      });
      loadRecentCheckins();
      toast({
        title: "Check-in Successful!",
        description: `${registration.fullNameEnglish} has been checked in.`,
      });
    }
  };

  const simulateScan = () => {
    setIsScanning(true);
    // Simulate scanning - in production, this would use a camera API
    setTimeout(() => {
      setIsScanning(false);
      const registrations = getRegistrations();
      const approved = registrations.filter(r => r.status === 'approved');
      if (approved.length > 0) {
        const randomReg = approved[Math.floor(Math.random() * approved.length)];
        processCheckIn(randomReg);
      } else {
        setScanResult({
          success: false,
          message: 'No approved registrations found for demo.'
        });
      }
    }, 2000);
  };

  const clearResult = () => {
    setScanResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary py-4 px-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/admin')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img src={ieeeLogo} alt="IEEE" className="h-10" />
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">Event Check-in</h1>
              <p className="text-sm text-primary-foreground/70">Scan QR codes to check in attendees</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <div className="space-y-6">
            {/* QR Scanner Area */}
            <div className="card-elevated p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-accent" />
                QR Code Scanner
              </h2>
              
              <div 
                className={`relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden border-4 ${
                  isScanning ? 'border-accent pulse-glow' : 'border-border'
                }`}
              >
                <div className="absolute inset-0 bg-ieee-dark flex items-center justify-center">
                  {isScanning ? (
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-primary-foreground">Scanning...</p>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">Camera preview would appear here</p>
                      <Button variant="gradient" onClick={simulateScan}>
                        <QrCode className="w-4 h-4 mr-2" />
                        Simulate Scan
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Scanner overlay corners */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-accent rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-accent rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-accent rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-accent rounded-br-lg" />
              </div>

              {/* Manual Entry */}
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-2">Or enter code manually:</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter ID or payment code"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                  />
                  <Button onClick={handleManualSearch}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Scan Result */}
            {scanResult && (
              <div 
                className={`card-elevated p-6 animate-scale-in ${
                  scanResult.success 
                    ? 'border-2 border-success bg-success/5' 
                    : 'border-2 border-destructive bg-destructive/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    scanResult.success ? 'bg-success/20' : 'bg-destructive/20'
                  }`}>
                    {scanResult.success ? (
                      <CheckCircle2 className="w-10 h-10 text-success" />
                    ) : (
                      <XCircle className="w-10 h-10 text-destructive" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${
                      scanResult.success ? 'text-success' : 'text-destructive'
                    }`}>
                      {scanResult.success ? 'Check-in Successful!' : 'Check-in Failed'}
                    </h3>
                    <p className="text-muted-foreground">{scanResult.message}</p>
                    
                    {scanResult.registration && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                            <User className="w-6 h-6 text-accent" />
                          </div>
                          <div>
                            <p className="font-semibold">{scanResult.registration.fullNameEnglish}</p>
                            <p className="text-sm text-muted-foreground">{scanResult.registration.faculty}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={clearResult}
                >
                  Scan Next
                </Button>
              </div>
            )}
          </div>

          {/* Recent Check-ins */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Recent Check-ins
            </h2>
            
            {recentCheckins.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No check-ins yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCheckins.map((reg) => (
                  <div 
                    key={reg.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{reg.fullNameEnglish}</p>
                      <p className="text-xs text-muted-foreground">{reg.faculty}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {reg.checkedInAt && new Date(reg.checkedInAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold text-success">{recentCheckins.length}</p>
                  <p className="text-sm text-muted-foreground">Checked In</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold text-accent">
                    {getRegistrations().filter(r => r.status === 'approved' && !r.checkedIn).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkin;
