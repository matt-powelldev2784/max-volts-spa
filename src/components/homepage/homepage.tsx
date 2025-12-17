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
import toolsFan from '@/assets/tools_fan.png';
import springSvg from '@/assets/spring.svg';
import { servicesData } from './servicesData';
import { LinkButton } from '@/ui/button';

const Homepage = () => {
  return (
    <>
      <NavBar />
      <Hero />
      <About />
      <Services />
    </>
  );
};

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

const About = () => {
  return (
    <section className="w-full h-full flex items-center justify-center flex-col lg:flex-row gap-0 lg:gap-30 bg-dark-black p-8 md:p-16">
      <div className="relative hidden lg:block w-1/2 max-w-[500px] pt-8 pb-8">
        <img src={toolsFan} alt="Electrician tools" className="object-cover" />
      </div>

      <div className="w-full md:w-full lg:w-1/2 text-white">
        <h1 className="text-center text-xl md:text-2xl lg:text-3xl lg:text-left font-bold text-mv-orange">
          MAX VOLTS ELECTRICAL SERVICES
        </h1>
        <h2 className="text-center text-xl lg:text-left lg:text-2xl mb-8 text-mv-green">About Us</h2>
        <p className="text-justify lg:text-left text-md mb-4 text-[17px] md:text-[19px]">
          Max Volts Electrical Services is a Surrey based electrical contractor serving both commercial and domestic
          customers in and around the M25 and London.
        </p>
        <p className="text-justify lg:text-left mb-4 text-[17px] md:text-[19px]">
          Max Volts ethos is to provide high-quality workmanship and deliver total satisfaction to all of our clients
          thus forging long-lasting business relationships.
        </p>
        <p className="text-justify lg:text-left text-[17px] md:text-[19px]">
          We can take a project from design to completion whether it&apos;s for a small commercial outlet, domestic
          household or a large office refurbishment. So why not call us now on 07877 695 996 to book an engineer.
        </p>
      </div>
    </section>
  );
};

interface CardItemProps {
  title: string;
  text: string;
  image: string;
}

const CardItem = ({ title, text, image }: CardItemProps) => (
  <article className="w-fit h-auto max-w-[700px] md:max-w-[800px] mx-auto flex flex-col md:flex-row lg:flex-col md:gap-8 overflow-hidden">
    <div className="relative rounded-3xl overflow-hidden w-full md:max-w-[350px] lg:max-h-[400px] z-20">
      <img src={image} alt="Electrical image" className="object-cover" />
    </div>

    <div className="relative w-full h-auto md:h-full z-10 mt-3 md:m-0 flex flex-col justify-between">
      <div className="absolute -top-[116px] left-1/2 -translate-x-1/2 z-10 hidden lg:block">
        <img src={springSvg} alt="Electrician tools" className="w-[75px]" />
      </div>

      <div className="w-full md:max-w-[350px] md:h-full lg:h-[250px] lg:mt-4 flex flex-col justify-between">
        <h2 className="text-center text-mv-green text-lg font-bold my-2 md:my-0 border-2 border-mv-green rounded-xl p-2">
          {title}
        </h2>

        <p className="grow text-justify text-white md:text-center lg:text-justify my-4">{text}</p>

        <LinkButton to="/contact" size="formButton">
          MORE INFO
        </LinkButton>
      </div>
    </div>
  </article>
);

export const Services = () => {
  return (
    <section className="bg-dark-black py-8 lg:pt-16 md:py-16 px-8 pb-16">
      <h1 className="w-full text-center text-xl md:text-2xl lg:text-3xl font-bold text-mv-orange mb-4 md:mb-8">
        OUR SERVICES
      </h1>
      <div className="w-fit mx-auto grid grid-cols-1 lg:grid-cols-3 gap-20 lg:gap-20 place-content-center justify-center">
        {servicesData.map((service) => (
          <CardItem key={service.key} image={service.image} title={service.title} text={service.text} />
        ))}
      </div>
    </section>
  );
};

export default Homepage;
