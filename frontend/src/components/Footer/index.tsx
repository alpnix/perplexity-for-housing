import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

const Footer: FC = () => {
  return (
    <footer className="bg-gray-900 text-white flex flex-col mt-auto">
      <div className="container mx-auto flex justify-between pt-5 px-10 space-x-2 flex-wrap">
        <div>
            <div className="relative flex items-center mb-[1.5rem]">
            <Image
              src="/assets/footer/logo.png"
              alt="Owl Logo"
              className="mr-2"
              width={26}
              height={26}
              style={{ width: "auto", height: "auto" }}
            />
            <p className="m-0">Owl</p>
            </div>
          <div className="relative flex space-x-4 items-center mt-4">
            <div className="w-4">
              <Image
                src="/assets/footer/location.png"
                alt="Location Logo"
                width={24}
                height={24}
              />
            </div>
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400"
            >
              Amsterdam, Netherlands
            </Link>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="w-4">
              <Image
                src="/assets/footer/linkedin.png"
                alt="LinkedIn Logo"
                width={24}
                height={24}
              />
            </div>
            <Link
              href="https://www.linkedin.com/company/grotn/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400"
            >
              linkedin.com/company/grotn/
            </Link>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="w-4">
              <Image
                src="/assets/footer/mail.png"
                alt="Email Logo"
                width={24}
                height={24}
              />
            </div>
            <Link
              href="mailto:info@sgrotn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400"
            >
              info@grotn.com
            </Link>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="w-4">
            &copy; 
            </div>
            <Link
              href="https://www.linkedin.com/company/grotn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400"
            >
              {new Date().getFullYear()} developed by{' '} Team Owl
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-lg">Services</h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-400">
            <li className="flex items-center">
              <Link href="#" className="text-sm text-gray-400">
                Tenant
              </Link>
            </li>
            <li className="flex items-center">
              <Link href="#" className="text-sm text-gray-400">
                Landlord
              </Link>
            </li>
            <li className="flex items-center">
              <Link href="#" className="text-sm text-gray-400">
                Looking for a Roommate
              </Link>
            </li>
            <li className="flex items-center">
              <Link href="#" className="text-sm text-gray-400">
                Real Estate
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg">Pages</h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-400">
            <li className="flex items-center">
              <Link href="#" className="text-sm text-gray-400">
                About Us
              </Link>
            </li>
            <li className="flex items-center">
              <Link href="#" className="text-sm text-gray-400">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg">Resources</h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-400">
            <li className="flex items-center">
              <Link href="#" className="text-sm text-gray-400">
                Site
              </Link>
            </li>
            <li className="flex items-center">
              <Link href="#" className="text-sm text-gray-400">
                Plans
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="w-full h-[15rem] -mt-10 relative">
        <Image
          src="/assets/footer/footer-bottom-image.png"
          alt="Footer Bottom Image"
          fill
          priority={true}
        />
      </div>
    </footer>
  );
};

export default Footer;
