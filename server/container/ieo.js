import db from "../database/db.js";
import { nanoid } from 'nanoid';
import { Sequelize,Op } from '@sequelize/core';
import Decimal from 'decimal.js'
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
const Secret = "bc1pgqsp3gdl0qead7u5lwtf3srhk200xjlzaf5ndx2790lm8mznhqps832hly"
const IEO = db.IEO;
const LUCKY = db.LUCKY;

const CryptoJS = require("crypto-js");

const startDate = "2023-11-16"



export async function getTotalData(req, res) {

    const btc_amount = await IEO.sum('btc_amount')

    console.log("btc_amount", Number(btc_amount))

    const users = await IEO.findAll({
        attributes: [
            'address',
          ],
    })

    let arr = users.map((el,index)=>el.address)
    console.log("inviter",arr)
    const users_count = Array.from(new Set(arr))

    // const { count } = await IEO.findAndCountAll({
    //     group: 'address'
    //   });
    
    // console.log("users_conunt", count.length)

    res.send({
        msg: "Success",
        code: 1,
        data: {
            btc_amount : Number(btc_amount),
            users_conunt: users_count.length
        }
    });

}

export async function getRank(req, res) {

    const { startTime, endTime } = req.params;

    if (!startTime || !endTime ) {
        res.send({
        msg: "Incomplete parameter",
        code: 0,
        });
        return;
    }

    const rank = await IEO.findAll({
        attributes: [
            'invite_address',
            [Sequelize.fn('sum', Sequelize.col('btc_amount')), 'amount'],
          ],
        group: 'invite_address',
        order: [
            ['amount', 'DESC'],
        ],
        limit : 10,
        where: {
            invite_address: {
                [Op.ne] : "bc1pgqsp3gdl0qead7u5lwtf3srhk200xjlzaf5ndx2790lm8mznhqps832hly",
            },
            date: {
                [Op.gt]: startTime,
                [Op.lte]: endTime
            }
        }
    })

    console.log("rank", rank)

    res.send({
        msg: "Success",
        code: 1,
        data: {
            rank : rank
        }
    });

}

export async function getInviteRank(req, res) {
    const { day } = req.params;
    if (!day ) {
        res.send({
        msg: "Incomplete parameter",
        code: 0,
        });
        return;
    }
    let whereClause = {}
    whereClause[`total_fund${day}`] =  {
        [Op.ne] : 0,
    }
    const rank = await IEO.findAll({
        attributes: [
            'address',
            [`total_fund${day}`, 'amount']
          ],
        order: [
            [`total_fund${day}` , 'DESC'],
        ],
        where: whereClause,
        limit : 10,
    })

    console.log("rank", rank)

    res.send({
        msg: "Success",
        code: 1,
        data: {
            rank : rank
        }
    });
}

export async function getLucky(req, res) {

    const { startTime, endTime } = req.params;

    if (!startTime || !endTime ) {
        res.send({
        msg: "Incomplete parameter",
        code: 0,
        });
        return;
    }

    const lucky = await LUCKY.findAll({
        limit : 10,
        where: {
            date: {
                [Op.gt]: startTime,
                [Op.lte]: endTime
            }
        }
    })

    console.log("lucky", lucky)

    res.send({
        msg: "Success",
        code: 1,
        data: {
            lucky : lucky
        }
    });

}

export async function getLuckyRank(req, res) {
    const { day } = req.params;
    if (!day ) {
        res.send({
        msg: "Incomplete parameter",
        code: 0,
        });
        return;
    }

    const timestamp =  dayjs.utc(startDate).add(day,"day").valueOf() 
    console.log("timestamp", timestamp)

    var timestamps = []
    for(var i = 0; i < 13; i++){
        var num = timestamp + 2 * 60 * 60 * 1000 * i
        console.log(num)
        timestamps.push(num)
    }

    console.log("timestamps", timestamps)

    let lucky_arr = []
    for(var i = 0; i < 12; i++){
        const lucky_user = await IEO.findOne({
            attributes: [
                'address',
                'date'
              ],
            order: [
                [ 'date' , 'DESC'],
            ],
            where: {
                date: {
                    [Op.gte]: timestamps[i],
                    [Op.lt]: timestamps[i+1]
                }
            }
        })
        console.log("lucky_user", lucky_user)
        lucky_arr.push(lucky_user)
    }
    



    res.send({
        msg: "Success",
        code: 1,
        data: {
            lucky : lucky_arr
        }
    });

}

