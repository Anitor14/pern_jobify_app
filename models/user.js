"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "User must have a name" },
          notEmpty: { msg: "Name must not be empty" },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "User must have a email" },
          notEmpty: { msg: "email must not be empty" },
          isEmail: { msg: "Must be a valid email address" },
        },
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "User must have a password" },
          notEmpty: { msg: "password must not be empty" },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        trim: true,
        validate: {
          max: 20,
        },
        defaultValue: "lastName",
      },
      location: {
        type: DataTypes.STRING,
        trim: true,
        validate: {
          max: 20,
        },
        defaultValue: "my city",
      },
    },
    {
      sequelize,
      tableName: "users",
      modelName: "User",
    }
    // {
    //   instanceMethods: {
    //     validPassword: async function (password) {
    //       return await bcrypt.compare(password, this.password);
    //     },
    //   },
    // }
  );
  // this is happens before the model is created.
  User.beforeCreate(async function (user) {
    if (user.changed("password")) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  });
  User.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };
  return User;
};
