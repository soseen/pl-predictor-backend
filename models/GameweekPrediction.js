module.exports = (sequelize, DataTypes) => {
    const GameweekPrediction = sequelize.define("GameweekPrediction", {
        gameweek: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false
        },
        seasonId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false
        }
    });

    GameweekPrediction.associate = (models) => {
        GameweekPrediction.hasMany(models.MatchPrediction, {
            foreignKey: 'GameweekPredictionId',
            as: 'matchPredictions',
            allowNull: false,
            onDelete: "CASCADE"
        });
        GameweekPrediction.belongsTo(models.User, {
            foreignKey: 'UserId',
            allowNull: false,
            as: 'gameweekPredictions',
            onDelete: "CASCADE"
        });
    }

    return GameweekPrediction
} 