import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import StepIndicator from '@/components/StepIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { submitRegistration } from '@/services/api';
import { RegistrationData, GOVERNORATES, FACULTIES, ACADEMIC_YEARS } from '@/types/registration';
import { generateQRCodeBlob } from '@/lib/qrcode-generator';
import { ArrowLeft, ArrowRight, Upload, CheckCircle2, User, Phone, GraduationCap, CreditCard } from 'lucide-react';

const STEP_LABELS = ['Personal Info', 'Contact', 'Academic', 'Payment'];

const Register = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Partial<RegistrationData>>({
    fullNameArabic: '',
    fullNameEnglish: '',
    phone: '',
    governorate: '',
    nationalId: '',
    faculty: '',
    academicYear: '',
    email: '',
    age: '',
    gender: '',
    paymentCode: '',
  });
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullNameArabic || formData.fullNameArabic.split(' ').length < 4) {
        newErrors.fullNameArabic = 'يرجى إدخال الاسم الرباعي كاملاً';
      }
      if (!formData.fullNameEnglish || formData.fullNameEnglish.split(' ').length < 4) {
        newErrors.fullNameEnglish = 'Please enter your full 4-part name';
      }
      if (!formData.nationalId || formData.nationalId.length !== 14) {
        newErrors.nationalId = 'الرقم القومي يجب أن يكون 14 رقم';
      }
      if (!formData.gender) {
        newErrors.gender = 'يرجى اختيار الجنس';
      }
      if (!formData.age || parseInt(formData.age) < 16 || parseInt(formData.age) > 50) {
        newErrors.age = 'العمر يجب أن يكون بين 16 و 50';
      }
    }

    if (step === 2) {
      if (!formData.phone || !/^01[0125][0-9]{8}$/.test(formData.phone)) {
        newErrors.phone = 'يرجى إدخال رقم هاتف صحيح';
      }
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'يرجى إدخال بريد إلكتروني صحيح';
      }
      if (!formData.governorate) {
        newErrors.governorate = 'يرجى اختيار المحافظة';
      }
    }

    if (step === 3) {
      if (!formData.faculty) {
        newErrors.faculty = 'يرجى اختيار الكلية';
      }
      if (!formData.academicYear) {
        newErrors.academicYear = 'يرجى اختيار السنة الدراسية';
      }
    }

    if (step === 4) {
      // كود الدفع إجباري (Backend يتطلبه)
      if (!formData.paymentCode) {
        newErrors.paymentCode = 'يرجى إدخال كود الدفع';
      }
      // صورة الدفع إجبارية
      if (!paymentFile) {
        newErrors.paymentScreenshot = 'يرجى رفع صورة إيصال الدفع';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      // Generate temporary ID for QR code (using national ID + timestamp for uniqueness)
      const tempId = `${formData.nationalId}-${Date.now()}`;
      
      // Generate QR Code
      toast({
        title: "جاري التحضير...",
        description: "جاري إنشاء رمز QR الخاص بك",
      });
      
      const qrCodeBlob = await generateQRCodeBlob(tempId);
      
      // إرسال البيانات إلى الـ Backend API مع QR Code
      const response = await submitRegistration(
        formData as Omit<RegistrationData, 'id' | 'status' | 'createdAt'>,
        paymentFile || undefined,
        qrCodeBlob
      );
      
      console.log('Registration successful:', response);
      setSubmitted(true);
      
      toast({
        title: "تم التسجيل بنجاح!",
        description: "سيتم مراجعة طلبك وإرسال بريد إلكتروني للتأكيد",
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى",
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
              <h2 className="text-2xl font-bold mb-4 gradient-text">تم التسجيل بنجاح!</h2>
              <p className="text-muted-foreground mb-6">
                شكراً لتسجيلك في فعالية IEEE Beni-Suef. سيتم مراجعة طلبك من قبل اللجنة المختصة وسيتم إرسال بريد إلكتروني للتأكيد.
              </p>
              <Button variant="gradient" onClick={() => navigate('/')}>
                العودة للرئيسية
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
            <h2 className="text-2xl font-bold text-center mb-2 gradient-text">Event Registration</h2>
            <p className="text-center text-muted-foreground mb-6">Complete all steps to register</p>
            
            <StepIndicator currentStep={currentStep} totalSteps={4} labels={STEP_LABELS} />

            <div className="mt-8 space-y-6 animate-slide-up" key={currentStep}>
              {currentStep === 1 && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold">Personal Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullNameArabic">الاسم الرباعي بالعربية *</Label>
                      <Input
                        id="fullNameArabic"
                        dir="rtl"
                        placeholder="الاسم الأول - الأب - الجد - العائلة"
                        value={formData.fullNameArabic}
                        onChange={(e) => updateField('fullNameArabic', e.target.value)}
                        className={errors.fullNameArabic ? 'border-destructive' : ''}
                        pattern='^[\u0621-\u064A\s]*$'
                      />
                      {errors.fullNameArabic && <p className="text-sm text-destructive mt-1">{errors.fullNameArabic}</p>}
                    </div>

                    <div>
                      <Label htmlFor="fullNameEnglish">Full Name in English *</Label>
                      <Input
                        id="fullNameEnglish"
                        placeholder="First - Second - Third - Last Name"
                        value={formData.fullNameEnglish}
                        onChange={(e) => updateField('fullNameEnglish', e.target.value)}
                        className={errors.fullNameEnglish ? 'border-destructive' : ''}
                      />
                      {errors.fullNameEnglish && <p className="text-sm text-destructive mt-1">{errors.fullNameEnglish}</p>}
                    </div>

                    <div>
                      <Label htmlFor="nationalId">الرقم القومي *</Label>
                      <Input
                        id="nationalId"
                        dir="rtl"
                        placeholder="14 رقم"
                        maxLength={14}
                        value={formData.nationalId}
                        onChange={(e) => updateField('nationalId', e.target.value.replace(/\D/g, ''))}
                        className={errors.nationalId ? 'border-destructive' : ''}
                      />
                      {errors.nationalId && <p className="text-sm text-destructive mt-1">{errors.nationalId}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="age">العمر *</Label>
                        <Input
                          id="age"
                          type="number"
                          min={16}
                          max={50}
                          value={formData.age}
                          onChange={(e) => updateField('age', e.target.value)}
                          className={errors.age ? 'border-destructive' : ''}
                        />
                        {errors.age && <p className="text-sm text-destructive mt-1">{errors.age}</p>}
                      </div>

                      <div>
                        <Label>الجنس *</Label>
                        <Select value={formData.gender} onValueChange={(v) => updateField('gender', v)}>
                          <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                            <SelectValue placeholder="اختر" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">ذكر</SelectItem>
                            <SelectItem value="female">أنثى</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.gender && <p className="text-sm text-destructive mt-1">{errors.gender}</p>}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Phone className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold">Contact Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phone">رقم الهاتف *</Label>
                      <Input
                        id="phone"
                        dir="rtl"
                        placeholder="01xxxxxxxxx"
                        maxLength={11}
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                        className={errors.phone ? 'border-destructive' : ''}
                      />
                      {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <Label htmlFor="email">البريد الإلكتروني *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <Label>المحافظة *</Label>
                      <Select value={formData.governorate} onValueChange={(v) => updateField('governorate', v)}>
                        <SelectTrigger className={errors.governorate ? 'border-destructive' : ''}>
                          <SelectValue placeholder="اختر المحافظة" />
                        </SelectTrigger>
                        <SelectContent>
                          {GOVERNORATES.map(gov => (
                            <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.governorate && <p className="text-sm text-destructive mt-1">{errors.governorate}</p>}
                    </div>
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold">Academic Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>الكلية *</Label>
                      <Select value={formData.faculty} onValueChange={(v) => updateField('faculty', v)}>
                        <SelectTrigger className={errors.faculty ? 'border-destructive' : ''}>
                          <SelectValue placeholder="اختر الكلية" />
                        </SelectTrigger>
                        <SelectContent>
                          {FACULTIES.map(fac => (
                            <SelectItem key={fac} value={fac}>{fac}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.faculty && <p className="text-sm text-destructive mt-1">{errors.faculty}</p>}
                    </div>

                    <div>
                      <Label>السنة الدراسية *</Label>
                      <Select value={formData.academicYear} onValueChange={(v) => updateField('academicYear', v)}>
                        <SelectTrigger className={errors.academicYear ? 'border-destructive' : ''}>
                          <SelectValue placeholder="اختر السنة الدراسية" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACADEMIC_YEARS.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.academicYear && <p className="text-sm text-destructive mt-1">{errors.academicYear}</p>}
                    </div>
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold">Payment Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="paymentCode">
                        كود الدفع *
                      </Label>
                      <Input
                        id="paymentCode"
                        placeholder="أدخل كود الدفع"
                        value={formData.paymentCode}
                        onChange={(e) => updateField('paymentCode', e.target.value)}
                        className={errors.paymentCode ? 'border-destructive' : ''}
                      />
                      {errors.paymentCode && <p className="text-sm text-destructive mt-1">{errors.paymentCode}</p>}
                    </div>

                    <div>
                      <Label>صورة إيصال الدفع *</Label>
                      <div 
                        className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                          errors.paymentScreenshot ? 'border-destructive' : 'border-border hover:border-accent'
                        }`}
                        onClick={() => document.getElementById('paymentFile')?.click()}
                      >
                        <input
                          id="paymentFile"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setPaymentFile(file);
                              setErrors(prev => ({ ...prev, paymentScreenshot: '' }));
                            }
                          }}
                        />
                        {paymentFile ? (
                          <div className="text-success">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                            <p className="font-medium">{paymentFile.name}</p>
                            <p className="text-sm text-muted-foreground">Click to change</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-muted-foreground">اضغط لرفع الصورة</p>
                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                          </>
                        )}
                      </div>
                      {errors.paymentScreenshot && <p className="text-sm text-destructive mt-1">{errors.paymentScreenshot}</p>}
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
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button variant="gradient" onClick={handleNext} className="gap-2">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  variant="gradient" 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Registration
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
