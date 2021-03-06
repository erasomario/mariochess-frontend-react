const getStartBoard = () => [
    ['wr1', 'wn1', 'wb1', 'wq1', 'wk1', 'wb2', 'wn2', 'wr2'],
    ['wp1', 'wp2', 'wp3', 'wp4', 'wp5', 'wp6', 'wp7', 'wp8'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['bp1', 'bp2', 'bp3', 'bp4', 'bp5', 'bp6', 'bp7', 'bp8'],
    ['br1', 'bn1', 'bb1', 'bq1', 'bk1', 'bb2', 'bn2', 'br2'],
]

const getPosition = (board, piece) => {
    for (let i = 0; i < board.length; i++) {
        const r = board[i];
        for (let j = 0; j < r.length; j++) {
            if (r[j] === piece) {
                return [j, i]
            }
        }
    }
    return null
}

const checkEnoughMaterial = tiles => {
    const w = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 }
    const b = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 }
    const rta = { w, b }

    tiles.forEach(row => row.forEach(p => {
        if (p) {
            rta[p.slice(0, 1)][p.slice(1, 2)]++;
        }
    }))

    const rule = (arr) => {
        return arr.reduce((and, cur) => and && rta[cur[0]][cur[1]] === cur[2], true)
    }

    const nsAndBs = (wn, bn, wb, bb) => rule([["w", "n", wn ? 1 : 0], ["w", "b", wb ? 1 : 0], ["b", "n", bn ? 1 : 0], ["b", "b", bb ? 1 : 0]])

    const isBlack = (col, row) => col % 2 !== 0 ? row % 2 !== 0 : row % 2 === 0

    if (rule([["w", "p", 0], ["b", "p", 0], ["w", "r", 0], ["b", "r", 0], ["w", "q", 0], ["b", "q", 0], ["w", "k", 1], ["b", "k", 1]])) {
        //king against king
        if (nsAndBs(false, false, false, false)) {
            return false
        }
        if (nsAndBs(false, false, true, false) || nsAndBs(false, false, false, true)) {
            return false
        }
        if (nsAndBs(true, false, false, false) || nsAndBs(false, true, false, false)) {
            return false
        }
        if (nsAndBs(false, false, true, true)) {
            const bishopColors = []
            tiles.forEach((row, i) => row.forEach((p, j) => {
                if (p && p.slice(1, 2) === "b") {
                    bishopColors.push(isBlack(i, j))
                }
            }))
            //both bishops on squares of the same color
            return !(bishopColors[0] && bishopColors[1]) || (!bishopColors[0] && !bishopColors[1])
        }
    }
    return true
}


const getBoardHash = board => {
    const m = {
        wp: "1", wn: "2", wb: "3", wr: "4", wq: "5", wk: "6",
        bp: "7", bn: "8", bb: "9", br: "0", bq: "A", bk: "B"
    }
    const squares = board.inGameTiles
    const rta = [board.turn % 2 ? "w" : "b"]
    for (let i = 0; i < squares.length; i++) {
        const r = squares[i];
        for (let j = 0; j < r.length; j++) {
            rta.push(r[j] ? m[r[j].slice(0, 2)] : "_")
        }
    }
    rta.push(board.touched.includes("br1") ? "1" : "0")
    rta.push(board.touched.includes("br2") ? "1" : "0")
    rta.push(board.touched.includes("bk1") ? "1" : "0")
    rta.push(board.touched.includes("wr1") ? "1" : "0")
    rta.push(board.touched.includes("wr2") ? "1" : "0")
    rta.push(board.touched.includes("wk1") ? "1" : "0")
    return rta.join("")
}

const getBoard = (movs, turn) => {
    const board = getStartBoard()
    const whiteCaptured = []
    const blackCaptured = []
    const touched = []
    const lastMovedPiece = turn > 0 ? board[movs[turn - 1].sRow][movs[turn - 1].sCol] : null
    movs.slice(0, turn).forEach(m => {
        const srcPiece = board[m.sRow][m.sCol]
        const destPiece = board[m.dRow][m.dCol]
        if (destPiece) {
            (destPiece.slice(0, 1) === 'w' ? whiteCaptured : blackCaptured).push(destPiece)
        }

        if (!touched.includes(srcPiece)) {
            touched.push(srcPiece)
        }

        if (srcPiece.slice(1, 2) === 'p' && m.sCol !== m.dCol && !destPiece) {
            const capt = board[m.sRow][m.dCol];
            board[m.sRow][m.dCol] = null;
            (capt.slice(0, 1) === 'w' ? whiteCaptured : blackCaptured).push(capt)
        }

        board[m.dRow][m.dCol] = srcPiece
        board[m.sRow][m.sCol] = null

        if (m.cast) {
            if (m.cast === 's') {
                board[m.sRow][5] = board[m.sRow][7]
                board[m.sRow][7] = null
            } else {
                board[m.sRow][3] = board[m.sRow][0]
                board[m.sRow][0] = null
            }
        } else if (m.prom) {
            board[m.dRow][m.dCol] = m.prom
        }
    })
    if (lastMovedPiece) {
        touched.push(lastMovedPiece)
    }
    return { inGameTiles: board, whiteCaptured: sortCaptures(whiteCaptured), blackCaptured: sortCaptures(blackCaptured), touched, turn }
}

