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
"bc1p7jz5kw3eu8j5hjlkp4taxysq44f03tw6v6ydt9sdfkzrrl4yyamqf5rjdz",
"bc1pvyqekn033pnlteezxc9hv4yz897at0vm3wqq9lq33zyp37k0pmns3d3mva",
"bc1pttqygrdvgx6lk2qf837jxwmqma3p7vk2uvwzj7knwttnhk2snxeqqv6kjp",
"bc1p2av78u2apwdwedsj97zlenkf3nqzav3pvaxd7g56k37d2yfgawes5yeqve",
"bc1p7pjj5st5xzq5vf2x6aflug7ycvlmqjdc7764wvxuzcrvwz6ff9qss9wx8g",
"bc1pu299u40lrjeknckdjlyq78njy26f0ap20hvcw7h2636urfxhc3wsxdzsjh",
"bc1pupkw5j8szz4kk9z6vy79r9490vtfc8tf63cadxv4h6c8cajslsssvwngxx",
"bc1pkz9l2wk5mglh5a9pm4fly0aamtj4smxzy3x8ykdwfcrkxhzjw0ks06hhl4",
"bc1p4jmvaz90lmqlcyd9cvtxq55gtd9znxzhgzwf7932r04pexgdvlxqc8du73",
"bc1pf77y7pynrhgy6q8va7z3z039gyvmj98e0af79vwkfzld58px0crqx5xgkm",
"bc1pnfaa0u5zhg6h9t8smtd9mhv4pawff0fdll76g4g6pym5mtzn24ns0wce0u",
"bc1p64eqxwm5a0m3mkjppe3mgnm6rg505uy65pwpc9jcslpfzxzxg57qmcduyg",
"bc1pahjnpgvwzw50q2xj39j85lxumk6acwsedsc2n2nc46ac2zuy0faqcd5jqg",
"bc1pcfcrypjh8g5es5u79xndattjj3msalzphg6y9tqt3dtw9egethtsw2q4qe",
"bc1pswzxryqa7tdwx85p5dkk7s0ljux5mlly423q4ucvvrag54tqjx0skg53dz",
"bc1p6husujnre7x0zdy2rjxxp9l3llpnyx0z5nner33adsfc4yaln02sgwa4mj",
"bc1p0cn4hu0463fhxlm49yryta6d3ugagrkm7ssdjvw96s8fav5xyurqmyjdw6",
"bc1paxdjmp5u2mw4h46z7rtsr3hfakqrux07lvxnp9a7rwc52dmf6qgqc3c0j7",
"bc1pj05e6enhku5g36ygcfdwc0n8rhc657fhmcsedsgcdp77cs2agg0s4m9r04",
"bc1prj4sln39duqrk6c9et98q82qfywcjqznakqmt9s0mlpq07gdk5fs396lcw",
"bc1pw4wxa8emrwrl5z0nm63czjn02qk24hd0z9nuekgct6j507sph27sz5g2cs",
"bc1pl2h2ftsksjtq2me5gzm74mxzukwnxuse7cuxuhhzf44cqqrgkruqc3yhfx",
"bc1pdhk2p3a9fde2wym4cuk9zhxzzchcsp5y2j5n5q8wfda5qdus9mqsxc0tqy",
"bc1pvntrlp75q32l479p97nuj577gswa2fddfga5gchx92fwgsfyau5slm6sf3",
"bc1pvayrkm3d8lreeyudv6pewmggxh5ej4mvesn8r7sqnqv3kfuhkllqnhtwqj",
"bc1p7qenwqdje957h82wdhxav5nyg9msalsfw8vfn65cjjfa6ntaelssznme0t",
"bc1pj67dp7w5dmpt4ny30fn4348n8mh0f3h46spdyrgpszz2zyacw9fsvstrfm",
"bc1phe4es6557q0pak8g4dl2zqpl3xt5p4sayvmva2am2ydm9k7qpqsqh4xapn",
"bc1p27z936xrqjpqxzy5c58c74awhsg8g0kv028a6jucfhgzdaqyaqmsfh7deh",
"bc1ps7hn9cjavxqq63pd0ge7pqmppl6wy88480d93wzxppkc3kerkqdqsdu0s5",
"bc1p58nls5f236velru5yhpz8qfjw3l7qx0xqu2k80nlr0xwrpwlrxasejp7rz",
"bc1p4zn5r562lj9nae2c46m9ld6t79gqpah6qx0t3znnsa3gnkyqkqgqev9ml9",
"bc1pavratqlyh9tl9w0s0mtsgt66nl5ucvxjntlmauj27d468ctzaftst7svc6",
"bc1p0h64fwrlkw44l4ga05ph4d4z456af3x54r0nlspqx8qtmn5wvedqlsr7ww",
"bc1p685wr0p65ljkxkp2mp9l7tayg4jxeucw9vlgjvvk86eglxfwhtzqlca9ul",
"bc1pyudcnh54a8sxexh45ase8yjnwl6l86p5avdxdy79xfwvuym8mt3qd05mpd",
"bc1p5mkw8ntlvc9lqq0mt7gq83cw6jhd0h5mkvd3geg2hd4x5tygtpgqvzgqsq",
"bc1pmperkrwjupdce4vcmg7chjrhg6e7ta332nc2fnmp3zj6u2e953aqzcwjv3",
"bc1pd4j35p7908d0ywpnj2zggdv2n5lx7sc3tpdgu3vapdncght40ycq5mgka8",
"bc1pcjydnl3g0efk0wvcxxuvku3fyzpe6rp05sqks959nkrc2sqdyhcqvnpv2f",
"bc1ps283zpqc7rkkh78h688xhgrjl86y6pene9jn62n8zmgxjrmy6c3s4k30x4",
"bc1p609px75pdgh7kv24a6tmcm9dmmdpa58pthda6asa4ls90pdd2y5sj6almn",
"bc1p80kfe0hwa72l2spfl29vhc0pmzzmdr5pgnawg7j4xatm3pghra3qa268wn",
"bc1pserh8fkefvt7tngfwdarz0nj87pz6w2f2v6krddxj25axvfdgvjs2x5kw2",
"bc1pga2knftdpk0uvm8qtwtldktm9ayjjdeddvkhupvreavd42udkgfqrg37ef",
"bc1prlzn29pql37x798u0zj65fh80vdcgnsemyn0sfkzcqavsxwzwuvqymg2l3",
"bc1pzlym73v34z8vrl9vs9vtxtd2g8t4z27gz704c2u6lqj02qfyfccsupu3a3",
"bc1pmwc5760agsna5ywc5q646zss0fy5zce9kj554qzqtrewn49qe83quhwlla",
"bc1pa3lswy2naxnvnp33km783jywsrsv4daeq4y5z005r37kk7s9nk3q4csxar",
"bc1p6hhvytk8m5cssp6attdnyd2hzkd5lgsdln2cnmc69r6cy0ruqqfsy775t6",
"bc1pydnen6f4m5zuzzredzryk6feluhlhrchzjay4cj3dnu0z698sdes7yn9lq",
"bc1p82tljcmfr50a7d0cz67k692ntxmwyhjphpvugzzcpeepzs39t64s6jvsk6",
"bc1ph7e45x02s7glf4dqfg7d5dp3ctl9tnsp8uj082j4da3m3dwlh4pswle3et",
"bc1pudfku4t6jp7mg2fnl5f8pnz79mjzt3tc7q0c65djxeac9w2ujreqzykn7v",
"bc1p2zww2fua3hukh5cstzl0krxl2v089jkqqqtjvwpd7ufyts2f6yqqqmqg7d",
"bc1pg99y0sztzuqju5veyrg3vz6vdgswapd7daxmvtmmapr4ak4fxrtqksgr2r",
"bc1pfh65pcujlpzg0x5q74ur0uxz8rmf2fh539w84ew8xvycvnx4j86stp9nls",
"bc1pe7vswydg09yj2u7ctkx92gc0l098ejwdwt5twe04g2yg5r2n2w9qlxl97v",
"bc1pfftcqgxc8rvvz5kgsgfd56f6y6m23q978tyj7w4lyxmevkncaw4qe66y9l",
"bc1p7xqf4jd0jmjgqm7cqxrxtnwdzg3ecqlqn29p57hgfjhjez0vk7uqw42hsd",
"bc1phtwpuw97l676f5sgpc83yvskc7ssu9afez0tsl5hcp693whwl3sssxtun3",
"bc1prwhensf7n4qf65vy0zhdyjs4vwdmha0lun3j74r7q9wrggnjpe9shwxgk7",
"bc1pde8e3zxkcvusy8v7tl8z8w5r0vy0ru6c94dg4h83yd60azvy80wsktzgae",
"bc1p4mfwn3t5a85fjctxzjaygeek76y9jl4wcdueujlusxvfw2yna0us8gp5s9",
"bc1pkne6l3a9nuj4ylpq7ell4lxy9gzd4ac62ust53u6kq2e7addk2eq54wfyp",
"bc1pl6ahfz6g4k26ukgq0ywaxwh9tafrre29m3cc5ycwpea57v8gcdwsqrcgy3",
"bc1pt840dqgmaewc7c5vn7y4495xa5lwx7lq35kqkju5mw0ux2rh0rdq6vtd0l",
"bc1pwyglx9p74kn6n2sfz0v86rqjwgj846sxrha3alccwx8n3tgl8x8sx8gnlm",
"bc1pul8w372dmx6rpctu9lyhrjp7crkmjzzdhf4jh0nrj5n4qyjamdasxj3g9y",
"bc1pqf7yvpuyzd5w79e7u7h0xealsn3n5x464uahcm0wakd26wj7u8vq4yy3vq",
"bc1pwk43l64z7rqhfxpgs3ney0h4sp6l0ag7jwe4r7tvh5h4jvaejees2qx3gd",
"bc1p5knu58vlr7xxvyjuphtul692wu99dz9y3396hjv0c7rv4uzy2ncqf4dl4n",
"bc1ppchywvwrkse3d5emxprg5ltzl5963cc5jcvyf2uc983qzf85ct3sp0sese",
"bc1ptdnv9qxzcd7qas5ct62e6fmdrn2hyyg084x6pttnfpjaxvgv3taqka8733",
"bc1p7ta6shsk25t8vrzhvpmlznc0d3xdm57c6jcd9na8mcmg8awqkjfsjmu27h",
"bc1pnjuc460wh62vwjkxyarsrxrj54ql5rwkh4yge2t27kuckvln2f5q8jjstd",
"bc1pgn954kh9yhkhatx32hr9uwcs59ryttgjyh0je0e5xa50fdept7eqza4vju",
"bc1p6tzje58u7gg678xyunsg5lfxzlat502hnqcyny6cv8lx3segkf3qyxqz8x",
"bc1pt42rrh5jum50vjdza49jznuz82dxp2lc66hgacp8wxs90m43n60qyhfhln",
"bc1pxwfjgagau9lpk3p8we5xyacp8gkumkxy8fdfyt4rmsyvta2jkq0q2v2gn3",
"bc1pxwrsw4vg9z2560l828p8kvk7m9cmaquvf267wp5a208n5vtf8x6s6x2rl6",
"bc1pnnq2cp4vlzpxsnadtnfdvkc70s9em0559648atmpcl5nzpt7z79sdf0d0k",
"bc1p0xtzdfvm74jwrer3hs8yqunsk8xd535e96utr0vsrncqft48u78q6kft00",
"bc1pdxl7yjgdxfj4ccs32j2l55jd54c4u0f65fk0ahp6q6s0slgszs7spku4q7",
"bc1plaj038x9acepe4q8gv9vfeuxnsn6repddefnmlhxdkuakxgj9w5sq8ctws",
"bc1ps5dhvdfqfr6ejt00dayjt3ch9pk584sx564vwx53dgy8qpt6x8wq4t39zl",
"bc1p9uz8c9a845spaf686g322nelgggz8rq62ktpjcche8cmqqhm8d7qyjvsaq",
"bc1pd3kkutwg758wt8vzh5flp8rsn5n4xttmzuym8nkxgjsdlrgm07es9gapp8",
"bc1p8vfpnrlqqwyq886gjffvfqzl4m40azxpfsc7me46yce2hgssr84qucatpv",
"bc1ps28ft6lsapqy8nk6xz4fpfnu6j49wa3dxjw9dm8u8s6cgleqnxqqrf22mp",
"bc1pk2yseflm4ty8wunm4zv9vtjwf9qm2dzd4klrmusaa2eutd5wulaqv4d0se",
"bc1p7setpnppcee4wkz8ay7vhll8k7nv8c6qdd2hqs80x3u2aqm6xhtq46at5u",
"bc1p7r2zpxs23z7w32x9rtnfzmaz2a4vdqvxhxe9l0dxld5axp2tqwkq0gweel",
"bc1pqhzxjjqvn5e7ak585pv07qhtne998jvwwufrgm8vldcpv2lpcdcq3lzvgp",
"bc1purjq5gm7dj54v4ywy8qs0x52ex7y2pm9vryzlwnuharhw7ufr2tsq0jf49",
"bc1pe4q9e7galgpm0hnjucaen0xapp5lhv9rlhnxn2a3gqyhh3rhk7zq9zuu3q",
"bc1phs2tn3pjhz3p5tp5chjc93c3vn00dyjkr7h6g4jy0lyjfwnlz9ysjfcqyn",
"bc1pkntprvkndv679ced2v0fkm0tku7r3jsfprwdx20vzsay38afs8rqkas9wx",
"bc1petue2sacuemazszvjx2cx5dgd2wqaduxnfvx5s9wthvykpdyddyqg3q6lz",
"bc1pylulu4g33v78hgrvu3f34d2kyud5mvf7yvar9xamjfgc4t63amesnwlrkc",
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

