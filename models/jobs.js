"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Jobs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Jobs.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      company: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Job must have a name" },
          notEmpty: { msg: "Company must not be empty" },
        },
      },
      position: { type: DataTypes.STRING, allowNull: false },
      status: {
        type: DataTypes.ENUM,
        values: ["interview", "declined", "pending"],
        defaultValue: "pending",
      },
      jobType: {
        type: DataTypes.ENUM,
        values: ["full-time", "part-time", "remote", "internship"],
        defaultValue: "full-time",
      },
      jobLocation: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "my city",
      },
    },
    {
      sequelize,
      modelName: "Jobs",
    }
  );
  return Jobs;
};
