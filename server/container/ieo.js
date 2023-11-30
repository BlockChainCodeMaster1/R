import db from "../database/db.js";
import { Sequelize, Op } from "@sequelize/core";
import Decimal from "decimal.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import axios from "axios";

dayjs.extend(utc);
const fundAddress =
  "bc1pgdes86zdg8u9vdwehv9yfj3lmkg7gc9z84fwl4dsntzpzas8krcsanrly4";
const Secret = "bc1pgqsp3gdl0qead7u5lwtf3srhk200xjlzaf5ndx2790lm8mznhqps832hly";
const IEO = db.IEO;
const LUCKY = db.LUCKY;
const CryptoJS = require("crypto-js");
const startDate = "2023-11-24";

export async function getTotalData(req, res) {
  const btc_amount = await IEO.sum("btc_amount");

  console.log("btc_amount", Number(btc_amount));

  const users = await IEO.findAll({
    attributes: ["address"],
    where: {
        btc_amount: {
            [Op.ne]: "0"
        }
    }
  });

  let arr = users.map((el, index) => el.address);
  console.log("inviter", arr);
  const users_count = Array.from(new Set(arr));

  // const { count } = await IEO.findAndCountAll({
  //     group: 'address'
  //   });

  // console.log("users_conunt", count.length)

  res.send({
    msg: "Success",
    code: 1,
    data: {
      btc_amount: Number(btc_amount),
      users_conunt: users_count.length,
    },
  });
}

export async function getRank(req, res) {
  const { startTime, endTime } = req.params;

  if (!startTime || !endTime) {
    res.send({
      msg: "Incomplete parameter",
      code: 0,
    });
    return;
  }

  const rank = await IEO.findAll({
    attributes: [
      "invite_address",
      [Sequelize.fn("sum", Sequelize.col("btc_amount")), "amount"],
    ],
    group: "invite_address",
    order: [["amount", "DESC"]],
    limit: 10,
    where: {
      invite_address: {
        [Op.ne]:
          "bc1pgqsp3gdl0qead7u5lwtf3srhk200xjlzaf5ndx2790lm8mznhqps832hly",
      },
      date: {
        [Op.gt]: startTime,
        [Op.lte]: endTime,
      },
    },
  });

  console.log("rank", rank);

  res.send({
    msg: "Success",
    code: 1,
    data: {
      rank: rank,
    },
  });
}

export async function getInviteRank(req, res) {
  const { day } = req.params;
  if (!day) {
    res.send({
      msg: "Incomplete parameter",
      code: 0,
    });
    return;
  }
  let whereClause = {};
  whereClause[`total_fund${day}`] = {
    [Op.ne]: 0,
  };
  // whereClause[`btc_amount`] = {
  //   [Op.gte]: 0.2,
  // };
  const rank = await IEO.findAll({
    attributes: ["address", [`total_fund${day}`, "amount"]],
    order: [[`total_fund${day}`, "DESC"]],
    where: whereClause,
    limit: 10,
  });

  console.log("rank", rank);

  res.send({
    msg: "Success",
    code: 1,
    data: {
      rank: rank,
    },
  });
}

export async function getLucky(req, res) {
  const { startTime, endTime } = req.params;

  if (!startTime || !endTime) {
    res.send({
      msg: "Incomplete parameter",
      code: 0,
    });
    return;
  }

  const lucky = await LUCKY.findAll({
    limit: 10,
    where: {
      date: {
        [Op.gt]: startTime,
        [Op.lte]: endTime,
      },
    },
  });

  console.log("lucky", lucky);

  res.send({
    msg: "Success",
    code: 1,
    data: {
      lucky: lucky,
    },
  });
}

export async function getLuckyRank(req, res) {
  const { day } = req.params;
  if (!day) {
    res.send({
      msg: "Incomplete parameter",
      code: 0,
    });
    return;
  }

  const timestamp = dayjs.utc(startDate).add(day, "day").valueOf();
  console.log("timestamp", timestamp);

  var timestamps = [];
  for (var i = 0; i < 13; i++) {
    var num = timestamp + 2 * 60 * 60 * 1000 * i;
    console.log(num);
    timestamps.push(num);
  }

  console.log("timestamps", timestamps);

  let lucky_arr = [];
  for (var i = 0; i < 12; i++) {
    const lucky_user = await IEO.findOne({
      attributes: ["address","btc_amount","date"],
      order: [["date", "ASC"]],
      where: {
        btc_amount: {
           [Op.gte]: "0.05",
        },
        date: {
          [Op.gte]: timestamps[i],
          [Op.lt]: timestamps[i + 1],
        },
      },
    });
    console.log("lucky_user", lucky_user);
    lucky_arr.push(lucky_user);
  }

  res.send({
    msg: "Success",
    code: 1,
    data: {
      lucky: lucky_arr,
    },
  });
}

