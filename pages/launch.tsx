import HeaderFooter from "../layout/HeaderFooter";
import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCards, Thumbs, EffectCreative } from "swiper/modules";
import "swiper/css";
import Link from "next/link";
import {
  getTotalData,
  getDataByAddress,
  getFloorDataByAddress,
  getInviteDataByAddress,
  getBalance,
  getFeerate,
  sendBitcoin,
  getInviteRank,
  getLuckyRank,
} from "../api";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Decimal from "decimal.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { NextPageContext } from "next";

const tp = require("tp-js-sdk");
dayjs.extend(utc);

const config: Object = {
  position: "bottom-left",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark",
};

Home.getInitialProps = async ({ query }: NextPageContext) => {
  const { invite } = query;
  return { invite };
};

interface Context extends NextPageContext {
  invite: string;
}

export default function Home({ invite }: Context) {
  const fundAddress = "tb1p282kvgryczkeellt8x7ucp7dzt5kqktlydyhvm52zc9y2jegn4dsqnjeys";
  const startDate = "2023-11-16"

  const ieoDate = dayjs.utc(startDate);
  const day = dayjs
    .utc()
    .diff(dayjs.utc(startDate).format("YYYY-MM-DD"), "day");

  const [account, setAccount] = useState("");
  const [myDataList, setMyDataList] = useState([]);
  const [totalData, setTotalData] = useState({
    btc_amount: 0,
    users_conunt: 0,
  });
  const [myData, setMyData] = useState({
    btc_amount: 0,
    token_amount: 0,
    inviter_btc_amount: 0,
    inviter_token_amount: 0,
    invite_count: 0,
  });
  const [rankData, setRankData] = useState([]);
  const [lucyData, setLucyData] = useState([]);
  const [showMyDataList, setShowMyDataList] = useState(false);
  const [myInviteDataList, setMyInviteDataList] = useState([]);
  const [showMyInviteDataList, setShowInviteMyDataList] = useState(false);
  const [value, setValue] = useState(0);
  const [balance, setBalance] = useState(0);
  const [inviteAddress, setInviteAddress] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const [rankDay, setRankDay] = useState(day);
  const [luckyDay, setLuckyDay] = useState(day);

  const router = useRouter();

  const formatAddress = (address: string) => {
    return (
      address.substr(0, 8) + "......" + address.substr(address.length - 8, 8)
    );
  };

  const getInitData = async () => {
    let promiseArr = [
      getInviteRank(day),
      getLuckyRank(day),
    ];
    const data = await Promise.all(promiseArr);
    setRankData(data[0].data.rank);
    setLucyData(data[1].data.lucky);
    setInviteAddress(invite);
  };

  useEffect(() => {
    getInitData();
    const interval = setInterval(async () => {
      let promiseArr = [getTotalData()];
      const data = await Promise.all(promiseArr);
      console.log("promiseArr", data, data[0].data);
      // const { data: totalData } = ;
      setTotalData(data[0].data);
      // console.log("totalData", totalData);
      // const { data: rankDatas } = ;
      // console.log("rankDatas", 
      // console.log("rankData", rankDatas);
      !!(window as any).account &&
        setAccount(
          (window as any).account.unisat != ""
            ? (window as any).account.unisat
            : (window as any).account.okx != ""
            ? (window as any).account.okx
            : (window as any).account.tp
        );
      // let unisatBalance = await (window as any).unisat.getBalance();
      // console.log("unisatBalance", unisatBalance)
      //   let unisatBalance = await (window as any).unisat.getBalance();
      if (!!account) {
        let promiseArr = [getDataByAddress(account), getBalance(account)];
        const data = await Promise.all(promiseArr);
        console.log("promiseArr", data);
        // const { data: myData } = await getDataByAddress(account);
        // console.log("getDataByAddress", myData)
        setMyData(data[0].data);
        // let btcBalance = await getBalance(account)
        // console.log("btcBalance", btcBalance.chain_stats.funded_txo_sum - btcBalance.chain_stats.spent_txo_sum)
        // setBalance(data[1].chain_stats.funded_txo_sum - data[1].chain_stats.spent_txo_sum)
        setBalance(100);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [ account, dayjs]);

  const getMyDataList = async () => {
    if (!!account) {
      setShowMyDataList(true);
      setShowInviteMyDataList(false);
      const { data: myDataList } = await getFloorDataByAddress(account);
      console.log("myDataList", myDataList);
      setMyDataList(myDataList);
    } else {
      toast("❌ Please Connect wallet", config);
    }
  };

  const getMyInviteDataList = async () => {
    if (!!account) {
      setShowInviteMyDataList(true);
      setShowMyDataList(false);
      const { data: myInviteDataList } = await getInviteDataByAddress(account);
      console.log("myInviteDataList", myInviteDataList);
      setMyInviteDataList(myInviteDataList);
    } else {
      toast("💰 Please Connect wallet", config);
    }
  };

  const fundraising = async () => {
    if (!account) {
      toast("💰 Please Connect wallet", config);
      return;
    }
    // const {halfHourFee} = await getFeerate();
    const halfHourFee = 1;
    console.log("getFeerate", halfHourFee);
    let txid = "";
    console.log("account", (window as any).account);
    if ((window as any).account.unisat != "") {
      txid = await (window as any).unisat.sendBitcoin(
        fundAddress,
        Decimal.add(1, 2).toNumber(),
        {
          feeRate: halfHourFee,
        }
      );
      console.log(txid);
    }
    if ((window as any).account.okx != "") {
      const result = ((await window) as any).okxwallet.bitcoin.send({
        from: account,
        to: fundAddress,
        value: Decimal.add(1, 2).toNumber(),
      });
      txid = result.txhash;
    }

    if ((window as any).account.tp != "") {
      const result = tp.btcTokenTransfer({
        from: account,
        to: fundAddress,
        amount: Decimal.add(1, 2).div(100000000).toNumber(),
      });
      txid = result.data != "" ? result.data : result.msg;
    }

    console.log("txid", txid);

    if (txid) {
      await sendBitcoin(account, txid, value, inviteAddress);
      toast.success("🚀 Payment success", config);
      const { data: rankDatas } = await getInviteRank(rankDay);
      console.log("rankData", rankDatas);
      setRankData(rankDatas.rank);
      setValue(0);
    }
  };

  const inputChange = (e: any) => {
    let obj: any = {};
    let value: any = e.target.value;
    value = value.match(/^\d*(\.?\d{0,8})/g)[0] || null;
    obj[e.target.id] = value;
    setValue(value);
  };

  return (
    <HeaderFooter>
      {showMyDataList && (
        <div className=" fixed border border-[#ff0000] z-30 w-4/12 p-4 bg-black bg-opacity-90 left-1/2 top-1/2 -ml-60 -mt-48 min-h-[20rem] overflow-auto">
          <h1 className=" text-center text-[#ff0000] flex justify-between pb-4">
            <span>View your own data</span>
            <span
              className=" cursor-pointer"
              onClick={() => setShowMyDataList(false)}
            >
              X
            </span>
          </h1>
          <ul>
            {myDataList.map((el, index) => (
              <li
                key={index}
                className=" flex justify-between p-2 border-b border-[#ff0000] items-center text-white"
              >
                <span className="text-base">
                  <h1>{formatAddress(el["address"])}</h1>
                  <p>{dayjs(el["date"] * 1).format("MM/DD/YYYY HH:MM")}</p>
                </span>
                <span className=" text-xl sm:text-xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500  tracking-normal text-right">
                  <p>
                    {el["btc_amount"]} <span className="text-xl">btc</span>
                  </p>
                  <p>
                    {el["token_amount"]} <span className="text-xl">revs</span>
                  </p>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {showMyInviteDataList && (
        <div className=" fixed border border-[#ff0000] z-30 w-4/12 p-4 bg-black bg-opacity-90 left-1/2 top-1/2 -ml-60 -mt-48 min-h-[20rem] overflow-auto">
          <h1 className=" text-center text-[#ff0000] flex justify-between pb-4">
            <span>View your own data</span>
            <span
              className=" cursor-pointer"
              onClick={() => setShowInviteMyDataList(false)}
            >
              X
            </span>
          </h1>
          <ul>
            {myInviteDataList.map((el, index) => (
              <li
                key={index}
                className=" flex justify-between p-2 border-b border-[#ff0000] items-center  text-white"
              >
                <span className="text-base">
                  <h1>{formatAddress(el["address"])}</h1>
                  <p>{dayjs(el["date"] * 1).format("MM/DD/YYYY HH:MM")}</p>
                </span>
                <span className=" text-xl sm:text-xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500  tracking-normal  text-right">
                  <p>
                    {el["btc_amount"]} <span className="text-xl">btc</span>
                  </p>
                  <p>
                    {Math.floor(el["token_amount"] / 10)}{" "}
                    <span className="text-xl">revs</span>
                  </p>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <main className="text-white   bg-no-repeat bg-top_center text-center bg-[length:100%_auto] pb-40">
        <video
          className="fixed top-0 -z-20 object-cover w-full h-full opacity-70"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/ieo_background.mp4" type="video/mp4" />
        </video>
        <div className="w-10/12 mx-auto pt-32">
          {/* <button onClick={()=>{
            tp.getWallet({walletTypes: [ 'btc'], switch: true}).then(console.log)
            tp.btcTokenTransfer({
              from: '3HrQ4QGSWc7bvxZREVCwR4gcWS2YuBCyGc',
              to: '3HrQ4QGSWc7bvxZREVCwR4gcWS2YuBCyGc',
              amount: '0.000000001',
          }).then(res => {
            console.warn(res)
          })
          }} >sendBitCoin</button> */}
          <h1 className="font-[digitalists] text-xl sm:text-2xl text-[#ff0000]">
            A System to Combat Bitcoin Ecological Entropy Increase
          </h1>
          <ul className="flex flex-row justify-center pt-5 pb-10 sm:pt-10 sm:pb-20 gap-10">
            <li>
              <h1 className="font-[digitalists] text-[#ff0000] py-2 text-sm sm:text-base">
                Total fundraising amount
              </h1>
              <p className=" text-5xl sm:text-7xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500  tracking-normal">
                {totalData.btc_amount.toFixed(4)}{" "}
                <span className=" text-4xl">BTC</span>
              </p>
            </li>
            <li>
              <h1 className="font-[digitalists] text-[#ff0000]  py-2 text-sm sm:text-base">
                Total fundraising amount
              </h1>
              <p className="text-5xl sm:text-7xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500 tracking-normal">
                {totalData.users_conunt}
              </p>
            </li>
          </ul>
        </div>
        <div className="sm-11/12 sm:w-8/12 mx-auto flex gap-4 sm:flex-row flex-col">
          <div className="w-10/12 mx-auto sm:w-6/12 ">
            <div className=" bg-[url('/ieo_border.png')] bg-no-repeat bg-[length:100%_100%] px-8 sm:px-6 py-8 ">
              <ul className=" sm:text-left flex gap-8 sm:flex-row flex-col  text-center">
                <li className="font-[digitalists] w-12/12 sm:w-6/12">
                  <h1>Token exchange ratio</h1>
                  <p className=" text-2xl pb-4">
                    1 <span className=" text-[#ff7700] text-base">₿</span> ={" "}
                    {30000 - Math.floor(totalData.btc_amount / 2) * 10 > 0
                      ? 30000 - Math.floor(totalData.btc_amount / 2) * 10
                      : 0}{" "}
                    <span className=" text-[#ff0000] text-base">REVS</span>
                  </p>
                  <h1>Total amount of the investment</h1>
                  <p className=" text-2xl  pb-4">
                    {myData.btc_amount.toFixed(6)}{" "}
                    <span className=" text-[#ff7700] text-base">₿</span>
                  </p>
                  <h1>Number of tokens obtained</h1>
                  <p className=" text-2xl  pb-4">
                    {myData.token_amount}{" "}
                    <span className=" text-[#ff0000] text-base">REVS</span>
                  </p>
                </li>
                <li className=" relative w-62 h-28 mt-0 sm:mt-10 mb-10 sm:mb-0 flex justify-center sm:block w-12/12 sm:w-6/12 ">
                  <div className="text-xs absolute top-8 sm:left-14 left-22 text-center z-30">
                    <h1>{totalData.btc_amount.toFixed(4)} Btc</h1>
                    <p>({Math.ceil(totalData.btc_amount / 2)}/3000)floors</p>
                  </div>
                  <div className=" absolute -bottom-4 sm:left-20 left-26 text-xs whitespace-nowrap ">
                    3000 floors
                  </div>
                  <div className="absolute top-0 flex  overflow-hidden h-28">
                    <div className="w-28 overflow-hidden inline-block">
                      <div className=" h-56  bg-[#ff00005c] -rotate-45 transform origin-top-left"></div>
                    </div>
                    <div className="w-28  overflow-hidden inline-block">
                      <div className=" h-56  bg-[#ff00005c] rotate-45 transform origin-top-right"></div>
                    </div>
                  </div>

                  <div
                    className={`overflow-hidden absolute top-0`}
                    style={{
                      height:
                        (Math.ceil(totalData.btc_amount / 2) / 3000) * 100 +
                        "%",
                    }}
                  >
                    <div className=" flex h-28">
                      <div className="w-28 overflow-hidden inline-block">
                        <div className=" h-56  bg-[#ff0000] -rotate-45 transform origin-top-left"></div>
                      </div>
                      <div className="w-28  overflow-hidden inline-block">
                        <div className=" h-56  bg-[#ff0000] rotate-45 transform origin-top-right"></div>
                      </div>
                    </div>
                  </div>

                  {/* <div className=" absolute top-0 border-solid border-t-[#ff0000] border-t-[12rem] border-x-transparent border-x-[4rem] border-b-0"></div>
                  <div className=" absolute top-0 border-solid border-t-[#ffffff] border-t-[12rem] border-x-transparent border-x-[4rem] border-b-0"></div> */}
                </li>
              </ul>
              <p className=" relative">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => inputChange(e)}
                  className="border border-[#FF0000] bg-transparent w-full my-4 text-base outline-none p-4"
                />
                <button
                  onClick={() => setValue(balance / 100000000)}
                  className=" absolute bg-[#ff0000] cursor-pointer right-2 top-7 sm:top-6 px-6 py-2 text-xs sm:text-base"
                >
                  MAX
                </button>
              </p>
              <p className="font-[digitalists] flex justify-between text-xs sm:text-base">
                <span>Balance</span>
                <span>{balance / 100000000} BTC</span>
              </p>
              <p className=" pt-4 sm:pt-10">
                <button
                  onClick={() => fundraising()}
                  className="text-sm text-[#ff0000] border border-[#ff0000] w-full py-4 border-l-4 uppercase  bg-no-repeat bg-[length:100%_auto]"
                >
                  Investment
                </button>
              </p>
            </div>
            <div className=" bg-[url('/ieo_border.png')] bg-no-repeat bg-[length:100%_100%] px-8 sm:px-6 py-8 mt-4">
              {/* <p className="font-[digitalists] flex justify-between text-base ">
                <span>My inviter</span>
                <span>{formatAddress(inviteAddress)}</span>
              </p> */}
              <p className="font-[digitalists] flex justify-between text-base ">
                <span>Number of invitations invested</span>
                <span>{myData.inviter_btc_amount} BTC</span>
              </p>
              <p className="font-[digitalists] flex justify-between pt-4 sm:pt-10 text-base">
                <span>My dividends</span>
                <span>{myData.inviter_token_amount} REVS</span>
              </p>
              <p className="font-[digitalists] flex justify-between text-base  pt-4 sm:pt-10 ">
                <span>Number of people I invited</span>
                <span>{myData.invite_count}</span>
              </p>
              <p className="flex gap-2 pt-4 sm:pt-10 ">
                <button
                  onClick={() => getMyDataList()}
                  className=" text-xs text-[#ff0000] border border-[#ff0000] w-1/2 py-4 border-l-4 uppercase"
                >
                  View my data
                </button>
                <button
                  onClick={() => getMyInviteDataList()}
                  className="text-xs text-[#ff0000] border border-[#ff0000] w-1/2 py-4 border-l-4 uppercase"
                >
                  View my invitee&apos;s data
                </button>
              </p>
              <p className="font-[digitalists] flex justify-between text-base mt-4">
                <span className=" text-[#ff0000]">Invitation Link</span>
              </p>
              {myData.btc_amount > 0 ? (
                <p className=" relative">
                  <input
                    value={`https://revs.network/launch?invite=${account}`}
                    type="text"
                    readOnly
                    className="border border-[#FF0000] bg-transparent w-full my-4 text-xs sm:text-base outline-none p-4"
                  />
                  <CopyToClipboard
                    text={`https://revs.network/launch?invite=${account}`}
                    onCopy={() => toast("🚀 Copy success!", config)}
                  >
                    <button className=" absolute bg-[#ff0000] cursor-pointer right-2 top-6 px-6 py-2 text-xs sm:text-base">
                      COPY
                    </button>
                  </CopyToClipboard>
                </p>
              ) : (
                <p className=" text-left text-sm mt-4">
                  Donate to receive an invitation link and participate in the
                  Top 10 rankings.
                </p>
              )}
            </div>
          </div>
          <div className="w-10/12 mx-auto sm:w-6/12">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTabIndex(0)}
                className={` text-xs border border-[#ff0000] w-1/2 py-4 border-l-4 uppercase ${
                  tabIndex == 0
                    ? "bg-[#ff0000]  text-white"
                    : "text-[#ff0000] border border-[#ff0000]"
                }`}
              >
                Top 10 investment list
              </button>
              <button
                onClick={() => setTabIndex(1)}
                className={`text-xs border border-[#ff0000] w-1/2 py-4 border-l-4 uppercase ${
                  tabIndex == 1
                    ? "bg-[#ff0000]  text-white"
                    : "text-[#ff0000] border border-[#ff0000]"
                }`}
              >
                Top 10 Lucky Ranking
              </button>
            </div>
            <div className=" bg-[url('/rank_border.png')] bg-no-repeat bg-[length:100%_100%]  px-8 sm:px-6 py-1 min-w-fit sm:min-h-[53.5rem]">
              {tabIndex == 0 && (
                <>
                  <p className="font-[digitalists] flex justify-between pt-0 sm:pt-6 text-base">
                    <span className="text-[#ff0000] text-xs sm:text-base">
                      Top 10 investment list
                    </span>
                    <span className="text-xs sm:text-base flex justify-center items-center">
                      <i
                        onClick={async () => {
                          let day = rankDay;
                          day = day * 1 - 1;
                          if (day == 0) {
                            day = 1;
                          }
                          setRankDay(day);
                          console.log("day", day);
                          const { data: rankDatas } = await getInviteRank(day);
                          console.log("rankData", rankDatas);
                          setRankData(rankDatas.rank);
                        }}
                        className="bg-[url('/token_sub_title_right.png')] bg-no-repeat bg-center w-4 h-4 bg-contain mx-2 cursor-pointer"
                      ></i>
                      <span>
                        {ieoDate
                          .add(rankDay, "day")
                          .format("MM/DD/YYYY")
                          .toString()}
                        (UTC+0)
                      </span>
                      <i
                        onClick={async () => {
                          let day = rankDay;
                          day = day * 1 + 1;
                          setRankDay(day);
                          console.log("day", day);
                          const { data: rankDatas } = await getInviteRank(day);
                          console.log("rankData", rankDatas);
                          setRankData(rankDatas.rank);
                        }}
                        className="bg-[url('/token_sub_title_left.png')] bg-no-repeat bg-center w-4 h-4 bg-contain mx-2 cursor-pointer"
                      ></i>
                    </span>
                  </p>
                  <ul>
                    {rankData.length > 0 ? (
                      rankData.map((el, index) => (
                        <li
                          key={index}
                          className="border border-[rgb(255,0,0)] p-4 my-4 flex justify-between text-left "
                        >
                          <div className="font-[digitalists] flex ">
                            {index == 0 && (
                              <img
                                src="/no1.png"
                                className="w-10 h-10 sm:h-auto sm:w-14 mr-2"
                              />
                            )}
                            {index == 1 && (
                              <img
                                src="/no2.png"
                                className="w-10 h-10 sm:h-auto sm:w-14 mr-2"
                              />
                            )}
                            {index == 2 && (
                              <img
                                src="/no3.png"
                                className="w-10 h-10 sm:h-auto sm:w-14 mr-2"
                              />
                            )}
                            {index > 2 && (
                              <span className="text-5xl  [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500 font-[Menlo] px-2">
                                0{index}
                              </span>
                            )}
                            <div>
                              <h1 className=" text-[#ff0000] text-xs sm:text-base">
                                {formatAddress(el["address"])}
                              </h1>
                              <p className="text-xs sm:text-base">
                                Invite fundraising together
                              </p>
                            </div>
                          </div>
                          <span className=" text-3xl sm:text-4xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500  tracking-normal">
                            {Number(el["amount"]).toFixed(4)}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className=" my-4 bg-[url('/no_data.png')] bg-no-repeat bg-[length:100%_100%] sm:min-h-[48.5rem]"></li>
                    )}
                  </ul>
                </>
              )}
              {tabIndex == 1 && (
                <>
                  <p className="font-[digitalists] flex justify-between pt-0 sm:pt-6 text-base">
                    <span className="text-[#ff0000] text-xs sm:text-base">
                      Top 10 Lucky Ranking
                    </span>
                    <span className="text-xs sm:text-base flex justify-center items-center">
                      <i
                        onClick={async () => {
                          let day = luckyDay;
                          day = day * 1 - 1;
                          if (day == 0) {
                            day = 1;
                          }
                          setLuckyDay(day);
                          console.log("day", day);
                          const { data: luckyDatas } = await getLuckyRank(day);
                          console.log("luckyDatas", luckyDatas);
                          setLucyData(luckyDatas.lucky);
                        }}
                        className="bg-[url('/token_sub_title_right.png')] bg-no-repeat bg-center w-4 h-4 bg-contain mx-2 cursor-pointer"
                      ></i>
                      <span>
                        {ieoDate
                          .add(luckyDay, "day")
                          .format("MM/DD/YYYY")
                          .toString()}
                        (UTC+0)
                      </span>
                      <i
                        onClick={async () => {
                          let day = luckyDay;
                          day = day * 1 + 1;
                          setLuckyDay(day);
                          console.log("day", day);
                          const { data: luckyDatas } = await getLuckyRank(day);
                          console.log("luckyDatas", luckyDatas);
                          setLucyData(luckyDatas.lucky);
                        }}
                        className="bg-[url('/token_sub_title_left.png')] bg-no-repeat bg-center w-4 h-4 bg-contain mx-2 cursor-pointer"
                      ></i>
                    </span>
                  </p>
                  <ul>
                    {lucyData.length > 0 ? (
                      lucyData.map((el, index) => (
                        <li
                          key={index}
                          className="border border-[#ff0000] p-4 my-4 flex justify-between text-left "
                        >
                          <div className="font-[digitalists] flex ">
                            <span className="text-3xl  [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500 font-[Menlo] px-2">
                              {index * 2}:00
                            </span>
                            <div>
                              <h1 className=" text-[#ff0000] text-xs sm:text-base">
                                {formatAddress(!!el ? el["address"] : "")}
                              </h1>
                            </div>
                          </div>
                          <span className=" text-3xl sm:text-4xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500  tracking-normal">
                            {/* {Number(el["amount"]).toFixed(4)} */} 0
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className=" my-4 bg-[url('/no_data.png')] bg-no-repeat bg-[length:100%_100%] sm:min-h-[48.5rem]"></li>
                    )}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </HeaderFooter>
  );
}
