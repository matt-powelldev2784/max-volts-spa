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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import emailjs from '@emailjs/browser';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/ui/form';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import telIcon from '@/assets/contact_tel.svg';
import emailIcon from '@/assets/contact_at.svg';
import facebookIcon from '@/assets/facebook.svg';
import instaIcon from '@/assets/insta.svg';
import formEmailIcon from '@/assets/email_lightgrey.svg';
import formPersonIcon from '@/assets/person.svg';
import formTelephoneIcon from '@/assets/tel.svg';
import { useState } from 'react';
import dashboardIcon from '@/assets/dashboard.svg';

const Homepage = () => {
  return (
    <>
      <NavBar />
      <Hero />
      <About />
      <Services />

      <section className="bg-dark-black w-screen py-8 pb-16 lg:pt-24 md:py-16 md:px-8 lg:pb-32" id="contact">
        <div className="flex flex-col lg:flex-row gap-12 min-w-[320px] items-center lg:items-start justify-center">
          <ContactForm />
          <ContactDetails />
        </div>
      </section>

      <Footer />
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
            <img src={facebookLogo} width={40} height={40} alt="Facebook Logo" className="h-[30px] md:h-[40px]" />
          </a>

          <a href="https://www.instagram.com/max.volts.electricalservices/?hl=en" target="_blank">
            <img src={instagramLogo} width={40} height={40} alt="Instagram Logo" className="h-[30px] md:h-[40px]" />
          </a>

          <a href="mailto:maxvoltselectricalservices@gmail.com">
            <img src={emailLogo} width={40} height={40} alt="Email Logo" />
          </a>

          <a href="tel:07877695996">
            <img src={telLogo} width={40} height={40} alt="Telephone Logo" className="h-[30px] md:h-[40px]" />
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

            <LinkButton className="py-4 md:py-6 px-6 md:px-8 font-bold rounded-xl" to="#contact" size="formButton">
              GET A FREE QUOTE TODAY
            </LinkButton>
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

        <LinkButton to="#contact" size="formButton">
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

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Valid email is required'),
  tel: z
    .string()
    .min(7, 'Valid telephone number is required')
    .refine((val) => /^\d+$/.test(val), {
      message: 'Telephone number must be numeric',
    }),
  message: z.string().min(1, 'Message is required'),
});
type FormValues = z.infer<typeof formSchema>;

export const ContactForm = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      tel: '',
      message: '',
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: FormValues) => {
    const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    setSuccessMessage('');
    setErrorMessage('');
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, values, {
        publicKey: EMAILJS_PUBLIC_KEY,
      });
      reset();
      setSuccessMessage('Thank you for your enquiry, we will be in contact soon.');
    } catch (error) {
      setErrorMessage('Sorry, something went wrong. Please try again later.');
      console.error('EmailJS error:', error);
    }
  };

  return (
    <div className="w-full lg:w-[800px] lg:ml-8">
      <h1 className="w-full text-center lg:text-left text-2xl md:text-2xl lg:text-3xl font-bold text-mv-orange mb-4 md:mb-4">
        ENQUIRY FORM
      </h1>

      <p className="text-white mb-4 text-center lg:text-left ml-0.5 px-8 md:px-0">
        Leave your details below and we will contact you:
      </p>

      <Form {...form}>
        <form className="flex flex-col items-center lg:items-start w-full" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="w-full px-6 lg:px-0 flex flex-col gap-4 md:max-w-[800px] md:w-full">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white data-[error=true]:text-white">
                    Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Name" variant="homepage" iconSrc={formPersonIcon} />
                  </FormControl>
                  <FormMessage className="text-white text-xs -translate-0.75 font-extralight" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white data-[error=true]:text-white">
                    Email <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Email"
                      autoComplete="email"
                      variant="homepage"
                      iconSrc={formEmailIcon}
                      iconAlt="Email icon"
                    />
                  </FormControl>
                  <FormMessage className="text-white text-xs -translate-0.75 font-extralight" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white data-[error=true]:text-white">
                    Telephone Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="Telephone Number"
                      autoComplete="tel"
                      variant="homepage"
                      iconSrc={formTelephoneIcon}
                      iconAlt="Telephone icon"
                    />
                  </FormControl>
                  <FormMessage className="text-white text-xs -translate-0.75 font-extralight" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white data-[error=true]:text-white">
                    Message <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Message" variant="homepage" />
                  </FormControl>
                  <FormMessage className="text-white text-xs -translate-0.75 font-extralight" />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            size="formButton"
            className={`text-white bg-mv-orange h-[45px] mt-6 rounded-xl font-bold lg:w-fit px-8 ${
              isSubmitting ? 'bg-mv-orange/50' : 'bg-mv-orange'
            }`}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            SEND MESSAGE
          </Button>

          {successMessage && (
            <p className="text-mv-green text-sm md:text-lg m-4 mx-6 lg:mx-0 text-center lg:text-left">
              {successMessage}
            </p>
          )}

          {errorMessage && (
            <p className="text-red-400 text-sm md:text-lg m-4 mx-6 lg:mx-0 text-center lg:text-left">{errorMessage}</p>
          )}
        </form>
      </Form>
    </div>
  );
};

