import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import StepIndicator from "@/components/StepIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { submitRegistration } from "@/services/api";
import {
    RegistrationData,
    GOVERNORATES,
    FACULTIES,
    ACADEMIC_YEARS,
} from "@/types/registration";
import { generateQRCodeBlob } from "@/lib/qrcode-generator";
import {
    ArrowLeft,
    ArrowRight,
    Upload,
    CheckCircle2,
    User,
    Phone,
    GraduationCap,
    CreditCard,
    Bus,
    AlertCircle,
} from "lucide-react";

const STEP_LABELS = ["Personal Info", "Contact", "Academic", "Payment"];

const Register = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState<Partial<RegistrationData>>({
        fullNameArabic: "",
        fullNameEnglish: "",
        phone: "",
        governorate: "",
        nationalId: "",
        faculty: "",
        academicYear: "",
        email: "",
        age: "",
        gender: "",
        paymentCode: "",
        isNeedBus: false,
        isIEEEIAN: false,
    });
    const [customFaculty, setCustomFaculty] = useState("");
    const [paymentFile, setPaymentFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
        // Clear custom faculty when selecting a different faculty
        if (field === "faculty" && value !== "Other") {
            setCustomFaculty("");
            if (errors.customFaculty) {
                setErrors((prev) => ({ ...prev, customFaculty: "" }));
            }
        }
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (
                !formData.fullNameArabic ||
                formData.fullNameArabic.split(" ").length < 4
            ) {
                newErrors.fullNameArabic = "Please enter your full name (four names).";
            }
            if (
                !formData.fullNameEnglish ||
                formData.fullNameEnglish.split(" ").length < 4
            ) {
                newErrors.fullNameEnglish =
                    "Please enter your full 4-part name";
            }
            if (!formData.nationalId || formData.nationalId.length !== 14) {
                newErrors.nationalId = "National ID must be 14 digits.";
            }
            if (!formData.gender) {
                newErrors.gender = "Please select gender.";
            }
            const ageValue = formData.age?.toString() ?? "";
            const ageNum = parseInt(ageValue, 10);
            if (!ageValue || isNaN(ageNum) || ageNum < 16 || ageNum > 50) {
                newErrors.age = "Age must be between 16 and 50.";
            }
        }

        if (step === 2) {
            if (!formData.phone || !/^01[0125][0-9]{8}$/.test(formData.phone)) {
                newErrors.phone = "Please enter a valid phone number.";
            }
            if (
                !formData.email ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
            ) {
                newErrors.email = "Please enter a valid email address.";
            }
            if (!formData.governorate) {
                newErrors.governorate = "Please select a governorate.";
            }
        }

        if (step === 3) {
            if (!formData.faculty) {
                newErrors.faculty = "Please select a faculty.";
            }
            if (formData.faculty === "Other" && !customFaculty.trim()) {
                newErrors.customFaculty = "Please enter the faculty name.";
            }
            if (!formData.academicYear) {
                newErrors.academicYear = "Please select an academic year.";
            }
        }

        if (step === 4) {
            // رقم المحفظة 11 رقم فقط
            if (!formData.paymentCode || formData.paymentCode.length !== 11) {
                newErrors.paymentCode = "Please enter exactly 11 digits.";
            } else if (!/^\d{11}$/.test(formData.paymentCode)) {
                newErrors.paymentCode = "It must contain only numbers.";
            }
            // صورة الدفع إجبارية
            if (!paymentFile) {
                newErrors.paymentScreenshot = "Please upload a payment screenshot.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, 4));
        }
    };

    const handlePrev = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(4)) return;

        setIsSubmitting(true);

        try {
            // Generate temporary ID for QR code (using national ID + timestamp for uniqueness)
            const tempId = `${formData.nationalId}-${Date.now()}`;

            // Generate QR Code
            toast({
                title: "Preparing...",
                description: "Creating your QR code",
            });

            const qrCodeBlob = await generateQRCodeBlob(tempId);

            // Use custom faculty name if "Other" is selected
            const finalFormData = {
                ...formData,
                faculty:
                    formData.faculty == "Other"
                        ? customFaculty.trim()
                        : formData.faculty,
                isNeedBus: formData.isNeedBus ?? false,
                isIEEEIAN: formData.isIEEEIAN ?? false,
            };
            console.log(finalFormData)
            // إرسال البيانات إلى الـ Backend API مع QR Code
            const response = await submitRegistration(
                finalFormData as Omit<
                    RegistrationData,
                    "id" | "status" | "createdAt"
                >,
                paymentFile || undefined,
                qrCodeBlob
            );

            // Backend will send confirmation email automatically

            setSubmitted(true);

            toast({
                title: "Registration successful!",
                description: "Your request will be reviewed and a confirmation email will be sent.",
            });
        } catch (error) {
            console.error("Registration error:", error);
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "An error occurred during registration. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-background">
                <Header subtitle="Event Registration" />
                <main className="container mx-auto px-4 py-12">
                    <div className="max-w-lg mx-auto text-center animate-scale-in">
                        <div className="card-elevated p-8">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
                                <CheckCircle2 className="w-12 h-12 text-success" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4 gradient-text">
                                Registration successful!
                            </h2>
                            <p className="text-muted-foreground mb-4">
                                Thank you for registering for the TIME event. Your application will be reviewed by the relevant committee and a confirmation email will be sent.
                            </p>

                            {/* WhatsApp Groups */}
                            <div className="space-y-3 mb-8">
                                <a
                                    href="https://chat.whatsapp.com/Jd5jBlSZobV4Um5aIpU5O3"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full p-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075E54] dark:text-[#25D366] border border-[#25D366]/20 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                                >
                                    This Event Group
                                </a>

                                {formData.isNeedBus && (
                                    <a
                                        href="https://chat.whatsapp.com/HZv908RvBbICm9LZz0Qdqn"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full p-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075E54] dark:text-[#25D366] border border-[#25D366]/20 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                                    >
                                        <Bus className="w-5 h-5" />
                                        This Bus Group
                                    </a>
                                )}
                            </div>
                            <Button
                                variant="gradient"
                                onClick={() => navigate("/")}>
                                Back to Home
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header subtitle="Event Registration" />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="card-elevated p-6 md:p-8 animate-fade-in">
                        <h2 className="text-2xl font-bold text-center mb-2 gradient-text">
                            Event Registration
                        </h2>
                        <p className="text-center text-muted-foreground mb-6">
                            Complete all steps to register
                        </p>

                        <StepIndicator
                            currentStep={currentStep}
                            totalSteps={4}
                            labels={STEP_LABELS}
                        />

                        <div
                            className="mt-8 space-y-6 animate-slide-up"
                            key={currentStep}>
                            {currentStep === 1 && (
                                <>
                                    <div className="flex items-center gap-2 mb-4">
                                        <User className="w-5 h-5 text-accent" />
                                        <h3 className="font-semibold">
                                            Personal Information
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="fullNameArabic">
                                                The full name in Arabic *
                                            </Label>
                                            <Input
                                                id="fullNameArabic"
                                                placeholder="First - Second - Third - Last Name"
                                                value={formData.fullNameArabic}
                                                onChange={(e) => {
                                                    // Allow Arabic characters, spaces, hyphens, and Arabic numbers
                                                    const value = e.target.value.replace(/[^\u0600-\u06FF\s-]/g, '');
                                                    updateField(
                                                        "fullNameArabic",
                                                        value
                                                    );
                                                }}
                                                className={
                                                    errors.fullNameArabic
                                                        ? "border-destructive"
                                                        : ""
                                                }
                                            />
                                            {errors.fullNameArabic && (
                                                <p className="text-sm text-destructive mt-1">
                                                    {errors.fullNameArabic}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="fullNameEnglish">
                                                Full Name in English *
                                            </Label>
                                            <Input
                                                id="fullNameEnglish"
                                                placeholder="First - Second - Third - Last Name"
                                                value={formData.fullNameEnglish}
                                                onChange={(e) => {
                                                    // Only allow English letters, spaces, and hyphens
                                                    const value = e.target.value.replace(/[^a-zA-Z\s-]/g, '');
                                                    updateField(
                                                        "fullNameEnglish",
                                                        value
                                                    );
                                                }}
                                                className={
                                                    errors.fullNameEnglish
                                                        ? "border-destructive"
                                                        : ""
                                                }
                                            />
                                            {errors.fullNameEnglish && (
                                                <p className="text-sm text-destructive mt-1">
                                                    {errors.fullNameEnglish}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="nationalId">
                                                National ID
                                            </Label>
                                            <Input
                                                id="nationalId"
                                                placeholder="14 digits"
                                                maxLength={14}
                                                value={formData.nationalId}
                                                onChange={(e) =>
                                                    updateField(
                                                        "nationalId",
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            ""
                                                        )
                                                    )
                                                }
                                                className={
                                                    errors.nationalId
                                                        ? "border-destructive"
                                                        : ""
                                                }
                                            />
                                            {errors.nationalId && (
                                                <p className="text-sm text-destructive mt-1">
                                                    {errors.nationalId}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="age">
                                                    Age*
                                                </Label>
                                                <Input
                                                    id="age"
                                                    type="number"
                                                    min={16}
                                                    max={50}
                                                    value={formData.age}
                                                    onChange={(e) =>
                                                        updateField(
                                                            "age",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={
                                                        errors.age
                                                            ? "border-destructive"
                                                            : ""
                                                    }
                                                />
                                                {errors.age && (
                                                    <p className="text-sm text-destructive mt-1">
                                                        {errors.age}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label>Gender *</Label>
                                                <Select
                                                    value={formData.gender}
                                                    onValueChange={(v) =>
                                                        updateField("gender", v)
                                                    }>
                                                    <SelectTrigger
                                                        className={
                                                            errors.gender
                                                                ? "border-destructive"
                                                                : ""
                                                        }>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">
                                                            Male
                                                        </SelectItem>
                                                        <SelectItem value="female">
                                                            Female
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.gender && (
                                                    <p className="text-sm text-destructive mt-1">
                                                        {errors.gender}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* IEEE Membership Checkbox */}
                                        <div className="border-2 border-accent/30 rounded-lg p-4 bg-accent/5 hover:border-accent/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    id="isIEEEIAN"
                                                    checked={!!formData.isIEEEIAN}
                                                    onCheckedChange={(checked) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            isIEEEIAN: !!checked,
                                                        }))
                                                    }
                                                    className="h-5 w-5 mt-0.5"
                                                />
                                                <div className="flex-1">
                                                    <Label
                                                        htmlFor="isIEEEIAN"
                                                        className="cursor-pointer font-semibold text-base">
                                                        Are you a member of IEEE?
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Check this box if you are currently an IEEE member
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {currentStep === 2 && (
                                <>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Phone className="w-5 h-5 text-accent" />
                                        <h3 className="font-semibold">
                                            Contact Information
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="phone">
                                                Phone
                                            </Label>
                                            <Input
                                                id="phone"
                                                placeholder="01xxxxxxxxx"
                                                maxLength={11}
                                                value={formData.phone}
                                                onChange={(e) =>
                                                    updateField(
                                                        "phone",
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            ""
                                                        )
                                                    )
                                                }
                                                className={
                                                    errors.phone
                                                        ? "border-destructive"
                                                        : ""
                                                }
                                            />
                                            {errors.phone && (
                                                <p className="text-sm text-destructive mt-1">
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="email">
                                                Email *
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="example@email.com"
                                                value={formData.email}
                                                onChange={(e) =>
                                                    updateField(
                                                        "email",
                                                        e.target.value
                                                    )
                                                }
                                                className={
                                                    errors.email
                                                        ? "border-destructive"
                                                        : ""
                                                }
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-destructive mt-1">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label>Governorate *</Label>
                                            <Select
                                                value={formData.governorate}
                                                onValueChange={(v) =>
                                                    updateField(
                                                        "governorate",
                                                        v
                                                    )
                                                }>
                                                <SelectTrigger
                                                    className={
                                                        errors.governorate
                                                            ? "border-destructive"
                                                            : ""
                                                    }>
                                                    <SelectValue placeholder="Select Governorate" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {GOVERNORATES.map((gov) => (
                                                        <SelectItem
                                                            key={gov}
                                                            value={gov}>
                                                            {gov}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.governorate && (
                                                <p className="text-sm text-destructive mt-1">
                                                    {errors.governorate}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {currentStep === 3 && (
                                <>
                                    <div className="flex items-center gap-2 mb-4">
                                        <GraduationCap className="w-5 h-5 text-accent" />
                                        <h3 className="font-semibold">
                                            Academic Information
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label>Faculty *</Label>
                                            <Select
                                                value={formData.faculty}
                                                onValueChange={(v) =>
                                                    updateField("faculty", v)
                                                }>
                                                <SelectTrigger
                                                    className={
                                                        errors.faculty
                                                            ? "border-destructive"
                                                            : ""
                                                    }>
                                                    <SelectValue placeholder="Select Faculty" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {FACULTIES.map((fac) => (
                                                        <SelectItem
                                                            key={fac}
                                                            value={fac}>
                                                            {fac}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.faculty && (
                                                <p className="text-sm text-destructive mt-1">
                                                    {errors.faculty}
                                                </p>
                                            )}
                                        </div>
                                        {formData.faculty === "Other" && (
                                            <div>
                                                <Label htmlFor="customFaculty">
                                                    Faculty Name *
                                                </Label>
                                                <Input
                                                    id="customFaculty"
                                                    type="text"
                                                    placeholder="Enter Faculty Name"
                                                    value={customFaculty}
                                                    onChange={(e) => {
                                                        setCustomFaculty(
                                                            e.target.value
                                                        );
                                                        if (
                                                            errors.customFaculty
                                                        ) {
                                                            setErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    customFaculty:
                                                                        "",
                                                                })
                                                            );
                                                        }
                                                    }}
                                                    className={
                                                        errors.customFaculty
                                                            ? "border-destructive"
                                                            : ""
                                                    }
                                                />
                                                {errors.customFaculty && (
                                                    <p className="text-sm text-destructive mt-1">
                                                        {errors.customFaculty}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        <div>
                                            <Label>Academic Year *</Label>
                                            <Select
                                                value={formData.academicYear}
                                                onValueChange={(v) =>
                                                    updateField(
                                                        "academicYear",
                                                        v
                                                    )
                                                }>
                                                <SelectTrigger
                                                    className={
                                                        errors.academicYear
                                                            ? "border-destructive"
                                                            : ""
                                                    }>
                                                    <SelectValue placeholder="Select Academic Year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ACADEMIC_YEARS.map(
                                                        (year) => (
                                                            <SelectItem
                                                                key={year}
                                                                value={year}>
                                                                {year}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {errors.academicYear && (
                                                <p className="text-sm text-destructive mt-1">
                                                    {errors.academicYear}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {currentStep === 4 && (
                                <>
                                    <div className="flex items-center gap-2 mb-4">
                                        <CreditCard className="w-5 h-5 text-accent" />
                                        <h3 className="font-semibold">
                                            Payment Information
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                                            <p className="text-lg font-bold text-primary">
                                                Ticket price 30 EGP including transportation
                                            </p>
                                        </div>

                                        {/* Payment Numbers - Simple */}
                                        <div className="bg-gray-50 dark:bg-gray-900 border rounded-lg p-4 mb-4">
                                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                                <CreditCard className="w-4 h-4" />
                                                Payment Numbers
                                            </h3>

                                            <div className="space-y-2">
                                                <a
                                                    href="tel:01554104799"
                                                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border hover:border-blue-400 transition-colors"
                                                >
                                                    <span className="text-sm font-medium">Instapay</span>
                                                    <span className="font-mono font-bold text-blue-600" dir="ltr">01554104799</span>
                                                </a>

                                                <a
                                                    href="tel:01097587564"
                                                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border hover:border-red-400 transition-colors"
                                                >
                                                    <span className="text-sm font-medium">Vodafone Cash</span>
                                                    <span className="font-mono font-bold text-red-600" dir="ltr">01097587564</span>
                                                </a>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="paymentCode">
                                                Wallet Number (11 digits) *
                                            </Label>
                                            <Input
                                                id="paymentCode"
                                                type="tel"
                                                placeholder="Enter 11 digits"
                                                value={formData.paymentCode}
                                                maxLength={11}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    updateField('paymentCode', value);
                                                }}
                                                className={
                                                    errors.paymentCode
                                                        ? "border-destructive"
                                                        : ""
                                                }
                                                dir="ltr"
                                            />
                                            {errors.paymentCode && (
                                                <p className="text-sm text-destructive mt-1">
                                                    {errors.paymentCode}
                                                </p>
                                            )}
                                            <p className="text-2xs text-muted-foreground mt-1">
                                                The number from which you sent the money
                                            </p>
                                        </div>

                                        <div>
                                            <Label>Payment Screenshot *</Label>
                                            <div
                                                className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${errors.paymentScreenshot
                                                        ? "border-destructive"
                                                        : "border-border hover:border-accent"
                                                    }`}
                                                onClick={() =>
                                                    document
                                                        .getElementById(
                                                            "paymentFile"
                                                        )
                                                        ?.click()
                                                }>
                                                <input
                                                    id="paymentFile"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file =
                                                            e.target.files?.[0];
                                                        if (file) {
                                                            setPaymentFile(
                                                                file
                                                            );
                                                            setErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    paymentScreenshot:
                                                                        "",
                                                                })
                                                            );
                                                        }
                                                    }}
                                                />
                                                {paymentFile ? (
                                                    <div className="text-success">
                                                        <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                                                        <p className="font-medium">
                                                            {paymentFile.name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Click to change
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                                                        <p className="text-muted-foreground">
                                                            Click to upload
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            PNG, JPG up to 10MB
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                            {errors.paymentScreenshot && (
                                                <p className="text-sm text-destructive mt-1">
                                                    {errors.paymentScreenshot}
                                                </p>
                                            )}
                                        </div>

                                        {/* Bus Question - Enhanced */}
                                        <div className="border-2 border-accent/30 rounded-lg p-4 bg-accent/5 hover:border-accent/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <Checkbox
                                                            id="isNeedBus"
                                                            checked={!!formData.isNeedBus}
                                                            onCheckedChange={(checked) =>
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    isNeedBus: !!checked,
                                                                }))
                                                            }
                                                            className="h-5 w-5"
                                                        />
                                                        <Label
                                                            htmlFor="isNeedBus"
                                                            className="cursor-pointer font-semibold text-base">
                                                            Do you need a bus to get to the event?
                                                        </Label>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mr-8 mt-1">
                                                        Will be provided free transportation from and to the event location.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex justify-between mt-8 pt-6 border-t">
                            <Button
                                variant="outline"
                                onClick={handlePrev}
                                disabled={currentStep === 1}
                                className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Previous
                            </Button>

                            {currentStep < 4 ? (
                                <Button
                                    variant="gradient"
                                    onClick={handleNext}
                                    className="gap-2">
                                    Next
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    variant="gradient"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="gap-2">
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit
                                            <CheckCircle2 className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Register;
