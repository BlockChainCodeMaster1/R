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
"bc1p4jnadqvu2f40w342trlfxyhrcrqa26u3mphzah2c4rs0rn6204qsvqdc6m",
"bc1pkk9ppvwtwrh5jqt43scey3mjvnn0aaqee7v3prgks9sw0dmgm8msywcmj0",
"bc1pjvs750ndh2j2r5nd2ef3swvryr6esxe4xnd43w8sv3a3jmtluzcsq4ugd0",
"bc1pg7ph6fcvtm4209yekqh3gj9q0su4q02ydahd7zq448ggmkl3868sxyude3",
"bc1pgg593d94gccg9utv9cgwjjeaew5jqdxdl7zzjjn3qd63wgcl9kzqhhlxw2",
"bc1p7jftxqugvstmr5a53hz6s5g9j90zwt2hw7mlxezrzw3j2t82s8mswtl927",
"bc1p8prwl0wtlk42my6y236j2grjlwaem42mq6jy62plwlh2mezmdeuq8ptus2",
"bc1plwcyhdk4erlhjle6enaw7267sc3jru84gas8jfl5xq96wmxgnrysd7fcg6",
"bc1p9tw9ut3jt2ftgndvytk2t9h9yggzw5ynrqqum9v4wwgqrlxvphcsl0uj6w",
"bc1p0pdxh9zvla6cv0vsy57nj456msx5cvny6uu38mqsykn439n5m2cskqwdp6",
"bc1pk0agma9wncenqjp0mqttmjc7p06aycu2srfyjh9q8xe62p0l4tvsy8qkm8",
"bc1pv5wrpvruuzm0yda0sx82cjmzrk7rkclnu9zlxylh9f3zmm84ty7quaz4wf",
"bc1pj6hgv6uejjyxvga5amg67k729z6skz4tvr7lazxx7grcw07zu3ts8dvcg2",
"bc1p2y6hth9w6wx95lhja2dnu49jjkt8kwa23exnkqs2tp9z2qclhn7qtn6wlf",
"bc1p6wejtrlmq2zdlkrcd9y0l5ps0m0suh4tzhy80gl7xjsvkkynjj5ss2cq9m",
"bc1puvs66j4ctwl0tvk2s98jtk7n8w5uetml6ev0qf7ung5wfv7l9gpsh0pzky",
"bc1pc02h64782rqp5vmfqtu9y67ruc0df0k0wklz8nkkfsj94z007j5sdtn6t6",
"bc1p74cqrgaqygnascfe8m8g0nfn7gfprwg7uwddx9ptednr3fxcatkstelvl6",
"bc1pj2rgd64eg6f45r2zndx8zxrnz7ysdhmvfnvrk86thf03f7hvws9szrkeem",
"bc1pvxvqx2t7e5eu6794l8npdjpyscqnwkncch85h307yznsr7ff2edqjdwra7",
"bc1p4skqeap04myp5fe3n3kem89wmqkyy6kvwjjfm8mvvl5cqcdjz58qemrg6h",
"bc1prw3k00w2kknp976p585zkcaf08gff2ensxcsttu7rurmp7zwajls4qjhsu",
"bc1pdcrd9y6fauamdnwj9yxt9hws2t80egrd0s9xvmcz6v042twgtlvq8hjr3h",
"bc1peqxea8cnyqrkk6wskmlzt6ru8f7rzluyngdjzqfl4ra6qlv28uhsldnkyv",
"bc1p0wkdjkgh87h09favfm6cd4lj7rx6j33xl0j9sjx46qgdx9xnuusqyzm452",
"bc1pacwkkgax6pvlkcdedxg88ejr9spuajukxml5tnnlkaq98mtjlmgqpnkh73",
"bc1pgn7dk0wm65lzssd8tk9gmezs8qydspht0fr8j0e99397nvvdamjsgnwh7n",
"bc1pw2q0vv9szzzhzvr606h0jz4sey20mxwdp32dsh0z4ym8nv3ea8qquvgufw",
"bc1pmu6tkglf464ew86agjyvz80vxp7zyyw5kw8g6y4vgxh48gdkm8wqj5936y",
"bc1pvcyw67nmz0zekv4qyqsmtty9nnmydp7nm7fltuxw97zcrnfaua5qhw525x",
"bc1p9wwx3eerh62e0dg4aqxdk9wkuprv4ttyvskf9ms77f9zt00uxj3qwtfxft",
"bc1p0q2vl0r2wlt93k39x36gxz94kx4cqqhgrj9nak5vfcxfwaumuseqwx9658",
"bc1pmd6a238r6n9neevtqpjzqhlugagpyff4ndgysvk55vqxn24f5a2q7uvv0e",
"bc1ph3ktfg8hd3jxphtxz8qhws4qq0u72h9dpkl09sftsncshjlapa8qwwudj5",
"bc1pa60ftzqt6ww5ndq8ldk7qpmfs3hqm6g0ruqpy0uj8d4c3v8nd4ns4vym2v",
"bc1pzutkv5ahg5af6c4rfj2vyjj06n54982848h2eujvf4lqxaczee9s5ms096",
"bc1ppmz00jm83wktaef4z3r8epu53ptlvkrjnf3cjalv2kae0zn0kz3qer9tkp",
"bc1puqs5efanf7yg8mpck4yz722m3fhdyppyaglw2e6uggajlh6l2pgsvqsmuh",
"bc1p4n5gzjscf3fls2fmxtakfqjg5flkps7l7l3k2nydk0q0e0ts7p3s45q3vy",
"bc1pajnrf6hyt0h3n6fdpujkd58tmtuu6xg3a9th6kzkvt08a3dwdhhs69ykax",
"bc1pfkrzvre59f364lsudv8kf469qmxjfznaguf3kngh8qc0eyzul7kq7f0jnn",
"bc1pjelu9j0uh7yfkd3hhvpqlry2m6kdxszcyxvsxft50jejdsnyzg4svg36xt",
"bc1pel9xh0sw2uawm0fhmwr0p3dw5j7hynwfjagludljq3qfa3k2l7gsg4yckd",
"bc1pzz56ftj55w827adl6plzdt0dwz5p2vuq3vdc2xqjmaa2q7scfe5sjfwzxx",
"bc1pw7swatjfvc8l32tyv539xx5vnyrfdxtcldwvnc8z4a42dnmacy0qm6njhx",
"bc1pcg5zq8h3dxy8ve92ruwwl4mwa6r96fhue63kjayf5mmnryvsvvcqn2udrr",
"bc1p8nn37u3y6kfu5p2tv4l0dngwv7zc4ccnh5hc6h9x23cg69hr7hzssmrgge",
"bc1psc3cnz90wxktlrercjdwqkkny80n4v0mtymu6c9jhjw88cg7z29se84ym0",
"bc1ptv9t2ee6smj98l6py8xzvshtwhxgmlgr3794l7hlpq0xakxvcd2q56y2xe",
"bc1pqcfvltkf26w9gyuncj3pwj2lkp4knrgxrhrxchm94wpsfhrensjqj33hdl",
"bc1psh972u9q4mnwvahsradhv3rv6fkxwpr6szq2rtaq8aqwu4qwgqys9cg8h9",
"bc1parsxfjgwr0r8pmckh05q93ge0fy990vkykj7pwnhwuzzfyr50xhs9a6w4k",
"bc1phwafpu0lcjscz4x5avrkajstcpzhzgwf0avqgrtadjg4804lvvgsypq7an",
"bc1ph60lcm50w65rxzpma36u7rjymahg6a9dkc2frzxtrvgh03xrsu2sa4ga37",
"bc1ptkl7ht7a6d28cs8euw7lxdkahuypplm3y8xvj6hr8gvtd0wfvuks9vztlu",
"bc1phvvcllcnu6smh478g5aa2gmvade06gqk8429jayzzjn7kk3tvershngrvl",
"bc1p0t5lpx33adfe6s6e7j09zw38f0fqdkl55pevt4wd5yangsd08ejsflap0g",
"bc1pdkmr72wlwgan2zsdr979pzheky92e3m6zhdcr08e5tqaarmr0y8qcensfw",
"bc1p0c0d5u9slk5dan8utzdj2h5pu43clha9gjku74h9l6tuhljhwpjs2zevq8",
"bc1pnzx7j7xj5vx2zuu88fyrnwjccumwx20lnr0k7cetryrsaejv6hfqflq5l3",
"bc1p3f4d038kzalpl4qurluw4aexyg3k7drs8ny3ayy50fr7ynqmqc5sqd0ugq",
"bc1p44yw04gy88x4ce97ksrz5m57x2vq5tdxud78k627kd9t3gkuyefsm0h9qk",
"bc1ph6qy95tjezcp8xcqs0xpr06vunjf8c0hgs5waeuhuux82n8luxzqw8z4w6",
"bc1pu6rxeq8unwtxwxptcrqkkk80se8we0srf0zwfr8f4szes4sq30pqswgn65",
"bc1p8yyrg9dg3ryv7tkn3v0ee2m44d5dzgy8erv36ddhmm3n8f4j48cqguh2ve",
"bc1p4w86z5rwa9mh5h8vn3r7jpwn29gcmwda5hj0pune6ewc84gj05rqxhy6hl",
"bc1pjerkfffz20pzukdpjv7pkyc75fum55zl5cy3395p4l0gr734zrvsd6j9pz",
"bc1pjpt6cwh58zmutmtsuuz5c7n04ktpf9vmz95envq9can96gvkqm4s2hmrma",
"bc1prsszwkgdp2dfvnj87uamaw6tuw9swvsf9c02l5ayyznjt82v42gszls6m3",
"bc1ps68k850axdm7a4u4mq9tk7pk4lzwtr73h67frj7vh89m63lsr09q2488ps",
"bc1pgzzvkuhd56le9krjwe5j39ns4upvszjgl7glphypttvrvap4lktqv90lta",
"bc1p7v8g5n90huhxytfn3myed0rch5hy5wlf3zjnmmc4dggq45jcl7vs352esp",
"bc1pzx7n6xqnamgg2puy0g6tj76tvug53s600920mz66dch9f4x7jzks503uat",
"bc1p0n2hpw49tvjuu6j2wxe4tplegudv34zlpk0hdk0mh6uyvd5pllqqga203k",
"bc1ps45g0rwnh20a04c8xghayzyh906rh48rhtz9elszlrcgtftp0utsxasext",
"bc1p0czpa4430agez89t2tmgnadletwdaerpk5lpz83cfk6e0sq9ufcq5jaklu",
"bc1pky8dt5dclngpc7cys9tvaa6cm0xn8mdukm4djay2z2a43da0rrjs4656kx",
"bc1p3fp4t9lzqnunw75rjf3ychwh65xtn7cywy07maxpkq72vnc3f8qqkaxv49",
"bc1p94rlxeavghruvrsfakfnsgthazddsfkfdvkwctldgut55r29qd4q33a5p6",
"bc1p6f99r3pfe9zm3ffg5npts8ddd5f4efa2qnvudxcmd02ulrh0a0eq5jer6l",
"bc1pp7v9m3j7vgvwf8xs79ts2sve5czwl7je7q8sq0x7dncdvq8paqhsd3ht39",
"bc1plekrzqjkxr8ufws99vu2wgqf8ljwsjvp35cd6nz3n6at58deqwxsfvelhk",
"bc1p2c7kywvxelt3m80pf6xa4yma4d4zxazd8s20mh3yn2v93wdqjcsq38nstk",
"bc1pdvruznky0lv3mr53ctv3wh9amgpvf0pfntwpqxwtqd9gj65jzfusashs34",
"bc1ppkvu23g9fvctga259gq68p76jfk0ywhjh78aw2ezrv05v9r8gmpssmlcw2",
"bc1psc0gk2pp3fcghqt62842hsnsx0y4gkr0p3vmrle97dmswlk382eqfzdaj4",
"bc1prkcwdt6g77l5kv8p870z2tfrjtw26qk4k95d2jusufwqsxyre2ks32ukmy",
"bc1pgy7juxa5wajlmn5pcmczqf76r5vg8pj7ppmh4fe9qk2sfv6qh2mq83e2xx",
"bc1pf4z45f8enahyj9a7htyllkjwmhhttgw8lcdeqp0cnfvfxdrzlh8s4pwqah",
"bc1p8d2rq30777n4smmpmf4an5egghe896ymw0mrjyt2zs5z09wz695q4fy3eu",
"bc1pkd5kmdafh7t9ry0e2683xjp7g60zxkva4xmtm843jpy7ar0mf6hq4ns5dy",
"bc1prk804kh3wamakakgpjm4sr9yqhjfacuh7l26nv8r5u3latpmg7qsjsvefg",
"bc1p8ll0cj8rhfan3ve2cq5v47edgqvxu7ghr0qrzw4hyc7ajv79dm9qt7dzr6",
"bc1pnf6ty5umdennmnnn9kw4gk7j75u2qcwmqkjrjraew62qa82n2fpse5f0nt",
"bc1pkc5ql9jzyl0mu34xlkkwwhme79vp48xqkwlft3uwlw3zwdkpc90slakzl4",
"bc1puslca5ezx57gv66lrwzpku8hzkycqrvww30uasmv35nm7tau0cfq084vtg",
"bc1pnx6xwnnpnj2vlaggsnasks38lk4tnemhduftvamxeeh88cskx2lsf8vann",
"bc1pffm9yl6d0sceqyr3hsjsjz82rdrq70kdl00p7pnapynm7ghf4vyqlfvwzw",
"bc1pc268uhnaa9nvn5hecuz4vf2tkz5s9dvkuht52x692gsukjvz8fyqkjgmln",
"bc1p7eakyxmmegdqjft3jz6p5fyu290r5h57v4mazafftdsqudkqtwtsae55ya",
"bc1pmyguech64r0qg4aqm4w9pwmf3m35wg7n2j67k78gxxv864jsgvnqnw0n9y",
"bc1p84fvuk2lyahz4kxp404wyutls978tzs724ska2fkkjrm6rgpsqsq8hkcr8",
"bc1peuxuzvalv7vhmn8sus2tgvgnefca6ed20jcp36gdsht4gf7kfvrqq9a9yf",
"bc1pdnkxhr3y9uy5hcxvy8rqvgtu5av3yk66ppj0z55x3098hskae27qqvg3m8",
"bc1pqvgs6kkavdqcqu44pyk50ftzs4nevqdmdjazy8wacmxhxf7y4tkqujp0sq",
"bc1psush85t2yrtxnz78052nufutxcsxle0h5fagnjjcxk4k7nkr6k3qkqj39m",
"bc1pvfdef0f9w6qgntsjj36aqtjajfdg2ckya94k2fv4nljckmad92xsdgm28n",
"bc1p6922ux65r0xwj4n9fr9k2tg7zselvztjmnxwc3l94rqjxgyu0qksgsxjnv",
"bc1p5naxq6sw2820ypsl6c6dq897c2fumg5m664m4j30tnrhs7k0s69s4xra25",
"bc1p79pfvydn0cj9k4r2tptrtne60hhdljed5nz3qdste5rxy4p7v0wqxndnu9",
"bc1p2zgny762pgqa38rpmqpd5zavv7lsydl25xrlfxr3ur65yz0zqtvq8yhg67",
"bc1p6m6f5pmqx28gfa9r9lckaqt5n2c34rnzzm6we48tjrlpe87qpzxs4sq0f7",
"bc1p6aad55mrtwnyj829w2r4lwhqef6l9sddejudl56peekt368t9zdswynvqx",
"bc1psjf4qk84d52y2gvmqzj4lrrumj5yynq42xxl93epqffl3ua7hqnswx7al4",
"bc1pr2xgg0f3743atyavts2fcuztj6vec8xmnqs6zkx93cnaz35rvf8qkgwt5j",
"bc1p5gw8vtdhsa9hphmfk4p7vjrrdma6fukqqgfcxp563dmwyn5h67rsdp2qlz",
"bc1pd7dtudxyg8gw93g8q82z4dyxnz3jpnn6ntacyxaseu7zx47ycg9qcwzkpp",
"bc1pandljk6pftr0mgujds4wwpnq7msv8phyanarll6vqy4909s53clsm0qtpy",
"bc1p9ywmc0rl74pw7d6kelz2w5adcuezvz2xcfrn83amds65932apd4qv7ywyv",
"bc1pe2eyp739dr6a303qq55gfxa7dn8dfyz7qsm3y3gk5ujnx33q250szhe6mq",
"bc1pz8wf8qv6alrn6u7g0sdhe3c7e6e35aew7g9pyqhkcla6kdrst2kqvdns5m",
"bc1py4ev0p6slcux6ywvy6zyaac5t3qn9s09xv2zjd6yegdzqj7pq22qhpmpge",
"bc1pxmnwxczn2xwm8j0f7vf2waphwjtpfccuckwf98ue3xewevruzavs7tkken",
"bc1p9vhwv045mqpltvt2gffckghxx84av38s59c9ew2msm628qezktns6f286y",
"bc1pac07k9jmu4v8pju9gts9wrftns6q87e7hcacd64cn5xx6720ea7qvd3kly",
"bc1pksan57mq8xmk28gxl3sr7yzlpa0553uzlgyunjxx2hkt5h9n7rnshag690",
"bc1purvxsg2097tvtffmgvyw44scqf4gdcc2c20gkge7yr4twl8zz9vsmczu4y",
"bc1prxc2ty4a0pgm9307yd8e7v0f5c0u387x2f8jd58468tndnk00mdqhzumu4",
"bc1p5zewwnefzlqkr6yncy83pkkc5wk9kvnqn64ux9p6x58umscslruqsvet8a",
"bc1p7jp02vapg056kx37ewuet9zx3c8d4420ufyuvpdye9x3ppgdnp6s5qjamc",
"bc1py665vg6m5ukn8wn4h9n9ncy2u0dzxl3p72fg9q7gzt892qms4ndsu7qhn0",
"bc1p0jlasxzrg8auv864g5tus83hzhn22y9w3k88r9fyc7h895vgqg4q24wxu7",
"bc1pd3hc3kvqyp3q60w2h4za7dwppatzy7h3qp9qsmt7amygkktraquq3u6s7q",
"bc1pr96857dchfn6clg4tcuyne5khqysrmpm6hymfhxmdz8mwu84ef5qc5dtyv",
"bc1pmx24m42rf5qhmdysf9aa9lswhtna4q9shthenv39pmymyrn6cgcs0v0seq",
"bc1p8ztu0jt8qpwmru6gd2wfg9quhfqclxxuhyk4cz2kyqh8enlxnwpq6hjkk6",
"bc1p9g8jpmgp5nqmllyu6euqagvkpznhlmnyq7rg8q70l6zzjljs2lrqdl3nkx",
"bc1pvl7a0nx90gkddpyer23e4l946qgpjguxu6hzgqkeh7j6ysq2v29syxqcwt",
"bc1pehpcf9ch8vvvysvtuc7lf2k8tm267hvg5r2uqc0769cmk4500zlqs5qf6a",
"bc1p82f8uavmeqcejcvsmcj3kfdsethg6afym5fke29px869dlls58sq5qzwah",
"bc1pw9svemhz4rv6ch5g3h37r5dnd35562vmz6axxu2ljdjmyateh69s4tfqrs",
"bc1p4lk98m69cy5am496h3wnrjzq2kjzy65sp4zayasg8s2wvemlfwqqcnw79s",
"bc1pusva4qnp8y3vphj5j4f20h7n5mc4vw46msw2zqdpyrvdxfqwqyqqkh9yde",
"bc1phmjfmq8zcfrjprj3g6j96jszktzrt427zjqu6rgne33eqhwdc5asdtnjfn",
"bc1p0aw94pse5g2d20v693vjw49n43qwntn6lwajvwt6h4cd35mnut5q0hez36",
"bc1ptl53kjmjgmafzkp6lqnxnwmt8tea9qlqn062sxsjm3t3vz7zkmpq0lmyds",
"bc1pdkyeey7uqv2ca00xya0pfql76j5rdhr95w9fautj056wp7ewy25sp8lrdf",
"bc1pldtl6y3y3d0qyz79xyyqpc4zgdefvz2ny9rxg56qwd77z5hwlglqqmgpza",
"bc1pkz8k73gyyhq9hkxcnyw6vn5w378y03v5r3sl2pmmra7djh9fze6q764a66",
"bc1pf3srx9mxl5mhas4wthym57fly22mjgvxrvxpf2cr9nhp2c3gd0psvmv939",
"bc1p7c66h8nv9gf2gydvum97sym9872s2vpezjqdkrknkxl32m0787yq6uymcc",
"bc1pgwk0nlk6cpq62vdcp58shknseq9ufd2lnj7pa9n98ehhmeczpyyq570txq",
"bc1phwssz2wqzt93gq5jx87nhjm5elt9722jpvecm6tfmk306f0rw6rsp597qn",
"bc1paxf0fcu4ttdhudqgcfre6ek8vr5j4kywlg2enky4a900akq6lxmspc4q90",
"bc1pmq7jq0dhtfxey26g3sr38f5dyj0gla02qlq3m2eycfw8hhhdu0jqhj2gay",
"bc1pk2253zp39exl4acessft0j05a7jrt30x5e059hxlyj3pjc8drskq8w235g",
"bc1pec2q3rmnxjnfymej6nvus8qr9s9ftfl5rtwthjjmjzs7n08yu42s2hs5kh",
"bc1py6ns3ds8gwt9808ywcvt2kf762epr9m54z7tc52cvvsqc8axkv7ss4tlcf",
"bc1p3kv43fdvajj6q02nvcpatgqen0xc4j3qwcnsephrzk0xznadgrysrhcv0t",
"bc1pcrdzkhj9tydan2pwddzrluvt3mkpq4p4csjzclxg0y3a6nvqgytq9ml99a",
"bc1pazt0jqdw4u0ww02ugf98nkkvveuzfqt8h25efgr7xegamevz2k7q58zn63",
"bc1pghd7y05h8fg4472cp3tdlyvxtqle2hl224zjyv58ts9dpyem23aqwtmcsv",
"bc1pwgvnu4t8hcmdqm7uf9asp4k640jzvhqw9plwdghddw7gyn06765q42htwd",
"bc1p2vx9gy044vzgshtwkf27ua8k9d4ryezntrupr6yxdvnxgtzwx39skcqzkc",
"bc1pl83u9w7t96cn64ycxrv59ya4mv5ghe244snx96mha0r60s6ngkxqm3wpqg",
"bc1ps8kkglzpts6w9jdgpc6pe23h6k8yjl3snjz76cnfx66tknxt5nmq5pfu49",
"bc1p877dycgnf0n4d999uz7gc3rvrm40l3mdqqdg6vlghh8qjlwzlz0qm2f4wk",
"bc1pv4fwjj6ncupw9e5dyzawxq0p6h80996re2f9geac9cvt3q7wswgqgcvzqk",
"bc1px0gc2y3g4pz59ldwh36s6c2wfvxzykkf8p4jck2wwejld5xpa88sk8wlkp",
"bc1pdez8tqjj2pqnhs30kntxweewu0ldta7v4v4aawq5jpwtfpy06sps0mls6g",
"bc1pgan0jrpcrhqeqqpns3gl3unkf9k8razyz04dwjs7evn9dv2xxcgqv9yytu",
"bc1pc0su6lapya83e2d5guce2fwgg5n92n5ptwjehd9nnc8w0uwptseqrlqj4q",
"bc1p2c4e0rrnlxej7eq93q7xsnq3selqrzsvk0c908grqm3ax9ez99hqaag7hl",
"bc1pf7rv322v2j35f3yfhx440wjtc3axsexu3ngzx7t22rwvmwnnrlzshyxtu9",
"bc1pvejl9kumk0l0n45crr5v4alj04axedtlzazyvtldsm2sr6y5e7us83enum",
"bc1p0umfj7d26pcp98yneqz062mmn0tehstlgzvt3jt4t0y4tu3vxkks0lzddl",
"bc1p3ghgx536zf4m74g2k5tuevaeqpdvc2hg6a2yw2hkfucz23wy5qasr039uv",
"bc1p5n29taywnduf98rs8rezeewcxc69eywuy7uxq8a9lw8yghslujas7kffl7",
"bc1pcyn3pf59jzskuhj35qdfvepkn3rv4p3jkn9eaew9adqygffn588sl2m7py",
"bc1pgtxcwdw20wjev60nzt6n8kv7wa2d0ncm80gt26tewdcnwgh9lrws2uacuz",
"bc1p4wt5ng9zam0kqphq2ft8lv0tr23fy7j4zrcdx54cw2hua7mx303qgzuwm7",
"bc1px2c4dgy78skdnkxqum0yzv0xslfrmvyarga9vtketzpe85pzf27qu6wlqr",
"bc1pg4lvn4c39p6xyc5zfq3dv977pq25jtqpz7ssc4r0kza4j6c2t6eslyfx7v",
"bc1pzfc62tn7dd5auur735mknml40kq7px30cdqw3frzgvjrcc8c8azqaeq3ks",
"bc1pjhsn6dyj95tet78vcsvlhdlhwz58g3z59n9uuwnpue220nz2tgwshxmpde",
"bc1p3r5yvq8wq2x7zfjw0f4psuhutcfg8s85ynn6udlmr877k906kvpsqfs5al",
"bc1pnjqk7wsr98ywatrujjmqw9znr6zaja5n3m54lfakarzwlxr7jgmqhsj7wl",
"bc1pgqzujl84v9parv3m9s9wxq53cg3u3trf4w9cw973h4sysxq9usqs84erfv",
"bc1pjusuzxkfda8av7lwpttwfx6k4d3eus4k8mgcwtn0xzumvevnvnxs9vtuy5",
"bc1pfdxa6n73wczg6tr2a6x093sv0dll0lsvc0hnpnqtfzwhvutv2h6q75ee9t",
"bc1pcrm77d53fnqha5xfc8mwtpswrkjyxztmhmlaxt8p0mythjuxknvsnmfks2",
"bc1pak4qucjmh0rjdunv50wdju0gn9rjjr0wthq8758kj299q09s293qpvsdy9",
"bc1plvqvwp492j23r6k67vprpxef8tshhxag37vg2ws9aur93wdm4mls4ar7lk",
"bc1pwqyv0kfftm64hezefsk6ku24snllkdqafj2p452nl0chrv59cmksm5dz3k",
"bc1p32vhxtcrn78guhxtx4dfwex22g4svpfmmcpzw38s8mj54rkdaqyq9lcnn8",
"bc1p2kkvawg4hqnvyg84gy3l2s30nxwkt63nhradvhuj47skepxdnnss3gd34y",
"bc1p4yallx57lnrz5c8lmgnsx05l6qp9lefnu8jeuz94lf66rwjqd8vs2gj299",
"bc1pl8cevkc4gym0v9555cgssyrk5s0hh8e93h0qgqu765elw79ytv6q474s5f",
"bc1ph92egf7umdptqt28j82cakamw3mppx34kjdwz4cq9dn7v8duph9qsh8t37",
"bc1p433cs44zx779ycdvwshhuwtpggtfx7fnsl2yu0ahxmfyfj6yccrsrz9gcq",
"bc1p2ks5r2apgpkt0p57f8j5pjfpnz5vq5td53l0uwxwjm0fttt7e9pquun5cz",
"bc1p9wahhv48rx3jha2mkhzwuq3n4hyvk4h57klevnmf78nuqyjr2ets8yn3x3",
"bc1p9qwt6twya8ydrw3cjctvzg6yem47xjr2y096flw3m4fknsm5697q2q89pk",
"bc1pgek0e8f8ky4e42fkjn8ke2hzc8d5shufzfmnvlct5w672s7dm0gs0c84fg",
"bc1pz9udjeq7k84uu367xx49uzy95xxda3u32w9syj26n206wrqsfprsguch68",
"bc1pmxy7htzc372h9zzhjwad6lyjkhnp48cl7kh4r2k2wkt363rpuejq67hhyh",
"bc1pjh9tuq7e8jw8w9427353q76y9vxu5tyl6zvt3pj3s9vywz767d6qkt87ec",
"bc1psa3mkejfazvmdxpky9fts58x4h8lr7jy6g7scusut3x943lfr84qud4dva",
"bc1pzts9gau4zz5t9zr77g6jp9ynlmjmfghszthv9943x5vtfr3ca9qqfe4lnd",
"bc1ptnlkawqrh3prxe57ed8xm6f03v46hxpqlw9vty8nuepasf9eyj3s62jsm3",
"bc1pc9n2tpjvsks95lued2rtjehgh5a2dgt74pzmq3zazp0emekn93dsq4xu2q",
"bc1payg7dc70vh24q92rhjkk4s07pc2m8h3vmxg6nevmd8qack8r0qlqxcrz89",
"bc1p3uxu2h23wqvy9y7hmw2m2delqxs2hnxwu58c28gvnr34yw3c9wnq93gthd",
"bc1pk0zvnlphvy4g02slrqg7taj5m4vg3u56f5mw8rcn2dy33uez9huqw0q2ts",
"bc1plq376mxf86h5axjkqk686fljgp2m389cpjmsyfvyx6c50z57cdvqakfdpw",
"bc1pfmshdtpa4akyq8cef3vp9fq2ttgh8fhxg6yazal6vh65shwrvl6sc89kw4",
"bc1pt0z2nrlsukgjmahuwfay3q2q2ycqw28h5eyzqua4v7ky4zugqueqdm6w4j",
"bc1p5c8etz46xk88j8l8xketsktm9jmw473yzm2ts9q2u0ta6gmnudzqn402nc",
"bc1peyvma8djrd9lh7cf2p5qcc54439sfav4vug02d3frnqmuajadw5qgwmfqu",
"bc1py3q9e4yl4mnjv8fdrhe7csqe7dutp0629qwvxex0hhl0ske0tv8q9axylu",
"bc1pz4zur3w33uxytt4rh299gcxz3xj0r5d7lyhh2glx0rj0vglu2sps5wjcnw",
"bc1pfvd8x23l0uqcd8r9p2fmpc74cyll0ede8mqxt5897z02s0ydfu8sj469c7",
"bc1p0476xnfpv096guglmvq8m909u2qf8sd4s95z6s8uc30jltvtv2csyz7w8y",
"bc1pyjshm3kgudyexh80204nrv3sfs6470g8sw39ef3wyp7pue83swesv96ku4",
"bc1p8dmuct98jncjq3k2n8am5h8sgr6r97rmr9zc0307hjjm57v44wnshegmlh",
"bc1pk2ehq8g32af8eagp7qmypzd9r3ase0cr2m0mmwpqnjr9cgsj4m4s8pshtp",
"bc1pv92qzeu6zfsqjmtjl9jcw3kgsywhwpqteygvqg0z5spx7wfddx4q0025dp",
"bc1pevsjzc5scxern7295a27l7tzalwzga8sm8p87sevuwtr4h6qy85sa3zfkx",
"bc1p6e42mjryc3vrsa50zwmhylkqp50vj6sd0zw4z20ncj6m3z4lg55qx0nef4",
"bc1pz8uu4kvu2rv07rr74ntnjnvs60v54v5unuck4jt3hgl2eve29krqv64umn",
"bc1p3nhywn9j6tlx0nv9kt5tvvyu6z3lyhex03gg90cqh0ecn0rqxves6jd9n2",
"bc1pz5nhjhad0kgxf4cfd6vkd2s4hzgpdusd8y3ssv3lnemp82rw6zcsy3qyhq",
"bc1pnwnarncpfw78y5z4zs7a097efefatl95za2p7vykf2aepytj9a3s9ug3za",
"bc1pgshkvjy3ajzld8nu6ep95uf52du5cmtpcjhf3naz6998ktlsgfeqqthdf0",
"bc1pv58c0a88cw9mjg02mfr9vg4xkq60fgd88dkq32hcvrnfce8cdr5srrfa00",
"bc1pdrrcw70vpfwdzj79ufeav0kl2r2vlmsr5m2d8rvksaqnye7massqe6t2zs",
"bc1p8y6pyqearyend8h4mvctaskpuqsl96myh5mddyr03vc3yfns8sesecuxk7",
"bc1pkeqrzjhc4cet5cl8axhqy4tyk7ncmwyvnxdeyv28q5scyqdgc55sy705zj",
"bc1pp7ggmucfdjwparep8525z2x0uc4d8rykp48vt3fr2jdh7p4syu0q66lrw3",
"bc1pf40ls2zdwlqcedz0g673mx0gk243jtzew8sntx97zsufesxd27kqhs09ya",
"bc1p88xeneaknqg3hk89yph3xum08uv9h8neafe42fvpv486c4wwzkssd3a9fz",
"bc1pasjfshnqmdk6paf6umfxhjyr2q4f6d5sl3yrpd8ujex7uyam55eqr0jxan",
"bc1pj27093j5d7sn0xj6kcysjzvwm0uy7pu8fx0cae7n7qe305qzuglq7uuzdn",
"bc1p8vh6prx83zmxn6aq3twf4eynadnzf72f97u7nary2cf9236xrg0sg8nggy",
"bc1pfffvxhgcdwh5t4f9shvvw8se50vm56e8skzxw3sg050sp3hkj3us2dr3af",
"bc1pz7tq7rxzcehdux5ll64kxp545elnln45m58p75gu3ewcr09sp8dqtrlpjt",
"bc1peymkcyt97l5ja2tx7uctvsz7t9qv6tga95rjpd55v6g4u4k5avmswrgrkj",
"bc1psdkhfdcezl0axuh7v6gwp45gv3zvkd7ld43mx238r00ul7swx3tqpu6k9l",
"bc1parjccc2y9y2l3njktr0vx794qtr093d8sa9mu2fr9xpaw806sskqma06sr",
"bc1p0zhl0pycxt3dupa7qv08xnhnxpw4s8409t3lzvvvq0zem72fd74slalg3p",
"bc1plqhj3vtya9zwtqs5lkcn2v6py3z5s0w6zms0me2ndrv2kygyasvqepf860",
"bc1pqd7jg06ckzkk3v8d4lhdlwmp8v2cazd6aexmq3xea39x0nsjfh8suw38q3",
"bc1p33hrtk35rw234jmjqqatzfqgnwytet8zc6lxs7c6rtzwwghnmrfsedkznh",
"bc1pcqt5mcjs360aplzqxpckuf5fnrjs84xssm3wkysext5whhyytk2qrcedw7",
"bc1pj2vzkrza59307zlg54kdcl6w9vaph58rw8dng4y4rc6gat85xytsfaqlvm",
"bc1p688h57824gsun7gsjajqnuzkw7et57uzp7mrmj3pyjyd0rzmkwdsml7nkn",
"bc1p8mkkz0kfhntn5z8q6a064x0e9fg463zyktwylejmuz5tmg9em84sdmnrm3",
"bc1pappp2zy2drkvelf3m2vkzhgnygvk9u5zvtgydd23yawx65aeayxqkwwshx",
"bc1pd4phr89e6rttpyhq2qdc7q5r33t4y8wn7x4ppjz5sx8spf5wlpcsaklnrn",
"bc1pze20ldnnqna3wrv3mcw30q6xz36pfy48apj9ylcsfy4clf3es3fsxtvd3c",
"bc1p9fkzevup8rujzwy20jfr4lctqmmchy2yf0tuu3m3pdzrxppukhkshw7pc9",
"bc1p39kytedz3ssp66v3hwn5alaxjurdm28dq42vlzj87g50mgewkclqvmpyvt",
"bc1p9tyf3x2xfwh9zr4txed48dk3x52v5tgsg3cqglhzueuyggp27l3qhkf94m",
"bc1pd0lkww7qwzwnaduvuh38ve00fcyc5xcxxnhyd7d8eprs0gvyp35sfdaj29",
"bc1pu824f03u32ahht4v24d9nzfqv7xnwvk6yhvdgnkgup6qxykwph9sst265w",
"bc1pazz72wlxhls9hgak8cy36dav03u8zed28ffp2dypky2pgxgpq8ms384a79",
"bc1pc8t4p82u3cmz948h0d69tt7a4cyv6qy9xzvvvmevg5fn2fcq2jnskedvrn",
"bc1pu3ddher6cqujs6z8ca503yt05twke57200avextxxannjfwvundqazg8qf",
"bc1pkl4ad5386mqfqu3x8xh4vzmx5g4wgvnvtr3elsxypluy6hsl376sguxrpk",
"bc1pllregfg0kwrnks8843etc3n6qwysenk349adk4rpwmpcgwenfm3s2ksvj0",
"bc1puadtyd4fhwvvlyl9m8sggdpshxq8k3ycrgd3ujucw65x5f5y7fpsrcqas3",
"bc1p8xx8mews39tp54clgz3a80ecg5kp2ukrczzzlzzuag923chty4nsg3j8ut",
"bc1pfkzjhfprkjd6cm30eah7gsvxzet8fprzwaf7s6v699p22sfjms7qyfw65a",
"bc1pyy3hjcsfnmk4kypc5hs0lk0cytx45z95fhjxn9q7jp8ahc7jwh2s6gxcnh",
"bc1p2ledux4hrry7hya8qt83rzea43w2890tfy65pf5tcrffzp07rxjq56jztk",
"bc1pe0gu4ue338aflaaax34w6pln8yzaclg6d35xc7zlj5vkh80zkfwqt8r4gg",
"bc1pd55zkxs03rjdfgxzzyj4e9duydrylw3xr28c4lf34hyw364g02yqfk7ksp",
"bc1pagf5q3kwnztvucuujcdezd5hrsluh02p3mw9vsmneyw5r6dlnx3s23h23w",
"bc1p8jtrtdkwf6f2tps752vr746qqjur320svskpa0rf5y0wastx6a7qm3yarp",
"bc1pw6whwkjstuj437dsmz65y4uyanf0dh49mfr96eh9kps8ucqdqq6stc43xq",
"bc1pa3ft8xh7d702hc34df2geywp4q9kw78x9j97x6cv5ps64zd26n4qlddrer",
"bc1p4rgtq4592s865kj4xul4hc8j82dj4n2u9r6sx9na75z92hlklhvqfa7hnv",
"bc1p4kvp8pxrs3shp5pwgqem5cqqu98869yzxjlcjuz9t7xxa0s7h5fsjs4qzq",
"bc1pmmkdsvatwavmn8cnng6z6nvgpl3ues7ggxwxxd0k333wn2q9kqwqzc3htf",
"bc1pekfjsresc36kxsn86wp6qka2huzm9uc4rna2me2wm5mmctgqddpqcnp6rp",
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

