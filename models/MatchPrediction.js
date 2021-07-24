module.exports = (sequelize, DataTypes) => {
    const MatchPrediction = sequelize.define("MatchPrediction", {
        matchId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false
        },
        homeTeamScore: {
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: false
        },
        awayTeamScore: {
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: false
        },
        isResolved: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
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