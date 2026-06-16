import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

export const PendingSignup = sequelize.define(
  "PendingSignup",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    signupData: {
      // Store entire signup form here
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    tableName: "pending_signups",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);