export async function getLuckyRankReward(req, res) {
  const { day } = req.params;
  if (!day) {
    res.send({
      msg: "Incomplete parameter",
      code: 0,
    });
    return;
  }
  const startTime = dayjs.utc(startDate).add(day, "day").valueOf();
  const endTime = dayjs
    .utc(startDate)
    .add(day * 1 + 1, "day")
    .valueOf();
  console.log(startTime, endTime);
  const luckyReward = await IEO.sum("btc_amount", {
    where: {
      date: {
        [Op.gte]: startTime,
        [Op.lt]: endTime,
      },
    },
  });
  console.log("getLuckyRankReward", luckyReward);

  res.send({
    msg: "Success",
    code: 1,
    data: {
      luckyReward: Decimal.div(Number(luckyReward), 600),
    },
  });
}

export async function getDataByAddress(req, res) {
  const { address } = req.params;

  if (!address) {
    res.send({
      msg: "Incomplete parameter",
      code: 0,
    });
    return;
  }

  const btc_amount = await IEO.sum("btc_amount", {
    where: {
      address: address,
    },
  });
  console.log("btc_amount", Number(btc_amount));

  const token_amount = await IEO.sum("token_amount", {
    where: {
      address: address,
    },
  });
  console.log("token_amount", Number(token_amount));

  const inviter_btc_amount = await IEO.sum("btc_amount", {
    where: {
      invite_address: address,
    },
  });
  console.log("inviter_btc_amount", inviter_btc_amount);

  const inviter_token_amount = await IEO.sum("token_amount", {
    where: {
      invite_address: address,
    },
  });
  console.log(
    "inviter_token_amount",
    parseInt(Number(inviter_token_amount) / 10)
  );

  const inviter = await IEO.findAll({
    attributes: ["address"],
    where: {
      invite_address: address,
    },
  });

  let arr = inviter.map((el, index) => el.address);
  console.log("inviter", arr);
  const inviter_count = Array.from(new Set(arr));

  res.send({
    msg: "Success",
    code: 1,
    data: {
      btc_amount: Number(btc_amount),
      token_amount: Number(token_amount),
      inviter_btc_amount: Number(inviter_btc_amount),
      inviter_token_amount: parseInt(Number(inviter_token_amount) / 10),
      invite_count: inviter_count.length,
    },
  });
}

export async function getFloorDataByAddress(req, res) {
  const { address } = req.params;

  if (!address) {
    res.send({
      msg: "Incomplete parameter",
      code: 0,
    });
    return;
  }

  const floorData = await IEO.findAll({
    attributes: ["address", "btc_amount", "token_amount", "date"],
    where: {
      address: address,
    },
  });

  console.log("floorData", floorData);

  if (floorData) {
    res.send({
      msg: "Success",
      data: floorData,
      code: 1,
    });
  } else {
    res.send({
      msg: "Failure",
      code: 0,
    });
  }
}

export async function getInviteDataByAddress(req, res) {
  const { address } = req.params;

  if (!address) {
    res.send({
      msg: "Incomplete parameter",
      code: 0,
    });
    return;
  }

  const floorData = await IEO.findAll({
    attributes: ["address", "btc_amount", "token_amount", "date"],
    where: {
      invite_address: address,
    },
  });

  console.log("floorData", floorData);

  if (floorData) {
    res.send({
      msg: "Success",
      data: floorData,
      code: 1,
    });
  } else {
    res.send({
      msg: "Failure",
      code: 0,
    });
  }
}

export async function sendBitcoin(req, res) {
  let { parms } = req.body;
  const bytes = CryptoJS.AES.decrypt(parms, Secret);
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  console.log("decryptedData", decryptedData);
  let { address, tx, amount, invite_address } = decryptedData;
  sendBitonFunc(req, res, address, tx, amount, invite_address, "1");
}

export async function sendBitcoins(req, res) {
  let { parms } = req.body;
  const bytes = CryptoJS.AES.decrypt(parms, Secret);
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  console.log("decryptedData", decryptedData);
  let { address, tx, amount, invite_address } = decryptedData;
  console.log(address, tx, amount, invite_address);
  sendBitonFunc(req, res, address, tx, amount, invite_address, "2");
}

export async function sendBitcoinT(req, res) {
  let { address, tx, amount, invite_address } = req.body;
  sendBitonFunc(req, res, address, tx, amount, invite_address, "1");
}

