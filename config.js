const MINE_RATE = 1000
const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
    timestamp: 1,
    lastHash: "-----",
    hash: "xxxxxx",
    data: [],
    difficultyLevel: INITIAL_DIFFICULTY,
    nonce: 0
}

STARTING_BALANCE = 1000;

module.exports = {GENESIS_DATA, MINE_RATE, STARTING_BALANCE};