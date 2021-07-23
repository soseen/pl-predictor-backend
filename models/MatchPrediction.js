module.exports = (sequelize, DataTypes) => {
    const MatchPrediction = sequelize.define("MatchPrediction", {
        matchId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false
        },
        homeSideScore: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false
        },
        awaySideScore: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false
        },
        isResolved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            unique: false
        },
        isCorrectScore: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            unique: false
        },
        isExactScore: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            unique: false
        },
    });

    MatchPrediction.associate = (models) => {
        MatchPrediction.belongsTo(models.GameweekPrediction, {
            foreignKey: 'GameweekPredictionId',
            as: 'matchPredictions',
            allowNull: false,
            onDelete: "CASCADE"
        });
    }

    return MatchPrediction
} 