async function sendBitonFunc(
  req,
  res,
  address,
  tx,
  amount,
  invite_address,
  state
) {
  if (!address ) {
    res.send({
      msg: "Incomplete parameter",
      code: 0,
    });
    return;
  }

  console.log("amount", amount);

  const ga = !!req.cookies._ga ? req.cookies._ga : "";

  const btc_amount = await IEO.sum("btc_amount");
  console.log("btc_amount", Number(btc_amount));

  let floor = Decimal.div(Number(btc_amount), 2).ceil();
  console.log("floor", floor);

  if (Number(btc_amount) == 0) {
    floor = 1;
  }

  const floor_remain = Decimal.sub(Decimal.mul(floor, 2), Number(btc_amount));
  console.log("floor_remain", floor_remain);

  let token_amount = 0;
  if (amount * 1 > floor_remain) {
    console.log(">");
    const remain_amount = Decimal.sub(amount, floor_remain);
    console.log("remain_amount", remain_amount);
    const size = Decimal.div(remain_amount, 2).ceil();
    console.log("size", size);
    token_amount = Decimal.sub(
      30000,
      Decimal.mul(5, Decimal.sub(floor, 1))
    ).mul(floor_remain);
    console.log("token_amount", token_amount);
    for (var i = 1; i <= size; i++) {
      if (i == size) {
        const remain = Decimal.sub(
          remain_amount,
          Decimal.mul(Decimal.sub(i, 1), 2)
        );
        console.log("remain", remain);
        token_amount = Decimal.add(
          token_amount,
          Decimal.sub(
            30000,
            Decimal.mul(5, Decimal.sub(Decimal.add(floor, i), 1))
          ).mul(remain)
        );
        console.log("token_amount" + i, token_amount);
      } else {
        token_amount = Decimal.add(
          token_amount,
          Decimal.sub(
            30000,
            Decimal.mul(5, Decimal.sub(Decimal.add(floor, i), 1))
          ).mul(2)
        );
        console.log("token_amount" + i, token_amount);
      }
    }
  } else {
    token_amount = Decimal.sub(
      30000,
      Decimal.mul(10, Decimal.sub(floor, 1))
    ).mul(amount);
  }
  console.log("token_amount", token_amount);

//   if (invite_address == "" || invite_address == address) {
    // invite_address = "bc1pgqsp3gdl0qead7u5lwtf3srhk200xjlzaf5ndx2790lm8mznhqps832hly";
  if (invite_address == address) {
    invite_address == "" 
    console.log('invite_address == ""', invite_address);
  }

  const inviters = await IEO.findAll({
    attributes: ["invite_address"],
    order: [["date", "ASC"]],
    limit: 1,
    where: {
      address: invite_address,
    },
  });

  // console.log("inviter[0].invite_address", inviters[0], inviters.length)

  if (inviters.length > 0 && inviters[0].invite_address == address) {
    console.log("inviter[0].invite_address", inviters[0].invite_address);
    // invite_address =  "bc1pgqsp3gdl0qead7u5lwtf3srhk200xjlzaf5ndx2790lm8mznhqps832hly";
    invite_address == "" 
  }

  const inviter = await IEO.findAll({
    attributes: ["invite_address", "path"],
    order: [["date", "ASC"]],
    limit: 1,
    where: {
      address: address,
    },
  });

  let path = await IEO.findOne({
    attributes: ["id", "path"],
    where: {
      address: invite_address,
    },
  });
  if (!!path) {
    console.log("path", path.id, path.path);
  }

  path =
    inviter.length > 0
      ? inviter[0].path
      : !path
      ? ""
      : path.path + path.id + "/";

  const paths = path.split("/");
  let newSet = new Set(paths);
  newSet.delete("");
  let arr = [...newSet];
  console.log("arr", arr);
  const day = dayjs
    .utc()
    .diff(dayjs.utc(startDate).format("YYYY-MM-DD"), "day");
  for (var i = 0; i < arr.length; i++) {
    await IEO.increment(`total_fund${day}`, {
      by: amount,
      where: { id: paths[i] },
    });
    console.log("paths", paths[i]);
  }

  if (path == "") {
    invite_address = "";
  } else {
    invite_address =
      inviter.length > 0 ? inviter[0].invite_address : invite_address;
  }

  console.log({
    address: address,
    tx: tx,
    btc_amount: amount.toString(),
    floor: floor.toString(),
    token_amount: token_amount.toString(),
    ga: ga,
    path: path,
    invite_address: invite_address,
    state: state,
    date: String(new Date().getTime())
  });

  const create = await IEO.create({
    address: address,
    tx: tx,
    btc_amount: amount.toString(),
    floor: floor.toString(),
    token_amount: token_amount.toString(),
    ga: ga,
    path: path,
    invite_address:
      inviter.length > 0 ? inviter[0].invite_address : invite_address,
    state: state,
    date: String(new Date().getTime()),
  });

  if (create) {
    res.send({
      msg: "Success",
      code: 1,
    });
  } else {
    res.send({
      msg: "Failure",
      code: 0,
    });
  }
}

