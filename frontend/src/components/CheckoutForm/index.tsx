"use client"

import React, {useState, useEffect} from "react"
import Image from "next/image"
import Link from "next/link"
import {
    useStripe, 
    useElements, 
    PaymentElement
} from "@stripe/react-stripe-js"

import getSubCurrency from "@/lib/currency";

function CheckoutForm () {
    const postURL = process.env.NEXT_PUBLIC_API_URL + "/users/payment";
    const stripe = useStripe()
    const elements = useElements()

    const [error, setError] = useState<string | null>(null)
    const [clientSecret, setClientSecret] = useState(""); 
    const [processing, setProcessing] = useState(false);

    const [amount, setAmount] = useState(10.00);

    useEffect(() => {
        fetch(postURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({amount: getSubCurrency(amount)})
        }) 
        .then(res => res.json())
        .then(data => {
            console.log("Data: ", data);
            if (!data.data) {
                setError("An error occurred. Please try again later.");
                return;
            }
            setClientSecret(data.data.client_secret);
        }); 
    }, [amount])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setProcessing(true);
    }

    return (
        <div className="flex flex-col md:flex-row lg:flex-row h-screen">
          {/* Left Side - Background Image (hidden on small screens) */}
          <div className="relative w-full lg:w-1/2 h-64 md:h-full lg:h-full hidden md:block">
            <Image
              src="/assets/footer/get-started-background.jpeg"
              alt="Checkout Background"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
    
          {/* Right Side - Checkout Form */}
          <div className="w-full lg:w-1/2 flex flex-col py-10 px-6 sm:px-10 justify-center bg-white">
            {/* Logo / Header */}
            <div className="flex justify-center items-center mb-6">
              <Link href="/" className="flex items-center space-x-2">
                <img
                  src="assets/images/logo.png"
                  alt="Company Logo"
                  className="h-12 object-contain"
                />
              </Link>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Checkout</h2>
    
            {/* Stripe Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Donation Amount Input */}
              <div className="space-y-2">
                <label
                  htmlFor="donationAmount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Donation Amount (USD)
                </label>
                <input
                  id="donationAmount"
                  type="number"
                  step="0.01"
                  min={0.5}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-primary focus:border-primary sm:text-sm"
                />
              </div>
    
              {/* Payment Element */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Payment Details
                </label>
                <div className="block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-primary focus:border-primary sm:text-sm">
                  <PaymentElement />
                </div>
              </div>
    
              {/* Error Message */}
              {error && <p className="text-red-500 text-sm">{error}</p>}
    
              {/* Submit Button */}
              <div className="flex flex-col justify-center items-center gap-2">
                <button
                  type="submit"
                  disabled={!stripe || processing}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#142329]"
                >
                  {processing ? "Processing..." : `Donate $${amount}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      );    
}


export default CheckoutForm;