import { Sequelize } from '@sequelize/core';
import configs from "./db.json";
import IEO from "../model/ieo";
import LUCKY from "../model/lucky";

const dbHost = configs.mysql.host,
  dbPort = configs.mysql.port,
  dbUsername = configs.mysql.username,
  dbPassword = configs.mysql.password,
  dbName = configs.mysql.dbName;

//mysql connect option
const db = {
  sequelize: new Sequelize(dbName, dbUsername, dbPassword, {
    host: dbHost,
    dialect: "mariadb",
    port: dbPort,
    operatorsAliases: false,
    dialectOptions: {
      connectTimeout: 30000, // 设置连接超时时间为 30 秒
      socketTimeout: 60000
    },
    pool: {
      max: 30,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      freezeTableName: true,
      timestamps: false,
    },
  }),
};

db.IEO = IEO(db.sequelize, Sequelize.DataTypes);
db.LUCKY = LUCKY(db.sequelize, Sequelize.DataTypes);

export default db;