export async function sendBitonFuntion(
    req,
    res,
    address,
    tx,
    amount,
    date,
    invite_address,
    state
  ) {
  
    console.log("amount", amount);
  
    const ga = !!req.cookies._ga ? req.cookies._ga : "";
  
    const btc_amount = Number(await IEO.sum("btc_amount"));
    console.log("btc_amount", Number(btc_amount));

    let ladder = [
        100, 
        100 + 105, 
        100 + 105 + 110,
        100 + 105 + 110 + 115,
        100 + 105 + 110 + 115 + 120,
        100 + 105 + 110 + 115 + 120 + 125,
        100 + 105 + 110 + 115 + 120 + 125 + 130,
        100 + 105 + 110 + 115 + 120 + 125 + 130 + 135,
        100 + 105 + 110 + 115 + 120 + 125 + 130 + 135 + 140,
        100 + 105 + 110 + 115 + 120 + 125 + 130 + 135 + 140 + 145,
    ]

    let floor = 1;
    let cardinal = 2;
    let token_amount = 0;
    if(Number(btc_amount) <= ladder[0]){
      floor = Decimal.div(Number(btc_amount), cardinal).ceil(); 
    }
    if(Number(btc_amount) > ladder[0]){
      cardinal = 2.1;
      floor = Decimal.add(Decimal.div(Decimal.sub(Number(btc_amount), ladder[0]), cardinal).ceil(),50); 
    }
    if(Number(btc_amount) > ladder[1]){
      cardinal = 2.2;
      floor = Decimal.add(Decimal.div(Decimal.sub(Number(btc_amount), ladder[1]), cardinal).ceil(),50*2); 
    }
    if(Number(btc_amount) > ladder[2]){
      cardinal = 2.3;
      floor = Decimal.add(Decimal.div(Decimal.sub(Number(btc_amount), ladder[2]), cardinal).ceil(),50*3); 
    }
    if(Number(btc_amount) > ladder[3]){
      cardinal = 2.4;
      floor = Decimal.add(Decimal.div(Decimal.sub(Number(btc_amount), ladder[3]), cardinal).ceil(),50*4); 
    }
    if(Number(btc_amount) > ladder[4]){
      cardinal = 2.5;
      floor = Decimal.add(Decimal.div(Decimal.sub(Number(btc_amount), ladder[4]), cardinal).ceil(),50*5); 
    }
    if(Number(btc_amount) > ladder[5]){
      cardinal = 2.6;
      floor = Decimal.add(Decimal.div(Decimal.sub(Number(btc_amount), ladder[5]), cardinal).ceil(),50*6); 
    }
    if(Number(btc_amount) > ladder[6]){
      cardinal = 2.7;
      floor = Decimal.add(Decimal.div(Decimal.sub(Number(btc_amount), ladder[6]), cardinal).ceil(),50*7); 
    }
    if(Number(btc_amount) > ladder[7]){
      cardinal = 2.8;
      floor = Decimal.add(Decimal.div(Decimal.sub(Number(btc_amount), ladder[7]), cardinal).ceil(),50*8); 
    }
    if(Number(btc_amount) > ladder[8]){
      cardinal = 2.9;
      floor = Decimal.add(Decimal.div(Decimal.sub(Number(btc_amount), ladder[8]), cardinal).ceil(),50*9); 
    }

    console.log("floor", floor);

    token_amount = Decimal.sub( 60000, Decimal.mul(Decimal.sub(floor, 1), 10)).div(cardinal).mul(amount);
    // const floor_remain = Decimal.sub(Decimal.mul(floor, 2), Number(btc_amount));
    // console.log("floor_remain", floor_remain);
  
    
    // if (amount * 1 > floor_remain) {
    //   console.log(">");
    //   const remain_amount = Decimal.sub(amount, floor_remain);
    //   console.log("remain_amount", remain_amount);
    //   const size = Decimal.div(remain_amount, 2).ceil();
    //   console.log("size", size);
    //   token_amount = Decimal.sub(
    //     30000,
    //     Decimal.mul(5, Decimal.sub(floor, 1))
    //   ).mul(floor_remain);
    //   console.log("token_amount", token_amount);
    //   for (var i = 1; i <= size; i++) {
    //     if (i == size) {
    //       const remain = Decimal.sub(
    //         remain_amount,
    //         Decimal.mul(Decimal.sub(i, 1), 2)
    //       );
    //       console.log("remain", remain);
    //       token_amount = Decimal.add(
    //         token_amount,
    //         Decimal.sub(
    //           30000,
    //           Decimal.mul(5, Decimal.sub(Decimal.add(floor, i), 1))
    //         ).mul(remain)
    //       );
    //       console.log("token_amount" + i, token_amount);
    //     } else {
    //       token_amount = Decimal.add(
    //         token_amount,
    //         Decimal.sub(
    //           30000,
    //           Decimal.mul(5, Decimal.sub(Decimal.add(floor, i), 1))
    //         ).mul(2)
    //       );
    //       console.log("token_amount" + i, token_amount);
    //     }
    //   }
    // } else {
    //   token_amount = Decimal.sub(
    //     30000,
    //     Decimal.mul(10, Decimal.sub(floor, 1))
    //   ).mul(amount);
    // }
    console.log("token_amount", token_amount);
  
    if (invite_address == "" || invite_address == address) {
      invite_address =
        "bc1pgqsp3gdl0qead7u5lwtf3srhk200xjlzaf5ndx2790lm8mznhqps832hly";
      console.log('invite_address == ""', invite_address);
    }
  
    const inviters = await IEO.findAll({
      attributes: ["invite_address"],
      order: [["date", "ASC"]],
      limit: 1,
      where: {
        address: invite_address,
      },
    });
  
    // console.log("inviter[0].invite_address", inviters[0], inviters.length)
  
    if (inviters.length > 0 && inviters[0].invite_address == address) {
      console.log("inviter[0].invite_address", inviters[0].invite_address);
      invite_address =
        "bc1pgqsp3gdl0qead7u5lwtf3srhk200xjlzaf5ndx2790lm8mznhqps832hly";
    }
  
    const inviter = await IEO.findAll({
      attributes: ["invite_address", "path"],
      order: [["date", "ASC"]],
      limit: 1,
      where: {
        address: address,
      },
    });
  
    let path = await IEO.findOne({
      attributes: ["id", "path"],
      where: {
        address: invite_address,
      },
    });
    if (!!path) {
      console.log("path", path.id, path.path);
    }
  
    path =
      inviter.length > 0
        ? inviter[0].path
        : !path
        ? ""
        : path.path + path.id + "/";
  
    const paths = path.split("/");
    let newSet = new Set(paths);
    newSet.delete("");
    let arr = [...newSet];
    console.log("arr", arr);
    const day = dayjs
      .utc()
      .diff(dayjs.utc(startDate).format("YYYY-MM-DD"), "day");
    for (var i = 0; i < arr.length; i++) {
      await IEO.increment(`total_fund${day}`, {
        by: amount,
        where: { id: paths[i] },
      });
      console.log("paths", paths[i]);
    }
  
    if (path == "") {
      invite_address = "";
    } else {
      invite_address =
        inviter.length > 0 ? inviter[0].invite_address : invite_address;
    }
  
    console.log({
      address: address,
      tx: tx,
      btc_amount: amount.toString(),
      floor: floor.toString(),
      token_amount: token_amount.toString(),
      ga: ga,
      path: path,
      invite_address: invite_address,
      state: state,
      date: date,
    });
  
    const create = await IEO.create({
      address: address,
      tx: tx,
      btc_amount: amount.toString(),
      floor: floor.toString(),
      token_amount: token_amount.toString(),
      ga: ga,
      path: path,
      invite_address:
        inviter.length > 0 ? inviter[0].invite_address : invite_address,
      state: state,
      date: date,
    });
  
    
  }

 
  