export async function getLuckyRankReward(req, res){
    const { day } = req.params;
    if (!day ) {
        res.send({
        msg: "Incomplete parameter",
        code: 0,
        });
        return;
    }
    const startTime =  dayjs.utc(startDate).add(day,"day").valueOf() 
    const endTime =  dayjs.utc(startDate).add(day*1 +1,"day").valueOf() 
    console.log(startTime, endTime)
    const luckyReward = await IEO.sum('btc_amount',{
        where: {
            date:{
                [Op.gte]:  startTime,
                [Op.lt]: endTime
            }
        }
    })
    console.log("getLuckyRankReward", luckyReward)

    res.send({
        msg: "Success",
        code: 1,
        data: {
            luckyReward : Decimal.div(Number(luckyReward), 600)
        }
    });
}

export async function getDataByAddress(req, res) {
    const { address } = req.params;

    if (!address ) {
        res.send({
        msg: "Incomplete parameter",
        code: 0,
        });
        return;
    }

    const btc_amount = await IEO.sum('btc_amount',{
        where : {
            address : address
        }
    })
    console.log("btc_amount", Number(btc_amount))

    const token_amount = await IEO.sum('token_amount',{
        where : {
            address : address
        }
    })
    console.log("token_amount", Number(token_amount))

    const inviter_btc_amount = await IEO.sum('btc_amount',{
        where : {
            invite_address : address
        }
    })
    console.log("inviter_btc_amount", inviter_btc_amount)

    const inviter_token_amount = await IEO.sum('token_amount',{
        where : {
            invite_address : address
        }
    })
    console.log("inviter_token_amount", parseInt(Number(inviter_token_amount) / 10) )

    const inviter = await IEO.findAll({
        attributes: [
            'address',
          ],
        where: {
            invite_address: address
        }
    })

    let arr = inviter.map((el,index)=>el.address)
    console.log("inviter",arr)
    const inviter_count = Array.from(new Set(arr))

    res.send({
        msg: "Success",
        code: 1,
        data: {
            btc_amount: Number(btc_amount),
            token_amount: Number(token_amount),
            inviter_btc_amount: Number(inviter_btc_amount),
            inviter_token_amount: parseInt(Number(inviter_token_amount) / 10),
            invite_count: inviter_count.length
        }
    });
}

export async function getFloorDataByAddress(req, res) {
    const { address } = req.params;

    if (!address ) {
        res.send({
        msg: "Incomplete parameter",
        code: 0,
        });
        return;
    }

    const floorData = await IEO.findAll({
        attributes: ["address", "btc_amount", "token_amount", "date"],
        where: {
            address: address
        }
    })

    console.log("floorData",floorData)

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

    if (!address ) {
        res.send({
        msg: "Incomplete parameter",
        code: 0,
        });
        return;
    }

    const floorData = await IEO.findAll({
        attributes: ["address", "btc_amount", "token_amount", "date"],
        where: {
            invite_address: address
        }
    })

    console.log("floorData",floorData)

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
    const bytes  = CryptoJS.AES.decrypt(parms, Secret);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    console.log("decryptedData", decryptedData)
    let { address, tx, amount, invite_address } = decryptedData;
    sendBitonFunc(req, res, address, tx, amount, invite_address, "1")
}

export async function sendBitcoins(req, res) {
    let { parms } = req.body;
    const bytes  = CryptoJS.AES.decrypt(parms, Secret);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    console.log("decryptedData", decryptedData)
    let { address, tx, amount, invite_address } = decryptedData;
    console.log(address, tx, amount, invite_address)
    sendBitonFunc(req, res, address, tx, amount, invite_address, "2")
}

export async function sendBitcoinT(req, res) {
    let { address, tx, amount, invite_address } = req.body;
    sendBitonFunc(req, res, address, tx, amount, invite_address, "1")
}

