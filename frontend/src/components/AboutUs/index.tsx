import React from "react";

import Founder from "./Founder";

const teamMembers = [
  {
      name: "Cagan",
      description: "CEO @ GrotN",
      email: "cagan04oflazoglu@gmail.com",
      image: "assets/team/Cagan-Oflazoglu.jpg",
  },  
  {
    name: "Alp",
    description: "CTO @ GrotN",
    email: "alniksarli@davidson.edu",
    image: "assets/team/Alp-Niksarli.jpg",
  },
];
  

const AboutUs: React.FC = () => {
  return (
    <section id="about" className="bg-gray-100 py-20">
      <div className="container mx-auto">
      <div className="container mx-auto flex justify-between items-center mb-16 gap-3 md:flex-row flex-col md:w-5/6">
            <h2 className="text-4xl font-bold md:text-left md:w-2/6 text-center w-full">
            Who are we? 
            </h2>
            <p className="text-md md:text-right md:w-3/6 text-center w-full">
            🏡 GrotN is an all-in-one housing platform aimed at solving challenges in finding secure, affordable, and convenient housing.
            </p>
        </div>
        <div className="founders flex justify-evenly flex-wrap">
            {teamMembers.map((member) => (
                <Founder
                    key={member.name}
                    name={member.name}
                    description={member.description}
                    email={member.email}
                    image={member.image}
                />
            ))}
        </div>
      </div>
    </section>
  );
};

export default AboutUs;