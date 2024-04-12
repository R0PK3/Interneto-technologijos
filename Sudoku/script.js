const HIDE_CLASS = 'hide';
const PRE_FILLED_CLASS = 'pre-filled';
const INPUT_REGEX = /^[1-9]$/;

let refToBoard = [];
let board = "";
let board_solution = "";
let board_width;
let board_height;

let resetBtn = document.body.getElementsByClassName("reset-btn")[0];
resetBtn.addEventListener("click", ResetInput);
let submitBtn = document.body.getElementsByClassName("submit-btn")[0];
submitBtn.addEventListener("click", SubmitData);
let fillBtn = document.body.getElementsByClassName('fill-btn')[0];
fillBtn.addEventListener("click", FillData)


let errBlock = $('body').find('.klaida').eq(0);
let succBlock = document.body.getElementsByClassName('pavyko')[0];

GetBoardData().then(jsonData => {
    board = jsonData.board;
    board_height = jsonData.height;
    board_width = jsonData.width;
    InitBoard(board_height, board_width);
});


function InitBoard(board_h, board_w){
    
    let table = document.body.querySelectorAll("table");
    
    if(board_h > 0 && board_w > 0){
        
        for(let i = 0; i < board_h; i++){

            const row = document.createElement('tr');
            for(let j = 0; j < board_w; j++){

                const data = document.createElement('td');
                const input = document.createElement('input');
                let arrIndex = i * board_h + j;

                SetInput(input, arrIndex);
                
                refToBoard[arrIndex] = input;
                data.appendChild(input);
                row.appendChild(data);
            }

            table[0].appendChild(row);
        }
    }
}

function SetInput(input, index){

    // 1a ar i laukus ivesti teigiami sveikieji skaiciai (is esmes ten nieko ir neleidzia vesti, apart
    //skaiciu, kadangi virsuj aprasytas regexas yra 1-9)
    input.addEventListener("input", (e)=>{  

        if(!(INPUT_REGEX.test(e.target.value))){

            e.target.value =  e.target.value.slice(0, -1);
        }
    });
    
    if(board[index] !== 'x'){

        input.value = board[index];
        input.disabled = true;
        // 3b inputui priskiriama prefilled klase
        input.classList.add(PRE_FILLED_CLASS);          
    }
}

function ResetInput(){

    ToggleError(false);
    ToggleSuccess(false);
    
    for(let i = 0; i < board.length; i++){

        if(board[i] !== 'x'){

            refToBoard[i].value = board[i];
        }
        else{

            refToBoard[i].value = '';
        }
    }
}

function SubmitData(){

    let sumbitedData = [];
    // 1b ar visi laukai yra uzpildyti (net jei ir vienas laukas neuzpildytas, bus blogai)
    for(let i = 0; i < board.length; i++){

        if(refToBoard[i].value === ''){

            ShowError("Uzpildyk visas reiksmes!");
            return;
        }

        sumbitedData[i] = refToBoard[i].value;
    }

    ToggleError(false);
    sumbitedData = sumbitedData.join('');
    if(board_solution === ""){

        GetSolutionData().then(jsonData => {

            board_solution = jsonData.solution;
            checkSolution(sumbitedData);
        });
    }
    else{

        checkSolution(sumbitedData);
    }
}

//3a tekstinio turinio pakeitimas, tai tarkim success bloke kur yra tuscias <p></p> ten bus irasytas
// naujas tekstas
function checkSolution(solution){

    if(solution === board_solution){

        ShowSuccess("Sprendimas teisingas!")
    }
    else{

        ShowError("Sprendimas neteisingas!");
    }
}

function ShowError(text){

    $(errBlock).text(text);
    ToggleError(true);
    ToggleSuccess(false);
}

function ToggleError(show){
    // 2 Klaidu bloku paslepimas/parodymas (taip pat ir ToggleSuccess)
    if(show){

        errBlock.show();
    }
    else{

        errBlock.hide();
    }
}

function ShowSuccess(text){
    
    $(succBlock).text(text);
    ToggleSuccess(true);
    ToggleError(false);
}

function ToggleSuccess(show){

    if(show){

        succBlock.classList.remove(HIDE_CLASS);
    }
    else{

        succBlock.classList.add(HIDE_CLASS);
    }
}

function FillData(){

    if(board_solution === ""){

        GetSolutionData().then(jsonData => {

            board_solution = jsonData.solution;
            for(let i = 0; i < board.length; i++){

                refToBoard[i].value = board_solution[i];
            }
        });
    } 
    else{

        for(let i = 0; i < board.length; i++){

            refToBoard[i].value = board_solution[i];
        }
    }
}

//4ab issitraukiam pradinius lentos duomenis is linko, ir returninam data.
async function GetBoardData() {

    try{

        const response = await fetch('https://6550e0cc7d203ab6626e476a.mockapi.io/api/v1/SudokuBoard/1');  
        
        if (!response.ok) {

            throw new Error('Klaida, gaunant pradinius duomenis');
        }

        const data = response.json();

        return data;
    } 
    catch (error) {

        console.error('Klaida: ', error.message);
    }
}

//4ab issitraukiam atsakymo duomenis ir returninam data
async function GetSolutionData() {
    try{

        const response = await fetch('https://6550e0cc7d203ab6626e476a.mockapi.io/api/v1/SudokuSolutions/1');  
        
        if (!response.ok) {

            throw new Error('Klaida gaunant atsakyma');
        }

        const data = response.json();

        return data;
    }
    catch (error) {

        console.error('Klaida: ', error.message);
    }
}

/*Del 4b, tai tokio kaip atskiro punkto kaip ir nera, kadangi lentele yra sugeneruojama pacioj pradzioj
GetBoardData.then ... ir tada inicializuojam pacia sudoku lenta. I ja ivedami duomenys, 
o paspaudus pateikti mygtuka, isvedamas pranesimas, ar teisingas atsakymas ar ne
*/