export async function update(req, res) {
  try {
    const { data } = await axios.get(
      `https://mempool.space/api/address/${fundAddress}/txs`
    );
    console.log(data);
    let arr = data.filter((e)=>{
            return e.status.block_time > 1700906400
        })

    let newArr = []
    for(var i = arr.length - 1; i >= 0; i--){
        let obj = {}
        obj.block_time = arr[i].status.block_time
        obj.txid = arr[i].txid
        obj.from = arr[i].vin[0].prevout.scriptpubkey_address
        // obj.to = temp2[i].vout[1].scriptpubkey_address
        var arr2 = arr[i].vout.filter((e)=>{
            return e.scriptpubkey_address == fundAddress
        })
        obj.value = (arr2[0].value - 40000) / 100000000
        // obj.value = (arr[i].vout[0].value - 40000) / 100000000
        newArr.push(obj)
    }

    console.log(newArr)

    for(var i = 0; i < newArr.length; i++){
        const result = await IEO.findOne({
            where: {
                tx:newArr[i].txid
            }
        })
        console.log("result", result)
        if(!result){
            await sendBitonFuntion(
                req,
                res,
                newArr[i].from,
                newArr[i].txid,
                String(newArr[i].value),
                String(newArr[i].block_time * 1000) ,
                "",
                "1"
            )
        }
    }

    // let ieo = await IEO.findAll({
    //     attributes: ["address", "btc_amount"]
    // })
    // ieo = JSON.parse(JSON.stringify(ieo))
    

    // let result = newArr.filter((e)=>{
    //     let bool = false
    //     for(var i = 0; i < ieo.length; i++){
    //         if(ieo[i].address != e.from){
    //             bool = true
    //         }
    //     }
    //     return bool
    // })

    res.send({
        msg: "Success",
        code: 1,
    });
 
  } catch (error) {
    console.log(error);
  }
}

