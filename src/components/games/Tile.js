export function Tile({
    col,
    row,
    piece = null,
    reversed,
    selected,
    myTurn,
    myColor,
    highlight,
    lastMov,
    onSelect = a => a,
    colors,
    size,
    showCoords,
}) {
    const tile = `${col}${row}`
    const selectable = myTurn && ((piece && myColor === piece[0]) || highlight)
    const black = col % 2 !== 0 ? row % 2 !== 0 : row % 2 === 0;
    const letters = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "f", 7: "g", 8: "h" }

    const tl = {
        textAlign: "left",
        position: "absolute",
        top: "0px", left: "3%",
        fontSize: `${size * 0.22}px`
    }

    const br = {
        textAlign: "right",
        position: "absolute",
        bottom: "0px", right: "3%",
        fontSize: `${size * 0.22}px`
    }

    const onClick = () => {
        if (selectable) {
            onSelect();
        }
    }

    let bgColor = black ? colors.primary : colors.secondary
    const high = highlight

    const circle = {
        borderRadius: "50%",
        border: `5px solid ${colors.dot || "rgba(128, 128, 128, 0.3)"}`,
        position: "absolute", left: "5%", top: "5%", width: "90%", height: "90%"
    }

    const dot = {
        borderRadius: "50%",
        backgroundColor: colors.dot || "rgba(128, 128, 128, 0.3)",
        position: "absolute", left: "35%", top: "35%", width: "30%", height: "30%"
    }

    const highStyle = high ? (piece ? circle : dot) : null

    return <>
        <div style={{ cursor: selectable ? "pointer" : "default", width: `${size}px`, height: `${size}px`, position: "relative", backgroundColor: bgColor, float: "left" }}
            onClick={onClick}>
            {showCoords && col === (reversed ? 7 : 0) ? <div style={{ ...tl, color: !black ? colors.primary : colors.secondary }}>{row + 1}</div> : ""}
            {showCoords && row === (reversed ? 7 : 0) ? <div style={{ ...br, color: !black ? colors.primary : colors.secondary }}>{letters[col + 1]}</div> : ""}
            {highStyle && <div style={highStyle} />}
            {(selected || lastMov) && <div style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: (colors.selection? colors.selection : "rgba(33, 150, 243, 0.3)") }}></div>}
            {piece &&
                <div style={{
                    position: "absolute", width: "100%", height: "100%",
                    backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundSize: "100% 100%",
                    backgroundImage: `url('${process.env.PUBLIC_URL}/assets/${piece.slice(0, -1)}.svg')`
                }}>
                </div>
            }
            {false && <div style={{ position: "absolute", left: "0px", color: "gray" }}>{tile}</div>}
        </div>
    </>
}