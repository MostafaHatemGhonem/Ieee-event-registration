import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Mail, Send, Eye } from 'lucide-react';
import ieeeLogo from '@/assets/ieee-logo.png';

const EmailPreview = () => {
  const navigate = useNavigate();
  const [previewData, setPreviewData] = useState({
    fullNameArabic: 'محمد أحمد علي حسن',
    fullNameEnglish: 'Mohamed Ahmed Ali Hassan',
    email: 'mohamed@example.com',
    faculty: 'كلية الهندسة',
    phone: '01012345678',
    attendeeId: 'demo-123'
  });

  const generateEmailHTML = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=IEEE-BSU-${previewData.attendeeId}`;
    
    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تأكيد التسجيل - IEEE Beni-Suef</title>
</head>
<body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; margin-bottom: 10px;">🎉 تهانينا!</h1>
            <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px;">تم قبول تسجيلك بنجاح</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <div style="background-color: #10b981; color: white; padding: 12px 24px; border-radius: 50px; display: inline-block; margin-bottom: 20px; font-weight: bold; font-size: 14px;">
                ✓ تم التأكيد
            </div>
            
            <h2 style="font-size: 20px; color: #1f2937; margin-bottom: 15px;">مرحباً ${previewData.fullNameArabic}،</h2>
            
            <p style="color: #6b7280; line-height: 1.8; margin-bottom: 30px; font-size: 16px;">
                يسعدنا إخبارك بأنه تم قبول طلب تسجيلك في فعالية IEEE Beni-Suef بنجاح! 
                نحن متحمسون لاستقبالك ونتطلع لرؤيتك في الفعالية.
            </p>
            
            <!-- Registration Info -->
            <div style="background-color: #f9fafb; border-right: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 18px;">📋 معلومات التسجيل</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 10px 0; color: #6b7280; font-weight: 500;">الاسم:</td>
                        <td style="padding: 10px 0; color: #1f2937; font-weight: 600; text-align: left;">${previewData.fullNameArabic}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 10px 0; color: #6b7280; font-weight: 500;">البريد الإلكتروني:</td>
                        <td style="padding: 10px 0; color: #1f2937; font-weight: 600; text-align: left;">${previewData.email}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 10px 0; color: #6b7280; font-weight: 500;">الكلية:</td>
                        <td style="padding: 10px 0; color: #1f2937; font-weight: 600; text-align: left;">${previewData.faculty}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-weight: 500;">رقم الهاتف:</td>
                        <td style="padding: 10px 0; color: #1f2937; font-weight: 600; text-align: left;">${previewData.phone}</td>
                    </tr>
                </table>
            </div>
            
            <!-- QR Code Section -->
            <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; margin: 30px 0;">
                <h2 style="color: #92400e; margin-bottom: 15px; font-size: 22px;">🎫 QR Code الخاص بك</h2>
                <p style="color: #78350f; margin-bottom: 20px; font-size: 14px;">احتفظ بهذا الرمز معك - ستحتاجه عند الحضور!</p>
                
                <div style="background-color: white; padding: 20px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <img src="${qrUrl}" alt="QR Code" style="width: 250px; height: 250px; display: block;">
                    <div style="margin-top: 15px; font-family: 'Courier New', monospace; font-size: 16px; color: #374151; font-weight: bold; letter-spacing: 2px;">
                        ID: ${previewData.attendeeId}
                    </div>
                </div>
            </div>
            
            <!-- Instructions -->
            <div style="background-color: #eff6ff; border-right: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #1e40af; margin-bottom: 15px; font-size: 18px;">📱 كيفية استخدام QR Code:</h3>
                <ol style="padding-right: 20px; color: #1f2937;">
                    <li style="margin-bottom: 10px; line-height: 1.6;">احفظ هذا الإيميل أو اطبع QR Code</li>
                    <li style="margin-bottom: 10px; line-height: 1.6;">عند الوصول للفعالية، توجه لمكتب التسجيل</li>
                    <li style="margin-bottom: 10px; line-height: 1.6;">أظهر QR Code للموظف المسؤول</li>
                    <li style="margin-bottom: 10px; line-height: 1.6;">سيتم مسح الرمز وتأكيد حضورك</li>
                    <li style="margin-bottom: 10px; line-height: 1.6;">استمتع بالفعالية! 🎉</li>
                </ol>
            </div>
            
            <p style="margin-top: 30px; color: #10b981; font-weight: 600;">نراك قريباً! 👋</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">في حال وجود أي استفسارات، لا تتردد في التواصل معنا</p>
            <p style="font-weight: bold; color: #1f2937;">IEEE Beni-Suef Student Branch</p>
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">© 2025 IEEE Beni-Suef Student Branch. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
  };

  const openPreviewInNewTab = () => {
    const html = generateEmailHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const copyEmailHTML = () => {
    navigator.clipboard.writeText(generateEmailHTML());
    alert('تم نسخ HTML الإيميل!');
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
              <h1 className="text-xl font-bold text-primary-foreground">Email Preview</h1>
              <p className="text-sm text-primary-foreground/70">Preview approval emails</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left: Controls */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-accent" />
                <h2 className="font-semibold text-lg">Email Data</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Full Name (Arabic)</label>
                  <Input
                    dir="rtl"
                    value={previewData.fullNameArabic}
                    onChange={(e) => setPreviewData({ ...previewData, fullNameArabic: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Full Name (English)</label>
                  <Input
                    value={previewData.fullNameEnglish}
                    onChange={(e) => setPreviewData({ ...previewData, fullNameEnglish: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={previewData.email}
                    onChange={(e) => setPreviewData({ ...previewData, email: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Faculty</label>
                  <Input
                    dir="rtl"
                    value={previewData.faculty}
                    onChange={(e) => setPreviewData({ ...previewData, faculty: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone</label>
                  <Input
                    value={previewData.phone}
                    onChange={(e) => setPreviewData({ ...previewData, phone: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Attendee ID</label>
                  <Input
                    value={previewData.attendeeId}
                    onChange={(e) => setPreviewData({ ...previewData, attendeeId: e.target.value })}
                    placeholder="demo-123"
                  />
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <Button 
                  onClick={openPreviewInNewTab} 
                  className="w-full"
                  variant="default"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview in New Tab
                </Button>
                
                <Button 
                  onClick={copyEmailHTML} 
                  className="w-full"
                  variant="outline"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Copy HTML Code
                </Button>
              </div>
            </Card>
            
            {/* Info Card */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Important Notes</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• This is a preview page for testing</li>
                <li>• Actual emails are sent by Backend after approval</li>
                <li>• QR Code format: IEEE-BSU-{'{attendeeId}'}</li>
                <li>• Backend needs to implement email sending</li>
              </ul>
            </Card>
          </div>
          
          {/* Right: Preview */}
          <div>
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">Email Preview</h2>
              <div 
                className="border rounded-lg p-4 bg-gray-50 overflow-auto max-h-[800px]"
                dangerouslySetInnerHTML={{ __html: generateEmailHTML() }}
              />
            </Card>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default EmailPreview;
