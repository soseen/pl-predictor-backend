module.exports = (sequelize, DataTypes) => {
    const MatchPrediction = sequelize.define("MatchPrediction", {
        matchId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: false
        },
        homeTeamName: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: false
        },
        awayTeamName: {
            type: DataTypes.STRING,
            allowNull: true,
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
        isBoosted: {
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