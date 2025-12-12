import ieeeLogo from '@/assets/ieee-logo.png';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header = ({ title = "IEEE Beni-Suef Student Branch", subtitle }: HeaderProps) => {
  return (
    <header className="gradient-primary py-6 px-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={ieeeLogo} alt="IEEE Logo" className="h-14 md:h-16 w-auto" />
          <div>
            <h1 className="text-base md:text-lg font-bold text-primary-foreground">{title}</h1>
            {subtitle && (
              <p className="text-xs md:text-sm text-primary-foreground/80">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
