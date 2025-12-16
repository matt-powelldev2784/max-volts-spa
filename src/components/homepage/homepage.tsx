import { Link } from 'react-router';
import facebookLogo from '@/assets/facebook.svg';
import instagramLogo from '@/assets/insta.svg';
import emailLogo from '@/assets/email_circle.svg';
import telLogo from '@/assets/tel_circle.svg';
import maxVoltsLogo from '@/assets/max_volts_logo.svg';

const Homepage = () => {
  return (
    <>
      <NavBar />
    </>
  );
};

export default Homepage;

export const NavBar = () => {
  return (
    <header>
      <nav className="w-full h-auto flex flex-col justify-between items-center bg-dark-black md:flex-row px-0 md:px-10">
        <Link to="/" className="h-full">
          <img src={maxVoltsLogo} alt="Max Volts Logo" className="h-14 md:h-16 py-2 md:py-1.5" />
        </Link>

        <div className="w-full md:w-auto gap-0 md:gap-8 flex justify-evenly md:justify-center py-2">
          <a href="https://www.facebook.com/MaxVoltsElectricalServices" target="_blank">
            <img src={facebookLogo} alt="Facebook Logo" width={40} height={40} className="h-[30px] md:h-[40px]" />
          </a>

          <a
            href="https://www.instagram.com/max.volts.electricalservices/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={instagramLogo} alt="Instagram Logo" width={40} height={40} className="h-[30px] md:h-[40px]" />
          </a>

          <a href="mailto:maxvoltselectricalservices@gmail.com">
            <img src={emailLogo} alt="Email Logo" width={40} height={40} className="h-[30px] md:h-[40px]" />
          </a>

          <a href="tel:07877695996">
            <img src={telLogo} alt="Telephone Logo" width={40} height={40} className="h-[30px] md:h-[40px]" />
          </a>
        </div>
      </nav>
    </header>
  );
};
