"use client";

import React from "react"

import CheckoutForm from "@/components/CheckoutForm"

import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import getSubCurrency from "@/lib/currency";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined"); 
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
const amount = 10.00; 


function Donate() {
    const [amount, setAmount] = React.useState(10.00);

    return (
        <Elements 
        stripe={stripePromise}
        options={{
            mode: "payment", 
            amount: getSubCurrency(amount), 
            currency: "usd",
        }}>
            <CheckoutForm />
        </Elements>
    )
}

export default Donate; 