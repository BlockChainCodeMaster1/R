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
    ga: DataTypes.STRING,
    invite_address: DataTypes.STRING,
    date: DataTypes.STRING,
    state: DataTypes.INTEGER,
  })
  IEO.sync();
  return IEO;
}
