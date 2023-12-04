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
      btc_amount: {
        [Op.ne]:
          "0",
      },
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
      btc_amount: {
        [Op.ne]:
          "0",
      },
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
"bc1p5ytx3lpxrqhcu07px0aj03hzgzwx7ah7atk4d7mmnnmku5uxnsyq7py50v",
"bc1ps0wua5dlv7lh7xyz8044h5666xnun0de3gm7zdukr3qzwys8n6qs8t0nec",
"bc1pzm69wyteeawtad0nthcxwxut8yyykp4f84myza6r7m23gysmy36s4m97as",
"bc1p56vgsw9x2dhgx0aljeqk29v89mn3smqc7ck8acl8235mf5ct37sqtpe074",
"bc1pz7lk2cwwjtvn5yywgfmv79pppyg6degqqg4qvwc6nfynv46266dqma0zxz",
"bc1pz87vnx45wg88vjkufhrlcmpct0nzypjwk7u2y2cz6khty0wcashs304v3e",
"bc1pkg9qcfejz7fqgwx5t4y8lw2lnxxf2r6zle6qcra2frfghm50jvwqmwat8g",
"bc1prc7e9egdfxh5v79zy96un7vuw6m3a30snswfn6hhmjkc02exge6q77n3uj",
"bc1p4k9slvzuadgm5dhljfmcst3gr8psqr5wnctqg7y52px8vswx8t5sav2dfg",
"bc1pn3pzk0tlgu5guqc0r4ck7zau2krdmnnffvxkmaq9u8h8j7fvn9lsjchyeg",
"bc1plgs5m3fsdtftrufnmnkzl20hxswaul9cjcvxrkphf34efzeuhr3qc0txzs",
"bc1pgp08sy0vzuuzr9al7dygrqq7d87r0ruvklt26naq438uul2anums22cp2j",
"bc1pww2pdfkmhet7ax6fzdtmp7cs8u4u9vtz0ugyqnfgh5g37jx6wu2svny4s6",
"bc1ppyazr5dczezn45ymtv3pm85p29vtf0aajhg44atpj4xxh3fqqktsllw02c",
"bc1pv35xhazry5cxv0xhaxjw9lh9n7tcdjqwv2yf0dcrpdw2zn93h9qsuzrvvn",
"bc1pxzrj9csu2gw9xezv4fuy0hkqpqy4yk6s9452syhj8y0jw0ny8e0s3tsqd3",
"bc1phkla4n35tlk98skakxg7ne4y0hjevtunt532q4yd8asm4gl3c2nshtghpn",
"bc1pngpdwrthlryzru9qvqw703u5grsgwdrz8cxpltlpnhv6wsdlr2kszdppqr",
"bc1pjcsss360n4qjled37lyksj8vws5k6250pdke8g4ej53w0qh2ny0qz4g9ym",
"bc1p3kuwu5e8xhmzk977k9dzlfnxy58x7n4m03shd0vvg0060un4pcqsg892f4",
"bc1prpf2hfx8m9h20kh8lfr604txf9mq2x3wc3gms5elqmpw7xzfz2xqkkd3xd",
"bc1p3qvhsm747jwhcrp4kmm7kwz8fprgtu6pp64g4p6u3jsmwvhvqasqwslcfr",
"bc1pkec8sh2rkgy4pqvldn7nhekclqvkstlkenpnt0k7vfghzhjggr0q5mx6k0",
"bc1pz4qcac30l7meuvzdchnv0yed6gdsj9f8jxffg50datht3ugnxfvsxt3lw6",
"bc1pgr2m7mj6htvwxmy0cpuvfxplj89rmsqljh0khp63zx60x9hpny5qg4n85m",
"bc1pse7fczk5matwu7ldj3jlh67scqgn8nxk67yzfxzcv5zgmupcr92sttpqvm",
"bc1p94cer0sy5n0z4m3y9fde56z3zcmtn6jp79av62fpm5dfdhj3gu3say05ne",
"bc1pckd5elcz7zwxn825t4tazvu29man39eajam7007hp5aayae9wzssfa2cu8",
"bc1p7cd7jcq8rsggzy4raugcz9m38qux2texavsy0gpj34xxlhp48fnsrvcfv0",
"bc1pkh7qdjq4jxy9lene52fva97cah5y8n4c3ykx09ydmvkm8xnlwg2qq279px",
"bc1ps2peqwp9rxzwhudlysvjh5zhk9r9kau730tpuqcp84r8gh30r73sqvk6xt",
"bc1pdxharww70srukdlu7myqhe3f3v2yf6afvtw4wd2faxgdyh537y5qxyhltw",
"bc1pfzrggqlfmgh9fs8n5xgs70m540g2ukg0fm0a33e9tg0jfg899mdsy6gmcp",
"bc1p56v4xz22kcjhda8ankr25eh90yva9zfgcq2pdpyq06cn70lrkhaqhvn7z6",
"bc1pgyavvnj85w2vtlh4m95sae8j0csed4t9hqaj57s3fqryxtw9ttnqnhpg6x",
"bc1p505k5u68csqz20cajfsfhttl55m60cm5rp8kjyua7k89jr34llnqu4as7a",
"bc1p2fkaqeflxe84qhymh0p0p374w8usfv8f8lvgwfkcze66gnjpw8ws80d0fm",
"bc1pz64yvylhurx48n04s82uxm40vpw7jc8n37szrv74u3f7vf4aw47sf4xmn2",
"bc1pctakcfnn7gml0975egs5v22paz9tyx4jdk3twft4edattef8dfpqftxj6a",
"bc1p9vppv8z2vq8kmq2ttmusftx6u8xry05efhqzmeew6877sp8ywz3snfxdgz",
"bc1prshe3c8st6az6jhfkrfw0dw2d20kxucysp7lrrhese867sxdzwdqkrj8wn",
"bc1peddvqjksav54e3pakeh564xh0t96e7g04z7qsyv9q7ytzpl73l8srun8ts",
"bc1phpghdd5m5frcam47sjmdx9pgk5km9p5r62qjzp083fx69l7sw8gqrnf2uy",
"bc1pknm7fr4gx4dt6hl99cllaxrr72ygnzfzswzu2s5rq8zrueagmfssxdmjjc",
"bc1pkrce7xqtdk44xjrl04c3mpn8s2csu4vyn832rgqzwsjhx54aw0esyh8ten",
"bc1p4mqgtvhgxw9tf72gy4uqhp4t89w5a4wxs0mkt45e6x2hjwsw7m9q4277t5",
"bc1pmus4revm43cgrnxsyt97dklhncd99guwuraxxq3z9x05jruhlntsg73uhj",
"bc1pgzk75k9tq4vafaelyvsxhre36u835k9l3efk5qencf20u0phcmtsndxu97",
"bc1praw8krur9aessapsyzhkpqkdz5rfdevdnphnxzc324ejt59l9chstjgamz",
"bc1pclq8fv4zw3awqdasc2nrm9qvk4rcydmtmt64duljnhf9msz0rgnsms0pnv",
"bc1pvchw77ydeux09jmjs760ulzxl9clehqxvk6lr3q8w8slfxhhhhzqzfh998",
"bc1pdfmm8tg5h7dv45etv53s9j4lmahehmfcyqwfgehzq7fcsmn62u3qedfrsh",
"bc1pfcdcsyssj8aancgr4tx239apt7exk8d5adupe8r6xuqa5yaqs0fqtzemgu",
"bc1pll5aa3gq39eeqr5n9fr0jr6saua8hzr5guza4q4ypmc20g4mv7ps03p5ck",
"bc1pusxvw6txxw6k3vamk8zzn2ztqehrw2460huawj6fzemam5t05yess3pxed",
"bc1pgjfe0u4qskeyz8xvmufj5ev92h4ql8659jcx46w2u52yajpyqwhqw20tmy",
"bc1p7hkc7ny9n26hhks9qx5ecvg9v7r7ma8zr8rzdfjeqjfe6fl3mkcsgu666w",
"bc1ptaummm75wulmkyrm3ck0tgu39g7yvk3dddyae55vau7zyearggssf8prcq",
"bc1pr432zaup4f0qfr32e7xe8p7jy245ku7yerwqy85735wc3xxk80kqxqed7y",
"bc1p3q95vk44jd232el4v5mnysmrhf3hswf9zzcueefg00rwn6v7p5gsxqcum6",
"bc1pzetn4u5398hkvdxanh7qc3encynkgg4mlmphvpud7hk999xu6tds7x827p",
"bc1pl062znn5pqelm5400kk76nyqtky3xtmzs8yek9s7xkcmq4n9grgq7p80hw",
"bc1p5cpzz8fmtpqcfnvfxrdwdnqaz4375jjmq5zktc280u3n7u49nqwq7xy5va",
"bc1pvmycgudw93k4pff42hkezgv7m9l5t5unhdvy6mzvxkfxrrs4vrssr0n39y",
"bc1paaftja9x9nwnhnfjudcxa67q7ure0tj8lte8umh6vkpgc4wtgjus38gard",
"bc1pxdemu4jmq0zh2tyf662lcveu9alrvuccadydfs79s3ed0jh0rr8qmzr2t5",
"bc1pl3qv06wgymru2umr49j43kmp2jsd9emnk5megq4s2xy4r4jumyuqclzmx8",
"bc1pn9yh8mn32nwdeuq5xx03zer4e9eydmv4awvkr57tw8yysvt5dkkq8j9005",
"bc1p4u052p6jh5m64vwl3scfklyr2vjy3xqcd7j3rky0n9s32avxklvs2m0t2l",
"bc1phgejgj90n79eqrafhw7kcfgxsg6fq5hnddgwxg06ug9rzxtqdrwsxh5k0p",
"bc1pwvkdu2236s3d4kd2hscw97rkenvgakrdcydmwn505vmz8s6en4lq99lkw4",
"bc1pg5shthmq62zas5c9mkwnc7kv9r0w0tfcfvlzwhfgnhn07q6rr7xsg5udrv",
"bc1pal57zet62yfcrpj0nkw5sqxllzg7l3gjl2lhvdcdaqp35ye226fsfkc989",
"bc1phuw865kxyja3ag7n5jl20x40ces0xc46qr44tdjqsqrnfdeus96susjy7m",
"bc1pusnq3js2vzklch3n278t85t4hvx29s2qgcpwytgmfqaqcuzpkeysm74nu8",
"bc1pf6pcd9lcvdgy0mvmnh927tpp6jkz7p324uu9wcelzl6fm2l6tlfsycq6d3",
"bc1pmys8vv0l4j53pyjpks2ke73w63qwuy4hd8rz3uxslv8xj3s63dgsvk2c9u",
"bc1pa37407px28cfp9kgwj3lzs2dxhw2jmd59gk2ekvnuxkxs6uy9wjqjp3khy",
"bc1p6vnkcjsze4vu205cqwfauxdydg90jpjgtc3hr2w5u6u868xus5jqd8pmfy",
"bc1pa66szw49nhhr7xt3pdrccdvucckehhpeyc6zwwmt48g9200z2kpsly8m2q",
"bc1pxwnnnav7vk47df3safmuvpwcn90kvu6hhf45gp7awdq37wh658yszhcv6d",
"bc1p2w54u2wlva3cvegz9lvq976wxxsqwkhr6wv7nkkk3hlnz7kckdesaxdqhu",
"bc1pyv5vgkr8q7nrntmenw7rpt6xpzf4dxc78zuf4y20wn423wckksesa0dg0d",
"bc1pevse0m7nkdwc8c8a0gl98xh77nwtd80je8zrwa88sj7u28yw84ksayl8pv",
"bc1pweldeyzfytaj3yq3r83t3jmagm3dt7fwxtxnyktpqe5dp8vu7d2s0pdpaf",
"bc1pz8pt7mngcw08z2yz9x2uszfewqeeh9666xw9gf0ryngydkjde09sradv6z",
"bc1p0jl3955s0ywyk2kjsa5csud28y9y380n3pj0jws6gccz3wvpqscqn826s2",
"bc1pd2jkecxw8a3stqtm3lajyg5ztvscp0syuarng72ztjtl27ud22ts8te3sr",
"bc1pp3dt956clrmphak4qk9pj7qgt7k8z93eleej7avn9qc3x039tu0qmfmyhm",
"bc1pfqak44jry3ljeeyakg9m5hqxzqss6sc6wlphm462cwna5da0yn5qas2vex",
"bc1pmzh7r04953l73qs3s75enkw50rxahsswf2scsw0t2y40jegkt05slgxnl2",
"bc1p97005peqmfwse0u37ff2m8lexfhnrthq9dvqn0cwkaafcvc97xaq684555",
"bc1palxwc5hledv6a3ppfa3rfeq35zgwhcvwx9w7n06jxu4dyp5rh9tqejz679",
"bc1ppvwarpl6mcfd3k406hlwdw8mdmmguk80mtt6ah5meu6kxw9ck2pq7uzgev",
"bc1ptz6ymzhxyr524qxwr3x8jmgh9mgf7d269ukz3axrl6ate9swde8s3n6a84",
"bc1ptea9amq3nmunhvzjejhlff59wgkcrjnywsygd259p5q7vf7cg9mss6vrlm",
"bc1p4yhsfj84xdgvumntadsex40p65vdz9qwa0ka0h7rwq0qd2mrd3vs2uyyqq",
"bc1ps7xruyau95tcf3e97993gnjf272nywcvyxhrpfquvqpq8acptvrs8p0lyj",
"bc1puvge9yjuq89k4d75c8qdjckuxrk40svw2ldfprf8ch9keveaqhrq2jax9t",
"bc1p9j5z86xrkl96x2v4pkgmv66t05k7yfsyjggx68s7kwsrvjeve56svaa2rz",
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

