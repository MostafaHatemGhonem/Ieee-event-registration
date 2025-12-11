import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import ieeeLogo from '@/assets/ieee-logo.png';
import season10 from '@/assets/season-10.png';
import { ArrowRight, Calendar, MapPin, Users, Shield, CheckCircle2 } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header subtitle="Season 10" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="mb-8">
              <img src={season10} alt="Season 10" className="h-24 md:h-32 mx-auto" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">IEEE Beni-Suef</span>
              <br />
              <span className="text-foreground">Student Branch Event</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join us for an incredible experience of learning, networking, and innovation. 
              Register now to secure your spot at our flagship event.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="gradient" size="xl" className="gap-2 w-full sm:w-auto">
                  Register Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="xl" className="gap-2 w-full sm:w-auto">
                  <Shield className="w-5 h-5" />
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Event Info Cards */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="card-elevated p-6 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl gradient-primary flex items-center justify-center">
                <Calendar className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Event Date</h3>
              <p className="text-muted-foreground">Coming Soon</p>
              <p className="text-sm text-accent font-medium mt-1">Stay tuned for updates</p>
            </div>
            
            <div className="card-elevated p-6 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl gradient-primary flex items-center justify-center">
                <MapPin className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Location</h3>
              <p className="text-muted-foreground">Beni-Suef University</p>
              <p className="text-sm text-accent font-medium mt-1">Faculty of Engineering</p>
            </div>
            
            <div className="card-elevated p-6 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl gradient-primary flex items-center justify-center">
                <Users className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Attendees</h3>
              <p className="text-muted-foreground">Limited Seats</p>
              <p className="text-sm text-accent font-medium mt-1">Register early!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 gradient-text">Why Attend?</h2>
            
            <div className="space-y-4">
              {[
                'Expert workshops and hands-on sessions',
                'Networking with industry professionals',
                'Exclusive IEEE member benefits',
                'Certificate of participation',
                'Exciting competitions and prizes'
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border hover:shadow-md transition-shadow animate-slide-up"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <p className="font-medium">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto gradient-primary rounded-2xl p-8 md:p-12 text-center shadow-glow">
            <img src={ieeeLogo} alt="IEEE" className="h-16 mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Ready to Join Us?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Don't miss this opportunity to be part of something extraordinary. 
              Registration is quick and easy.
            </p>
            <Link to="/register">
              <Button 
                size="xl" 
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg"
              >
                Register Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 IEEE Beni-Suef Student Branch. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
