module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });

    User.associate = (models) => {
        User.hasMany(models.GameweekPrediction, {
            foreignKey: 'UserId',
            as: 'gameweekPredictions',
            allowNull: false,
            onDelete: "CASCADE"
        });
    }

    return User
} 