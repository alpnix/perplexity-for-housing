import React from "react"; 

const Features = () => {

    const features = [
        {
            heading: 'AI Matching',
            description: 'Our advanced AI algorithms ensure personalized matches between tenants and houses or compatible roommates, streamlining the search process for a perfect fit. Forget the stress of endless browsing—our intelligent system works tirelessly to match you with options tailored to your preferences.', 
            image: 'assets/features/ai-matching.png'
        },
        {
            heading: 'Secure Payments',
            description: 'Integrated with Stripe API, Owl provides a seamless and secure payment platform. Tenants and landlords can easily handle rent payments, deposits, and other transactions without worrying about fraud or delays. Transparency and security are at the core of every transaction.', 
            image: 'assets/features/secure-payments.jpg'
        },
        {
            heading: 'House Pool',
            description: 'Owl offers a comprehensive pool of rental properties, making it easy for users to explore listings with detailed profiles, availability, and amenities. Landlords can showcase their properties to the right audience, and tenants can find their ideal living space with ease.', 
            image: 'assets/features/house-pool.jpg'
        }
    ];

    return (
    <section id="features" className="features py-12 bg-gray-50 relative overflow-hidden -z-20">
        {/* Background SVG */}
        <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 10000"
        className="absolute left-1/2 -translate-x-1/2 w-full h-auto -z-10 opacity-30"
        >
        <path
            d="
            M50,50 C200,150 200,300 400,350 
            C600,400 600,550 300,600 
            C100,650 100,800 400,850 
            C700,900 700,1050 400,1100
            "
            fill="none"
            stroke="#9b775c"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="10,10"
        />
        </svg>            
        <div className="container mx-auto flex justify-between items-center mb-16 gap-3 md:flex-row flex-col md:w-5/6">
                <h2 className="text-4xl font-bold md:text-left md:w-2/6 text-center w-full">
                Why Choose Us? 
                </h2>
                <p className="text-md md:text-right md:w-3/6 text-center w-full">
                🔑 Read more about our distinctive features that set us apart from the rest of the competitors. 
                </p>
          </div>

          <div className="features__container max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
            {features.map((feature, index) => (
              <div
                className={`feature__box flex flex-col-reverse lg:flex-row 
                  ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}
                  ${index % 2 === 1 ? "lg:flex-wrap-reverse" : ""}
                 items-center gap-8 lg:flex-items-center
                 lg:gap-12`
                }
                key={feature.heading}
              >
                {/* Text Content */}
                <div className={`
                    features__content max-w-xl text-center flex-col
                    ${index % 2 === 1 ? "lg:text-left" : ""}
                    ${index % 2 === 0 ? "lg:text-right" : ""}
                `}>
                  <h2 className="features__heading text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                    {feature.heading}
                  </h2>
                  <p className="features__description text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                {/* Image */}
                <div className="features__image flex-shrink-0 max-w-xl">
                  <img
                    src={feature.image}
                    alt={feature.heading}
                    className="w-full lg:max-w-md rounded-lg shadow-md object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
    );
};
      
export default Features