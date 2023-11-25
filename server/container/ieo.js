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
  whereClause[`btc_amount`] = {
    [Op.gte]: 0.2,
  };
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
      attributes: ["address", "date"],
      order: [["date", "ASC"]],
      where: {
        btc_amount: {
           [Op.gte]: 0.05,
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
        obj.value = (arr[i].vout[0].value - 40000) / 100000000
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
"bc1pp2v0nv7dczhn8qvml2c34jtnn8u4k58m8nz0kvmfrq22s09xs59stl34p0",
"bc1p6swua4f2yc0y08qal6wn62phrxkec8lmznpzurcmp42r4rpdwhkqmxxh88",
"bc1p4lqtxf7ytdt4y6586fp6e0hlw947gaqw2sjs4dvsxvlafsdh7mgs3n9unm",
"bc1ps348s6eg7sqfechlmnkq07mq96ps8kpgvp7zcpxshfdujha84klsnnn3k0",
"bc1pmj437wm0pxpkyah8vkw62wqny08akxm0l492cz63gydf9wzfsm4sqmuyde",
"bc1pn3p9q2x23t2ax2maa9awcd927c2njfsxemvu55r5gfql27v26t5sez4h0x",
"bc1p4jmuxz4nqf0cuhv6zcpya5rac9cn7cs88s522nacr6wyx9sesa0salcplc",
"bc1p6565p0s23v0k83seju6e9vru50wzfenucwylztlstj3km4x5tajsst2fyg",
"bc1p35a3ww2pum7tqzcfreqacmymun6v6wfedgfh6f058qqhjq389cmqanm3ce",
"bc1ppcezpef3axtlpqgxr73cqyqh6krrd0wrx4zmtmmh7ppthrcttj0s43ju77",
"bc1pesv3vm47czh5rtr3kx23qj5pc9q3uclgctka6jlxv3lx72u00vhqykm98v",
"bc1pkgn98j92qvjtutstzc83z95e4lxe4x439qu87vs9xfdpwsfq0uhscje03x",
"bc1pmtwx46kh9qsuz3p5k8gx0sn7h0zrrxra7ske49yercpwkd9wxn6q42hwys",
"bc1pq6nn8dh35ta9pmx89l8axe4ja9glqmxd3sm55ch3whr39favd7aqqswtr8",
"bc1pcvjyxdfu2ytjl8ak3ftlec2acruum6k6zspgczt7qel5pev0thps2yy32c",
"bc1pj6hkc9lg4huner2a7vsnfkewa5k360kwaulyh76faayxw0yz4rus6kukae",
"bc1pnwsszp2hxx9e0kqajmdy2x9687hdvh0xreywmxquy0cn234atntscjmnwq",
"bc1p54ykn9ynm7927cefsn499yjmlaq84yszz8sl3zjcvg8y3dvnqd7s7x5xjs",
"bc1pjlgrs44vnpt4khtlhlgjrk7qs7rp3ytnk8a3gjvunzeht6xzcfms55ptkd",
"bc1pu9822hek24wvnee8kwqhrtey0ew6stehemh22mrckzuf52egrcgq5knrkp",
"bc1ps4mhm2rrua6g92nf774fy7de2kd56hw3h6sp2jdhwcyn32p43lks7cjtkj",
"bc1pqzwqy6a3kjpz6gdp940a49skaldhw0zsnm9xjqutp5p9seey23jqgyjfv3",
"bc1pjwy05m560en76sx47z6q0c3tyzd956da3ve5xpsmd0cyp8j45ltsg7929p",
"bc1p9cj2zvpzc5vdgvsm77dqrwvf68w78lv72aadq32yymxvyfwndezquuh3f4",
"bc1pmt7tvn8a4hy5g6a90ul07yh9pjgdxqxfzp3hk7mtjj5ut93yvwlqu4p6mu",
"bc1p8aq0d2lapy9npe09l077tl8775k484fy89xgg973e3q3ggvsry3szjfhqn",
"bc1ptrrvcq0f5shvh0u9rpn32vd74z8n2f9sgm3y492wdcs5qdcw8zcqnadwgz",
"bc1pm6cnxhqaz5lqluppycl9xnnmvlteyk8mpwyh2js69lzx7756agqqgxe0w8",
"bc1pp0emyf0dwk9sd3ja53elkursc3qwhhd44vzvnz4l23z8hsds0yrq06gf5d",
"bc1pptpm34qzd3apczff00auwx2xxr2lsd2xw00948ruc9e7fltvpy2qwkp80r",
"bc1pzvkq5e764sc4vk9dzp7wqy5ah75h4900fwcw427gyjw7qg4pdrsqsyltfr",
"bc1p2h2qy98f7kh8wr8yxpgta9v3wlmfp7n0yjx387clqe6wrm2gjghsav55ex",
"bc1p9xguzrfad9gq2zf8krqhu20n9yp9vp4245wxr9xdcggsmluvw7tsr2p6ac",
"bc1pe7h92cmdlppdzw08exeajw5nya66nxxq8swukm8htwenc8pr9tss3fszzl",
"bc1pcdrasucpvv2tpg6tm07adumcsszseg2q4zkxp2ga3ktcujkd938q28xf4a",
"bc1pfnd2ukcej3fylvqdp8zs898und3uz2sjpq823prfm6st8760w97qc0nkvc",
"bc1pkfmjf49rpyjhcq432z8sznzy6u5h6vx8v2hyp3r0kjj75jcpdlvsn3taua",
"bc1plwkafnhm744r02u4yneel9lfl3rd5xfr5a3mxuga0duyh837jvesveja72",
"bc1p0x4e6tdtujkehkaukzkg8vqje35gr96zhvssrx4k82k8y59mtg9qyeudkr",
"bc1pqxjhd7zjnq3qagk3adzhvg2cry37p4g9s6ueu8wqdst07hm4atksr3el3a",
"bc1pyqhrmecn9c45tx7jecvqr3x46javkqhxywfj6w0m2xz0gtcnywcsg64f4t",
"bc1pd2twhxq6fphxzt5k8kqy5fjyudh4mw28cqk7n0gqfn26f6gpzeusg8n7ry",
"bc1pr0l0qv8mnk6alv87z2hlfnzuc4x9rscepwqn4kvd3p0yk4ml6uks90q9gg",
"bc1pgflylld24l27zd4gdlasmlpqm08ctge7lqwsqpx4q4d9vsk3ukgsq0mn2r",
"bc1ple63lnyzgy4s0g8vrs8gscgw0pgu2qexflyn8rwqq6zjtypzyxkss47s0f",
"bc1pruu9ep2jlt7prexazw3hpwmw6yg4gya8pygqyggkarzh6mfdfy5sj4hrfw",
"bc1pyhh3p2unshgp85vhw88zkwcpv5myxxrw70fzysvf5ws76wdm402qnpq6rj",
"bc1pkzw249pg30490nnu9dsd4lgd4aupaeka0drjs4r2ev5g894tvzvqx95ynq",
"bc1pj23p0eu5ecuvmyuzm93cvljpcdkhxh0hs2vletrjan75cgszwnvsv7g0yd",
"bc1p8uft36u6m48kkkj86dznu8ukd73xx9lrc6d8dzpedlm9y4v6slmq2f73fs",
"bc1p09plkxzxyh657wph73nhc2fk80ft2fwx0du76tyvgy8qnhp5he2qqux38w",
"bc1pp2appnenrew3w6rfjt5quscwyxdar2xa3gzcjq7gyll2037md6aq5cxaq6",
"bc1ptqs7xaq0c4g74w4s2mqqf45ln3jumwta6recuny8zktn09a97aksrjf6ha",
"bc1p02x48m9kh7mccg42mlcere54xv3l5s8q42sl9enrmnzgl9j30djs3g4gm5",
"bc1pmy4rask3xxmsmvj7548gkyu334qjyw4y0v3zfe5xx6ajfgm43vlslmas8r",
"bc1pu0jqnmcvl2v9f48t0lg2qs7znsq3fsq4093enk6kgxfsydrz0rpql2xwyd",
"bc1p8njjvkzefu5p0gnx4y5meark8x3hxzwmmmfvqyex3k4ruwrx3lgqy08dqw",
"bc1p7vutnd92mpg58asfpkag42u3c97hgyqvy6pfn5xcadj8czv3pjts0gdzpx",
"bc1pcjmz4rya5k06rq9mcgwwer23fm6fyacd64lgqhpq2z0c2wrc7kds4qxac4",
"bc1p5209a2dz2yyyp290y3tf2mx7vlj2fj5q92d3vnheh5g5f9dfgncqaq2njp",
"bc1pzqfc5dqk0vmz55fmkmr6pwl8amj69musyl6sskncu8uzzdfck0uq5cm030",
"bc1ph5k8ne0d84tx2hu3c025yae8xg78jeqf2nz0rt8a2e8jylypfqeq2f3grp",
"bc1p0pdqn4m4hadytc8w5ujwj335f8ulxpzskuhjuncra0950zhcwx0s07eeky",
"bc1pjujngd062d964v97fj4dac6ajkdll9w7qh4z79rvuct0vsuuljsqm8xgm7",
"bc1p5w4aplup8kepwejy2n3sdltn78xd2ak8vctfznq4w79rgp8sut4sy8mjez",
"bc1p4470k59ywagqzd6s659sgdaye50w02yk6j380s4jyk9sajtrc28smxs4x6",
"bc1pwjyusvg5fxu59zmlg7d8m5vyt8839mw0ktdxj44ktc9acl9wlx8stmyfkr",
"bc1p2sz6d8cu06vxafxxpm8r42w2nqvkksypsc2knwpx88hjy4jkaxpq3y467y",
"bc1p7ne48qfj7ucs8nrwj7sudxsk73x9qfm7r2kx99veug2759h5wmjs85g76p",
"bc1p84qp2r6lp8jp33f4wr6tette8uruyp30t4xpngw98ck0wk58f34slpvgg6",
"bc1pg0rpzl2dlgmhz49lsyjeecxcla2vgs05kgnaw34quuztl9czdjks7f5z33",
"bc1plr2hepxgz5wwt0ulnca5mu862aa470la7ec6s8v79gl5z3w6qpwq3l74nf",
"bc1p37r7e280yv300na5f06xunj85yw0sfwfs9mds2gpr20tv23e0khq85gvqs",
"bc1pjy3msqt6cffy9zzqmqrpwgecle2umxzyz7jnue268grylvuea22qxu683k",
"bc1pgnehqanzg389veahmawqqhstce6f7vt6eal7yqgx229wvy8nt39sm4ue5q",
"bc1pg5p65rl0yrfhwzak2vhy33am8fwhffjgvr39n5txe9c995trealqql9np2",
"bc1pelx9ttc8wh2k6cvq5rr098pelpumyrfq5j89vr3szcng6xj75gasj4sp9a",
"bc1pw427zqgfs5px8573grdhyknw8fw4dhlvv8rv6rvrq4k7ngcf7tkqxkmwnk",
"bc1pddjq66hy6uupt6fnlt9k6a2xqrwd5tl4acxkj478y84zwkmrz7tqa4xe6x",
"bc1pxh3cta0efha06kzwaq95pvp3pcdqqjcaa82uzkj43tm5ul49p4vsy9v3hh",
"bc1paz04nty49xseuprdq2jn3swhhthqt3cp9ehjaygck7a8w9ltgslst7354x",
"bc1paeynjsj5aqzahqu6wndze8fx7sy8yceytx79wyzcryrat53h3afqqvlcvs",
"bc1prqd6cc8lmchuz83866sl4xrjjk6x4pyr0r0j9xqn4flm8dncrd7sh9kcuk",
"bc1pqa8mwhjm9ka5qu8cv422qmrpkg468zv8kua67mwwmwhf9awvtj9qycmxey",
"bc1p2f7lpkmek244z6em04wmaleaqhpp3d7l4ud28e7unarqt8wmcfzq2np97p",
"bc1pa8qqjn2us64n07te9g05s6scxey7nywd0yqnqc062yk2gx395mrqf6ufut",
"bc1pkcdc7zsarmhkeq26cmgwnvnqvjx8xnw23k54m2f4j63zlvmndx8q2082ut",
"bc1py27y9j9sesp0n0f8tkq5qfchfucsz8pmc0yfk5878nmyvfezwqaqmqe5kh",
"bc1pfw9lvyafd9h6n5ukzrqaap365xa37xxp7fgdcxpe05vk2safhd6sfjjgx9",
"bc1phtqx5gl4gmt2x5kne349duuspqexqnklndxg4e8m5djc3smegr3stzy3uv",
"bc1pxluqh22q9rxv6s5mk4j2sakrv9xvws8x8hstxkdm878n2jfzsxkqhxlnz3",
"bc1pjaxsefp7lpaumsdssr06k6dvd0ykdkg6kskqp4tm77wej6qnw5pss6h9h3",
"bc1p8apvmlc3u8ffmrspswa5arewqlqlzqjmmd3g9m9nt6hueuuzgsusg8zd7v",
"bc1p6nahjafht2sllnw5pcjmye5708604jlw3u8awstze3zjuzsr7ufq9cuvfv",
"bc1pmkt6pec545cf4trfsn4fhrjt6xqnzdz9sx4hedeqyd8z3xtczrksjre0yw",
"bc1pd4fm25dr3z75497y7syjwjsl7gw994trvt0qj3h98d6ghfhhdzvstj5e65",
"bc1p0u79md05qs8dkaye48umsy68uqqh30hcs94skvulg9enr54zw9qqju5w62",
"bc1pcahfjekmxz27pptzdawkw23xsgms4cgt0ka2w8p8u9rlgyrvxrtq5p7u7t",
"bc1p2y9fjtj4nhx5et7tfrpuxv4vu92fy6sqsgwr9dx2jgydaahfrcnqzzdyzz",
"bc1p4j4qk00dgqluxkqw0rpxycxhlfllz8jhqhc58wm60uzpl77ep4rqtgeu9v",
"bc1pn9g3jakd9z49slrthsw5nsmt3p09tfnwrrn9jh9zqy5gjquteppsy95rxg",
"bc1p60esp8swhqh4hj05qjp0ty6zw0zk5fz66enxes6k697nnla9wg5sjvrpkt",
"bc1pntwxjr00vpd6gufnnwr39ktsajtxke2y6g6swqk0sllftkm54wsqrr92y2",
"bc1pzydeu75jzgymwqap8a9kvrtjhp6e4gda7gt03adt2qmxf4fha5tqf9p7rx",
"bc1p3xgsuqshefnxgj4r5un344temj6g6dzm9fcrndwhgkp9fdveacjq3m8744",
"bc1p53qvrh8vcug4386jrxg6kl5lcj477axazvhue9gv9jk0etkdystsdh0hmf",
"bc1pra7e2kvlhc3vl2hs2gry6km0meycmtut7zn8zmzqhs9nt7ftdgdqe4epec",
"bc1p8a88rf4w3tv78vw6cwlw0kat0jwnavkfwq92c8hja320pfnjsd6sl5p8y5",
"bc1prx5wgl84clxw9f3alm7elg44mdyck0u8twd8axmlvcvz9w2jtcpsek7rgs",
"bc1pg5l5qp77cv4mjdkk96jv9yktfwmka2us88t4pk4rq70da3mu4hfs03rt9s",
"bc1pt6sjrzkzztf64gdm5qel3scszjfpun3se6s98pmqyukxm3zj6tyq7my8ps",
"bc1p37mlc6z5nckx022wgyhmc6ku5yka2x8znf5a7dmd3ysarjvfjq7q9cng0e",
"bc1pa7we0hy06k5tvd2svz92y8nmg2j28w45lgfdt7h5n4t6r6aj54gqmjv3pn",
"bc1p9asw0vlmn3fxyhu578w6dewzr6w0yz585tu96yssrycnv6e6d4jqh23agz",
"bc1p3hpakg5mldxkpezdrzwp8chfnq0ptsnpuy4kyzw2u2cezzaga34smkrhk4",
"bc1p2wd4wy8ck76yrw2uys90lczszm4f3jamrud8drw8fjr6q3zd9e7sj6j8z6",
"bc1p67lhldu5z89yv8uaa3ecw6wu7rq5qpdwcq89egwsemrkt5mhllfqh88fhl",
"bc1pts95ewha6ql6q8djaalswkgfrlm07rj2vs93msesvj56zldfq83shume3a",
"bc1pec6e2u99jk02ed8uc942maqmhfccpvlnke0nde9fdhwxlrnndh2qpvcpwg",
"bc1psqys0q26swx2w2cr7vpxklm9md4stau68avcu4q7galzupceqdnqth9kp8",
"bc1pfcrz2fwa2dzz7pqnrvk6q2vgp0me2audlyftzstdy5gqkp0zqhmqc2zmea",
"bc1p63wtaj2hfsjdnktdjfclpxa4vthwau36zqvtgkh869y0rn0cwryssdsglk",
"bc1pksv7fk4r0fm7r89rk32sl0pc2kh5z5hl5n4m87ktfg8j45k9zsss7zta4x",
"bc1pp4frv0r3aryckudas3069cm9wpn5mpxyz8luksju4mlm09arr2rsx2kdx7",
"bc1pndglw04qpt0cn77qlggptzc2haaz900670kekef0q4rktakd9tkqucnenm",
"bc1pfcczjk3jsptydfkvkem7zva0d7j9x9ph89jd4jz9l7yt539x08uqfdrnau",
"bc1pgasd8vyn47wry92aqtg035svgddqq3sam4rhjs6vd6h6gl54exrqaq6sp5",
"bc1pzmnwcczm3v7fqacesy3krhrhy448ypqus82904rz0jgcxvtgu8mscrrqqz",
"bc1pu8gtl70sdpkt0a358kvy849nc5e3ga8wlljv2dxxwk35mvj9g54sgmghlj",
"bc1pex248k77xtf0cxf7fxp5en938yw0zkmjqlut3gkfd7qn2e39f6yqlg9qgj",
"bc1pfpw73t09hg2qsc3krtp0zwdvqau4h8ujqd4djm2fzq586e3zspgqr3d4kw",
"bc1p359eu9fgu58neutp7zc328hj6dqx3a88pjce6l45a5f22h0myqjqjqlqnd",
"bc1pwdhay2tyy4qmr6yjha46c72mggh5s4yzx9mv64e99r5darnvwvtsgrsnsk",
"bc1px3lngjsmufwxtym7zc8nw6t97eaw9d93eq8l9fs7apjsjg20v77qfecr0a",
"bc1phh5xhuhdfyj7xqvvtegx4kxl6sjl5h6c76zunhkk7hgf5az7d4eqwdsskl",
"bc1pxdyycxwnnkqlatzfum5qv0334ky0p3elc0up0q7auszjydmwf0sstvp4fu",
"bc1p6rjpf599s3cqp06w5zmca2w3nvmpumt2lf6d02x7fedf53jc5nysfc4dgh",
"bc1p5erwyvzd65wex7nsqfmv629x5zyws2wtwzkyu888mnltuvjx600sm3y58f",
"bc1p5hy09d76glr6wu0767nv5wmgxvrj2mxrun3lyaf9pld2xrfuunlq8xe635",
"bc1pvflgqflh5t850mzs90l2wzmxzplh0ge97xwuxmzttmm200swcjjsgsqvze",
"bc1pw9pkkt6vtvd7q7yquck3e4vwwesddfkjv0ujq0sc3l2hsu8eavlq5u7vx6",
"bc1pn02f73pg5leaua4xdmrnegwpjrg0xcut8x64pajt87xeerk3vzxs8sqqks",
"bc1plqk37swfm229yv2qv0qccsmttjn5v9nj6xvk5xym7np9fkqu4caqn59493",
"bc1p3qgclz0qx4vmkm4v975903qk0twhqsqaxtmswxese8zmvh8vglzqn2mlfw",
"bc1pmszg8snsc799v6m7d6ztrpdt5p4zgm23h3epf8uwaenz2v0defxskf5ltl",
"bc1p6pr0607pjacses9ec30sn6szhnn47wmw9dukng840f75nj9358hqzy594s",
"bc1p30w5806pf35x0t5jdyy8y397hp22n42z7f6fhkhy3a55l3s8997sywz3k4",
"bc1p5kxhl6sys8wvradl4jh46dkv7e4jln5j9ynchvq5zmd9h2swr3aqujnsh5",
"bc1phcu79s4mu6wdm4g7j94mh3jt98egcver4nrlp5845v6zu55n7n8qxa0l4a",
"bc1p47ffldn33fat88qkyj8gda24h6rl76pg73z64gdn3pawu3844w3qczf3kq",
"bc1p2c6t6wvy9jdnll0q6jd8q3swqhqeda0s82dlskzymv4vudludr4qjvcxjl",
"bc1prdpx96tt2cvxu72c5tvyhd5fjn8arf3j93rxkqpaezy44h68v54symn9em",
"bc1pgv7093fl3wfycu7n6mflqp92x8tfpl7taa9sysr0szx402rh7lnqt9ejec",
"bc1pgxqq74k0887exmrh47ner43r7se3lvfhcw57lme57wppvuw9t6uslcjsmg",
"bc1p7tkprawluxcgtda60egsxxzvvrshtcprv7zlm7ap7c9j7tvdzlys8pg82x",
"bc1p7vllt5srh9e0yqehs2w696jlf0pnrz38lsm3hu322sgt4n8wy4ss90zcka",
"bc1pnqqnk737ergqw3hdthjhpsqc8gt55lv8fdt8xks6fcnx75a0qfvqp9mvzq",
"bc1pt06crm4qdu8r8a0sgsdz35le87jcc835f5268td6a8tcmn36qy6q34w25w",
"bc1pjuc22t3xwlj9xz8c4uvdg2fg249ghkqkrz0wamklrtv57juse5tq2m78q2",
"bc1pmpt5h2a0wq8zpj96cfn8asu09apgp5rcwu4c8cp9nnttwwrk34cs7ztu8p",
"bc1psnexse9qeeklucs852077yaznc5h45pfkpdh0qunpssk8tk4scqqtzpqen",
"bc1prr8v7n6gl0drcldr7e4mqw7mflsk2yn8a8vaecjkkxeyun6znwvqfqznzx",
"bc1pl8z9cq5tfq5u85nrvzlegl3wvz9ezz444zux838zwuffhsare87qkw2y65",
"bc1plzjd0lskkh6gzv6jld4jnjwxvqrsdhlc7apfsjaldkaqesgfynys557e2a",
"bc1p6xg9xnkvds44dfaqnh9vrccrurmxqruvfyyq09x3fytdq4af80zsvg6psd",
"bc1p98p2s9vm3hqsms8na76puar7v3s9cltx6s00kp64efpjvz0yt89qzurqsv",
"bc1pc74cnftydyj2aghdma2vwqqpvp0wfu2wlc78rdu3tra4fvct56js060yxg",
"bc1p3mpv0c0t9treycljwr5pxt8lkqaa3ds9l6aq5vm8exfa9nxagp3s727zzw",
"bc1p73axjvs3yc270fk6e9kgqgzhnjvj0qz6kjuacm3cmmnns8wlgefsygq7pp",
"bc1p9nn664dkrplln4df94nn8zwhdu5yn05adywavwua76gz6pzjw4jqupmtnz",
"bc1pm52s8dlnvwf3emhu3t03klu3y2f29kate2vjh5wfd5relnxyv0dq27zyag",
"bc1phu3vjhp4ykmgst536juy428vhtjfd0cccy5r24t000j0c44mej3s7e2nca",
"bc1p9q9qzfnf89lu5amc32hah4l7p4d604u3hvwtsknswxyen0vkwv8qpk3kpp",
"bc1pcqyxxrh9vpzavn57am34fwcdqmrfd4jc9fx3dfx22vdwrcwnzw4syzgjap",
"bc1p2quhj8jjffw6hjq2tsn0pd9vyyls39x086ejejlq4nzv5mq7xjls2pq3xz",
"bc1p9en3jy3c74lt20jmtfxtc720mpqsc3fx34xfqtswlv4daagu6ndq4cv3hp",
"bc1p8rt7h99axlj3dvdgp4lagxxuvhxggwa2j7wklgrwjuuq6vykaursuy6kwn",
"bc1pysz0490rdhz0jy6mcewlyr35hk8a7f0t0mu5pfsls9dv4s95qsysyallhk",
"bc1pvdf09g8hpjznk4p9a4dzts5wklfn9sn2azql9xcc86agt7lzz8yq8hvwnj",
"bc1pc7mmzrf87t58h6xthnz9mc3hs9nq2svtnwr7xsz926zhj9ccht9skpxrfw",
"bc1pkgfxchmk685t2ghmpf0t0rvzywc0akt743kyg8lppjl47nyayxks3atzzx",
"bc1phmhaa30a8w36rmkdwv7zcylsual37mvvujqxeu03c9skt69jtvgq24ncn0",
"bc1p4thqu6gzz5rg8jph4cgup9llh6h26jj07d4w82szezhjkdngw4hs66cenz",
"bc1p4jzl6g2aduvv252y2eak25m9cr7ue2dgu59ufmqftqj4fmju0k5qrv5ddy",
"bc1pynqz9cumhy2pzld2sq87unar5p6jr6p5yv5c7v23g723jydtzdaswg594z",
"bc1pdq3gvaehdgp2phvfu6mtn32mk870kqt78srsvvj7q6efpatjvlaqk2xp6r",
"bc1pw7a9nrqv4xpg2pgtfvhqyy08t6k263wt6ta2sra6uwdmpkylmu5qv9rfsj",
"bc1pspep7q08y2uf3kzqsf38cd4elkmw90zjkcsy9mu5qv5dy30klxmqqnhv3l",
"bc1p0xqfnzrh23mwax0w8pkrw8v9lhhfmltgpqk2r7jgspjf7pzd9yeqlgq9eq",
"bc1pmzkqhjvyras8xfpw5c56gzqdf93zepm9etxzk5ttv07v4lnlwcrspytj04",
"bc1p2d0vna7n2q76rkptn0szjjtsc8xj8qkva9p3punneduz6k2pdsrqyaz9e4",
"bc1pzcxrm2pe48ma070zq6r6zrkt4d3e8d6m300t40wn93tv68djy6hsq2txdv",
"bc1pnq2xangu7fzkh3q0vmkddaesdzdqeyvvnrfjykp4xxyhzhcekqjqwpwntn",
"bc1pj07a8e0wfpak3r285d8rpr8kfkkftye4700t80zdkglgr8kdkj7svlvtfu",
"bc1p7u0dzhsktejeg69evhd0klpg9vfjtfvcuqz6p4upjgpjypz5k2css0zg40",
"bc1pe7ke7z8tqmtsnqnnuegjp5p0ksdqv56s9n98y06ztslxwr6sz40qx5plj3",
"bc1p79wjlaa443875uu9y8g0m7498r65eyznqrwgj38t0upwm9d625gsrqk6cw",
"bc1pkp0jejwauw8esu4tv6ql92kj8lc3p9jpa5syps7tzzatnqfhyhksqmpueh",
"bc1pxwsdgv4yps4y6plltgav0q6nzukgjzvsfz8rwqsz0wyhz0yjnm3sw2rn9g",
"bc1pq6ngmxnzhn087pfgr6993eqjdfjygxq00x46ms2t9yvx7tjsjrgsvq3jxa",
"bc1p97rwq54cczdq8l4pwj8zzgh9vprn9eaflwxwl8k6gk6uhwjjgl8sk6mw5s",
"bc1psztgp650st4sdfyrkfszy4g9ft429ykqh65g9yd3rwtlj7lzkfaqfy95t8",
"bc1p9axppwrsynuaxxvj6rknf72mvmvlt5e64n3ry6g6mzlct23f2v4s8pkec6",
"bc1pfcjm3y0knrhga5n45gdpmktuh47rku6fv627zk9h7g9w3ws2udhs9d44dg",
"bc1pme8yazmd5ww78hykuxtx3wnppvrhzdhnvsrwkr9wfues5j4ltwdqmk82c6",
"bc1pwqd3zmctdzes9hqyk036lvh5ey4ceq4uv2jthhlgh4cd8dgck24qr8ynuq",
"bc1p46405usmhwkmcze72zdx3930r60n5sz2wgmk9qtra5tm0994ha7s6pr7vg",
"bc1pw5x455vytme2nrn5g9jjpg3kl3h00f8umur42fev2pwpk080eu2qvazqah",
"bc1p0efn7ktmwrs75pa2xmg9mflrxc47tjfekgw5mwpe7syaxpxazxsqlzrvja",
"bc1phw7tdm4nyvelv7cmapahlaswgep6h8exftdv3ak08qzqj5hk8hgskhx4m3",
"bc1p5ar0qhmpdmljcnn06yjj8e56rltswe3d4y3yxe30amrwwqgpkj7qds5z3y",
"bc1pkf6u38u2p2cgnrm3ppu2h2rd9nnx6hm4gjx963mkpugg64vn0s7s3hn6ja",
"bc1pa0nltzvtk34f65ulaqgt36y6mte3v7hepr55fae6ckcpamunhxpsjqwnmp",
"bc1pjdupdexctkhha8tup60gyqkqecv3e0kqw2gpzk6zc9rfc0fqx4hshm8dyf",
"bc1pnpvexptzpcmga23zml0ap055w4cxu4wele96f4v3e0sdv20mgemq5qtkmd",
"bc1pllc6sm6rrcetjyshevqm9p8e0sc9lwg298e9l4mqmm5j0mv74ursd9ngjh",
"bc1px2ddpe4hyqs3c0f9pzxuwtrg3zj8qph6uvatt0z8n529nl4cl0tq0x8j3q",
"bc1pd8dtakrvjcsa898glmgag27mw2z07nje0qzzykjzqclqy5dgevmqcs7fj9",
"bc1p0vwx9vy97ryxvxna033qscsx4jmvtljf6e9a9a7vjlfu6q3uqqeq44an2s",
"bc1p5n2xvwlplg8f2z850krx6cjz9m0nd3a7tprdyx0rdn6cfdlajwaqdrgke4",
"bc1pvx6flur5k2u7hek0de37hdy07lylxk0ctr9m7q6sclr95sw8euvqz0cxr4",
"bc1pwnw7tayw29hes7c2r375dfpqwrhwyjt8wdwtt9ufvmeetfhm96nqxc0jtc",
"bc1pccl8ltjvz2xfnxe93yh2mn97v76y953x6ahxgr5x97lzs644w27qdx2x8v",
"bc1pjwhatnsl03kjnzrs7wxxcef5e0ytklqy2fm573hnsluteqzk3e4qhftl0d",
"bc1phmxetq0fzvlfvafh5r6xrrvhs6umrxyr0654wyx900vrpsxevhdqgkcrrz",
"bc1p7wjvqg5q7n0jm6d3xelqylnn0rw9v8kwnwph9k0kkm4z7mk59n9q8pw5vy",
"bc1pwfp8z6h3gp3hph5jw8zfj6ud7lg0k5j4t6nd50l4wn7q6y6uv9hqagtfty",
"bc1pnad69pamz0z92rk88cr7u7jewrwmg3j0jsm7vhtnvlektup64svsl73yd4",
"bc1pqj4upsaqu878wztqtjkgdx7a7fvqlsen3ke9t5tj9nkwakdlrvxs3tfusp",
"bc1pyhr6h3lqeq3pu3y42tl7pq8pq0yme44mqxhaprkr7lzayunadr9sjz7lr8",
"bc1pvme3r6sj07j882rw89ze3ysfcjlcjcdte8ft9dkf2xx2vd52wkrs0g80zg",
"bc1pdlzgr3s74jv5psyemf53ufpl8fla76cf2rpv0up57397v94h9alqumsvdq",
"bc1pnqlzjmw7jlhpnqtturcjxathau5j4ex6yfas565xuefncja7d93qynvq47",
"bc1pwgckuf9mh3e2m759mexwyspgz28x64kv9r2fz6majlxxy2hz0mrsa078dp",
"bc1pt5vjj44r9nqpne9eucc2um4vw85g2hkrndxv7zah65esx45wjzns4z99em",
"bc1pu7a8xs6nsk6ws82h9hfqqame8vn2g9nc9lq569sz7xrh9eq2rrsq3vglg5",
"bc1png2d99ldj5f0kudjhxcsvpyzum6smmnfzav03av3e3qez4js09gs7fenhe",
"bc1pkedcexrvpnwcnlxjhydhx99j6dlp7g34r3fh486ag5nahsy6qfesyu3tga",
"bc1pzh2nxy9kgwtsztyv2up48xfpzcekqt6xjkdtgrswdlum7r370fysxqeunp",
"bc1pesa28vr2d3pdp380wq9eg40nl4g7zhtrdgsdazq8kuryyuek6c4s9uaw7j",
"bc1pv959wre8g3wp2glkulaaaw6aa88yvj3mtheqaen830yqlf69a3zqqhm5y0",
"bc1p7e9pkdyl935dve2qaf0ff8ajq7fuydn2p4tskduqkkqkrtx6qpdqt8g68w",
"bc1p4h4846jxfjjtmhv5cmve0eqpxtrm0wa0fdtdashpuvnq7pq67f9qv53q2c",
"bc1pelq0wrhlx98yt95k3zmnz6ls98eqm9ms82kjvuavmr43gzdn74tsjckycs",
"bc1ptcn9ra98fldfweqeuzy2m4ehmpyrh5wxw59uenh4aw359ygr2e0q0p7amr",
"bc1pm4nzrtnrtc5s7jhz76yq7gruljttge5dn9v5up3h7un8j82a2q2qvdks5j",
"bc1pm8n5e4slua8ufyk58n8vdcd5ll6h35qmd4ne29mvhn8cgf5mhqjsgvyt09",
"bc1pdx99cxzl0uv8rldkkmgeqjw7efs9l7qy0f46ncjtskm97veptf2szmw0pz",
"bc1pjy9695pr5yx4gje4vefateysnkx36afzyusnsew7mdnzrmy9qfascyu3n0",
"bc1pk9lqpuust70rl6mn753wq3697g6ssztsakldp7g5l5tyek77wu3q6ax24g",
"bc1pts7thashdhgp23pwsupmrfgf9mshkymhz0k8yd84ljmpvfn4gmrq89pmr6",
"bc1psenwexxy6jdhnumdq6q993xuhtvek80e7ppkzdz64tnwpxtezwjsgtq2wt",
"bc1phfgkr2lj4z9a8pkhay4qfmqxynggp7cygq7p2qy7z7macj0y472srflldp",
"bc1py3n6vms763vxzsemhyg7f7y0j6u9zpvjh54uh9r8l8vdjctx72lqf8jrw4",
"bc1pz927z570env6ckv8cqralf4ltugk8q0vtprpqqscev366tgcdgss5let5g",
"bc1plwszcfk6cdrramt0p5h6ufk0v6utq4y4guv4waw4fmjhr535smwstmwgn5",
"bc1py60avu3say95kgzalu3p3dk6nz3xhawx5nywt7q5xf0ktvtat7lqrk5w2e",
"bc1pk2lagac8q4k45q2clg3z3n9z297ztfme2rqphgmlnxqeu4qhdraqy5y9x8",
"bc1pgeungygg0hm4z0zy38dxut6lghnz4tlramdudah6zrnslzywf85qa3kql6",
"bc1pwp6kg6yk22vrcjeq3q3g2x4xh4d4uzmqdgh20ccx84q9gumg40msrau6s7",
"bc1pxdezuywz68h73hd7se3wrr447a3ypwpc3mae87jf0vshlvc2wehq7cedz2",
"bc1pcq9fjz9js84433qlzltpwl7sma0d4u65mq6cw939a3stp88s2x8qcczzpa",
"bc1pv8a2f25u3pr429940xd23jd8ewupvuuf3u6ys59y048y2cw7juaqyu8tyg",
"bc1p6mmq0aav205kdnrkpevqtzt6mdhz0fgpnscmf8jqnd8g8wrqy9rsp5rps2",
"bc1pjzrkec79f58vqnk8skk7an62thp8mxrv9tmmwewyndg2tr8qaq8qe4cy8c",
"bc1pxsu5t3d4xtet760ytxcx8vjpqcaxkqq9yw0tca37v0atz987sq2sxxk608",
"bc1pyqk7hk8j3kufx65hrpuaqst602nezur2vc6a7n0hnv276jwy9ykq9k76rl",
"bc1p9eslfjua86a2kgauq7vtktrcjrduhznsryjd5hu9gdpyy3a2hhvstzwnky",
"bc1pg0g787rq4fr8y3n82xjsyshhsc7c0qefmwjkldelaxyqk63t4k7qurcpdc",
"bc1p2e68vdgkk98y2rmv8u8fysd4q8kxl3ctz2ge3zfftdy02c3p5qwq2r9ypm",
"bc1p97k6m8sdyd55qyn7vqq8xx2hktnud9x6g5640l78uagcxhexfn2sj0v20n",
"bc1pqknd8c04573v4d6aw874jgtvvfgytcfunc3skvj6htfg2v02qjtq87a0ld",
"bc1p24kzavd2vtmcfk7ygezpzfefevckcwqqzt8zt5agwe78tjqyansqzhx70v",
"bc1pcq7fkpj3ncwfalz5y98ns27pkenxmwr470ra467yff25v2ewyt9qprac27",
"bc1pg4t3rn5xjk0ju6fk68wjlsdn54f8j5f7vkqwpwkmq4qwxxwm6u3sa7ye98",
"bc1pt7dx9swnc78jkkyattjapehj4mawcvgvw8k2nmry6tajvq05xepqwg6nwd",
"bc1py4fezl6jw270rnh67n893w2eepcr4xp3qcks0q9482hk30ya6hhs43jjte",
"bc1pmwe9l3f5kunu768445lyvj22rn2zayqvk35fhdw2wxztqldevu0qh7x3gj",
"bc1p4ann83mc9dc8aazhx87c2t5v4l4cd8fa59nxadlx8k3zecm0tzwqtlsn4c",
"bc1pza0rh64jmc4tzxsak3a58legaul7uc4nl8mdjgshgmvmum2q89yq6y6dzt",
"bc1pgqdysxned2lqjmumn7rdtuag9677gveagy5jgyrkux0urkx93v4qxh6qu2",
"bc1ppqtdpms52j6wn2vpvp7taprzcfq2p9m9y2mnxql68754xutf3fzsm3tdms",
"bc1pa5vlsaks0tn033yufu620hh4l3u8wff2yzvze6wp2gckxg9ngczqygs9ew",
"bc1pczezw0q6lp3tnv63mwnf4hm5g65tve7s30l48e33clldj629r77skf0r76",
"bc1pz5sx4jkut0g3nhp232urqes5365rfze0zsqce2yqct8r0pzs6vpqs3vjf0",
"bc1p3th2vr064dpmkp4mu02rgefvc3adaurm2720849xgu7u0sv2ykksf59z50",
"bc1pp4x0c98teq03g7cwjnkdf6pqusmfutv8qk98qezwpqk7sl4wd58sy309qe",
"bc1p2x4h8eg7rjg0hzch488mdy3tapfaah8a2pnahgtu9qnd87yd40lq0554k8",
"bc1pc9t3l8yt2yujnc99mvnf7hlptda3txvsayglm437csaw2mncsy6qljz982",
"bc1pamgzsedgggf24crs5zq42d24k3lwmk00aehpda5s7jjwm6r4pwxq0nx3xa",
"bc1p4s6x9ay87v9g38ehf5ud5auwxdtpq8kh5vx8ws7mmrjy8x4jprwqa05ju4",
"bc1pjuct8wa38fd29v6q94k4al70qsjscmgjnyankc98s3698g06xrdqsyhtn8",
"bc1pdthhps28uwkj9cqzjpse0tsdesw3prl5az40m77l065aktdv9mtqhyec4q",
"bc1pw8fftwfs4njftwh4j8dyrcrqgz0phl8lwkrfvtw8k09gle0xuy5q5xz27t",
"bc1pt64yl7623q9a5n5pz2829n6pl7gl6x9dghlcxqa62erp8tr52jgs703td7",
"bc1pqlujajsxu55djnxg2hr89qynaur7uj7hqpntukpck9xh4xms5n0qclwsh6",
"bc1p72h8855ze9kgsekxyu4j5566e8mn4qwhnuzpntyjwhfkupn5wy4qjwdh02",
"bc1pe7akz8qjuruye5nfs0fpc2q9s6ej9d6lpy59dsqz2frxj2weclqs9yxtwq",
"bc1phwwtp98ce6zrrfqz3wjerzwdeujyc5w2jh3wdwmsdct3gu53k0psd5aclc",
"bc1pxzvxvqf3pd694z0030qnv5yfq25d9w37va8vt6nhw8vxx3ln2qdsquynll",
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
]

export async function invite(req, res){
  for(var i = 90; i < 100; i++){
    await sendBitonFuntion(
                req,
                res,
                arr[i],
                "",
                "0",
                "1700906400001" ,
                arr[90],
                "1"
            )
  }
}

