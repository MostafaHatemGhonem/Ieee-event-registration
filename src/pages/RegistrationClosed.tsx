import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const RegistrationClosed = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header subtitle="Event Registration" />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto text-center animate-scale-in">
          <div className="card-elevated p-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-4 gradient-text">Registration Closed</h2>
            <p className="text-muted-foreground mb-4">
              We're sorry — registrations are currently closed. Thank you for your interest.
            </p>
            <p className="text-muted-foreground mb-6 text-sm">
              If you believe this is an error or want to ask about waitlist options, please contact the organizers.
            </p>

            <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegistrationClosed;
