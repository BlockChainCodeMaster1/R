export default function (sequelize, DataTypes) {
  var IEO = sequelize.define('ieo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    address: DataTypes.STRING,
    tx: DataTypes.STRING,
    btc_amount: DataTypes.STRING,
    floor: DataTypes.STRING,
    token_amount: DataTypes.STRING,
    path: DataTypes.STRING,
    ga: DataTypes.STRING,
    invite_address: DataTypes.STRING,
    date: DataTypes.STRING,
    state:{
      type: DataTypes.STRING,
      defaultValue: "1"
    },
    total_fund1: {
      type: DataTypes.STRING,
      defaultValue: "0"
    },
    total_fund2: {
      type: DataTypes.STRING,
      defaultValue: "0"
    },
    total_fund3: {
      type: DataTypes.STRING,
      defaultValue: "0"
    },
    total_fund4: {
      type: DataTypes.STRING,
      defaultValue: "0"
    },
    total_fund5: {
      type: DataTypes.STRING,
      defaultValue: "0"
    },
    total_fund6: {
      type: DataTypes.STRING,
      defaultValue: "0"
    },
    total_fund7: {
      type: DataTypes.STRING,
      defaultValue: "0"
    },
    total_fund8: {
      type: DataTypes.STRING,
      defaultValue: "0"
    },
    total_fund9: {
      type: DataTypes.STRING,
      defaultValue: "0"
    },
    total_fund10: {
      type: DataTypes.STRING,
      defaultValue: "0"
    },
  })
  IEO.sync();
  return IEO;
}
