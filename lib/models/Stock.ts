import { DataTypes, Model } from "sequelize"
import sequelize from "../db"

export interface StockAttributes {
  id?: number
  stock_symbol: string
  price: number
  volume: number
  timestamp: Date
}

class Stock extends Model<StockAttributes> implements StockAttributes {
  public id!: number
  public stock_symbol!: string
  public price!: number
  public volume!: number
  public timestamp!: Date

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Stock.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    stock_symbol: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "stock_symbol",
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    volume: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Stock",
    tableName: "stock_market",
    timestamps: true,
  },
)

export default Stock
