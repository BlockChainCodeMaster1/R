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
"bc1pzg9c3fcjm4cwtq6tsmxestgqjh6vccfeule403q2z9xq4r09f45qn4mg96",
"bc1pf6lmmy3mw9autye54v8dt3erdamrxav3nv926e07e0hj6xa2kk6s7t07f8",
"bc1p8pw3w8razdzvcnlp4z924tsvfea2m78a5vd39k3jpuazkxe67nwqckdq3n",
"bc1pawjp0qfz3mf4pnmtlp82ms5dw6ljxvvclcgu4y6n48l472du7u3s0lwhzn",
"bc1p0fldrpj9e8zvrhng4kv08tjwrtz89zd2vyu5sdxfzd7hy9q9hujqrd736q",
"bc1pvjn778qlqfe32r4w7suc7xcarynyqpe8w95tnjgvn58pcnysyrmqlc6wvs",
"bc1pctqflfdcvnrn9e9emg64z5vz4mqjnrey32zcnsq8k2qfg88vzfzslsa0d8",
"bc1pqpj22m7c0643sl3cgjfdgtw04vn3wucwkycw6ea3ppa4fx2tx8aqs754nf",
"bc1pmgwynsczg7908ld7cyy84n0t7vqvwq4ys4v6vq9st8rfmqfn8twsy7gnff",
"bc1p0ah5z4d2xjyam8lvr8nppt8qc3rklwvucq07576je9xsuuuyxd2qz6zzq3",
"bc1pfxr9gatrxvvfc8us9xe0htzclptn67ytuw58l7gtym5ks36jq9yq9qlpu9",
"bc1pfnx8yham5nw9uv40da4r343a5w73nasxe0gdk45n700qlww0d6js6vgcpa",
"bc1py2ejq94rn0n5e6xzmfr40uyepys04d4tupzc27lpnqh3lzd78meswqcl0v",
"bc1p9n3c2xq9cxps6fltnvs3sl0n7xfjxdeyd48xa6nfttw6uhq3mydse8enxu",
"bc1pndyscfatwecy6mn5qyz4gmtzk4scm5valctglyu8nc0c6kj2xv3smsrwcm",
"bc1p2c4uvt2hnlqkvfnhrqwcu6pa7zjqzm4gczapusrdtq3n89n74naspnjhls",
"bc1pznd4xhu4mmjufue60wn29kyvlkjz58fcldkx9429katchtwrv6dqngkrg5",
"bc1pmd28jzukfgvwz83waq6w7q4ehf3jn4llk5f893fwj5cy4qvjj9jq8z2drx",
"bc1p3ytsm0y7l6pgd9yxdcjgh9rc5gwzyl6dq0l7ht3xn3jsuzn9vj0sppldyp",
"bc1pwpetygg48ufcvzms3anj056247wfnex3p6mqyrck02j49mrtdwvqwhur3w",
"bc1p80r43430m042juq2q0k8lupqz0zv62wydnr38l29vwvmvxfdf2ks499ey7",
"bc1pswkpn2cz3wf5j8f709srnqlf2vtem6qhsx98u79egmlyyzddu9ysvyl25m",
"bc1pntrxkaacy96z3yeld68trvzdatfve5efyc5udgme07ux5glxvsks0vtcjv",
"bc1pxv4jxs8zk9drah5hhg084erkqtu9t3syxgmw3pjsmjgk2pd6e3vq4q28cy",
"bc1p7y7yxuncdrc3zaxsdacscejm3dzjg3gdesvu9asnmytm2aef2l6s2a3d9h",
"bc1pzg73g3m6gcmsjryfzrjh74cz8cxaxx5ayhgxrn9hzrmxm6l8fxvqc53f0s",
"bc1pvw8pv4zcplh3px3zwtjxn3ut7q7wls35rph5zek0exh688yj6wysqp9s5c",
"bc1pwgyul63zqwfsz5ppyc4x4aqwf7j7cvj43kcdewu9neut5w4d0y7scwttpp",
"bc1pvumlcgw6wcysp4kkqnt50vx4yzq75ge0706r98mwmslwg3qhyxjscrc6ae",
"bc1pkj9xkp5ng7gwh7zsacxva49taulf422sc05ms8cjfzsu7qqw8dqstfffyl",
"bc1p3uktz2sdu60cxr3dlq287q54jv0emsd7ml2ye7s3l2jy07c6zlsq3uvu92",
"bc1paxkdeve856yd5f8je789ysse56w6s0hssz50zctt8j20gnvfsmasn0xr0q",
"bc1ptf043k2uzm7dl4xgu657p35lsj6yuylawqzaz0u9tuksp589se9sugg7jq",
"bc1pp8xyzxnq4zr2vkg4nkyc0eh5qlw49806ugnns0k9zfxvgp4janms88vp67",
"bc1p0clve5t9r2tsgyswd7v7t88u58cg5ncya6ytv93cntwdu7ep4y0q3ykyh2",
"bc1p0f3lnsqge6u8dzpn2e5z8dw376zeglfm8nrguu9cl0tctw5lu3hq9pum7k",
"bc1pqjvu928yxu6n0fpz7xf4kn0zrtmv88a2t96at4ph3677xpfep0hs6hsg83",
"bc1plsl5m76p6zrjk2c07k53kgwvtn0g0fzkxwx6nvh7gl7vz4rdtelq9g97mq",
"bc1pl7wxj6knc84v2vdtrpn3z0a6p4cz575qxgd5yjgd5276x2qcjwmqhm2fmy",
"bc1pesrw4jf07jpfhjwn5rkfsgml7djtkt3k3dzddupz0yp4hkdwjznswrx27h",
"bc1p4nvhr22ggga25rzd3n7thjavlgy8yx60566zewc8yknjvshug7xsafr5fr",
"bc1py7lthle89nhxyu5t8a68gvfpcqjpu6swjtk9u4dtrfuyujawjvmqsq60h4",
"bc1pj7xldehs0tcp3j4wt9sthx992ff4hmnmg78hvkjdwr5yxcsfk0aqmg290x",
"bc1p69r707stkkypa9vnfe875330dd2s944f33ukv763wpe69dxyfw4qna3tj9",
"bc1pshvqqgn67cv2y7v4vwgjyl9smp7hxren3xfnm8jwnu6jqn42yzvq84gsz4",
"bc1pdsz33px2y9j8vg9sg5sxnndd8zzfp7xtqftnycucelw7jy3kg97qeeqg7a",
"bc1p6zpa8v23znf8746s6kmg4zva8gpkwwlw79y6sucjfqsj3y3rm9rqghmvnd",
"bc1p7wdk08etd2xv9p3q7hq5j380zq27num4cddhpf0sjje80x8qervqyqz2wx",
"bc1pj3xcy5agxj734yr5aawz3vexqmqjxphqh8e95mwmq4s2g8v4nnmqrpah96",
"bc1p3m038xl97efxm2q0ydak3urk500x9sd55uwn4wsr3sa4yrh7mysqmyzdyv",
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

