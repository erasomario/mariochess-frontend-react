const { apiRequest } = require("../utils/ApiClient")

const createGame = async (apiKey, opponentId, time, addition, color) => {
    return await apiRequest(`/v1/games/`, 'POST', apiKey, { opponentId, time, addition, color })
}

const findGameById = async (gameId, apiKey) => {
    return await apiRequest(`/v1/games/${gameId}`, "GET", apiKey)
}

const createMove = async (apiKey, gameId, piece, src, dest, cast) => {
    return await apiRequest(`/v1/games/${gameId}/moves`, 'POST', apiKey, { piece, src, dest, cast })
}

module.exports = {
    createGame,
    findGameById,
    createMove
}