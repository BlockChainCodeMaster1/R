export default function (sequelize, DataTypes) {
  var Lucky = sequelize.define('lucky', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    address: DataTypes.STRING,
    btc_amount: DataTypes.STRING,
    date: DataTypes.STRING,
    state: DataTypes.INTEGER,
  })
  Lucky.sync();
  return Lucky;
}
