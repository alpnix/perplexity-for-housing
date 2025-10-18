"use client"
import React from 'react'; 


// components import
import Header from "./Header"
import { faker } from '@faker-js/faker';

const Landing = () => {
  
  const randomName = faker.person.fullName(); 
  const randomEmail = faker.internet.email(); 

  console.log(randomName, randomEmail);

  return (
    <main
      className="relative w-full h-screen flex flex-col items-center justify-center text-center bg-cover bg-center px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url('assets/images/landing-bg.jpeg')`,
      }}
    >
      <div className="absolute inset-0 bg-black opacity-60 z-0"></div>
      <div className="container flex flex-col items-center justify-between h-full pt-5 pb-12">
        <Header />
          <div className="relative z-20 w-4/6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
                <span className="block xl:inline">Dream Mate,</span>{" "}
                <span className="block text-primary xl:inline">
                  Dream Rental.
                </span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-white mt-4">
              Find your perfect living space hassle-free with Owl! Enjoy secure housing wherever you desire, without the stress of overbidding or uncertainty. 🏡
              </p>    
          </div>
          <div className="relative z-20">
            <form action={"/sign-in"} className="bg-white bg-opacity-50 rounded-lg shadow-md p-6 flex items-center space-x-4 flex-wrap">
            {/* Location */}
            <div className="flex flex-col">
              <label htmlFor="location" className="text-sm font-medium text-gray-900">
                Location
              </label>
              <select
                id="location"
                defaultValue={"default"}
                className="mt-1 block w-40 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="default" disabled >
                  Select
                </option>
                <option value="location1">Amsterdam</option>
                <option value="location2">Den Haag</option>
              </select>
            </div>

            {/* Budget */}
            <div className="flex flex-col">
              <label htmlFor="budget" className="text-sm font-medium text-gray-900">
                Monthly Budget
              </label>
              <select
                id="budget"
                defaultValue={"default"}
                className="mt-1 block w-40 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="default" disabled >
                  Select
                </option>
                <option value="budget1">$250 - $750</option>
                <option value="budget2">$750 - $1500</option>
                <option value="budget2">$1500 or more</option>
              </select>
            </div>

            {/* Roommate */}
            <div className="flex flex-col">
              <label htmlFor="roommate" className="text-sm font-medium text-gray-900">
                Roommate
              </label>
              <select
                id="roommate"
                defaultValue={"default"}
                className="mt-1 block w-40 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="default" disabled >
                  Select
                </option>
                <option value="roommate1">Solo Tenant</option>
                <option value="roommate2">Roommate(s)</option>
              </select>
            </div>

            {/* Property Type */}
            <div className="flex flex-col">
              <label htmlFor="propertyType" className="text-sm font-medium text-gray-900">
                Property Type
              </label>
              <select
                id="propertyType"
                defaultValue={"default"}
                className="mt-1 block w-40 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="default" disabled >
                  Select
                </option>
                <option value="apartment">Studio</option>
                <option value="house">Apartment</option>
              </select>
            </div>

            {/* Search Button */}
            <button className="ml-4 px-6 py-2 bg-primary text-white text-sm font-medium rounded-md shadow hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Search
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Landing;