const arr = [
"bc1p3emlpvpk73qhxgp5pryjm0dn05ky33cdeakdk6j5ssmwlwnyn9rsee324k",
"bc1p750r23208ek6qcfu00a5kptznntdz5df693hhwn8w384dy6u399q3utuyw",
"bc1pymrhru4mxseanvy6wp430njkfhy3vm4zguwd46a5nnnzvcmptjgq3ra8ay",
"bc1p3scgk5ngtg66agqscwd96y4zg3cu66tf9d62n5j324mdzjf20gwskppj8f",
"bc1pqurswhyuwf4kxd8wusyptnwajg3avvcq47v8z6mtgazxs2y0dn0sxdkj8v",
"bc1pdgnmjnuktw8kzfqymlfnqczeergux3zwjwft58af5awmnhrsnczsvl0m32",
"bc1p70c0fs6rsx4rmpc34trtkt3d3z3cs43jphyu0xnym4k5shfc6rsqv4gl7z",
"bc1ply7lep9lm74qjwmkkx3f7kzm5wn06lj6p2faes987l5cu7rseexqg7qhr3",
"bc1pmad83h9aekcc2nav8gl28kfr2muq7y4tuw08eg9tl29fedpe6rzquzwk2h",
"bc1p3p23rqg7twq7kuc63urm6ay8qctwwarrvy33cpa6gdp0t9xx7y3qkz5u3h",
"bc1pqte80zgzzpanqdq8hqw2xlfjlrwzy3jl0vl44geqsd5l78va3s5qnc5yrd",
"bc1p8swp00paxt2d9sm38jscxj5f08zf6pplg6j05ex54vdmf3g4ahdsl6w2vn",
"bc1pvzs87eruudpc3rg234lryucz9x2vv2xst5fjzg5kyqvmmdhhvcfszfmj8d",
"bc1p6mduceehw8tp9zntxvepup8hg8298e8u34zwwm9lmvd088kta7gs330eu2",
"bc1p6l9lgm53yvjvjce8uqcpnpm28pqqsu2z3lkz7zx9u5vd805e7ccqse78pv",
"bc1puu2e0tgq209y02q5mmzwd0cezy25vjv0du5hegyqh3utuelh56pqc4djs6",
"bc1pj6qu20wjv35ddclp9l6pd8ksaswpv9z9c8wwe2fuxg3tyz28cfkq2em5fk",
"bc1pev0tzhnzgwlzte3k8jwke92ls7m39sea7kakakqr06l002wgr00qzksj4f",
"bc1pe6k7f9mldmcvngm32fm7cvp5y93rlwzwg3mnk8426hcs2w9rahwsp9mjdn",
"bc1psutzraryr0rpqecl4xx8y7fvkpt2hs2xkgplclpgrzk4eup9s7hqhu38w0",
"bc1p6zwasq82u2wns2r3z546re04quu83kakvgzwx6sllumk0dz7pdgs05rae6",
"bc1pfhf5y39k33qj4vj2a8j77dl4x5h8zxhfuud6n3pm79nuhvkugagqq5ccna",
"bc1pakxg9y48f5tv3fu8lg8d2v6hmhep7gmh466msf8qmcyt3sc7z25q4geses",
"bc1pqaqvnr44zj7677zzcvmk9wr5f2xfg833p3fuj9g9glz85z3zu0gsu8s9qt",
"bc1pdycmqz66r74trgq00wcxcwv3p9k79smtncgj84pp9vj8nhpzu0yq00d5nt",
"bc1pd5q5gg8pjccm8gh5mx27p0ajrw0rsmhfp7nvnzg3k8g9mtllyj0q20n2qz",
"bc1pfqmapkgleznqfddp0s3n660uvezvprsu03hq5lc89lcj0w5rc7fqamg2x8",
"bc1pndwrtwnvvdqmekqzt9r0rf7pf749v92k5cc47ux0rkdzhhu9a95sjn3l8m",
"bc1pznfmh344daztapyphdng8mlkzu549z39f93pknxnp2la8gxst75sj7hquw",
"bc1pghqnl6f0d3f8nrq4dh9nxg9c8dxwxgc7hwn30m7rgqsd73qejdhsx63xx6",
"bc1p9d39w2xynxr0wy3cszhd64pz7qhrd8zmvj5g2kaq6l2zyvljx8yq38vtta",
"bc1p5ksm98ffpjgx92ywduhq20j25nl45azc0r9egakwj2ce0warqvms0rru9z",
"bc1ptzvl4d6wlphx6nmchx3dwsd6pju4vh626el5smm3rcnpzlhgcpcsfmyg9v",
"bc1prnv64mnj3gwggzds2xpaz8azrpu0wpwwp39xp97h3c6k59slfx5qe0eqew",
"bc1p9gzdatman4vj4l8gqznz9psr2tvtd8ww7v3a4rt50cyxjdfpwftse8mu3z",
"bc1pvhght0c67z5sxgmvgn0sx6mcps3ngj6tk6fwx0jjh7xr25ncdyjs2rd7mm",
"bc1pxhwhrvt2wxcf7ns7kz058ssnhjv72v72s2jt735mfar75u72gljsld3xuh",
"bc1pscw8lpf9zyxvneevehgfd58ks26hrk8nva8xet5sfsxk25qa4tkquyn2r2",
"bc1pnrlke8zgayzee5npnmtm5au5wtfmynuh8ccx7k8dmzanfwh08nuq092wwj",
"bc1ptsyqzyrdelkyr548kacn7l5gtj59qxw8uwy738kmmk22f3vrpvhsywlj7q",
"bc1pya36ld350kru347gjak9uc825qlzu9agh97pdtvlthfq6vmgumvqwmj545",
"bc1pmdhhl9nxy7fn3tmajk00x3hmf00l4suuzlskewxljrlwatcqlvfsplttwk",
"bc1psajc4pulqgyc8tn6dlwjhsj9t8g9w00rhtm75lp8rf282fdkn4yq6pd8uc",
"bc1pwq5qqzg7h9ld9rqa7mglyj4w8yl84w0h069jxgfcedjxrh577ynqjcx0m7",
"bc1pcz9gxnasm75qp33m9emt8t79t5l3ytnznu6wsvzjnkfdxze7lnhsxulz4c",
"bc1psxmc4xkcrll0ha83eak2x60gcr0ym22ugg5f6qm9duphvldtqm5qgwrazw",
"bc1phs70lzf95r7m2yvmmvezfs78h4sphwg29690rfxmz6w69dumsccq3rm4mm",
"bc1p6nlmyfwnf8r7dv9z52vv33xfp3t4994t548xrwlahy2c678k7uqq9hjc5h",
"bc1p4tzfspj80gutqq3h5u8zmmh2p6yfnzfw0w6y68vy46ce8e6j73kstllegh",
"bc1p5vatf496v6f0n4x0uvsxd0dxn64qwmawcc0xu4cx9a82pwsr4kqs5yrmn2",
"bc1pft53w9ra3jtgu6zge9kj7w0e6ymld6u5j26kxfyq6tx45paswmzs0d7q42",
"bc1pz8cu4g7sutum92ml8tt4uz4dp8dp23dynn6r890qc8gesvjg7pxquvdek9",
"bc1pjes2mmy34raegaetjj6ld8nh8pwnnqavcyc93zjlln5t3mqae0cqn66tu0",
"bc1pjjcxa6gpz06hvk8lmgk5x5p0ff400nhche8znderm9fn08mc7a7qk976nk",
"bc1pqh078vj00swpqn4c99773wmjarxzdnhwcshdh6cy4unp58kn5e3srfg4ee",
"bc1p4ec2mqnp3j8xvsmwhfzfgxla9pl5jyfzsqalqnzujraelepvgz8se6axk3",
"bc1p8x7qv8kqprdta8nhtrvtsremamy75u0hlk50fys3q23ctc27yhvqy0f9ps",
"bc1pl3xcgx3smgsyazw04k2nmcznmavkrgufpprsd2j243zm6puwm25qvxtmwu",
"bc1pd0agwpftquhxvh88kgvx63st6c9n3pyflzplg2rgw57tsnnu4dxsvwdxz4",
"bc1pyk8ssgp586zgtxz7zc6x7m4lmpa895k25dkpf5l55zxd2gv8yh0qxkljuz",
"bc1plrycy4r7wv2950597f2lwpdxswgja8q828tld588u7dygvzjy4kqdug3h7",
"bc1plsyaadmy2828yq6l4vkwmy3azjmua42zcnj43qvhahs2guzghkjsxutqf8",
"bc1p90t5swzc9x9re298m3y64gwrjfhegke852wrsw58e3talldrddksw257uj",
"bc1pn4ltg9dy0l0v3m44yn8z9uyt6us66r2r37apghtysc6cuzfy6ucsxj452e",
"bc1psca2cz4q0qa86akddhmy52r044j7s09h225ylf05lglqgml58kss42czma",
"bc1pc2ef2kxq4kcltk3rqq7cjk98sz8vdtgw3lma08md4vz564ysh28qj7cmac",
"bc1pl263ck0dkg8ejxn66nyzuahpf5dxre97xywep38sd07xrunadxlq3et883",
"bc1p2mnw3d2pux0sj35cmlhq0taeyhmug3drwtmpnxd06awv84sq33jsgqe5zm",
"bc1puavkkcs8kr9qv0m7pvyn3rksztr4al60jpqvegt9fv39tqew705qpqsmal",
"bc1p6k2wdre75j3txe99nw7zm75nmv6a3d2t0ruysfkmtp5xky49v38ql2pu8p",
"bc1pk9vhap5fsryk8xwm6udr2cfnxw43ur84p02a0pvqkklnhvg3kpeqjx6g4q",
"bc1p0vdkkae038y2hmvksq2twxjmevkc63575ut7cx4flc34skd7j9us7zwdhm",
"bc1pjmm43pjz8gndtk8cdcpkpwlege4k7gmxq42rsqm6pfr08f7edg9swjlf8v",
"bc1peu9weswyjc4dj3dlr5s7q6nkwxggvjfu0694nawmehl40c90ajkqg0vv9s",
"bc1pusz54rsk5ztcteq9rf6fnq6ksp276ftwf4nldt0f2pvv2tv8s92quf8j2w",
"bc1p3lvkv7ynrr40te8s5r8lfxltjvktyv43trz9lcvn37yljtdlf2jsyyas8v",
"bc1pgg24kcmmf4tasqnmuw2tat7xcwrraatupkull5ufdj3z6qc60dfqhcmnhx",
"bc1pyanxfahhr68dkqkehgzys0d8u29dqcw8ty0cta9l7mv7pmmwk44s8duf6n",
"bc1ppnelff8natue775pq3prez749gmke60pvxstmln4nv2a25t9ax5sr02gdu",
"bc1plxk8kue7wazrx0xlamfrhpyjy5ukg7azt96mh543l7dapcqksgrq7u4j3g",
"bc1pslas25tll63zawf7zcmlcttfnlywmwrra2ug3jng8drzncgxy8ase4ady8",
"bc1phlhhc8p346mh86dd5ax94wxczt36wufmqr4jn8620cwnz3mfxsaqnfn93p",
"bc1phxsu4a6dyvrmc7hkgv6hwstedsjfzk5pg74jh5269fr322m4p34s6zmzqs",
"bc1pzay879zvtau707aff4943kg2cy86t5z55rv6um763sd8vajkhzrsvw8zl6",
"bc1p8j3la4gr7lws40jymgcya3mud5gr4r5wrcy3tuh79ppg2r0uprcqhc73lh",
"bc1p5qgt0jxhsg242674w85hgqx24shtuxp36jds729y0g0mg7d4dg0q5l5uu8",
"bc1p9zslnq8h63rfqapr774ewclhc6d3gtf3jxwckypjrdtqxlyhjkusatra3w",
"bc1psg244tzan99drfyxj3kaarfp8835qxrvr7vuvt5fhng2t8kp3znspwv0nt",
"bc1p8wc8z7vph3pn6xdj570ak5lpcl68n77gv5ge50t98ytsvpk2l0ds9jzxv5",
"bc1pens9hyful80605a0z0p9rlzr2e39l5xaucrfsvpmsf36gelqsleqtsj089",
"bc1pu6964qqsf5dctvzy508fnd9xj75w2apdpzp0w74fwaxtle848zhsw9yl48",
"bc1p8rzd8hl20werj2k2rm7hzsvr8ac37z6ulajaf3zrewnj5qcx2quqv0q72j",
"bc1p3gxydpfhq4nfdg549xgk2ls5sezhlxw5xvjtsdmxg7clf4lcnzssvcvq3q",
"bc1p0yv8el7vkt4fjy0sdxglmj0p6l7jh97mgyqml9vhmx5uqngma9kspvd8tt",
"bc1pttm3wc6sgrkxzg36lc2melzj8590a5vmkfcg02rtm5q7lydz2vyq0aey8q",
"bc1pahwgldv752h52q7slc8kt7hkz7fh2ptzwmczrd29vkhwqydjcctqch93jw",
"bc1pygznwfe0r3cpwsqpyruu08atq2l2xxexep8hes857pduy2xkyljs3cwtmd",
"bc1phlwq337wkze4apx5zl28rgcaydt5q9nmuadx074dj45t4fectkeq4yjtz5",
"bc1pus9y79cnx5qk9xh4z867294ql0pnhm435xdmyfuayz5ltnssrqwq7k2w24",
"bc1pew2sncnguxp8g9qheq423rur23rw8y4yygak54j2u28uw3kmuzgslgsdzm",
]

export async function invite(req, res){
  let total = 0;
  let js = 0;
  while(total  < arr.length) {
    for(var i = js; i < (js+1)*10; i++){
      total += 1;
      await sendBitonFuntion(
                  req,
                  res,
                  arr[i],
                  "",
                  "0",
                  "1700906400001" ,
                  arr[js],
                  "1"
              )
    }
    js = js + 10;
  }
}

