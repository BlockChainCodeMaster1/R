import db from "../database/db.js";
import { nanoid } from 'nanoid';
import { Sequelize,Op } from '@sequelize/core';
import Decimal from 'decimal.js'
const IEO = db.IEO;

export async function getTotalData(req, res) {

    const btc_amount = await IEO.sum('btc_amount')

    console.log("btc_amount", Number(btc_amount))

    const { count } = await IEO.findAndCountAll({
        group: 'address'
      });
    
    console.log("users_conunt", count.length)

    res.send({
        msg: "Success",
        code: 1,
        data: {
            btc_amount : Number(btc_amount),
            users_conunt: count.length
        }
    });

}

export async function getRank(req, res) {

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
                [Op.ne] : "01"
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
    console.log("inviter_token_amount", parseInt(Number(inviter_token_amount) * 0.1) )
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
        floorData: floorData,
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
        floorData: floorData,
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
    let { address, tx, amount, invite_address } = req.body;

    if (!address || !tx || !amount  ) {
        res.send({
        msg: "Incomplete parameter",
        code: 0,
        });
        return;
    }

    const ga = !!req.cookies._ga ? req.cookies._ga : "";

    const btc_amount = await IEO.sum('btc_amount')
    console.log("btc_amount", Number(btc_amount))

    const floor = Decimal.div(Number(btc_amount), 2).ceil()
    console.log("floor", floor)
    
    const floor_remain = Decimal.sub(Decimal.mul(floor, 2),  Number(btc_amount))
    console.log("floor_remain", floor_remain)

    let  token_amount = Decimal.sub(30000,  Decimal.mul(10, Decimal.sub(floor,1))).mul(amount)
    console.log("token_amount", token_amount)
    if( amount > floor_remain) {
        console.log(">") 
        const remain_amount = Decimal.sub(amount, floor_remain)
        console.log("remain_amount", remain_amount)
        const size = Decimal.div(remain_amount , 2).ceil()
        console.log("size", size)
        for(var i = 0; i < size; i++){
            if(i ==  Decimal.sub(size,1)){
                const remain =Decimal.mod(amount, 2)
                console.log("remain", remain)
                token_amount = Decimal.add(token_amount,Decimal.sub(150000,  Decimal.mul(10, Decimal.sub(floor,1))).mul(remain))
                console.log("token_amount"+i, token_amount)
            }else{
                token_amount = Decimal.add(token_amount,Decimal.sub(150000,  Decimal.mul(10, Decimal.sub(floor,1))).mul(2))
                console.log("token_amount"+i, token_amount)
            }
        }
    }

    if(invite_address == "") {
        invite_address = "bc1pgqsp3gdl0qead7u5lwtf3srhk200xjlzaf5ndx2790lm8mznhqps832hly"
    }

    const inviter = await IEO.findAll({
        attributes: [
            'invite_address',
          ],
        order: [
            ['date', 'ASC'],
        ],
        limit : 1,
        where: {
            address : address
        }
    })

    console.log("inviter", inviter[0].invite_address)

    console.log({
        address: address,
        tx: tx,
        btc_amount: amount,
        floor: floor,
        token_amount: token_amount,
        ga: ga,
        invite_address: inviter.length > 0 ? inviter[0].invite_address  : invite_address,
        date: String(new Date().getTime())
    })

    const create = await IEO.create({
        address: address,
        tx: tx,
        btc_amount: amount.toString(),
        floor: floor.toString(),
        token_amount: token_amount.toString(),
        ga: ga,
        invite_address: inviter.length > 0 ? inviter[0].invite_address  : invite_address,
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