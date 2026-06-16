import { DataTypes, Model } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class User extends Model {
  static initModel(sequelize) {
    User.init(
      {
        user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        fullname: { type: DataTypes.STRING, allowNull: false },
        username: { type: DataTypes.STRING, allowNull: false, unique: true },
        dob: { type: DataTypes.DATEONLY, allowNull: false },
        gender: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        phone_no: { type: DataTypes.STRING, allowNull: false },
        passwordHash: { type: DataTypes.STRING, allowNull: false },
        profilePhoto: { type: DataTypes.STRING, allowNull: true }, // store URL
        refreshToken: { type: DataTypes.STRING, allowNull: true },
        parent_family:{type: DataTypes.INTEGER,allowNull:true}
      },
      {
        sequelize,
        modelName: "User",
        tableName: "users",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

    // Hooks
    User.beforeCreate(async (user) => {
      user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
    });

    User.beforeUpdate(async (user) => {
      if (user.changed("passwordHash")) {
        user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
      }
    });

    return User;
  }

  // Instance Methods
  async isPasswordCorrect(password) {

     if (!this.passwordHash) {
    throw new Error("No password hash found for this user");
  }
    return bcrypt.compare(password, this.passwordHash);
  }

  generateAccessToken() {
    return jwt.sign(
      { user_id: this.user_id, email: this.email, phone_no: this.phone_no },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
    );
  }

  generateRefreshToken() {
    return jwt.sign(
      { user_id: this.user_id, email: this.email, phone_no: this.phone_no },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
  }
}

// ES module export
export default User;