const checkThreefold = (game, hash) => {
    let reps = 0
    game.movs.forEach((m, i) => {
        if (i < game.movs.length - 2 && m.boardHash === hash) {
            reps++
        }
    })
    //it's 2 cos I need to find another to hashes like mine to make it 3    
    return reps === 2
}

const isMine = (myColor, piece) => {
    return (myColor === piece[0])
}

/**
 * Creates a copy of board and executes the movement described by sCol, sRow, dCol, dRow
 * @param {*} board 
 * @param {*} sCol
 * @param {*} sRow 
 * @param {*} dCol 
 * @param {*} dRow 
 * @returns 
 */
const simulateMov = (board, sCol, sRow, dCol, dRow) => {
    const newBoard = board.map(r => r.map(c => c))
    newBoard[dRow][dCol] = newBoard[sRow][sCol]
    newBoard[sRow][sCol] = null
    return newBoard
}

const isKingAttacked = (board, touched, myColor) => {
    const attacked = getAllAttackedByEnemy(board, touched, myColor)
    const pos = getPosition(board, `${myColor}k1`)
    return includes(attacked, pos[0], pos[1])
}

const includes = (arr, col, row) => {
    if (!arr) {
        return false
    }
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][0] === col && arr[i][1] === row) {
            return true
        }
    }
    return false
}

const scanTileK = (arr, board, myColor, dCol, dRow) => {
    if (dCol >= 0 && dCol <= 7 && dRow >= 0 && dRow <= 7) {
        //if the dest square is empty or occupied by an enemy piece, I'll check if it's safe to go that square 
        if (!board[dRow][dCol] || !isMine(myColor, board[dRow][dCol])) {
            arr.push([dCol, dRow])
        }
    }
}

const scanTileN = (arr, board, myColor, dCol, dRow) => {
    if (dCol >= 0 && dCol <= 7 && dRow >= 0 && dRow <= 7) {
        const piece = board[dRow][dCol]
        if (piece) {
            if (!isMine(myColor, piece)) {
                arr.push([dCol, dRow])
            }
        } else {
            arr.push([dCol, dRow])
        }
    }
}

const scanRow = (arr, board, myColor, c, r, cdelta, rdelta) => {
    for (let cc = c + cdelta, rr = r + rdelta; cc >= 0 && cc <= 7 && rr >= 0 && rr <= 7; cc += cdelta, rr += rdelta) {
        const piece = board[rr][cc]
        if (piece) {
            if (!isMine(myColor, piece)) {
                arr.push([cc, rr])
            }
            break
        } else {
            arr.push([cc, rr])
        }
    }
}

const sortCaptures = (list) => {
    const conv = { p: 0, n: 1, b: 2, r: 3, q: 4 }
    return list.sort((a, b) => {
        const na = conv[a.slice(1, 2)], nb = conv[b.slice(1, 2)]
        return (na > nb ? 1 : (na < nb ? -1 : 0))
    })
}

const getKingSquares = (c, r) => {
    return [[c, r + 1], [c + 1, r + 1], [c + 1, r], [c + 1, r - 1], [c, r - 1], [c - 1, r - 1], [c - 1, r], [c - 1, r + 1]]
}

const getKnightSquares = (c, r) => {
    return [[c + 1, r + 2], [c + 2, r + 1], [c + 2, r - 1], [c + 1, r - 2], [c - 1, r - 2], [c - 2, r - 1], [c - 2, r + 1], [c - 1, r + 2]]
}

const getAllAttackedByMe = (board, touched, myColor) => {
    let attacked = []
    board.forEach((r, i) => r.forEach((c, j) => {
        if (c && c.slice(0, 1) === myColor) {
            attacked = attacked.concat(getAttacked(board, touched, myColor, j, i))
        }
    }))
    return attacked
}

const getAllAttackedByEnemy = (board, touched, myColor) => {
    let attacked = []
    board.forEach((r, i) => r.forEach((c, j) => {
        if (c && c.slice(0, 1) !== myColor) {
            //if it's my turn to play, it means the enemy king is not under attack, no there's no need to check
            attacked = attacked.concat(getAttacked(board, touched, myColor === 'w' ? 'b' : 'w', j, i, false))
        }
    }))
    return attacked
}

