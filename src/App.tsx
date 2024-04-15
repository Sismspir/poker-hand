import { hand }  from './poker-functions/pokerhand';
import PlayerHand from './Screen/playerHand';
import  mainDeck  from './assets/imgs/mainDeck.png';
import { generate }  from './poker-functions/generatedeck';
import moving from './assets/imgs/moving.png'
import avatar from './assets/imgs/avatar.png'
import { useEffect, useState } from 'react';
import './App.css';

interface Iplayer {
  playerIndex: number;
  playerMoney: number;
}

type MyFunctionType = () => void;

const ControlBtn: React.FC<{ action: MyFunctionType, text: string, bgColor: string }> = ({action, text, bgColor}) => {
  const hovBg = bgColor.slice(0,7) + (parseInt(bgColor.slice(7)) - 200).toString();

  return(
    <button onClick={action} className={`p-2 ${bgColor} rounded-xl`}>{text}</button>
  )
}

function App() {

  const [ playerMoney, setPlayerMoney ] = useState<Iplayer[]>([]);
  const [ round, setRound ] = useState<number>(1);
  const [ playerHands, setplayerHands ] = useState<string[][]>([]);
  const [ isFirstAnimationComplete, setIsFirstAnimationComplete ] = useState(false);
  const [ foldedPlayersApp, setPlayersFoldedApp ] = useState<number[]>([]);
  const [ displayMsg, setDisplayMsg ] = useState<string>("Welcome to our table!");
  const [ shownmsg, setShownmsg ] = useState<boolean>(false);
  const [ flopReady, setFlopReady ] = useState<boolean>(false);
  const [ showCards, setShowCards ] = useState<boolean>(false);
  const [ activeAnim, setActiveAnim ] = useState<boolean>(false);
  const [ isTimeToDeal, setIsTimeToDeal ] = useState<boolean>(false);
  const [ gameSet, setGameSet ] = useState<boolean>(false);
  const [ playersNo, setPlayersNo ] = useState<number>();
  const [ winner, setWinner ] = useState<number>(0);
  const [ flop, setFlop ] = useState<string[]>([]);
  const [ pot, setPot ] = useState<number>(0);
  const [ deck, setDeck ] = useState(generate());

  const handleSetNo = (event: React.ChangeEvent<HTMLSelectElement>) =>{

    if (event.target.value !== undefined ) {

      setPlayersNo(parseInt(event.target.value));

      // initialize each player's money 
      const playerArr: Iplayer[] = [...playerMoney];

      for(let i = 0; i< parseInt(event.target.value); i++){
        playerArr[i] = {playerIndex: i+1, playerMoney: 4000 };
      }  
      
      setPlayerMoney(playerArr); 
    }  
  }
  const dealPlayer = () => {
    if( playersNo !== undefined) {

      setActiveAnim(true)
      setTimeout(() => { setActiveAnim(false), setplayerHands(updateArr) }, 2000);

      const updateArr = [...playerHands];
      
      for(let i = 0; i< playersNo; i++){
        const card1:string = deck.shift() as string;
        const card2:string = deck.shift() as string;
        const myTempArr = [card1, card2];
        
        updateArr[i] = myTempArr;
      }   
    }
   
  }
  const dealFlop = () => {
    setFlopReady(true);

    const card1:string = deck.shift() as string;
    const card2:string = deck.shift() as string; 
    const card3:string = deck.shift() as string;

    setTimeout(() => { setFlop([card1, card2, card3]), setFlopReady(false); }, 600);
    setIsTimeToDeal(false);
  }
  const dealNext = () => {

    setFlopReady(true);
    const card4:string = deck.shift() as string;
    const tempFlop = flop;
    tempFlop.push(card4);
    setTimeout(() => {  setFlop([...tempFlop]), setFlopReady(false); }, 300)

    if(flop.length == 5) console.log("should find winner");
    setIsTimeToDeal(false);
  }
  const showPlayerCards = () => {
    setShownmsg(!shownmsg);
    setShowCards(!showCards);
  }
  const findWinner = (plHands: string[][], board: string[]) =>{

  const hierarchy = ['nothing', 'pair', 'two pair', 'three-of-a-kind', 'straight', 'flush', 'full house', 'four-of-a-kind',' straight-flush'];

  let winner: number = 0;
  const winners: string[][] = [];
  let winningIndex = 0;
  
  // filter for foldded players
  plHands = plHands.filter((hand) => {
    console.log(hand, plHands.indexOf(hand));
    if (!foldedPlayersApp.includes(plHands.indexOf(hand) + 1)) {
      return hand;
    }}
  )

  for(const cards of plHands){
    console.log( `the following cards ${cards} have`, hand(cards, board).type, `with ranks ${hand(cards, board).ranks}`);

    const currentCombo = hand(cards, board).type;

    if(typeof currentCombo == 'string' && hierarchy.indexOf(currentCombo) > winningIndex){

      winners.push([cards, hand(cards, board).ranks]);
      winningIndex = hierarchy.indexOf(currentCombo);

    } else if(typeof currentCombo == 'string' && hierarchy.indexOf(currentCombo) == winningIndex){

      winners?.push([cards, hand(cards, board).ranks]);

    }
  }
  if(winners.length < 2 && winners.length > 0) setTimeout(() => {
    setDisplayMsg(`The winner is player ${playerHands.indexOf(winners[0][0]) + 1} with: ${winners[0][0]}. His rankings: ${winners[0][1]}`);
    winner = playerHands.indexOf(winners[0][0]) + 1;
  }, 500)

  if (winners.length === 1 ) winner = playerHands.indexOf(winners[0][0]) + 1;
  console.log('the winners are', winners);

  if(winners.length >= 2){
      console.log("lets find out the kicker winner");
      
      const ranksHierarchy = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
      let finalWinner;
      const rankingListLength = winners[0][1].length;

      for(let i=0; i< rankingListLength; i++){
        
        let winningIndex = ranksHierarchy.indexOf(winners[0][1][i]);
        finalWinner = winners[0]; 
        let winnerFound = true;
        const loopLength = winners.length;
    
        for(let j = 1; j< loopLength; j++){

          const currentRanksList = winners[j][1];

          if( ranksHierarchy.indexOf(currentRanksList[i]) > winningIndex ){

              finalWinner = winners[j];
              winningIndex = ranksHierarchy.indexOf(currentRanksList[i]);
              console.log("possbile winner is", winners[j], "with j", j, "and i", i);

          }else if( ranksHierarchy.indexOf(currentRanksList[i]) == winningIndex ){
            winnerFound = false;
            console.log("The same index was found at index", ranksHierarchy.indexOf(currentRanksList[i]), "with current index", winningIndex, "with j", j, "and i", i);
          }             
        }
        
        if(winnerFound) {
          setDisplayMsg(`SAME rank case. the winner finally is, player ${playerHands.indexOf( finalWinner[0]) + 1} with hand ${finalWinner[0]} and its rankings are: ${finalWinner[1]}`);
          setWinner(playerHands.indexOf( finalWinner[0]) + 1);
          break;
        }

        for(let k = 0; k< winners.length; k++){
          if(ranksHierarchy.indexOf(winners[k][1][i]) < winningIndex){
            winners.splice(k,1);
          }
        }
        // draw
        if( rankingListLength === i+1 ){
          let cardsString = '';
          for (let k = 0; k < winners.length; k++){
            cardsString+= (winners[k][0]).toString() + " and ";
          }
          cardsString = cardsString.slice(0, cardsString.length - 4);
          setDisplayMsg(`We have a draw between ${cardsString}. The players should split the pot.`);
        }

      }
    } 

  console.log(`the winner (${winner}) gets ${pot}`);
  }
  const startNewRound = () => {
    // set the rest properties
    setRound(round+1);
    setActiveAnim(false);
    setDisplayMsg('');
    setplayerHands([])
    setDeck(generate())
    setFlop([]);
    setPot(0);
    setWinner(0);
    setPlayersFoldedApp([]);
  }
  const handleFirstAnimationEnd = () => {
    setIsFirstAnimationComplete(!isFirstAnimationComplete);
  };

  useEffect(() => {

    if (winner !== 0 && isTimeToDeal ) setDisplayMsg(`Player ${winner} wins ${pot} $`);
    if (flop.length === 5) {
        // pay the winner 
        const tempMoneyArr = playerMoney;
        const finalMoneyArr = tempMoneyArr.map((obj) => {
          if (obj.playerIndex === winner ) {
            console.log(`obj.player.index ${obj.playerIndex} and winner ${winner}`);
            return {
              ...obj,
              playerMoney: obj.playerMoney + pot,
            };
          }
          return obj;
        })

        setPlayerMoney(finalMoneyArr);
    }
  }, [winner, pot, playerHands, isTimeToDeal])

  return (
    < div className='bg-black flex flex-col min-h-screen space-y-[85px] font-serif'>
      <div className='bg-[#292b2b] w-full min-h-[5rem] text-center font-serif p-2 flex-1 flex flex-col items-center justify-center relative'>
          <div className='absolute top-2 left-2 px-4 py-1 text-white text-lg italic font-bold rounded-md bg-red-400'>Round: {round} </div>
          <div className='font-semibold text-lg text-[#e7dddd]'>{displayMsg}</div>
      </div>
        
      <div className='h-[420px] min-h-[400px] flex items-center justify-center space-x-2 mx-4'>
        <div className="w-full text-black-500 text-center font-serif h-full bg-green-700 border-[1rem] border-gray-400 rounded-full p-2 flex items-center justify-center relative">
        {pot !== 0 ? <div className='absolute mb-80 border-2 border-[#0e0c33] rounded-xl p-2 font-serif text-[#fdfdfa] bg-slate-700'>Pot: {pot} $ </div> : <></>}
        <div className='absolute w-[5rem] mt-56 rotate-45'>
          <img className='absolute h-[7rem]' src={mainDeck} alt="img" />
          <img onAnimationEnd={handleFirstAnimationEnd} className={`absolute -rotate-45 ${activeAnim ? isFirstAnimationComplete ? 'animate-slideinX' : "animate-slideinY" : flopReady && "animate-slideinFlop transform"}`} src={moving} alt="img1" />
        </div>
        <div className='absolute mt-72 ml-28'>
          <img className='h-[5.5rem]' src={avatar} alt="img2" />
        </div>
        <PlayerHand playerHands={playerHands} cardsShown={showCards} roundsPlayed={round} playerMoney={playerMoney} setPlayerMoney={setPlayerMoney} pot={pot} setPot={setPot} setWinner={setWinner} setDisplayMsg={setDisplayMsg} isTimeToDeal={isTimeToDeal} flop={flop} setPlayersFoldedApp={setPlayersFoldedApp}/>
        
  {/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ FLOP ~~~~~~~~~~~~~~~~~~~~~~~~~~ */}
        <div className='flex space-x-3 text-pre '>{flop.map( (card, i) => <div key={i} className='bg-white px-1 pt-2 pb-1 rounded-md border border-black shadow-2xl'>{
            <div className={`flex-col w-[65px] h-[110px] -mt-2 ${['♦', '♥'].includes(card.slice(-1)) ? 'text-red-500' : 'text-black'} `}>
              <div className='flex space-x-1'>
                <div className='flex-col'>
                  <div className='m-0 -mb-2 text-lg font-medium'>{card.slice(0,card.length-1)}</div>
                  <div className='text-xl row-start-2'>{card.slice(-1)}</div>
                </div>
                <div className='border-2 border-red-500 invisible'>I am invisible</div>
              </div>
              <div className='-mt-20 flex flex-col mx-1'>
                <div className='border-2 border-red-500 invisible'>I am invisible</div>
                <div key={i} className={`text-xs grid grid-cols-2`}>
                    {Array.from({ length: parseInt(card.slice(0, (card.length-1)  ) ) > 0 ? parseInt(card.slice(0, card.length-1)) : 1 }).map((_, i) => (
                      <div className={ ['A', 'K', 'Q', 'J'].includes(card.slice(0, (card.length-1)) ) ? `text-3xl ml-5 mt-4` : `text-md` } key={i}>{card.slice(-1)}</div>
                    ))}
                </div>
              </div>
            </div>
          }</div>)}
        </div>
  {/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ SET UP THE GAME ~~~~~~~~~~~~~~~~~~~~~~~~~~ */}
        </div>
      </div>
      { gameSet ? 
      ( <div className='mx-auto w-5/6 text-center text-white font-serif p-2 flex-1 flex items-center justify-center space-x-1 bg-[#24262e] rounded-t-[10rem]'>
          { flop.length < 3 && winner === 0 ? 
          <> 
           <ControlBtn action={dealPlayer} text={'Deal Players'} bgColor={'bg-red-600'}/>
           <ControlBtn action={dealFlop} text={'Deal Flop'} bgColor={'bg-red-500'}/>
          </> : <></> }
          { flop.length < 5 && winner === 0 ?  <ControlBtn action={dealNext} text={'Deal Next'} bgColor={'bg-red-600'}/> : <></> }
          { flop.length === 5  ? <ControlBtn action={startNewRound} text={'New round'} bgColor={'bg-red-500'}/> : <></> }
          <ControlBtn action={showPlayerCards}  text = {!showCards ? 'Reveal Cards' : 'Hide Cards'} bgColor={'bg-red-600'}/>
          { flop.length === 5  ? <ControlBtn action={() => {findWinner(playerHands, flop)}} text={'Find Winner'} bgColor={'bg-red-500'}/> : <></> }          
      </div> )
      : ( <div className='mx-auto border-t-2 w-1/2 text-center text-white bg-[#181717] rounded-t-2xl font-serif p-2 flex-1 flex items-center justify-center'>
          <div className='flex flex-col items-center'>
          <div className='italic mx-auto'>Choose the number of players:</div>
            <select className='w-[70%] pb-1 mt-2 text-center bg-[#4d517c] text-lg font-medium italic rounded-md focus:outline-none' onChange={handleSetNo} value={playersNo}>
            <option disabled selected> - Players no - </option>
              {[...Array(4)].map((_,index) => (
              <option className='' key={index + 1} value={index + 1} >{index + 1}</option>
              ))}
            </select>
            <button  onClick={() => {setGameSet(true)}} className='bg-[#40405c] mt-6 rounded-md w-1/2 items-center p-1 hover:bg-[#746c7e] hover:font-semibold '>Start game</button>
          </div>
        </div> ) 
      }
    </div >
  )
}

export default App
