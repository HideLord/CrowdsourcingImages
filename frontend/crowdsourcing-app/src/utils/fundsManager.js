import { getCurrentUserInfo, updateFunds } from "./dbUtil";

/**
 * Conditional calling of payed API function. It checks if the user has funds before making the call. After the call, it updates them.
 * 
 * @param {*} priceFunction function that, given the response of the api call, will calculate the price.
 * @param {*} apiFunction the api call function
 * @param {*} args args passed to the api call function
 */
export default async function checkFundsAndSend(priceFunction, apiFunction, args) {
    const userInfo = await getCurrentUserInfo(); // we do not catch on purpose.

    if (userInfo.cash_spent >= userInfo.cash_limit) {
        throw new Error("Could not process API call. Low funds.");
    }

    const response = await apiFunction(...args);

    updateFunds(priceFunction(response));

    return response;
}