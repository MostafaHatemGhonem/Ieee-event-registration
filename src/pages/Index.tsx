import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import ieeeLogo from '@/assets/ieee-logo.png';
import season10 from '@/assets/season-10.png';
import { 
  ArrowRight, Calendar, MapPin, Users, Shield, 
  Lightbulb, Rocket, TrendingUp, Award, Globe,
  MessageSquare, FileText, Network, Zap
} from 'lucide-react';

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
            {/* <div className="mb-8">
              <img src={season10} alt="Season 10" className="h-24 md:h-32 mx-auto" />
            </div> */}
            
            {/* TIME Branding */}
            <div className="mb-6">
              <h1 className="text-7xl md:text-8xl font-black mb-4">
                <span className="gradient-text">TIME</span>
              </h1>
              <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-sm md:text-base font-semibold mb-6">
                <span className="px-4 py-2 rounded-lg bg-accent/10 text-accent border border-accent/20">
                  <Zap className="w-4 h-4 inline mr-1" />
                  Technology
                </span>
                <span className="px-4 py-2 rounded-lg bg-accent/10 text-accent border border-accent/20">
                  <Lightbulb className="w-4 h-4 inline mr-1" />
                  Innovation
                </span>
                <span className="px-4 py-2 rounded-lg bg-accent/10 text-accent border border-accent/20">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Management
                </span>
                <span className="px-4 py-2 rounded-lg bg-accent/10 text-accent border border-accent/20">
                  <Rocket className="w-4 h-4 inline mr-1" />
                  Entrepreneurship
                </span>
              </div>
            </div>
            
            <h2 className="text-2xl md:text-4xl font-bold mb-6 text-foreground">
              Experience Creates Opportunities,<br />
              <span className="gradient-text">Not Just Courses</span>
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your real journey starts when you explore, compete, network, and push yourself. 
              <span className="font-semibold text-foreground"> TIME = Real Experience. Real Expertise.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="gradient" size="xl" className="gap-2 w-full sm:w-auto pulse-glow">
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
            <div className="card-elevated p-6 text-center animate-slide-up hover:scale-105 transition-transform" style={{ animationDelay: '0.1s' }}>
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Calendar className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Event Date</h3>
              <p className="text-muted-foreground">decemper 17 2025</p>
              <p className="text-sm text-accent font-medium mt-1">Registration is open</p>
            </div>
            
            <div className="card-elevated p-6 text-center animate-slide-up hover:scale-105 transition-transform" style={{ animationDelay: '0.2s' }}>
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <MapPin className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Location</h3>
              <p className="text-muted-foreground">القرية الذكية</p>
              <p className="text-sm text-accent font-medium mt-1">Creativa Hub Beni-Suef</p>
            </div>
            
            <div className="card-elevated p-6 text-center animate-slide-up hover:scale-105 transition-transform" style={{ animationDelay: '0.3s' }}>
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Users className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Attendees</h3>
              <p className="text-muted-foreground">Limited Seats</p>
              <p className="text-sm text-accent font-medium mt-1">Register early!</p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Happening */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              What's Happening at <span className="gradient-text">TIME?</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              A day packed with talks, workshops, and networking that will transform how you think about your future
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card-elevated p-6 hover:shadow-glow transition-all animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-lg mb-2">Global Participation</h3>
                <p className="text-sm text-muted-foreground">
                  Learn how joining global initiatives transforms your CV and opens new opportunities
                </p>
              </div>

              <div className="card-elevated p-6 hover:shadow-glow transition-all animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-lg mb-2">Entrepreneurship Mindset</h3>
                <p className="text-sm text-muted-foreground">
                  Think like a founder. Start building yourself while you're still a student
                </p>
              </div>

              <div className="card-elevated p-6 hover:shadow-glow transition-all animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-lg mb-2">Soft Skills Workshop</h3>
                <p className="text-sm text-muted-foreground">
                  Understand why companies prioritize soft skills and how to develop them today
                </p>
              </div>

              <div className="card-elevated p-6 hover:shadow-glow transition-all animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-lg mb-2">Research Paper Guide</h3>
                <p className="text-sm text-muted-foreground">
                  Write effective papers that get you internships, competitions, and scholarships
                </p>
              </div>

              <div className="card-elevated p-6 hover:shadow-glow transition-all animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                  <Network className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-lg mb-2">Networking Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with speakers, sponsors, and ambitious students. Real relationships = Real opportunities
                </p>
              </div>

              <div className="card-elevated p-6 hover:shadow-glow transition-all animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-lg mb-2">Interactive Games</h3>
                <p className="text-sm text-muted-foreground">
                  Fun activities that teach teamwork, communication, leadership, and problem solving
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why TIME Matters */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why <span className="gradient-text">TIME</span> Matters
            </h2>
            
            <div className="space-y-4">
              {[
                { icon: Rocket, text: "Experience that creates real opportunities" },
                { icon: Network, text: "Network with industry leaders and ambitious peers" },
                { icon: Lightbulb, text: "Learn what universities don't teach" },
                { icon: TrendingUp, text: "Build yourself while you're still a student" },
                { icon: Award, text: "Get recognized and open doors to your future" }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border hover:shadow-md transition-all animate-slide-up hover:scale-[1.02]"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <p className="font-semibold text-lg">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto gradient-primary rounded-2xl p-8 md:p-12 text-center shadow-glow animate-fade-in">
            <img src={ieeeLogo} alt="IEEE" className="h-16 mx-auto mb-6" />
            <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-primary-foreground/90 mb-2 text-lg font-semibold">
              Limited Seats Available
            </p>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Don't miss this opportunity to be part of something that will actually change your path. 
              Your future starts here.
            </p>
            <Link to="/register">
              <Button 
                size="xl" 
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg hover:scale-105 transition-transform"
              >
                Register Now - Secure Your Spot
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
            © 2025 IEEE Beni-Suef Student Branch. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
