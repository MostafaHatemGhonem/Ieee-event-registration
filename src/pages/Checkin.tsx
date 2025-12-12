import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { getAllRegistrations, checkInAttendee } from "@/services/api";
import { RegistrationData } from "@/types/registration";
import { QRScanner } from "@/components/QRScanner";
import {
    extractAttendeeIdFromQR,
    isValidIEEEQRCode,
} from "@/lib/qrcode-generator";
import ieeeLogo from "@/assets/ieee-logo.png";
import {
    QrCode,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    User,
    Clock,
    Search,
    Camera,
} from "lucide-react";

const Checkin = () => {
    const navigate = useNavigate();
    const [manualCode, setManualCode] = useState("");
    const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
    const [scanResult, setScanResult] = useState<{
        success: boolean;
        registration?: RegistrationData;
        message: string;
    } | null>(null);
    const [recentCheckins, setRecentCheckins] = useState<RegistrationData[]>(
        []
    );
    const [useCamera, setUseCamera] = useState(false); // Toggle between camera and manual entry

    // Handle QR code scan
    const handleQRScan = async (qrData: string) => {
        if (!qrData) return;

        // Validate QR code format
        if (!isValidIEEEQRCode(qrData)) {
            toast({
                title: "خطأ في الرمز",
                description:
                    "رمز QR غير صالح. يرجى التأكد من استخدام الرمز الصحيح للفعالية",
                variant: "destructive",
            });
            return;
        }

        // Extract ID from QR data (format: IEEE-BSU-{nationalId-timestamp})
        const extractedData = extractAttendeeIdFromQR(qrData);
        if (!extractedData) {
            toast({
                title: "خطأ",
                description: "فشل قراءة البيانات من رمز QR",
                variant: "destructive",
            });
            return;
        }

        // Extract national ID from the extracted data (format: nationalId-timestamp)
        const nationalId = extractedData.split("-")[0];

        try {
            const registrations = await getAllRegistrations();
            // Find by national ID instead of just ID
            const found = registrations.find(
                (r) => r.nationalId === nationalId
            );
            await processCheckIn(found);
        } catch (error) {
            toast({
                title: "خطأ",
                description: "فشل البحث عن التسجيل",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        loadRecentCheckins();
    }, []);

    const loadRecentCheckins = async () => {
        try {
            const registrations = await getAllRegistrations();
            setRegistrations(registrations); // Store all registrations for stats
            const checkedIn = registrations
                .filter((r) => r.checkedIn)
                .sort(
                    (a, b) =>
                        new Date(b.checkedInAt || 0).getTime() -
                        new Date(a.checkedInAt || 0).getTime()
                )
                .slice(0, 10);
            setRecentCheckins(checkedIn);
        } catch (error) {
            console.error("Failed to load check-ins:", error);
        }
    };

    const handleManualSearch = async () => {
        if (!manualCode.trim()) return;

        try {
            const registrations = await getAllRegistrations();
            const found = registrations.find(
                (r) =>
                    r.id === manualCode ||
                    r.paymentCode?.toLowerCase() === manualCode.toLowerCase() ||
                    r.nationalId === manualCode
            );

            await processCheckIn(found);
            setManualCode("");
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to search for registration",
                variant: "destructive",
            });
        }
    };

    const processCheckIn = async (
        registration: RegistrationData | undefined | null
    ) => {
        if (!registration) {
            setScanResult({
                success: false,
                message: "Registration not found! Please verify the code.",
            });
            return;
        }

        if (registration.status !== "approved") {
            setScanResult({
                success: false,
                registration,
                message:
                    registration.status === "pending"
                        ? "Registration is still pending approval."
                        : "Registration has been rejected.",
            });
            return;
        }

        if (registration.checkedIn) {
            setScanResult({
                success: false,
                registration,
                message: `Already checked in at ${new Date(
                    registration.checkedInAt || ""
                ).toLocaleTimeString()}`,
            });
            return;
        }

        // Perform check-in
        if (registration.id) {
            try {
                // Send both attendeeId and nationalId to backend
                await checkInAttendee(registration.id, registration.nationalId);
                const updated = {
                    ...registration,
                    checkedIn: true,
                    checkedInAt: new Date().toISOString(),
                };
                setScanResult({
                    success: true,
                    registration: updated,
                    message: "Check-in successful! Welcome to the event.",
                });
                await loadRecentCheckins();
                toast({
                    title: "Check-in Successful!",
                    description: `${registration.fullNameEnglish} has been checked in.`,
                });
            } catch (error) {
                setScanResult({
                    success: false,
                    message: "Failed to check in. Please try again.",
                });
                toast({
                    title: "Error",
                    description: "Failed to check in",
                    variant: "destructive",
                });
            }
        }
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
                            onClick={() => navigate("/admin")}
                            className="text-primary-foreground hover:bg-primary-foreground/10">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <img src={ieeeLogo} alt="IEEE" className="h-10" />
                        <div>
                            <h1 className="text-xl font-bold text-primary-foreground">
                                Event Check-in
                            </h1>
                            <p className="text-sm text-primary-foreground/70">
                                Scan QR codes to check in attendees
                            </p>
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
                                    useCamera
                                        ? "border-accent pulse-glow"
                                        : "border-border"
                                }`}>
                                {useCamera ? (
                                    <div className="relative">
                                        {/* Real Camera Scanner */}
                                        <QRScanner
                                            onScan={handleQRScan}
                                            onError={(err) => {
                                                console.error(
                                                    "Camera error:",
                                                    err
                                                );
                                                toast({
                                                    title: "خطأ في الكاميرا",
                                                    description:
                                                        "تأكد من السماح بالوصول للكاميرا",
                                                    variant: "destructive",
                                                });
                                                setUseCamera(false); // Close camera on error
                                            }}
                                        />

                                        {/* Close Camera Button */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="absolute top-2 left-2 z-10 bg-white"
                                            onClick={() => setUseCamera(false)}>
                                            <XCircle className="w-4 h-4 mr-1" />
                                            Close Camera
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-ieee-dark flex items-center justify-center">
                                        <div className="text-center p-8">
                                            <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                            <p className="text-muted-foreground mb-4">
                                                Click to activate camera
                                            </p>
                                            <Button
                                                variant="gradient"
                                                onClick={() =>
                                                    setUseCamera(true)
                                                }>
                                                <Camera className="w-4 h-4 mr-2" />
                                                Start Camera
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Manual Entry */}
                            <div className="mt-6">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Or enter code manually:
                                </p>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter ID or payment code"
                                        value={manualCode}
                                        onChange={(e) =>
                                            setManualCode(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === "Enter" &&
                                            handleManualSearch()
                                        }
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
                                        ? "border-2 border-success bg-success/5"
                                        : "border-2 border-destructive bg-destructive/5"
                                }`}>
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                            scanResult.success
                                                ? "bg-success/20"
                                                : "bg-destructive/20"
                                        }`}>
                                        {scanResult.success ? (
                                            <CheckCircle2 className="w-10 h-10 text-success" />
                                        ) : (
                                            <XCircle className="w-10 h-10 text-destructive" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3
                                            className={`font-bold text-lg ${
                                                scanResult.success
                                                    ? "text-success"
                                                    : "text-destructive"
                                            }`}>
                                            {scanResult.success
                                                ? "Check-in Successful!"
                                                : "Check-in Failed"}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {scanResult.message}
                                        </p>

                                        {scanResult.registration && (
                                            <div className="mt-4 p-4 bg-muted rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                                                        <User className="w-6 h-6 text-accent" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">
                                                            {
                                                                scanResult
                                                                    .registration
                                                                    .fullNameEnglish
                                                            }
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {
                                                                scanResult
                                                                    .registration
                                                                    .faculty
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full mt-4"
                                    onClick={clearResult}>
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
                                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-success" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {reg.fullNameEnglish}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {reg.faculty}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">
                                                {reg.checkedInAt &&
                                                    new Date(
                                                        reg.checkedInAt
                                                    ).toLocaleTimeString()}
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
                                    <p className="text-3xl font-bold text-success">
                                        {recentCheckins.length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Checked In
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <p className="text-3xl font-bold text-accent">
                                        {
                                            registrations.filter(
                                                (r) =>
                                                    (r.status === "Approved" ||
                                                        r.status ===
                                                            "approved") &&
                                                    !r.checkedIn
                                            ).length
                                        }
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Remaining
                                    </p>
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
