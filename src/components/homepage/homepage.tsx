import { Link } from 'react-router';
import facebookLogo from '@/assets/facebook.svg';
import instagramLogo from '@/assets/insta.svg';
import emailLogo from '@/assets/email_circle.svg';
import telLogo from '@/assets/tel_circle.svg';
import maxVoltsLogo from '@/assets/max_volts_logo.svg';
import { Fade } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import { slideImages } from './slideData';
import { Button } from '@/ui/button';

const Homepage = () => {
  return (
    <>
      <NavBar />
      <Hero />
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

export const Hero = () => (
  <section className="relative overflow-hidden bg-darkBlack">
    <Fade arrows={false} duration={5000} transitionDuration={700} pauseOnHover={false}>
      {slideImages.map(({ key, image, alt, title1, title2, title3, text }) => (
        <div key={key} className="w-full h-[215px] md:h-[380px] lg:h-[620px] relative overflow-hidden">
          {/* Overlay */}
          <div className="absolute w-full h-full bg-black/60 z-10"></div>

          {/* Background Image */}
          <img
            src={typeof image === 'string' ? image : (image as string)}
            alt={alt}
            className="object-cover w-full h-full absolute inset-0 z-0"
          />

          {/* Text Overlay */}
          <div className="absolute top-0 flex flex-col items-center justify-center lg:items-start lg:left-32 lg:max-w-[750px] h-full w-full z-20 gap-4">
            <p className="text-center max-w-[280px] md:max-w-[750px] lg:max-w-[680px] lg:text-left font-bold text-2xl md:text-3xl lg:text-5xl text-white mx-2 md:mx-16 lg:mx-0 rounded-xl mb-2">
              {title1.toUpperCase()}
              <span className="text-mv-orange">{' ' + title2.toUpperCase() + ' '}</span>
              <span>{title3.toUpperCase()}</span>
            </p>

            <p className="hidden text-justify text-white text-sm mx-6 rounded-xl py-2 mb-4 md:mx-16 md:block md:text-base md:text-center lg:text-xl lg:text-left lg:mx-0 ">
              {text}
            </p>

            {/* <a
              href="#contact"
              className="text-white bg-mv-orange flex flex-col items-center justify-center w-[265px] md:w-[300px] sm:max-h-[40px] max-h-[45px] mt-4 md:mt-0 rounded-xl font-bold"
            > */}
            <Button className="py-4 md:py-6 px-6 md:px-8 rounded-sm font-bold">GET A FREE QUOTE TODAY</Button>
            {/* </a> */}
          </div>
        </div>
      ))}
    </Fade>
  </section>
);
