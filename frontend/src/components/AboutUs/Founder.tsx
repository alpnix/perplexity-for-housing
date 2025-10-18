import Link from "next/link";
import React from "react";

interface FounderProps {
    image: string;
    name: string;
    description: string;
    email: string;
}

const Founder: React.FC<FounderProps> = ({
    image, 
    name, 
    description, 
    email
}) => {
  return (
    <div
        className="rounded-lg p-4 flex flex-col items-center"
    >
        <img
        src={image}
        alt={name}
        className="rounded-full w-32 h-32 mb-4 shadow-lg"
        />
        <h2 className="text-2xl mb-2">{name}</h2>
        <p className="text-center">{description}</p>
        <Link
        href={`mailto:${email}`}
        className="mt-2 text-primary hover:underline hover:text-secondary "
        >
        {email}
        </Link>
    </div>
  );
};

export default Founder;