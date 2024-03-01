import { TbSquareRoundedLetterX } from "react-icons/tb";
import cardeck from '../assets/imgs/cardeck2.png'
import cardeck1 from '../assets/imgs/cardeck1.png';
import dealer from '../assets/imgs//dealer.png';
import { useEffect, useState } from 'react';
import { nextPlayerIndex } from "../poker-functions/blinds";

interface Iplayer {
    playerIndex: number;
    playerMoney: number;
  }

interface IcurrentBets{
    playerIndex: number;
    playerBet: number;
}

const PlayerHands: React.FC<{ playerHands: string[][], cardsShown: boolean, roundsPlayed: number, playerMoney: Iplayer[], setPlayerMoney: React.Dispatch<React.SetStateAction<Iplayer[]>>, pot: number, setPot: React.Dispatch<React.SetStateAction<number>>, setWinner: React.Dispatch<React.SetStateAction<number>>, setDisplayMsg: React.Dispatch<React.SetStateAction<string>> , isTimeToDeal: boolean, setIsTimeToDeal: React.Dispatch<React.SetStateAction<boolean>> }> = ({playerHands, cardsShown, roundsPlayed, playerMoney, setPlayerMoney, pot, setPot, setWinner, setDisplayMsg, isTimeToDeal, setIsTimeToDeal} ) => {

    const [ dealerPos, setDealerPos ] = useState<number>(roundsPlayed%playerHands.length !== 0 ? roundsPlayed%playerHands.length : playerHands.length);
    const [ showBetInput, setShowBetInput ] = useState<boolean>(true);
    const [ playerPlaying, setPlayerPlaying ] = useState<number>( dealerPos !== playerHands.length ? dealerPos + 1 : 1);
    
    // bets and player variables
    const [ betsBeforeNextCard, setBetsBeforeNextCard ] = useState<IcurrentBets[]>([]);
    const [ currentBet, setCurrentBet ] = useState<number>();
    const [ playersChecked, setPlayersChecked ] = useState<number[]>([]);
    const [ latestBetIndex, setLatestBetIndex ] = useState<number>();
    const [ playersFolded, setPlayersFolded ] = useState<number[]>([]);
    const [ possibleMoves, setPossibleMoves ] = useState<string[]>(['Bet', 'Check', 'Fold']);

    // handles the selected option
    const handleSelectedOption = (event: React.ChangeEvent<HTMLSelectElement>, index: number) => {
        event.preventDefault();
        const playerChoice = event.currentTarget.value;

        if( playerChoice === 'Bet' || playerChoice === 'Raise') {
            setShowBetInput(!showBetInput);
            console.log(`The player ${index} just put made a ${playerChoice}`);
        }

        // ~~~~~~ HANDLE CHECK ~~~~~~~
        if ( playerChoice === 'Check') {

            let nextPlayer = 0;

            do {
            nextPlayer !== 0 ? nextPlayer += 1 : nextPlayer = playerPlaying + 1; 
            
             if(nextPlayer > playerHands.length ){
                nextPlayer = 1;
            }

            console.log(`current player: ${playerPlaying} next Player ${nextPlayer}`);

            } while (playersFolded.includes(nextPlayer))

            setPlayerPlaying(nextPlayer);

            const tempChecked = playersChecked;   
            if(nextPlayer === tempChecked[0]){
                setLatestBetIndex(-1);
            }
            
            tempChecked.push(index+1);
            setPlayersChecked(tempChecked);
        }

        // ~~~~~~ HANDLE CALL ~~~~~~~
        if ( playerChoice === 'Call' && currentBet !== undefined ) {

            // setCurrentBets
            const tempBets = betsBeforeNextCard;
            const newBets = tempBets.map((obj) => {
                if( obj.playerIndex === index+1 ) return { ...obj, ['playerBet']: obj.playerBet + currentBet}
                return obj;
            })

            setBetsBeforeNextCard(newBets);

            // set player's changed money
            const tempMoney = [...playerMoney];
            const newMoney = tempMoney.map(player => { if( player.playerIndex === playerPlaying) {
                // check if the player can handle the bet
                if( currentBet > player.playerMoney ) {
                    console.log("Not enough money left");    
                } else{
                    //I have to find the previous player's total money bet ( newBets[player.playerIndex].playerBet == currentBet ) and substract the money the current player has already bet
                    console.log(`lastBettingIndex: ${latestBetIndex} with newBets[latestBetIndex].playerBet: ${newBets[latestBetIndex].playerBet} and current player Playing: (${playerPlaying}) bets after calling -  newBets[player.playerIndex].playerBet}: ${newBets[player.playerIndex].playerBet} and betsBeforeNextCard ${betsBeforeNextCard[player.playerIndex].playerBet}`);
                    return { ...player, ['playerMoney']: player.playerMoney - (Math.abs(newBets[latestBetIndex].playerBet - betsBeforeNextCard[player.playerIndex].playerBet))                        
                     } }  
                }
            return player; } );

            setPlayerMoney(newMoney);

            if(newBets[playerPlaying].playerBet == currentBet) {
                setPot(pot + currentBet)
            } else {
                setPot(pot + Math.abs(newBets[latestBetIndex].playerBet - betsBeforeNextCard[playerPlaying].playerBet));
            }
        
            setPlayerPlaying(playerPlaying !== playerHands.length ? playerPlaying + 1 : 1);
        }

        if ( playerChoice === 'Fold') handleFold(index);
    }

    // handles player's bet
    const handleBet = (event: React.FormEvent<HTMLFormElement>, playerInd: number) => {
        event.preventDefault();
        let lastBet = event.currentTarget.bet.value;
        if ( lastBet == "" || isNaN(lastBet)) lastBet = 0;
        console.log(`Player ${playerInd } is going to put ${lastBet} in the pot`);
        setCurrentBet(parseInt(lastBet));
        setLatestBetIndex(playerInd);

        // setCurrentBets
        const tempBets = betsBeforeNextCard;
        const newBets = tempBets.map((obj) => {
            if( obj.playerIndex === playerInd ) return { ...obj, ['playerBet']: obj.playerBet + parseInt(lastBet)}
            return obj;
        })
        setBetsBeforeNextCard(newBets);

        console.log(`bets object:` , newBets[1], newBets[2], newBets[3], newBets[4]);
        // set player's changed money
        const tempMoney = [...playerMoney];
        const newMoney = tempMoney.map(player => { 

            if( player.playerIndex === playerInd) {
            // check if the player can handle the bet
            if( lastBet > player.playerMoney ) console.log("Not enough money left");    
            return { ...player, ['playerMoney']: (player.playerMoney - lastBet) } }  
        return player; } );

        setPlayerMoney(newMoney);
        
        setPot(pot+ parseInt(lastBet));

        setShowBetInput(!showBetInput);
        // Sets the next player
        const currentPlayers = [];

        for(let i = 1; i<= playerHands.length; i++){
            if(!playersFolded.includes(i)) currentPlayers.push(i);
        }
        // if( currentPlayers.length === 1 ) setWinner(currentPlayers[0]);
        setPlayerPlaying( nextPlayerIndex(currentPlayers, playerPlaying) );
        // if all players had spoken
        setPossibleMoves( ['Raise', 'Call', 'Fold'] )
    }

    // handles player's fold
    const handleFold = ( playerInd: number ) => {

        const tempFoldedPlayers = [...playersFolded];
        tempFoldedPlayers?.push(playerInd+1);
        setPlayersFolded(tempFoldedPlayers);
        console.log(`players folded  ${tempFoldedPlayers}`);
        // Sets the next player
        const currentPlayers = [];

        for(let i = 1; i<= playerHands.length; i++){
            if(!tempFoldedPlayers.includes(i)) currentPlayers.push(i);
        }
        const nextPlayer = nextPlayerIndex(currentPlayers, playerPlaying);
        // Do we have a winner?
        if( currentPlayers.length === 1 ) setWinner(currentPlayers[0]);

        setPlayerPlaying(nextPlayer);
        console.log("the next player is", nextPlayer, "the pot is", pot);
    }

    useEffect(() => {
        // Who is the dealer?
        setDealerPos(roundsPlayed%playerHands.length !== 0 ? roundsPlayed%playerHands.length : playerHands.length);

        // Who moves?
        setPlayerPlaying(dealerPos !== playerHands.length ? dealerPos + 1 : 1);
        setPlayersFolded([]);

        // Set the current bets
        for(let i = 1; i<= playerHands.length; i++){
            betsBeforeNextCard[i] = {playerIndex: i, playerBet: 0};
          }            
    },[roundsPlayed, playerHands, playerHands.length, dealerPos])

    // Checks wether all players had spoken
    useEffect(() => {
        
        if(latestBetIndex === playerPlaying) {
            setDisplayMsg('Let`s deal the next card');
            setPossibleMoves(['Bet', 'Check', 'Fold'])
            setIsTimeToDeal(true);
            setShowBetInput(true)
            setLatestBetIndex(-1);
            setPlayerPlaying(playersChecked[-1])
            setCurrentBet(1);
        }
    }, [latestBetIndex, playerPlaying])
    
    return(
       <>
        { playerHands.map((hand, ind) => (        
        <div key={ind} className={`text-white ${[0].includes(ind) ? `absolute top-8 left-24 rotate-45` : [1].includes(ind) ? `absolute top-8 left-[78vw] -rotate-45 ` : ind == 2 ? `absolute top-52 left-24 rotate-45` : `absolute top-52 left-[78vw] -rotate-45 `}`}>
            <div className={`rounded-full ${playersFolded?.includes(ind+1) ? 'bg-red-400' : 'bg-slate-500'} text-nowrap border-2 border-black px-4 py-1 flex ${[0,2].includes(ind) ? `-rotate-45 absolute bottom-20 left-28` : `rotate-45 absolute bottom-20 right-32`}`}>
                {ind + 1 === playerPlaying && playerHands.length !== 1 && !playersFolded?.includes(ind+1) && !isTimeToDeal ? (
                <div className="">
                    <p className="mt-1">Your turn</p>
                    {showBetInput ? 

                    (<select onChange={(event) => handleSelectedOption(event, ind)} className='bg-slate-700' name="" id="">
                        <option disabled selected>Pick a move</option>
                        {possibleMoves.map((move, index) =>(
                            <option key={index} className='text-white' value={`${move}`}>{move}</option>
                        ))}
                    </select>)

                     : ( <form onSubmit = {(event) => handleBet(event, playerPlaying)}

                     className='flex flex-col mx-auto space-y-2 p-2 items-center'>
                            <input className="bg-gray-600 text-[#ffffff] font-mono text-center rounded-md border-2 border-gray-900 w-full" defaultValue="Bet" name="bet" min={currentBet} type="number"/>
                            <div className='flex space-x-2'>
                                <input className="bg-green-700 hover:bg-green-600 hover:cursor-pointer rounded-xl px-3 py-1 border border-gray-900" value="Bet" type="submit"/>
                                <button onClick={() => {setShowBetInput(!showBetInput)}} className='bg-red-500 hover:bg-red-400 hover:cursor-pointer rounded-xl border border-gray-900 flex justify-center text-gray-800 text-2xl p-1 '><TbSquareRoundedLetterX /></button>
                            </div>
                        </form>)} 
                </div>) :  

                <div className='text-[#ffffff] font-mono'>{ playerMoney.find(player => { return player.playerIndex === ind + 1})?.playerMoney } $
                {playersFolded?.includes(ind+1) && <p>Fold</p>}</div>}
            </div>
            <div className="text-lg flex items-center justify-center space-x-2">
                <div>Player {ind+1}</div>
                <div className='bg-slate-200 rounded-3xl shadow-3xl my-2'>{dealerPos === ind+1 && (<img className='w-[3.2rem]' src={dealer} alt='dealer'/>)}</div>
            </div>
            { cardsShown ? <p className={`flex space-x-3 ${playersFolded?.includes(ind+1) ? 'opacity-55' : ''}`}> { hand.map( (card, i) =>           
                <div className={`bg-white px-1 pt-2 pb-1 rounded-md border border-black shadow-2xl`}>
                <div className={`flex-col w-[40px] h-[80px] -mt-2 ${['♦', '♥'].includes(card.slice(-1)) ? 'text-red-500' : 'text-black'} `}>
                <div className='flex space-x-1'>
                    <div className='flex-col'>                    
                    <div key={i} className='m-0 -mb-2 text-lg font-medium'>{card.slice(0,card.length-1)}</div>
                    <div className='text-2xl row-start-2'>{card.slice(-1)}</div>
                    </div>
                    <div className='border-2 border-red-500 invisible'>I am invisible</div>
                </div>
                    <div className='-mt-16 grid px-1 pb-1'>
                    </div>
                </div>
                </div>) }
            </p> : (ind + 1) % 2 === 0 ? <div className={`w-[5.7rem] ${playersFolded?.includes(ind+1) ? 'opacity-55' : ''}`}><img src={cardeck} alt="img" /></div> : <div className={`w-[6.5rem] ${playersFolded?.includes(ind+1) ? 'opacity-55' : ''}`}><img src={cardeck1} alt="img" /></div>}
        </div> 
        )) 
       }
      </> 
    )
}

export default PlayerHands;