const ContactDetails = () => (
  <div className="hidden lg:flex flex-col gap-16 w-[250px] min-w-[250px] text-light-grey lg:mx-8">
    <div className="flex flex-col items-center gap-2">
      <img src={telIcon} alt="Telephone Icon" className="w-[80px]" />
      <p className="text-lg">PHONE:</p>
      <a className="text-lg" href="tel:07877695996">
        07877 695 996
      </a>
    </div>
    <div className="flex flex-col items-center gap-2">
      <img src={emailIcon} alt="Email Icon" className="w-[80px]" />
      <p className="text-lg">EMAIL:</p>
      <a className="text-lg text-center" href="mailto:max.volts.electricalservices@gmail.com">
        MaxVoltsElectricalServices
        <br />
        @gmail.com
      </a>
    </div>
    <div className="flex flex-row items-center justify-center gap-8">
      <a href="https://www.facebook.com/MaxVoltsElectricalServices" target="_blank">
        <img src={facebookIcon} alt="Facebook Icon" className="w-[50px]" />
      </a>
      <a href="https://www.instagram.com/max.volts.electricalservices/?hl=en" target="_blank">
        <img src={instaIcon} alt="Instagram Icon" className="w-[50px]" />
      </a>
    </div>
  </div>
);

export const Footer = () => {
  return (
    <footer className="relative w-screen bg-neutral-700 pb-10 min-w-[320px]">
      <div className="flex flex-col gap-8 text-lg text-white md:flex-row">
        <div className="min-w-[320px] grow pt-4 text-center md:pl-8 md:text-left">
          <p className="pb-2 text-lg font-bold md:pb-4">Links</p>
          <div className="flex flex-row items-center justify-center gap-4 md:justify-start">
            <a href="https://www.facebook.com/MaxVoltsElectricalServices" target="_blank" rel="noopener noreferrer">
              <img
                src={facebookIcon}
                alt="Facebook Logo"
                width={40}
                height={40}
                className="h-[30px] md:h-[40px]"
                draggable={false}
              />
            </a>
            <a
              href="https://www.instagram.com/max.volts.electricalservices/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={instaIcon}
                alt="Instagram Logo"
                width={40}
                height={40}
                className="h-[30px] md:h-[40px]"
                draggable={false}
              />
            </a>
            <a href="mailto:maxvoltselectricalservices@gmail.com">
              <img
                src={emailIcon}
                alt="Email Logo"
                width={40}
                height={40}
                className="h-[30px] md:h-[40px]"
                draggable={false}
              />
            </a>
            <a href="tel:07877695996">
              <img
                src={telIcon}
                alt="Telephone Logo"
                width={40}
                height={40}
                className="h-[30px] md:h-[40px]"
                draggable={false}
              />
            </a>
          </div>

          <div className="min-w-[320px] mt-8 gap-2 flex flex-col items-center md:gap-4 md:items-start md:justify-start">
            <p className="text-lg font-bold">Employee Dashboard</p>
            <Link to="/login">
              <img
                src={dashboardIcon}
                alt="Dashboard Icon"
                width={40}
                height={40}
                className="h-[28px] md:h-[38px]"
                draggable={false}
              />
            </Link>
          </div>
        </div>

        <div className="grow text-center md:pr-10 md:pt-4 md:text-right">
          <p className="font-bold">Telephone</p>
          <a href="tel:07877695996">07877 695 996</a>

          <p className="font-bold mt-8">Email</p>
          <a href="mailto:maxvoltselectricalservices@gmail.com" className="text-sm md:text-base lg:text-lg">
            MaxVoltsElectricalServices
            <br />
            @gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Homepage;
