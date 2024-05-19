document.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");

    // DOM elements
    let gameWrap = document.getElementById('hexagonGame');
    let tileGrid = document.querySelector('.tile-grid');
    let tileElements = tileGrid.querySelectorAll('.tile-grid .tile');
    let btnPrimary = document.getElementById('btnPrimary');
    let countdown = document.getElementById('countdown');
    let targetView = document.getElementById('target');

    // Logic variables
    let gameState = 'idle';
    let target = 0;
    let tileValues = [];
    let activeTiles = [];

    // Game constants
    const validCombinations = [
        // Horizontal
        [0, 1, 2],
        [3, 4, 5],
        [4, 5, 6],
        [7, 8, 9],
        [8, 9, 10],
        [9, 10, 11],
        [12, 13, 14],
        [13, 14, 15],
        [16, 17, 18],
        // Left diagonal
        [0, 3, 7],
        [1, 4, 8],
        [2, 5, 9],
        [4, 8, 12],
        [5, 9, 13],
        [6, 10, 14],
        [9, 13, 16],
        [10, 14, 17],
        [11, 15, 18],
        // Right diagonal
        [0, 4, 9],
        [1, 5, 10],
        [2, 6, 11],
        [3, 8, 13],
        [4, 9, 14],
        [5, 10, 15],
        [7, 12, 16],
        [8, 13, 17],
        [9, 14, 18]
    ];

    addListeners();

    function generateRound() {
        target = getRandomInt(5, 16);
        tileValues = generateRandomTileStack();

        console.log(target, tileValues);

        updateView();
    } 

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function generateRandomTileStack() {
        let possibleTileValues = [];

        for (let i = 0; i < 19; i++) {
            possibleTileValues.push(getRandomInt(1, 6));
        }

        // Now I need to check these random values to see if they work for a game
        let combinationsFound = []; // Need 4 or more combinations

        for(let i = 0; i < validCombinations.length; i++) {

            let combinationSum = 0;
            for(let j = 0; j < 3; j++) {
                combinationSum += possibleTileValues[validCombinations[i][j]];
            }

            if(combinationSum == target) {
                combinationsFound.push(i);
            }
        }   
        
        if(combinationsFound.length > 3) {
            console.log(combinationsFound);
            return possibleTileValues;
        } else {
            return generateRandomTileStack();
        }
    }  
    
    function updateView() {
        for(let i = 0; i < tileValues.length; i++) {
            tileElements[i].innerHTML = tileValues[i];
        }
    }

    function addListeners() {
        // The tiles
        tileElements.forEach((tile, i) => {
            tile.addEventListener('click', () => {

                if(tile.classList.contains('active')) {
                    tile.classList.remove('active');
                    activeTileIndex = activeTiles.indexOf(i);
                    activeTiles.splice(activeTileIndex,1);
                    tileGrid.classList.remove('comboed');
                } else {
                    if(activeTiles.length == 3) {
                        console.log('already 3 selected');
                    } else {  
                        let checkTileSelection = [...activeTiles, i];
                        let validTileSelection = containsAllValues(validCombinations, checkTileSelection);

                        if(validTileSelection) {
                            tile.classList.add('active');
                            activeTiles.push(i);
                        }

                        if(activeTiles.length == 3) {
                            tileGrid.classList.add('comboed');
                        }
                    }
                }

            });
        });

        function containsAllValues(subArrays, checkTileSelection) {
            for (const subArray of subArrays) {
                if (checkTileSelection.every(value => subArray.includes(value))) {
                    return true; 
                }
            }
            return false; 
        }

        btnPrimary.addEventListener('click', () => {
            if(gameWrap.classList.contains('idle')) {
                generateRound();
                gameWrap.classList.remove('idle');
                gameWrap.classList.add('countdown');
                startMemoryCountdown();
            }
        });
    }

    function startMemoryCountdown() {
        countdown.innerHTML = 30;

        let countdownInterval = setInterval(() => {
            countdown.innerHTML -= 1; 

            if(countdown.innerHTML == 0) {
                clearInterval(countdownInterval);
            }

        }, 1000);
    }

    

});