async function sendBitonFunc(req,res,address, tx, amount, invite_address, state) {
    if (!address || !tx || !amount  ) {
        res.send({
            msg: "Incomplete parameter",
            code: 0,
        });
        return;
    }

    console.log("amount",amount)

    const ga = !!req.cookies._ga ? req.cookies._ga : "";

    const btc_amount = await IEO.sum('btc_amount')
    console.log("btc_amount", Number(btc_amount))

    let floor = Decimal.div(Number(btc_amount), 2).ceil()
    console.log("floor", floor)

    if(Number(btc_amount) == 0) {
        floor = 1
    }
    
    const floor_remain = Decimal.sub(Decimal.mul(floor, 2),  Number(btc_amount))
    console.log("floor_remain", floor_remain)

    let token_amount = 0
    if( amount * 1 > floor_remain) {
        console.log(">") 
        const remain_amount = Decimal.sub(amount, floor_remain)
        console.log("remain_amount", remain_amount)
        const size = Decimal.div(remain_amount , 2).ceil()
        console.log("size", size)
        token_amount = Decimal.sub(15000,  Decimal.mul(5, Decimal.sub(floor,1))).mul(floor_remain)
        console.log("token_amount", token_amount)
        for(var i = 1; i <= size; i++){
            if(i == size){
                const remain = Decimal.sub(remain_amount, Decimal.mul( Decimal.sub(i,1),2))
                console.log("remain", remain)
                token_amount = Decimal.add(token_amount,Decimal.sub(15000,  Decimal.mul(5, Decimal.sub(Decimal.add(floor,i),1))).mul(remain))
                console.log("token_amount"+i, token_amount)
            }else{
                token_amount = Decimal.add(token_amount,Decimal.sub(15000,  Decimal.mul(5, Decimal.sub(Decimal.add(floor,i),1))).mul(2))
                console.log("token_amount"+i, token_amount)
            }
        }
    }else{
        token_amount = Decimal.sub(15000,  Decimal.mul(10, Decimal.sub(floor,1))).mul(amount)
    }
    console.log("token_amount", token_amount)

    if(invite_address == "" || invite_address == address ) {
        invite_address = "bc1pgqsp3gdl0qead7u5lwtf3srhk200xjlzaf5ndx2790lm8mznhqps832hly"
        console.log('invite_address == ""',invite_address )
    }

    const inviters = await IEO.findAll({
        attributes: [
            'invite_address'
          ],
        order: [
            ['date', 'ASC'],
        ],
        limit : 1,
        where: {
            address : invite_address
        }
    })

    // console.log("inviter[0].invite_address", inviters[0], inviters.length)

    if(inviters.length > 0 && inviters[0].invite_address == address){
        console.log("inviter[0].invite_address", inviters[0].invite_address)
        invite_address = "bc1pgqsp3gdl0qead7u5lwtf3srhk200xjlzaf5ndx2790lm8mznhqps832hly"
    }

    const inviter = await IEO.findAll({
        attributes: [
            'invite_address', 'path'
          ],
        order: [
            ['date', 'ASC'],
        ],
        limit : 1,
        where: {
            address : address
        }
    })

    let path = await IEO.findOne({
        attributes: [ 'id', 'path' ],
        where: {
            address: invite_address
        }
    })
    if(!!path){
        console.log("path", path.id, path.path)
    }

    path = inviter.length > 0 ? inviter[0].path : !path ? "" : path.path + path.id + "/" 

    const paths = path.split("/")
    let newSet = new Set(paths)
    newSet.delete ("")
    let arr = [...newSet]
    console.log("arr", arr)
    const day = dayjs.utc().diff(dayjs.utc(startDate).format("YYYY-MM-DD"),'day')
    for(var i = 0; i < arr.length; i++){
        await IEO.increment(`total_fund${day}`, { by: amount , where: { id: paths[i] } })
        console.log("paths", paths[i] )
    }

    if(path == ""){
        invite_address = ""
    }else{
        invite_address = inviter.length > 0 ? inviter[0].invite_address  : invite_address
    }


    console.log({
        address: address,
        tx: tx,
        btc_amount: amount.toString(),
        floor: floor.toString(),
        token_amount: token_amount.toString(),
        ga: ga,
        path: path,
        invite_address:invite_address,
        state: state,
        date: String(new Date().getTime())
    })

    const create = await IEO.create({
        address: address,
        tx: tx,
        btc_amount: amount.toString(),
        floor: floor.toString(),
        token_amount: token_amount.toString(),
        ga: ga,
        path: path,
        invite_address: inviter.length > 0 ? inviter[0].invite_address  : invite_address,
        state: state,
        date: String(new Date().getTime())
    })

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

