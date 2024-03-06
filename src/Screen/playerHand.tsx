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

const PlayerHands: React.FC<{ playerHands: string[][], cardsShown: boolean, roundsPlayed: number, playerMoney: Iplayer[], setPlayerMoney: React.Dispatch<React.SetStateAction<Iplayer[]>>, pot: number, setPot: React.Dispatch<React.SetStateAction<number>>, setWinner: React.Dispatch<React.SetStateAction<number>>, setDisplayMsg: React.Dispatch<React.SetStateAction<string>> , isTimeToDeal: boolean, flop: string[], setPlayersFoldedApp: React.Dispatch<React.SetStateAction<number[]>> }> = ({playerHands, cardsShown, roundsPlayed, playerMoney, setPlayerMoney, pot, setPot, setWinner, setDisplayMsg, isTimeToDeal, flop, setPlayersFoldedApp} ) => {

    const [ dealerPos, setDealerPos ] = useState<number>(roundsPlayed%playerHands.length !== 0 ? roundsPlayed%playerHands.length : playerHands.length);
    const [ showBetInput, setShowBetInput ] = useState<boolean>(true);
    const [ playerPlaying, setPlayerPlaying ] = useState<number>( dealerPos !== playerHands.length ? dealerPos + 1 : 1);
    
    // bets and player variables
    const [ betsBeforeNextCard, setBetsBeforeNextCard ] = useState<IcurrentBets[]>([]);
    const [ currentBet, setCurrentBet ] = useState<number>();
    const [ playersChecked, setPlayersChecked ] = useState<number[]>([]);
    const [ latestBetIndex, setLatestBetIndex ] = useState<number>();
    const [ lastCallIndex, setLastCallIndex ] = useState<number>();
    const [ lastCheckIndex, setLastCheckIndex ] = useState<number>();
    const [ playersFolded, setPlayersFolded ] = useState<number[]>([]);
    const [ possibleMoves, setPossibleMoves ] = useState<string[]>(['Bet', 'Check', 'Fold']);

    const findWhoPlaysNext = (start = 0) => {

        let nextPlayer = start;

        do {
        nextPlayer !== 0 ? nextPlayer += 1 : nextPlayer = playerPlaying + 1; 
        
            if(nextPlayer > playerHands.length ){
            nextPlayer = 1;
        }

        } while (playersFolded.includes(nextPlayer) || nextPlayer == 0 )

        setPlayerPlaying(nextPlayer);

        return nextPlayer;
    }

    // handles the selected option
    const handleSelectedOption = (event: React.ChangeEvent<HTMLSelectElement>, index: number) => {
        event.preventDefault();
        const playerChoice = event.currentTarget.value;

        if( playerChoice === 'Bet' || playerChoice === 'Raise') {
            setShowBetInput(!showBetInput);
        }

        // ~~~~~~ HANDLE CHECK ~~~~~~~
        if ( playerChoice === 'Check') {

            // const nextPlayer = findWhoPlaysNext()
            console.log(`findWhoPlaysNext ${findWhoPlaysNext()}`);
            setPlayerPlaying(findWhoPlaysNext());

            const tempChecked = playersChecked;

            tempChecked.push(index+1);
            setPlayersChecked(tempChecked);
            setLastCheckIndex(index+1);

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
                    console.log(`player ${index + 1} called ${(Math.abs(newBets[latestBetIndex].playerBet - betsBeforeNextCard[player.playerIndex].playerBet))} in the pot`);
                    // console.log(`player 1 ${newBets[0].playerBet ? newBets[0].playerBet : newBets[0].playerIndex} player 2 ${newBets[1].playerBet ? newBets[1].playerBet : newBets[1].playerIndex} player 3 ${newBets[2].playerBet ? newBets[2].playerBet : newBets[2].playerIndex}`);
                    console.log(`Latest bet ${currentBet}`);
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
            
            //set last player called
            setLastCallIndex(index + 1);
            
            setPlayerPlaying(findWhoPlaysNext());
        }
         // ~~~~~~ HANDLE FOLD ~~~~~~~
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
        // callers and checkers have to be settled again
        setLastCallIndex(-1);
        setLastCheckIndex(-1);

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
            console.log(`current player ${playerInd} his newBet obj ${newBets[playerInd].playerBet} last bet ${lastBet}`);   
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
        
        setPlayerPlaying( nextPlayerIndex(currentPlayers, playerPlaying) );
        console.log(`The next player is ${playerPlaying} and the players that have folded are ${playersFolded}`);
        // if all players had spoken
        setPossibleMoves( ['Raise', 'Call', 'Fold'] )
    }

    // handles player's fold
    const handleFold = ( playerInd: number ) => {

        const tempFoldedPlayers = [...playersFolded];
        tempFoldedPlayers?.push(playerInd+1);
        setPlayersFolded(tempFoldedPlayers);
        setPlayersFoldedApp(tempFoldedPlayers);

        // Sets the next player
        const currentPlayers = [];

        for(let i = 1; i<= playerHands.length; i++){
            if(!tempFoldedPlayers.includes(i)) currentPlayers.push(i);
        }
        const nextPlayer = nextPlayerIndex(currentPlayers, playerPlaying);
        // Do we have a winner?
        if( currentPlayers.length === 1 ) {
            setWinner(currentPlayers[0]);
            setPlayerPlaying(-5);
            console.log('the game should stop');
            setDisplayMsg(`Player ${currentPlayers[0]} wins.`);
            return;
        }
        setPlayerPlaying(nextPlayer);
    }

    useEffect(() => {
        // Who is the dealer?
        setDealerPos(roundsPlayed%playerHands.length !== 0 ? roundsPlayed%playerHands.length : playerHands.length);

        // Who moves?
        setPlayerPlaying(dealerPos !== playerHands.length ? dealerPos + 1 : 1);
        console.log('I changed player playing');
        setPlayersFolded([]);
        // Set the current bets
        for(let i = 1; i<= playerHands.length; i++){
            betsBeforeNextCard[i] = {playerIndex: i, playerBet: 0};
          }            
    },[roundsPlayed, playerHands, playerHands.length, dealerPos])

    // Checks wether all players had spoken
    useEffect(() => {
        console.log(`latest bet index ${latestBetIndex} betting money ${currentBet} player playing ${playerPlaying} players checked ${playersChecked} players folded ${playersFolded}`);
        if( ( latestBetIndex === playerPlaying && latestBetIndex > 0 ) || ( playersChecked[0] === playerPlaying && playerPlaying > 0 && latestBetIndex <= 0 ) || ( lastCallIndex === playerPlaying && lastCallIndex > 0 ) || (lastCheckIndex === playerPlaying && lastCheckIndex > 0 && latestBetIndex <= 0 ) ) {
            console.log(`ENTERED HERE WITH ${latestBetIndex === playerPlaying} OR ${playersChecked.slice(-1)[0] === playerPlaying} OR ${lastCallIndex === playerPlaying} OR ${lastCheckIndex === playerPlaying}`);

            setPlayerPlaying(0);
            setLastCallIndex(-1);
            setLastCheckIndex(-1);
            setShowBetInput(true);
            setCurrentBet(1);
        } 
    }, [ latestBetIndex, lastCallIndex, lastCheckIndex, playersChecked, setDisplayMsg, playersFolded ])

    // Responsible for changing variables when the next card is dealt
    useEffect(() => {

        const nextPlayerPos = dealerPos !== playerHands.length ? dealerPos + 1 : 1;
        setPossibleMoves(['Bet', 'Check', 'Fold']);
        setPlayersChecked([]);
        setLatestBetIndex(-1);
        setLastCallIndex(-1);
        setLastCheckIndex(-1);

        if ( !playersFolded.includes(nextPlayerPos) ) {
            setPlayerPlaying(nextPlayerPos);
            console.log(`i set the player ${nextPlayerPos}`);
        } else {
            const next = findWhoPlaysNext(dealerPos + 1)
            setPlayerPlaying(next);
            console.log(`i set the player ${next}`);
        }

        if(flop.length < 5 ) {
            setDisplayMsg('Let`s deal the next card');
        } else {
            setDisplayMsg('');
        }
        setPossibleMoves(['Bet', 'Check', 'Fold']);
    }, [ flop ])
    
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