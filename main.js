document.addEventListener("DOMContentLoaded", (event) => {

    // DOM elements
    let gameWrap = document.getElementById('hexagonGame');
    let tileGrid = document.getElementById('tileGrid');
    let tileElements = tileGrid.querySelectorAll('.tile');
    let btnPrimary = document.getElementById('btnPrimary');
    let countdown = document.getElementById('countdown');
    let targetView = document.getElementById('target');
    let pointsView = document.getElementById('points');
    let feedbackView = document.getElementById('feedback');

    // Logic variables
    let gameState = 'idle';
    let target = 0;
    let tileValues = [];
    let activeTiles = [];
    let points = 0;
    let correctCombinations = []; // Used by handleSubmissions to store correct answers

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

    // Game settings
    let TIME_MEMORY = 10;
    let TIME_RECALL = 30;

    initIdleView();
    addListeners();

    function initIdleView() {
        countdown.innerHTML = TIME_MEMORY;
    }

    function addListeners() {
        // Primary button
        btnPrimary.addEventListener('click', () => {
            switch (gameState) {
                case 'idle':
                    generateRound();
                    break;
                case 'recall':
                    handleSubmission();
                    break;
                case 'results':
                    generateRound();
                default:
                    break;
            }
        });

        // The tiles. Pointer events none unless in recall phase
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
                    } else if(activeTiles.length == 0) {
                        tile.classList.add('active');
                        activeTiles.push(i);
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

        function containsAllValues(subArrays, arrayToCheck) {
            for (const subArray of subArrays) {
                if (arrayToCheck.every(value => subArray.includes(value))) {
                    return true; 
                }
            }
            return false; 
        }
    }    

    function generateRound() {
        target = getRandomInt(5, 16);
        tileValues = generateRandomTileStack();
        points = 0;
        correctCombinations = [];
        deactivateTiles();
        
        startMemorising();
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
            return possibleTileValues;
        } else {
            return generateRandomTileStack();
        }
    }  
    
    function startMemorising() {
        gameState = 'memorising';

        for(let i = 0; i < tileValues.length; i++) {
            tileElements[i].innerHTML = tileValues[i];
        }

        pointsView.innerHTML = points;
        countdown.innerHTML = TIME_MEMORY;

        gameWrap.classList.remove('idle', 'results');
        gameWrap.classList.add('memorising');
        
        let countdownInterval = setInterval(() => {
            countdown.innerHTML -= 1; 

            if(countdown.innerHTML == 0) {
                clearInterval(countdownInterval);
                startRecall();
            }

        }, 1000);
    }

    function startRecall() {
        gameState = 'recall';

        for(let i = 0; i < tileValues.length; i++) {
            tileElements[i].innerHTML = '';
        }

        btnPrimary.innerHTML = 'Submit';
        targetView.innerHTML = target;

        gameWrap.classList.remove('memorising');
        gameWrap.classList.add('recall');

        countdown.innerHTML = TIME_RECALL;

        let countdownInterval = setInterval(() => {
            countdown.innerHTML -= 1; 

            if(countdown.innerHTML == 0) {
                clearInterval(countdownInterval);
                startResults();
            }

        }, 1000);        
    }

    function startResults() {
        gameState = 'results';

        for(let i = 0; i < tileValues.length; i++) {
            tileElements[i].innerHTML = tileValues[i];
        }

        btnPrimary.innerHTML = 'Play again';

        gameWrap.classList.remove('recall');
        gameWrap.classList.add('results');
    }    

    function handleSubmission() {
        let feedback = '';

        // Get the index of the submission in the validCombinations array to check if it's already been found
        let submissionIndex = -1;
        for (let i = 0; i < validCombinations.length; i++) {
            if (arraysAreEqual(validCombinations[i], activeTiles)) {
                submissionIndex = i;
                break;
            }
        }
        
        // Check if the combo has already been found OR handle the new guess
        if(correctCombinations.indexOf(submissionIndex) !== -1) {
            feedback = 'found';
        } else {
            // Find their guess' sum
            let combinationSum = 0;
            for(let i = 0; i < activeTiles.length; i++) {
                combinationSum += tileValues[activeTiles[i]];
            }
    
            // Check against target
            if(combinationSum == target) {
                points += 1;
                correctCombinations.push(submissionIndex);
                feedback = 'correct';
            } else {
                points -= 1;
                feedback = 'wrong';
            }
    
            // Update the points view
            pointsView.innerHTML = points;
        }

        displayFeedback(feedback);
        deactivateTiles();

        function arraysAreEqual(arr1, arr2) {
            if (arr1.length !== arr2.length) {
                return false;
            }
        
            const sortedArr1 = arr1.slice().sort();
            const sortedArr2 = arr2.slice().sort();
        
            for (let i = 0; i < sortedArr1.length; i++) {
                if (sortedArr1[i] !== sortedArr2[i]) {
                    return false;
                }
            }
        
            return true;
        }

        function displayFeedback(feedback) {
            // Add a feedback related class to the active tiles
            tileElements.forEach(tile => {
                if(tile.classList.contains('active')) {
                    tile.classList.add(feedback)
                }
            });

            // Add the feedback class to the gamewrap for other UI
            gameWrap.classList.add(feedback);

            // Determine the correct feedback message to show
            switch (feedback) {
                case 'found':
                    feedbackView.innerHTML = 'Already found';
                    break;
                case 'correct':
                    feedbackView.innerHTML = 'Correct!';
                    break;
                case 'wrong':
                    feedbackView.innerHTML = 'Whoops!';
                    break;
                default:
                    break;
            }

            // Quickly remove the feedback classes and feedback text
            setTimeout(() => {
                tileElements.forEach(tile => {
                    tile.classList.remove(feedback)
                });
                gameWrap.classList.remove(feedback);
                feedbackView.innerHTML = '';
            }, 2000);            
        }
    }

    function deactivateTiles() {
        tileElements.forEach(tile => {
            tile.classList.remove('active');
        });

        tileGrid.classList.remove('comboed');
        activeTiles = [];
    }

});