const getCastling = (board, touched, myColor, c, r) => {
    const rta = []
    if (board[r][c] && (board[r][c].slice(1, 2) === 'k' && !touched.includes(board[r][c]))) {
        const attacked = getAllAttackedByEnemy(board, touched, myColor)
        if (!includes(attacked, c, r)) {
            //long castling
            if (board[r][0] && (board[r][0].slice(1, 2) === 'r' && !touched.includes(board[r][0]))) {
                if (!board[r][1] && !board[r][2] && !board[r][3]) {
                    if (!includes(attacked, 2, r) && !includes(attacked, 3, r)) {
                        rta.push([2, r])
                    }
                }
            }
            //short
            if (board[r][7] && (board[r][7].slice(1, 2) === 'r' && !touched.includes(board[r][7]))) {
                if (!board[r][5] && !board[r][6]) {
                    if (!includes(attacked, 5, r) && !includes(attacked, 6, r)) {
                        rta.push([6, r])
                    }
                }
            }
        }
    }
    return rta
}

const onBoard = (c, r) => (c >= 0 && c <= 7 && r >= 0 && r <= 7)

/*list of squares attacked from the square c, r */
const getAttacked = (board, touched, myColor, c, r, checkForKingAttacks = true) => {
    let arr = []
    const piece = board[r][c]
    const type = piece.slice(1, -1)
    const color = piece.slice(0, 1)

    if (type === 'k') {
        getKingSquares(c, r).forEach(s => scanTileK(arr, board, myColor, s[0], s[1]))
    } else if (type === 'r') {
        scanRow(arr, board, myColor, c, r, 0, 1)
        scanRow(arr, board, myColor, c, r, 0, -1)
        scanRow(arr, board, myColor, c, r, 1, 0)
        scanRow(arr, board, myColor, c, r, -1, 0)
    } else if (type === 'n') {
        getKnightSquares(c, r).forEach(s => scanTileN(arr, board, myColor, s[0], s[1]))
    } else if (type === 'b') {
        scanRow(arr, board, myColor, c, r, 1, 1)
        scanRow(arr, board, myColor, c, r, 1, -1)
        scanRow(arr, board, myColor, c, r, -1, 1)
        scanRow(arr, board, myColor, c, r, -1, -1)
    } else if (type === 'q') {
        scanRow(arr, board, myColor, c, r, 1, 1)
        scanRow(arr, board, myColor, c, r, 1, -1)
        scanRow(arr, board, myColor, c, r, -1, 1)
        scanRow(arr, board, myColor, c, r, -1, -1)
        scanRow(arr, board, myColor, c, r, 0, 1)
        scanRow(arr, board, myColor, c, r, 0, -1)
        scanRow(arr, board, myColor, c, r, 1, 0)
        scanRow(arr, board, myColor, c, r, -1, 0)
    } else if (type === 'p') {
        const delta = color === 'w' ? 1 : -1
        //first square
        if (onBoard(c, r + delta) && !board[r + delta][c]) {
            arr.push([c, r + delta])
            //second square
            if (!touched.includes(piece) && !board[r + delta + delta][c]) {
                arr.push([c, r + delta + delta])
            }
        }
        //attacks
        if (onBoard(c + 1, r + delta) && board[r + delta][c + 1]) {
            if (myColor !== board[r + delta][c + 1].slice(0, 1)) {
                arr.push([c + 1, r + delta])
            }
        }
        if (onBoard(c - 1, r + delta) && board[r + delta][c - 1]) {
            if (myColor !== board[r + delta][c - 1].slice(0, 1)) {
                arr.push([c - 1, r + delta])
            }
        }
        //passing
        const pass1 = board[r][c - 1]
        if (pass1 && ((pass1[0] !== myColor && pass1[1] === 'p') && ((myColor === 'w' && r === 4) || (myColor === 'b' && r === 3)) && touched[touched.length - 1] === pass1)) {
            arr.push([c - 1, r + delta])
        }
        const pass2 = board[r][c + 1]
        if (pass2 && ((pass2[0] !== myColor && pass2[1] === 'p') && ((myColor === 'w' && r === 4) || (myColor === 'b' && r === 3)) && touched[touched.length - 1] === pass2)) {
            arr.push([c + 1, r + delta])
        }
    }
    //remove every move that would left my king under attack
    if (checkForKingAttacks) {
        arr = arr.filter(s => {
            const sim = simulateMov(board, c, r, s[0], s[1])
            return !isKingAttacked(sim, [piece, ...touched], myColor)
        })
    }
    return arr
}

export {
    getStartBoard,
    getBoard,
    getAttacked,
    getCastling,
    isKingAttacked,
    getAllAttackedByMe,
    getAllAttackedByEnemy,
    simulateMov,
    includes,
    checkEnoughMaterial,
    getBoardHash,
    checkThreefold
}