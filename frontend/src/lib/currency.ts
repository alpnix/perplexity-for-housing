const getSubCurrency = (amount: number, multiplier = 100) => {
    return Math.round(amount * multiplier); 
}

export default getSubCurrency;