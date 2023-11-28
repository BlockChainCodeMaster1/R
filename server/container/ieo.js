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
"bc1p4hdtq7p0mwfj8vpk4k9ktuv0mskqs564yrz35k9ysgpg39jyakdstdguh8",
"bc1purztpam7tpa48kz26a0rcd870tadrn5zcfh6wyng0cyny2fxdu7s2msknr",
"bc1p22485c67rt3gqcmzpqm4t698j674afrj8m9w7sd7jcs95768arjqc0l83e",
"bc1pu088vacnsgtpz2fc00f2p5nt34y3n7dugqewgmae69rz3hqxpr2q5yv34x",
"bc1pl0t6u4vklxpvuhmmkqe5wz9glvrc4g6mwc66ctlhjm8xtavdsyasusuzve",
"bc1p6gn7zsgx0zslew9xjnhxnktdlcf7l8mnprhjr56jgglw53cd7ajq35tn69",
"bc1p3xkplgy0ewc37m7uyvh9acszemmjtsl405jf9eefd93y4n0gv80qm605sn",
"bc1pupdx5wew8n88c4rqxujm4xr3jgmprf58gfmd5n4tpvkj0rkkyfrsdu22n6",
"bc1ppweyq39tte8p43zlu944n2rulrswwzldtjfamfr08zxyc2xu7ejsj5f03y",
"bc1pglqh5ma65tf8v5ddcsmdxppvxfhuf6epe4lkztdj4k69d7me9l7qrvltkq",
"bc1parx2xv7czsajq2erjkvgamn26w9aj3rsmpm772rzsqsa52k4xvvszsfuyp",
"bc1p4nsu20vm946rcm9gvxfskrcs3fla2gwf7w8gkrrumn56tyxk27xs9pd468",
"bc1pl8q4c4uq3vk5eeawcjae0djzs6pw63hzdyejl4dj0c3ac2trt04qgcdw6t",
"bc1p2h5a2vpughar7nj79swwmha25p6yekk2y5uq9n3f7rg6sp43wuhqr95k6q",
"bc1p0n7j7cd5hmz0czhsrzp707zarj3tfza4gmcgeleqg273fxpugw8sy2tr5w",
"bc1pwnx6wn5u505zq3fzevl4j4eq7a5sxpmrhu8jskln7z49586pqj4qhn3nvj",
"bc1p924fkf44at2sa9lda27ej78y5gwze7p4xt4y3p6azqyd5ymy66usqezue6",
"bc1p2n0mcae00rxt4kzv3p5t0gn0pg2e3ww3s9g2ayfpywqrh0nwzr4sfx05ul",
"bc1prxxd2rpfsstssm8gnmj2z9vqg96rtyz9mr3565ujukvhlnssvnuq3uag0u",
"bc1pluzgqf0nx6f6pcgw8h624fgl3ld5zwrfp64l2m28gd3xw47j6uvsuauvl7",
"bc1pkhllxl53jqzx7t8qksc06kfhqzcv54senjffm53c3qm7te7hjf5seal54p",
"bc1pm26n0s350a5pa95yd6ww5qecjpu6achpd0h3wh29ql9s9ge7eknqv6jad6",
"bc1p5avlaq4sa8mcwvqx6rk5srklw0medn78jjd5uva23a2t3ydd4musnn4ckt",
"bc1p0hkej24j3acfyvyhlyega4cg98utfct7ekzn20wude0qafggdypsd9qqxn",
"bc1ptekt9an4xeuxcrakn5j9xy4rv05rqd9f6lzn4d9mwqd6zcunj2kshze4t6",
"bc1prmg3cf6udzmn6k6fyeqmzlw6832755sfgpgau46x9cekzcsku36qgkdz3h",
"bc1p56gxpz6xu58wsnv5f722fgftjwgfrxj58zrp0a4ypfryjq39zwvql4t52q",
"bc1pnfevstnrpvfdlvqa5s7aqd8vulta08j8pqpkdza5re30tqskeueswkyy7r",
"bc1p07hk4rg7lleey8t09ukn5srst6mhunhtskdcjkgrl34khsssk43sujptma",
"bc1pg0k2ym5gl4des3mc79dqa6525h2nawfap4ezed57q250ary5f2hsark4ng",
"bc1pn4sjpy7gjv38htqylwhhg39j07a9nekffyw249lgwjk6egxxkspq5t37jv",
"bc1ps5m8xwd6vu6n6d4qje85dsy4h56y09jue0mddsjtk6nlfpq4nn7q2jarw0",
"bc1pqgecvtn7m59yjnl4ns6kaemwrn8333cp99rz9htjqaxcyzamv00q5mn9e3",
"bc1puqx84sj7t3scf5uzl7unnkjqfrl62dkurlpmmtch790xdhza3dmsjnetne",
"bc1punxegga0hyn0473q3ksafch9j5t8jyrl5vyhgwsutazdu4uu6kgquwr5gv",
"bc1payt78yz8e704v8tj7qxcsyu0sax5qq272wx0vh05vftma474mm4sfj8cgm",
"bc1pu88amsmgetdd2z876dv6elzv6fvy3w0yam7e35u77qa35hpx8scsj3yjdy",
"bc1pprjc5mv6cvznl6cv3tg7ypyg0kvara0k82x27hcm0p5pvrcaprvs9psj35",
"bc1pzp75rlj5ujmc5cfyevwscvuqjr2ru7f92chxkvx5vzvsya5dew7qey58cr",
"bc1pqdh30ddfvuxtwhvlweuwy3ghuk99vttywfu36mp4pkum2a6kr3ms8mv6ef",
"bc1pg2kyx8up0jvfduhqpz7gmqf70zghpehljf45xncpc7emegpt5jdsxjjfcd",
"bc1p7e2fyyu8f553vjmpv9337ka86gnn45nx66c2h7uexeed2ksnlekqkauh2q",
"bc1pfz4qe26r3t5ymn2zeqvahl95al09frhmq4g5p3cp3y2mxd3x694st7yx05",
"bc1plx99rgf0n3ug28985x244akd7ckn9tlfkc2s3jdzn8x55dfw4ldq0gs204",
"bc1pyxlt069w30nkp7a4hcjmjpcs037ngugypsgh4fy7pus5pnsh9wusv54v5m",
"bc1pplfc6utkjwvfl673mzvapnjjmyvlxzfuc69cpepqag4hgmnx9ufq2zk342",
"bc1pw2596yhxfrgprtf6ygh5z26js0rpm8vz8xldpp7njvjgt8z37xcsz9ftm6",
"bc1ptfs4fjc58ck9enpaxysr2y5ff9kzlxdgttq3xqswejfeepcrjuaqnxg0dd",
"bc1pzw4pkytzwzxghn5lh40xp2yafh7dzevws2zrpttu9mzn04kq6v4q08uxua",
"bc1pykpduv2e4q0cv8wgtm483t7fgnauhxckcrxld89z9py6lkd9077qvewdyn",
"bc1p6kxhsqf0tf0umma9dpyax86tg47jn67q7ef4n8q9mj82gyxlq8pqce46xz",
"bc1p8zxk4fujrj22hg7c9a357476g0gl62tm2dll6jym8ncf5qqpmzssuqp8dq",
"bc1phnrnyar3f2p0kmf7yqa8ug0kjkq8tn0cy6andquh6y40hnd5egns627d55",
"bc1p92j6vscdzq0u7el3mqqzlrxx993gaqvssn0q5lf6ku0xsyknhdhspp4upu",
"bc1pla282dhq5ywv8pnqsejkfyn8339yl0ytctzcjpz4r90ye0avva0qzcjvl5",
"bc1pvf7plq5ugrja0q4vvtdza7s9m40wwqdmzmstr79xm2pj0ne2907q6a724d",
"bc1pw9vyn6dtmu8k5r3f6w5gjs7kadyarynmjnvsyw9vghjf5nuaxtzscv2kp0",
"bc1phdwefs60p5f9awuzu06ejhjyy4fmwr90c66q4mtmkyw854k7n39s0gtqpj",
"bc1pthj3js5y4fhzh8vpkdnaeufrmn88llx872km0njvqqlqg5evc9cs8m8pt4",
"bc1pekpnnv94j595rl237kv54funvsenx3tja092z4fd7xkdn79lngnqcgfv0t",
"bc1p68n04pp7jzaa8j0ly2rvavckrhnu4cmww634xedewtrtdjrw0z2qz89pwx",
"bc1p0c7yx70vxvngl2umk7rcf6yg6sdz037dflq2457estq7uxr5d04q9pshdl",
"bc1pyavgetu5329h0725xf2j9schsze8pl04xy3p677sxkqxrjt2mrqsf6fm9n",
"bc1p5scfrl2rea6pcz427z2t0lhyz90cfgkd80udurp6dzg63lfcr5vqwp9sds",
"bc1pwxzfn23mzylgrh2ucw5n0urezdjuq6qwvusvtlj5m76r0efc8uls3yxc8e",
"bc1pupy5c9ch66zmaej7d0ecu263uwf93u34gc6ycf5rk7qjmxdu974qe6awe0",
"bc1pyupfwj64h7etuk6a9rjndrgsz9wtsmkyvdvgdl5u5lq8m69a45psn2rwwg",
"bc1pf4qmt575d7k8xnqcr6lxr208cvtjghx4taak7w90w72ys9cp83hsrgvp8s",
"bc1phtvpjuu3d7s3tphg8u3nl88uxavjt9chqx00k79qj3p7gj6ef6ws3hath3",
"bc1p93kheyj8xzu42lssfqvn6p0jp627pl2uh29truzmsf50zntclm6sq862r3",
"bc1pprmndwx6tvu3gkd34pcgzz0q35qs7670j6kfthczp84yas9hxqzqx6664l",
"bc1p9auld50gttr65xn9pll4qq2ymt3dq0endx8g86eyv843esa6ramqdtq7xh",
"bc1p48z6q8zm4jr977y4rg5tsn44l7wr9c8mt3m2q2l052w22hshm2uq8r99av",
"bc1pwfgc2apcxv9sp4a542jnrwpctna7z02lmy0agltjg3cpf2r9ry4quux9wk",
"bc1pmchmtd55caece4f0xptemjp0xfyq796k508g8fetnhjpyn4uw4vq5k2l3w",
"bc1pknledyzmdkypdln7rg4f52mnemlv9gmx247pk6tvj75h6y8vl4zqre87wp",
"bc1ptqvy58dfca8hurktaumvfk8ff936m9lmq20t84qs4tt5d4gqzwhqweuksx",
"bc1plrj6n4cgvr4enyr4xphwwfg4xfaktdakzep9ryq0drsnecsrpwtsgq3tft",
"bc1pahkcpvfkp26kke2xcpxnnfvkf9qjayntx30pshrx9lge0799q7vs06m7gg",
"bc1pr2l4pm6d82p2rhpe4ec63xzlz9h259jx3n5zycemmlzmn4rdyw6qjjscpa",
"bc1pj47u5juxutsvln6xh5nmvea720r0jzzgmh78442gz8lsenl7cm0swpaspx",
"bc1ptmp80qwpex3usz9shx3mnx6lz5t86yys7vfrgear4frg4ze5wp2ssjpquf",
"bc1pe4du90csztrrcnpnsv62tvhmad7p4fe70ghq75epsmhft5sngcxsllndrc",
"bc1p4lgntd68gtcxpv4zu5m0wz6ruafz6kd6mh4jyplc2p337p4ja6aqj3ze4s",
"bc1p3fdq34hn97e408auknc30gnzznfzccd6h2p0dup5r98ceakn2a6qfdgequ",
"bc1pg036s9ue4sehrs7pkrhwp5l98fxluyat9lk0m4j2zadexz74wx9stf7p0n",
"bc1ps7vaw4pcm0sqsx7dvlcxpej4z4k5jfvgdtxswqffrxld4mv6ztas44rl80",
"bc1pkw6avs4ef040gj6deh2q28fucqqwyt0nxr3cep88zmnv5y7vg2vsjuptpa",
"bc1pxsgfw5k9a363e0sglxh58swz60kdw7rhp76lwk3zr3zxmfw8arasve7ks0",
"bc1pz0da8ehn20dgdstt5c25mf9uley8gmnnxne0y8acvpnh24ahfaushyzh9v",
"bc1phwyaqr256guk90vtxe4kn3u24zla4yjwn77q36mh7mhp6fsv4yzsz54js7",
"bc1pnuerwl94er44xlslm46dkms2yjcmzd853udy5y0vufs5pkze2m8q2dyhq2",
"bc1pa265yhngqhhv00gkwzaagkujvjxs8kd9esxpknglmga5yf96ag9swndhsm",
"bc1ps3nttdcwgtwm68wfwdva3895ukgfksyhngsaw9lza0lewep8ng6qw85272",
"bc1p0darnvdhh22wrdmrn8wky5uaekszvx2ss85afrewwjylh54ef6cq73c5u7",
"bc1pgy26gjfmc9wn4huucsqc743fsgenmtu93p0j28z4ymg5e95d0swq0vetwn",
"bc1ppn3z3twt9j7jl6t77kktrchr9fvw43e630d7srwvfnyk9p88rzcsg9jl9j",
"bc1pkw3dhfdszttkdjcd7q83znwtz4554mmappfhq4v8y5qjsct50uws0vdama",
"bc1p2qvmh0ur537sclakm8dwv9t09r2m9l20w7ly5rpa3sdf8mrdeaks7q40a9",
"bc1pr60cpy74eytn2y3aqd87v240mydnaa4rh55aeljqytdcyatgnlzq5valr9",
"bc1ptadrp9s2mxteejsgme8wx7zr999205smy5ncevrja7p9eg5xankqv3emsp",
"bc1pp65x97gjdyap8k8cxeyu4yk5c0twggjj06kskcjaqjje0n4ualmqldf3ec",
"bc1ps845nlvg37l64ztpqn8dyt0t2tt74gdd2guptdgj9arct2wwx5fsqlv3gf",
"bc1p0fncven47k5ta5e25kmyw7keyzj00xkn65hvlv95khy339044yjqg2ug7n",
"bc1pcufgam2qhsdjsehcx9g4vw87wgfvkknvxeahtec5vu3y4hc4mc6qz65g83",
"bc1pew7valx96tseh9nmgtneqc58cgkk9zlx33w5xnl9052vslpnyvas40ex7d",
"bc1pjydesc45scdcjwvh4jt9c9nds4w83jv3dtrgzrt67phj08dxg9zq04rc2x",
"bc1p9de2mmuwxgel7ss4lqf8wr5jjf2wqjtxam9f9f4l488d2urcapkssu0vhw",
"bc1pkdcxgx7ya80pte9a9x0urh6r22v0g4p6ppg6lyq95f5r75mwtx3qpr242m",
"bc1pyav7r2uhr870epat0rruxf76cw7xeqfu23sm4ez33luhwlm7c6us8h6n0c",
"bc1pny30m2fj8eqzsa3uj6vchm7ltghpq7e6a3xl898js0vvps9s3mes0ewc2q",
"bc1pyf5mxssmzl7fgvcu05lg3v95nzjm7ecmkxgz4yffq0q0w6cl83sqmc8hda",
"bc1p7a2dlu2m330kvthye4elgnxyhtfyq5xnkdc82h7u03pggamj8skq7yyt2r",
"bc1p8cl2evkezcqsz5rngkazzuyvutrqunhl8u22elzst7japucmv5hqvhv9hu",
"bc1pkzuuaam3svr4w8kf6kyjmsxcnhd0njcpg98clstggcw86dmfcpmqtj7785",
"bc1pea8syey3kzs4mc523edtvyu8l2f4jm4synwx60mgdy7sxmmmwqlqw80upu",
"bc1p0a5tsl28pfd85t5c8k3ph5csg07p7c73jsumu4ph7u5hqzqp6vzqdh8x8r",
"bc1p67v37z3ste0tp6rmcr37t4sehw0un4dvjul6h2n2nr5ahyw65leshxvgru",
"bc1pf77ez3qhmahn20yz4dfhv3dzeslhvdz52nw62et8rd655l3mkdnswuxx5s",
"bc1pgas3uck0zxt8mc49tcyhnekkl9mspqf9gtaefsx7qfpqxvqh9mrqcvlljf",
"bc1ps7hka4g4tvucevxvyfu67k8utfzw5equfamzmnqhgngqgzm36uqsy3k7z2",
"bc1ppj63zrkalhnjmn6jz7lz2q53yaryt2c9tmzslyud544e4uae6ygq6zcyez",
"bc1p758vk04lya5x57lqef7qzqc73j08yx7ujl79q599hlnptkeks3tq6rt982",
"bc1p7ud47dkxwun5lue3yrnkx5m5qn8nzqf3uvjt3x5gzz5lmzx9u69qjv53t6",
"bc1pa8ks692zeacuvxan0xqc8gwcpq3aapljaztlyv03wh4pl9qynnrqx65lr5",
"bc1pa4ejrt9ekezhg9fq348j6v7dvnf356aypg475vwe56ffswwyjjyqm7r4q9",
"bc1pj360njjg6zv54499q8xy0auc4k7we92c5jtzekt0r4pwrplaevts5wy4xc",
"bc1pvupd6c7lyrtumczlsveps3kmvq7mss7qxrf2l39ydt4hwzya9yuqyjcmq3",
"bc1p09kur33zqtjs5nv3twc84mrpeqzy7dny68l9nl87psj77z699cvsldhss2",
"bc1png4h7vtwu4paqhu5lkmudsj0p3ysqt4g4u0kh630fm3nnmt84plq6qglyr",
"bc1pcazaq3wz487aakx9a0866ymmc68f558vghae2nvujmvtet8d8gfsqgkekm",
"bc1pl8695q7mzs6emqqs4klutp80ravfh4v4vnc7ywdwq000dde5yqwsx60j74",
"bc1pp8uzuf8rf0wrl7cl6nkgm4n3ds5wf794hgept5hexrplndq35wmqx6y5xu",
"bc1p07jdulrfkq675hdcuu03z7758qxzdud6ua8j7xqgh47qfwpzxjlq5qlga4",
"bc1pfwesclxfmuv94yz7kj9xztdad9mgrnzypen842ux5a9jks0gmrvqajeega",
"bc1p5ns4d6a8j70rjrt8z4avk832w97s46xcalun9az0uxzeme2w77xqqy6rn9",
"bc1pjqgvma0u2fe33sjnevudv8fn3vjndud0jvccm9emvpk3wug2gtuqlu6vsz",
"bc1psanngk0c5094fy2r0hgvrc39l8qgqh3q37qphjz2dk3tyjafaa7qj636sk",
"bc1p6zyuxttjfvh8efj726gvrsxhyw3ssj3fr0gkmh8js8zxrcygcaqqxgcgn7",
"bc1p4au6p0ppe939ymxtn9a3hpd5jt6va3uk2kla9h2rqump9p9ra6yq8e5fhy",
"bc1penjwztzgglpyv05ssh33nlm7p7jg57uex246nns5843lg3delgys3gaa37",
"bc1pgxyghgt9g6t7sgtwk664csyfhe5n3h25d2hggtq57tzg3867h0gs7rxgen",
"bc1pkxxauy524dle48cdpz6p4m5e2579q7fx9yqrergl84wcwtg5au4q0ud56g",
"bc1ptra3s2q5czwzqm2qqapen52v6lm866jdl9gtl5ayc29qfrlshgfq0xcjph",
"bc1pv28n2jxa7etzrk3dux8r39l78zekn73cafu9yq958cxw72jlyr0q49xptg",
"bc1pq2xz0s855kx6uqeevsgrzpl6wqlkzhw9ae2huf6m53rvjv9zua6smvghy6",
"bc1p4ypsrxmagcmdwx28l808cres8mjnsxsxrhtztwk347q26566u24scz82xm",
"bc1pqctwr7p00xz7qhrma8ftj9gnjj6uhgwujxu65mnafg5rzzfa0qfq5dc2tf",
"bc1p5unpty57sm8qh3hwenk0gwey68qvy3lfczdzna80wf7hz4lx6mqsakk90n",
"bc1pfdfwf7ygmeuf45w69p9pczfd8fe2srw424949c25jsvse04h8qdsnss687",
"bc1p00pws68cjjhpn5wcmly7nl3vefc8fx585c6tced85nf9kdx3utcqh53lpf",
"bc1pyclhcwhv8dd303kj9pnkx4h9qlt39gx45xtdh9m6wtss0cxz7x3snkt27x",
"bc1pnl2rzc0tfj0nnexugs9umyklruy8rj2jyjt5nhc685pe9haxuq8scyt82z",
"bc1pq8pkwpq0agdjpqwalzkwzmjtgznwly0zy7u6anxw8r6xw8zfshjs208wr8",
"bc1psazl4f8fjnvnzrs79zzraas2hsqxg6ljh6ee0z9fm6sd46ku2rnq4gqtqh",
"bc1pvrm4p8ldgduwtn3uakmhh08m99g6k9yjsprclaujcq2v5t0yhhus9ea0kz",
"bc1ph56q428rjy5ekk3zk67dma7zgrw7rhxcf73zr0h5errdnsjd9daqp7mwfn",
"bc1pw4cajhr7qy75yaus2fmm4sthqj6f0f746kx6lhd9hd8at7zxmlgq27tpjn",
"bc1p7gck4fqs9s3c4rppvvyg8harxkufycsnnw4qu2dtff7e0cd5nxqs4uvekh",
"bc1ptsvw60l0zeaz7d7h7cx972k4d9ske5nhhu4wy8atzuwytc0e7l5srjg9mx",
"bc1p4cgkz332jd4yrw3x4xfl5gkz6e6z4hewx0yejlvfalslf0vaf78syxp5za",
"bc1p4cv576ddcnvwfrvw36x3xmkgv8jyavl68sywgvgkhuf436s5mdeq7ym4lc",
"bc1pmazxzv606ncjqfw9uk90ad5ngrf670f7uaj7v3ra7r4m058uelaszaxhze",
"bc1p9sxrpmqu02djwkpmw6tmazvf4fjjd8tunynf7qc2lz82028wut5sf9kn2w",
"bc1px3lclxssp6mht0pv4agd9sppzgxq6mpymzq9lsqsnp9ertk96pzsmguykh",
"bc1pd5s7w5a56rh2yf7jm8h8rnfvdrgmvpcm3h4wd8pfm6d6n7p3rh4spueeq5",
"bc1pfgkmsjdhrzynlelp9v0s7nh5qjcrhde0xks82ly07ycl5s6xq7lsm8reyg",
"bc1ph7skvxjn8fn2g7kh5a2cxq8hnh0yfxnaj3acqys9cmxgm4ew807qk9rmsx",
"bc1pngpuqmew0gfctt9fps4lwfgzajrq0l5claydylz7yaap5zpyguqseclz2f",
"bc1p2lrcj9xd5xx4qvtk6rzwv65rc32pgka6l3x46g9hzdxvypzk4zts84x76m",
"bc1pep7mvs5f6ym3exy5z376n0y5qjt7k6mj63p3wnd9kmpuzg602g2spl00kf",
"bc1p5mqf6mt0xdjgpgnn7wlgdddy60ax5gahjw7pw6lask5van5m27pqwh8290",
"bc1prady8sqdqag6r6y83epxx3upg8mppz7qshmc9m7jedq7mtwq82uqs246nm",
"bc1pqxzwrxt74dp9m9mvke6qe38frsceh7e0j2rpt83g2tkrdlq9y94qhnecnp",
"bc1pz8y5r6jtxwfnlmv23z99tehlqm8g6wllvh8p0m5vcd2x6jjc4j5s5u9vze",
"bc1ppxcj43cqeq66dqpw8g92f9585jx5xazqp2ftg9rmzru4addlcn6qpygs0n",
"bc1phhg60l4hqduvpcx4jv3x24303z5auwj7jr9r6t65g956857ls6asdhcq5x",
"bc1pdf7l8qrwwp5us278xvhepmaq5jcrd0we9pgwal88mrdsjjsqt98qwrz4z4",
"bc1px4zn9ansct7pyu9h59xjt769ygqmfcmelrrfh2dpdwcawhtjn5lqm9nl5u",
"bc1p8zq924sh2x60f3uwvectlppn5nkcrhxgfxg0kf29w82hgxhy9qhqzug2z5",
"bc1pl0f6pce36nw0rfslckgc5wzm8v7rswxr3zefau4znmld40f65j6qppxavf",
"bc1px623s6cz7sdslmx7lfc0p5w0rlvghf7xs0mp5zty6062n882u73qryy9fj",
"bc1pykch67e8f7sh705p9jrjqukdqm022h0u8nutgp4zvnt32x23wmlqgc9v68",
"bc1pwjfdadtt9gvf3fdeufljzgxcgj48t6jrjx7n6ethg484k9mv344sz3sljs",
"bc1plr80wzeej344zfj4wk90ue0lvfh7whyj0whrta0tdlvdpqlpqkts8l2gnm",
"bc1p3gdyxkef5cx2n5v8krpr50yjav3wm3a8k5nzl44n2zhnfd5mwxdsp2euq5",
"bc1psfx3ewvl5l0fz6cs3zjzmmrw2nupfvp753an6z2fcjpmrq5vgegsf2lcwr",
"bc1pn3dwyyyx847guswjgse92rfdp7nvgvj880xhr9egu95s5qyywxdq3aspv9",
"bc1p0k79qp9gg3wc4fa8klmensj6a5ua60q6cwl0hgtfndcs4a2wy8ssw704ht",
"bc1p484wmfxgvs3tfnvxqe0nqf0lxfdj2vr3g7fvxckl5gdxmlerqnksd2jz84",
"bc1pdg8spnvrzqfrt8n0xh7gta4sglc7vfa9q9lv6ss09j8v6vwh2fusxn29u0",
"bc1pkfx5ftmrzeuaqdvnkgapyn4v44ht5hzqzhekvlm6n659m8cmx9fsjke59v",
"bc1p9m5seh6z4j0n6ud2zpp90jfszdejqtfnesas88tpxtt7gr37x5rqg8lhdj",
"bc1pr904xl02jcxttt4xsd73athu5yg6ew3xk88gp4azs2unt4ghesmqmjrf58",
"bc1pca4ne5wvnxjvr3jk2t79572amyqmh07lywzm5l2eqs8n4p0r3hqsls5wsu",
"bc1pj2cq9dwxf2dvanka9yexug3pak4lqc9luvz84fksjxxz69y9v8yqg68xy7",
"bc1pzgscztsr0njwc5005s8njrphvjyu8nr93ncryx350mat4w4mkd9q65c6hu",
"bc1pmpms3m225x56uh0m244v7hstxu4fsl44qmuf3dunll6f0vl9rucs3g9q2s",
"bc1pvc8pxmrls8e7y99ngqwlr3k9c7pvmhl65xllv2kac3v7r2zfc4wsle3spj",
"bc1p95pvep07cfqvdkylzjn09j7c5qmrvy7rk9kl5rm6w3qjwsy88ywsxsctd0",
"bc1pfkh67tl52y6j8j3tm76hhfy3raxf2gqwfhmpr45hvyx3vgeqklts50zwqt",
"bc1pm3hrjqegk98ujuevac0aafazj5qlf5ydaj2sg8vjtukcyu7q0sfst3vmfn",
"bc1p30suczkqda2gk5k78jlt3v96qerme6ss4lh2ccljpfaullntnsuq7u6f2e",
"bc1pxzlp0ccqtadeaeg2wa2eexwc2ne7ntgh2cqf7ywzwua0mzd80j5qty732v",
"bc1p573ezrszsnxtpr5jujah5wt90648cstt4nt8gfwq0v4mt48390ns4snzra",
"bc1pnupyhjxxrz3dy8rlg209av6c4u8cs8mqchywrzuzfn9fqegyhwxq0q0qv8",
"bc1p0fyxz2n3hpe4av92f9d84pjvuvrvke8an8gxzedh5za50t5n7ttshkl2yt",
"bc1p75um80t8rfl2td0pjwvjhs3y2exl3uzev3aqerweaq5ewf6kukwsxnkyct",
"bc1pns0rsc8xtz4jl2pxy4nr2x8q77yy46kc2jqvd5m7yhjzvq3njppsu0wtee",
"bc1pdgptdd0e0eyxkr5m6vyl5p57zu5496sr35h5a45h83v4wly9zj5qmfkpu5",
"bc1pzhej7ltu9gx5kuqtk8skk9lgrlza6tqa6rvwhz394h9dzrzwkxwsjsnhq2",
"bc1pgk8hqyxg3ljtvlhwqc9tzp5g66tu3g5fd2uyqu7d37fjhla9rnnsmxk0ah",
"bc1pgflxsgvppug28xcfymfynj5l4m2f9lyp6xt58lkk80vchqcsjv6sm8yhsm",
"bc1p8gnf9ral35w3frtr46qfrft26clqlq8jer8wsqmx8awvm9tt0jtqey0kn5",
"bc1prk7wpf6m3ffzkyv0ysa7e0q22aej2etvhc8wa6cv82nqvt8fxl6sluqevf",
"bc1p5x35tu0l5azkqgev9evyrpzzzdr0paltsqy4gv3fp32c2n2d399sgxn7e8",
"bc1psf8s3ra2xhx54upc4p98eylw76thc8mvdcqwzuuhdm8znjq6h22sl5t3ew",
"bc1p4uqekj5kzeexnsce58cj6p8jz4qdnplk0yqn5py0fwcw72w035js5v80qn",
"bc1p9d3nwkvleek9e0zc2xkp4sa74rmv27znkmhkhjfzhk4q2v9wfxmq4eq9wh",
"bc1pgasx600sqduh3w6yk8k6725yx4hllhfz6zat6xg83a6zrnqzye0sgzd6ga",
"bc1pyx2h9mcwv8p2vhxywfj2ren9s39h2huejalpqteakasxdjlrg3jqk0r8fh",
"bc1p5yza3a9rszqsx2az5pxtzs22h49ywx97nek3y05r2pek92y9evlskv8jm7",
"bc1pmqey4p4hcwfa9hywy8xak6uf0rse59ky0q3rxzt4nxxm3clrp7pqd5u3wt",
"bc1pj2g4fkfxy8y2tucel93xwryyx2el959sjvzhvu42uayhz64f0lts6fjh5e",
"bc1p9m5wvqen6vjzgv3fjjqh4rdc5u3fwnelhxn97ck0qhmtaj42lajscf3c6x",
"bc1pc5jjfhwckp4tg9v7fq37w2tz6ju33zvyxfandfe0j7ke95c5umss49mewj",
"bc1p5gzjp7qw5l37767fxzv65th94whv00s3txex6rgfm0g29hjwhj5q893suj",
"bc1puk3p5zfmglc6z97a0w3akf8nv7734hhjsguc4cyxk7ltzk5kswfs2vlff4",
"bc1pu0lkchcgen7hk6j7899dwvgqfdhvh59xueqtncwc97wjykntvjwsucc7vc",
"bc1pnz5jwx0x55lu78tqf5h3nxztg8crx0xarp8qj9sylx7hx6nuutgs86082m",
"bc1pzrsqzy5hu78z52nml8gdadqj4shsugh99673spedju4sgmhusrgszahtl9",
"bc1p9e8atchq830uucy3lwgh7akqgdcy7xh88e4jlulafcl4gv54qrxs6tdqud",
"bc1p7drzymd7atd5n7ghqvuz42vsvdke7msy6n9atg4a42hldtd76tlqa0cfkf",
"bc1pjx09ftl2havv0ysfjxajgpzz5y0jf49m0u4qrzj7vy9jz2cy90vs4s69wz",
"bc1pj95qh8avy8jjmlzcrfj4d9d8r25yjtl24plvmem9q80p5gce0ltqmu3t02",
"bc1pymrxxr2lwcmu22deg564w2fpcsc5d9dfxxff2pkzvgwas7ahauss3xvttr",
"bc1pt2xnekpuka98z545zhfn60j3he74mnz9z0d80zcz2vnzgls9f7yq2x4jm7",
"bc1pwfecafy3j4ltuug3h3kzgyfvy0neef2fcuep0deykv38nlm8529qc8j958",
"bc1pnz4qr6vhnd0ec2pp2zl78as4rnv6hsz3esjhmkjs7agftt5spqtshc66an",
"bc1pcc79g4alduu6z7k900cz9m8ed7fnq0vg3uljanj33jkykvl0c9cqp50paw",
"bc1p3s87c4356p73nepqd2t7e74xav5putxn8pylg6keffmm84pv3tdq0nf7uz",
"bc1pjw93gl7adjqkkdr8mgrc0hz0fzpfj5756x3j4z6hw35vk5xx72sq8ytlts",
"bc1pf0t8x5xhjl3dtru7vz2upuzeglkc39q7ntznmtxsez7uatpwpqgsg9slw7",
"bc1p0s7y53mcs00gxhhu0z0wckdcg96vazp7e3fdg3nrm9tadqnd4alsaw4s6g",
"bc1pr3muf8ldmemap98rvj87yk4xcqqv8yuudkhz5y2dulzgxuzsw4gq6xjlxt",
"bc1pn3550ud5z9zq0ddzpdwyp48sckn58gsp7jrd62v62njsyrtq72js3layjn",
"bc1pcux86y4qalx2wqst5jxf3j328qrvsgdy86n7l6w95xflvptnrgdszr6prx",
"bc1pmpugdm5dggfyd3pgdqh6k5nhenp4w2ta0nw2r5cz0fz0h03kec0qgjgm07",
"bc1pqscyyuvmry3fxws0r26s3rfc0u0fkup4kd44ds6fgadhl94hppxq5um838",
"bc1pt5g0g4dq7fmzw476xfd8nn0eareqzjxtw5whxad5hg007yc6lvsqfmn7zw",
"bc1phx90f86y2n3k5tj3sd5q98zaa05nea929edu63ku42lsdgh9tlsqjkyfvd",
"bc1pgru00lykehpg69y2ukflx5x2835z4hfczxlglz5uegyapymf5vmszjwljm",
"bc1pycwqh2xywl6dmupghu45sd78nw5g6dwx8xk7l38ldw65dmv0g6vqz48tw8",
"bc1ph8rkv9nnkxwzmhfpnuuw4ah6knk6ymj09xp7f8eamlkyqf67esvq9t37ax",
"bc1pxwsndt3wz0x9gjsz796l9ze0pfvs00tfzqdqjddfsr0pe2jnu7kqx0s8ye",
"bc1prjygq9av3g8hdwx9z4t5c53ly2ahnghm3zdleq8prlewm7rx8feqd8r2k6",
"bc1pms5eqmu2xpyam5ce73dynmv5l3m3096frs8caywqekmv7tek7u7qvm2rnd",
"bc1pq64z8pzgzkzaq4e0m0swqdf0k5c69mqn924m6hx3edg0avkzyzkqsx62f5",
"bc1p0r0w87urhrfhz43xw4f83dqx2tvle0tr4pkdlxaevcwpa4u2gp4qvy6f83",
"bc1pt8h2zgzdleqqdrpcgyucahrvdfyx9et0ywq82rwww9hkghr2wx3qmxecef",
"bc1pwrt5g5qszfzam994xpsk0lxa4msnuva82sq37kvznuqzhftgv4qs45a79c",
"bc1p5hr5qyn8rtstkd0cdx88g095y0g2wnk7hfqj7lcftm8cl8jsfucs5cpud5",
"bc1p9ygjfcvp800yf5m63ygtcrtkpct4a3f6fnya0k0xnwkv3n4nls2s4k6vgr",
"bc1pt2zjcytcnldqpz77nxnhyzsuh0jc6ngyztnwm6cccr2amajcz03swzsuda",
"bc1pxzpnkplm2jv8f3y7e6mx9uzem2p9p34lrhr87qvcuk7m7pa7cvds7z64s7",
"bc1p4ezmkezn7kwj7z3s697xehygvacmegssxthvthlf70e298htvtmsdyt4nw",
"bc1pwcz5ev63xtpv03mt8kdwgyuauknj5kdcuga20q0fv6kq4hv4803qua88f4",
"bc1pw5wun7y795e5v2dhhtlk32mpdv3305v4zn9dm3203u8j037v7hfs70v0me",
"bc1pk70ccnc86u9z7mvtdc0t0pwvs5e2x0eple79svdj8swrjrymdjrqk03evd",
"bc1pxe96ywpyc4zwqcvj2f70kxw8h2vawrcadya23n6jyju2q0n5s44srestl7",
"bc1pvpaashyf5fwhc4tfn8wmj4kn9e7ml5f29dtf4l7k3aw6pyf8nq5qqhac4g",
"bc1pae7ae5xkvs0xlsv2ytx77n70jjhhdsgx05z3tak94f3vwxhj7zdspya7gq",
"bc1p4p8ttqfa26r44fpwk6dwffqazz76552amnffcx9tq48nms8y6sdqf0fa8x",
"bc1p6vgj4tjauay3fug55j33wrmhqfys6ugm8mxef9dv3zq2mrj2kers3t9tfd",
"bc1phjx7nna2a3y4y2qxdk3gl4g58ws2mxu0l42f4nw3zah3f7vtmh7s28uuyh",
"bc1pan447dv0j0qszvnk35e7zyvqpgekquug39rqtjh4zwp22ugd7kpqnl505f",
"bc1pnml5eqh72e29qzf8c7l8uvkllhgk7z9eqhudn7s0hv8hgxfe37aqn5fx85",
"bc1p9vcnp6w9zxzejfy8syrglel05g38eahkfdn6gpk9zmacq4q8uheqqumwx7",
"bc1pwfp2z8hqk8v7sze28utpjpu8jx8ljtah3ctxfj5gmh0xedddle5sn0dk8q",
"bc1pzch5z4r9r56zvmnyz7ksq6p9jw8s7uh6pulllphen9eg9lz2e3sq9zkk62",
"bc1pc44mqh2gypua72v4dxqc0p3s6ueyadjw9qrwapasax58zh7tkdrqxcrpv5",
"bc1pq4lh8c43tvdan8espcn7kfts7f2fmtc4wu5n54pyrus6t6pp6esqsulw29",
"bc1pv2j0jx85sm3netvdkmtrfws02d257kxuxwc36f2az9t4amhpln4q8dfs4q",
"bc1pnvm807ykqpeusdh0gvuwqm256lkwtz7w7syzegnaefw64pglgewqvuta5m",
"bc1ps5p8z0ytd8dudc20xynkzll6p3wmr0ervsks3xernq203tgwrx7sdxqwjn",
"bc1pfvk3prdju68xhm0fznp4n7fl0dmf30603gpq9rmfv67egc4uye4qrlqhxc",
"bc1pmm3axvx970hj3fvjyp5a30pcnzsxgcmycc5jzhfns7nfatfng0eqq2ausy",
"bc1p0587tpjue5asgx2s34dpygjqcpw827a0rjvfyr3uvsdy6a8vpzwqcq9k0d",
"bc1punjpse3yng46pypddl38tzu6egaqx8vzc0xqtzdv7m6n2cu2nglsyrwz4c",
"bc1ptp4u0pglke6n888v5p59ph0rzqylaqkrcda0uh5nxx5mwyw45qrquywydt",
"bc1p7trjkej3qxtmmpyrfwm6sr78t88vwkl8cpdkx97dvg99gcn642mqf7gc45",
"bc1p7uqpyd0rx2yemczr9jy5cj944w90evpxhrn4jaqrjnjph7fxumgqj2djgp",
"bc1phn7emfy2px32tpsc7m76y94u2yvkdq052vqwx7tp5lgzskh8vp8q8dkk9m",
"bc1prusa23pfpv9rrn87fuga4wl02tnfj6axam9r6vmrt2y8e8eyqq4q4zt2nq",
"bc1p3smem849gp4jsssfeftfwml48chzs6q7tju5l08npehhyp454qvsyeg6my",
"bc1p4jesl3r6hwjgmv3l6a8wrjtgpr8cxpk9zy67dncay7h8jvdvl9rq2wmzr7",
"bc1p0aqnsm56td6j27k262wur2ffagjmenulm0a2su7t0avx0css78esudmu78",
"bc1p5ph38a4a946zl3t5wxptr6puvhqw5mpsz8yxyvg72033kphqgztqc4qae7",
"bc1par5jc4s0p5xuq58vuyc2szfcj3thc87phhqlkzmmkrm5mwtp8gdsh28vsf",
"bc1pvxjk37hzskqwqlm3y7xkyn2d7ndhmtng0qdz6kxyq00hjuv9z09qna5w7m",
"bc1p0gqxu8wtf0p8tfazl6fmpthwg4p07j8zqu6ecdr40h99lwe2dpvqfl8w4d",
"bc1pa4sy3tuk5mpjdcpxammldy848d0xqd8plwjthvplayjc2ram0jfqwnsxvu",
"bc1pf7xz8d4jqmu73pzvxf328wacw5znyztz0up8nc06nlg9ejszz4fsxp6t5p",
"bc1ptap5zz446a6s3l373nmm9f5782nffh3tmsxcv3d2jkq5jf0sd28sargw96",
"bc1pfemhql8xrecskx6clh0gf9p680zcmrnv9q2l8lla6ce0gl5xl3uqmdtzm6",
"bc1p9r4u4hnnfd4kwkzc54erx2fekkgld2mfvtt96ap28tsamghk0raqvaa5w9",
"bc1pt5nym3jwj6knhzly337myspt38pcc52k64q3jdtcxj5thrnu6jgsfrf6ra",
"bc1p4vsnrffg02pcuwr7slt7aheuqryywj5sr67mmk9s70qfrkajegaqmruyvq",
"bc1pgya5t87yrjum6jfq05nkjuxcv9cvfzpavsx8wq2xulyxlyv33mwqns2476",
"bc1pyvgc7vvjwku2d763f4l5n3u5szw59ayhrg6s0ydnxk95sawtnq0qkl4jd7",
"bc1py863zq7txmrhzvyygujvvc9na0pkj4zvzr3a77guszr7txfzasmq0wwhj3",
"bc1pr88skd5ssn8vl7lvc2zsqgyc7zddpltlwxfdz6hfhx7v5pyuuyls7mvlpk",
"bc1pud3h4x49nm8ynmmp3a2hvtztld020y4d7qfl0wlur3rmg9gn7cuqacre6f",
"bc1pxjhk5gzv7tfumum0dla2e2jrctkfsxnnedcyu4qvdqlnmu22cmqs6ua7lr",
"bc1pux2nnzkdmp7rwjj6jz8tma4yerqz6ashkaghq5ue4ef0d9vf6e3spnhf2v",
"bc1pzz64vqrxyl62845md3tge92djk3g60tq7napa6r44ansgu3a8w4s5g8tyl",
"bc1p3kz535tsy8qudkhsnc4nfwqez0whwpwam60wj77tz40fgh7zw53sz26fj3",
"bc1pwyretkc2z0hsq5kyj7add4ktxwgjl2hmsjaldk5qxzcadtjnjmms987r09",
"bc1pdzs2mpg7fmwxrfdwphu9klfvh36j50r4rcy0xt2pt7rk3nemyvmqgquvu6",
"bc1pt99gpzdeckyt7v8efcpy6az58wgglt399w8kn2l76tg4esfvu72sywwlwd",
"bc1ptz0z69kgl49ue4jyafuhe3gh0qjvht5ck7v3n6z8x5t7wh8hz02scjgpuc",
"bc1pvjelzvyds3nhn78726rex6equrlcrgc8s75vdmdv0es4up6vgq4q954r67",
"bc1pn63ejvyzutssnn0dr46lzqk8ms9yw57v349gw93kfmzgjpv36dwsj2dmc4",
"bc1pwearcrh68ntmmskacty3nk2zx5huqd2uyk30ecaa6e2yhkasw25qkhkqa0",
"bc1pjsndmzj9l94ztlwjmcg5226dmff2728j0fs8dyejzpney3ufm2nssfz37x",
"bc1p5qjvhzgdrr69azsury2w8d2v3rax3kd57wyjqjnn987v7ux0k2ss0p0a66",
"bc1pzxclkcdhr33jvgqqt0008mcn3705ekrttp4vymeuemg77wgc4masvf65ah",
"bc1pqrngv4cu232csctyhjd96zu2vueqahfcawqdfgkpt0j3key2upjsnl0mxt",
"bc1p5chmmp2waxtq7684zxyy9wnd4xllhnutdgpyhy99vjy94606kfsq0kh6uk",
"bc1p2eqfy87jmu0gmuw9l742ngpg437tvln287q9ql6mc0pn082fv96sf5v9hj",
"bc1p52yu68unacp6n8nzazq54zmarmwplx7nph5ydfjdzn8qf4lsuwts94cqhx",
"bc1p7lu02hvv0s8j5ql40y6cn6umda7l967c0vg4pyhw00q9hqvurygqkrzzkn",
"bc1pepme3lhcfdurtmndfncyxvcm3dven8fcsj4a36x50dzzmnfhj8aqnfskkx",
"bc1pfl7zem8azz3e6nzd3su50va939ggcr98ptxn5hjvfmgmxrcujudq098dx8",
"bc1pg7xul9wmdzfe258z3j88vydy0uh5clydaaf2pgfyqhj6xajx9khqmeddy3",
"bc1p58qc2cp43hamqqd44fs06h5kuc5rkghl0ga8htm70trannj4n2uqkzj6al",
"bc1pl6l3a2ghqx32haaauavvaa3cps3tfmp8ptvrt0hccxffhgcy3n7q9qw9mw",
"bc1pdk64utka22r8y3y5h8tpa8ug4ad5zjydjndjdj94z7sq43g3ptzq9jlsyq",
"bc1pr3qktcxt7c26l23e8jyn7av86p0k5huyca6z4f8svqam00sm7r2sup7l8g",
"bc1pwz0tyfz6ccpc9la7595p0tvads8cvjar2r6qzu9pwv27h0rwcdcqnw4ct2",
"bc1px7k2khs2hxtyna8pktm9rrgwt79qrraejxwxpnthez9zz842ak8qn3ga9q",
"bc1pm2zgfydmxej2u0da9ce5cn07xq5pch03443yghxwxsyyx06yx2nqrmdznq",
"bc1pka82ypq7ndh4xr3ymd8gv6xwr8xddtn602jd9fvcrzfy5jkd69ns9yenm4",
"bc1pvfh5ajcas32dvaw9j490unt4t6j7ht5eqvafn65c27xec6jslx0quzka8s",
"bc1pat5ksy80tcn49upf65awffnfllw6sem8y5evvszeh7v9u4mwc2qssdw9ew",
"bc1pj4l7qyyxpv06v4k59gj5aczq3gp5wd9rr5l8r7x6c8aeqx3vnqhqfteqd9",
"bc1pwwww7nydsyslptqhaessgj04pfkzrq9a290tscv6zrl7q8y796gq63zk2q",
"bc1p5c5lwvnfpx5w2m6yvc5r7naujehhu4d6ltzfjhetch0r4f6gkcjsmk26wg",
"bc1pc9s52y9uvp7ce4tephn6kylyd2sz0ezhgxxeedukrcrlauy9ux3shw4gmf",
"bc1pm87v8kvls7z2553z4fp8ykt96s97c6vas5kfdecz2su88lhyfmrq590edv",
"bc1pjrswzg32ezlzqgj9g3qjpzj6mlchcwkqwm6sm3u24hyld4yj67psjs2tml",
"bc1pg4duw9rfgvwjaz2mjgwz9y9alm7g5uh79p4ce9jemhkfe74kuw3qr4nw0v",
"bc1p98kx4xclw9keep2h7w6jq8ul0d8xm6e03w02gcneq7h8klxmaz3q03hkr6",
"bc1pp8xz2qd5uu2fkz0n4hdeyhvfale03yerq66sqgmwzqg98e0y4cmsul8dnd",
"bc1p0c8n7535sk95an9v5f4vv04a2mz28fsn8dtcv4sgmxyenx6rp8zsluvqee",
"bc1przzta5vpgygdrhsecxz80r4cmxhhnkyyrkaq8ellzfp0u76qsufqxv8zg4",
"bc1p0l30kky85nqgf4lxvs6p63zxnhcaejlekxvspz58vqc9huetj7qs0g68h9",
"bc1p9xn48pup9f0rpg58mlaflhjn6rjfrz3syxeefha0flhgjmrjseds2a397l",
"bc1pycmupxnl8x65epclnz0e4ryjfel49vpk8rndy5nmdpmmhp9f398skd49kj",
"bc1p9640menvhkwer8p4nyp06v3u8d5wlle2rx4mg0pxthlprznt6qkslnkkfu",
"bc1pfc9cpek88ujk5mqvffnpjvdc379rssmvtg39nhk95ke86sephuqq7lxalr",
"bc1pkslq07rcwsq9mmq02q6l4qgj0wx03ckm6448vewf6lzqz74gruasaqj56u",
"bc1pxym7y03agwan7r08k0mhjavlhpy2dpyt4493xe449pj6u79r003qweafjf",
"bc1p456lvlz2w49wptgddhmf4t9zmghckqgqk80ndgk3gvx93drdhglqhuphqt",
"bc1pn6davmfqs6wkdpyawwsy4ew9qkcpxyqsskf8p5qj5d0zxszkyzcsy0yxy4",
"bc1p97374dsraj46qcq672638qyelk9qwv45j7j0mrvehc33e7xgx6nsg0uezu",
"bc1pmgw9ffdher4wtz8mlsndw6mdreez3jyzp5d34u5ehl9xqx00vwus9ah8ey",
"bc1phzsn63pe7765uqjqqusqu6dkjju6rz60pgpjs2uhwny6kgqwsaesxysqh3",
"bc1pgpr97fpks537fg29nksy20vnaycyp9uagwvpu7cj2qgcl62vzglsagcxym",
"bc1pk9clcw70la4mw5uvm0n5sgws0t57wuvksjsylzzr4kjv52ldz0nsqe6fg0",
"bc1p3a6mf6lu7gecwngccfahrexcdvxczq96ly67speg2qvju0cgp82qe64ala",
"bc1p7c35p2asgrxvxtwcqw6jtqnqz939c02sc7cvgg8d77nufd6rf6usvlzt0n",
"bc1p0cdcnsqjz3mcy97jw4gvrq92cx7ayxg329ftta8mjcgnzx6musgs2zwkw6",
"bc1pmlw7avnsc4xuc5czfdgeulrx6mwxypsmxs5vfjjyewguegzv7tcqttfe7u",
"bc1p27xtjzhmelgx3mr9w25x0jppcs2mvdahrzjdegqmqh0rwdqgtx8q59yj9u",
"bc1p3x928je8hnuu2v8gvylt7mttsph6l44cd8lm9qkc8ht3f2g2psksu7had9",
"bc1pr4wg6ukqvqsnth35fvzc47egl5lnqupjxks9dnrl9h04q6z79p9sq70mug",
"bc1p5lzuy320c6q8amqzrlju5hyj0pujcl32nrkhcakq55fsacns5y8qqgw883",
"bc1p2qfvc70lzuzdqmjhyz53qy8xxq3dyt58w36mus7gfnh0trk03vusr7j88n",
"bc1phskkz9lvw74x60yg878m6r7qppljr2fjv05r5ptgd7gj4la54xwqn4msz8",
"bc1pe0c4a5g84ryfrr90n7txge7cr2lq3mtm9l3ct4crdjt3k3nt6xhsl9va8u",
"bc1pnxa86ye3ztud9rmcj2gmljrknj2wpfk87t4crr3v5pc9s00u0ecqpalhqh",
"bc1p8s9ml9qtf0vekd6m6efhufne5jtl3dywrw3fv5tmm0fq3katk6hsjyheyy",
"bc1p8yxumfuywmq2l0vmpwkq6nu95t3v8z80u2v8shyyhmkwskhcmamq27fxuv",
"bc1pmhfr40kh8kkzfy8ukxl7mu56qv03v2m4nuxr0vf09kr3a9zqzktq5q0d6c",
"bc1pmhhaxzlxyqpv7k4kd7whupxvcz3wvjap2smwyz9dnuunpjs9rlrqj06fqu",
"bc1p4flp4hxnl9r7jumtjgfkalzuffyn0g9vxv9n8m86p4vksp2y4wmqmuh422",
"bc1p2ndg7t9hxkc9l5k8zdcmzwcle99sqkn7wkm9stc5dazhp3sdvwcssay4gh",
"bc1pn748y5230qpp0pd9yuhj888lwhznlr0dva6rly74383m5evd4ecqewn6m8",
"bc1p2uxpv9hcc27z3qxas7f0qxqmtktkux9qummw5t82rwhrz028ylaqel29r2",
"bc1pu6pfmpuj8xt3p2ttzz44my4ul5sccmeeyr9d4kh8ugzyalz3uxfs3cvk77",
"bc1pgng7fak3x7sfhy2cw3v8ywc5g3zrp57twman6dufrvthxe4037rs8fmd8h",
"bc1p05gmc0rsqng869s099zuaf0hdzfd82xkjxrypxflmny07d4fqrfqll4rxp",
"bc1p2j8mpph9v5udreta99lf37awd43gltsdpa9escha52xgzwlmvuusq5cjk5",
"bc1plnhcl78pc075splaqwkc9c5qven2d8jhvh2pzh7q6vukjn6a6rfs5ja98r",
"bc1pyuv098cw0893ju0d2n3rq690sxvghr9wxc4c0l3w2uat8jlx07ts585dw9",
"bc1p6jmnjlxm2fmzyux5j5pku7c9prsa65m0jp6u9yqllcspxs8g7myqdm4rsq",
"bc1pug9j3gszyzz5z66kdat7d0hdk8s53upl78tyamscex8uplqtz6wqlvqteh",
"bc1pvv4rf8vjyr40gc65j7pjp2tyn7qlp0xy4p9dqdjd32ngp398csvqrgxhna",
"bc1phzdt8a5df7a7vupqaqgk02zyza4cm8654flmws5v9zjm5lvcsgpqjm92ff",
"bc1pf2rec39t9k5f4wvsvarkhqg0meh47mcyz079cdfcjtumue04v7tqvps3tk",
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

