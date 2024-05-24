//snakeautorandom.js
//Snake game simulation in javascript/canvas. Automatic randomized movement, resets on collision with self or border.
//Uses html canvas element with: id="canvas" width="400" height="400"

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

const canvasSideLength = 400;
const canvasSideTiles = 10;
const startOffset = 4;
const grid = canvasSideLength/canvasSideTiles; // must be round number
var   gameSpeedCounter = 0;

// uses prevMove and nextTurnOrStraight to decide next move
// Move schema: 1=west,2=north,3=east,4=south
// Turn schema: 1=left,2=straight,3=right
// 2D matrix, x=Move, y=Turn //INDEX BY -1 FROM SCHEMA in calc func
//
//             x+1=1  2  3  4
//   compass move  W  N  E  S  
pickNextMove = [ [ 4, 1, 2, 3 ], //y+1=1=left turn
                 [ 1, 2, 3, 4 ],     //2=straight
                 [ 2, 3, 4, 1 ], ] ; //3=right turn

var snake = {
    x: grid * startOffset, //starting pos
    y: grid * startOffset,
    
    dx: grid, //movement per iter
    dy: 0,
    
    cells: [], //all squares of snakes body, accumulates infinitely

    handleNextMove: function(nextMoveInt){
        console.log("handleNextMove:: handling nextMoveInt=" + nextMoveInt);
        switch(nextMoveInt){
            case 1: //west
                this.dy = 0;
                this.dx = -grid; break;
            case 2: //north
                this.dy = -grid;
                this.dx = 0; break;
            case 3: //east
                this.dy = 0;
                this.dx = grid; break;
            case 4: //south
                this.dy = grid;
                this.dx = 0; break;
            default:
                console.error("in handleNextMove:: unhandled nextMoveInt=" + nextMoveInt);
        }
    },

    detectPrevMove: function(headCell, neckCell){
        let prevMove = 0;
        if (headCell.x > neckCell.x){
            console.log("Detected prevMove=east");
            prevMove = 3; //east
        } else if (headCell.x < neckCell.x){
            console.log("Detected prevMove=west");
            prevMove = 1; //west
        } else if (headCell.y > neckCell.y){
            console.log("Detected prevMove=south");
            prevMove = 4; //south
        } else if (headCell.y < neckCell.y){
            console.log("Detected prevMove=north");
            prevMove = 2; //north
        }
        console.log("detectPrevMove:: returning prevMove=" + prevMove);
        return prevMove;
    },
};

//main
function loop() {
    requestAnimationFrame(loop);
    if (++gameSpeedCounter < 15) { // 60fps slowdown factor, higher=slower
        return;
    }
    
    gameSpeedCounter = 0;
    context.clearRect(0,0,canvas.width,canvas.height);
    
    // Random pick next direction move: int 1-3
    // 1=left turn, 2=straight, 3=right turn
    let nextTurnOrStraight = Math.round((Math.random() * (3-1) + 1));
    console.log("nextTurnOrStraight=" + nextTurnOrStraight);
    
    // check head/neck to know last move, no doubling back on neck 
    if (snake.cells.length > 1){
        let headCell = {x: snake.cells[0].x, y: snake.cells[0].y};
        let neckCell = {x: snake.cells[1].x, y: snake.cells[1].y};
        console.log("headCell{x,y}={" + headCell.x + "," + headCell.y +
                 "}, neckCell{x,y}={" + neckCell.x + "," + neckCell.y + "}" );
        
        let prevMove,nextMove = 0 //1=west, 2=north, 3=east, 4=south
        prevMove = snake.detectPrevMove(headCell, neckCell);

        console.log("Attempting check of pickNextMove matrix, with nextTurnOrStraight=" + 
                        nextTurnOrStraight + ", prevMove=" + prevMove);
        nextMove = pickNextMove[nextTurnOrStraight-1][prevMove-1]; //move+turn schemas are 1-indexed
        console.log("nextMove=" + nextMove);

        snake.handleNextMove(nextMove); //TODO for move-redo (try-again) logic, rollback to before this line after seeing resetGame=True
    }
    
    // move snake by new velocity (either left-turn, straight, or right-turn)
    snake.x += snake.dx;
    snake.y += snake.dy;
    
    // accumulate infinite snake body
    snake.cells.unshift({x: snake.x, y: snake.y});

    let resetGame = false; //make global var if keypress handling
    
    if (snake.x >= canvasSideLength || 
            snake.y >= canvasSideLength || 
            snake.x < 0 || 
            snake.y < 0){
        console.log("Grid boundary violation for canvasSideLength=" + canvasSideLength
            + ", with snake head pos {x,y}={" + snake.x + "," + snake.y 
            + " ...Setting resetGame=true");
        resetGame = true;
    }

    // draw snake one cell at a time
    context.fillStyle = 'green';
    snake.cells.forEach(function(cell, index) {
        context.fillRect(cell.x, cell.y, grid-5, grid-5); // draw in snake body, with border grid effect
        if (index===0){
            console.log("PROCESSING HEAD CELL, DRAW LASTMOVE INDICATOR??? from index"); //TODO
        }
        for (let i = index + 1; i < snake.cells.length; i++) { // check collision
            if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) { // collision, snake in body. reset
                console.log("Self-collision detected!! for cells index=" + i + ", with x,y=" 
                    + cell.x + "," + cell.y );
                console.log("Setting resetGame=true");
                resetGame = true;
            }
        }
    });

    //TODO for move retry (collision redo), if resetGame=true here, rollback to before snake.handleNextMove call
    if (resetGame){
        console.log("resetGame=true, resetting");
        snake.x = grid * startOffset;
        snake.y = grid * startOffset;
        snake.cells = [];
        snake.dx = grid;
        snake.dy = 0;
        resetGame = false;
    }
}

requestAnimationFrame(loop); //start game

//// TODO keypress handling?
//document.addEventListener('keydown', function(e) { if (e.which === 37) { //left arrow }});
