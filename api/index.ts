import axios from "axios";
const CryptoJS = require("crypto-js");
const Secret = "bc1pgqsp3gdl0qead7u5lwtf3srhk200xjlzaf5ndx2790lm8mznhqps832hly";

export const getTotalData = async () => {
  try {
    const { data } = await axios.get(`/api/getTotalData`);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getRank = async (startTime: Number, endTime: Number) => {
  try {
    const { data } = await axios.get(`/api/getRank/${startTime}/${endTime}`);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getInviteRank = async (day: Number) => {
  try {
    const { data } = await axios.get(`/api/getInviteRank/${day}`);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getLucky = async (startTime: Number, endTime: Number) => {
  try {
    const { data } = await axios.get(`/api/getLucky/${startTime}/${endTime}`);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getLuckyRank = async (day: Number) => {
  try {
    const { data } = await axios.get(`/api/getLuckyRank/${day}`);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getDataByAddress = async (address: String) => {
  try {
    const { data } = await axios.get(`/api/getDataByAddress/` + address);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getFloorDataByAddress = async (address: String) => {
  try {
    const { data } = await axios.get(`/api/getFloorDataByAddress/` + address);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getInviteDataByAddress = async (address: String) => {
  try {
    const { data } = await axios.get(`/api/getInviteDataByAddress/` + address);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getBalance = async (address: String) => {
  try {
    const { data } = await axios.get(
      `https://mempool.space/api/address/` + address
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getFeerate = async () => {
  try {
    const { data } = await axios.get(
      `https://mempool.space/api/v1/fees/recommended`
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const sendBitcoin = async (
  address: String,
  tx: String,
  amount: Number,
  invite_address: String
) => {
  try {
    const parms = CryptoJS.AES.encrypt(
      JSON.stringify({
        address: address,
        tx: tx,
        amount: amount,
        invite_address: invite_address,
      }),
      Secret
    ).toString();
    console.log("AES", parms);
    const { data } = await axios.post(`/api/sendBitcoin`, {
      parms: parms,
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};
