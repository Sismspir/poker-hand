export function hand(holeCards: string[], communityCards: string[]) {

  const hierarchy: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let finalType: string | undefined = "nothing";  
  let finalRanks: boolean | (string | number)[] = ["ok"]

  //check flush
  function hasFlush(holeCards: string[], communityCards: string[]) {
    
    const colors: string[]  = ['♠', '♦', '♥', '♣'];
    const playerColor: string[]  = [ holeCards[0], holeCards[1] ];

    let winningColor
    let sorted: string[] = [];
    
    for ( const board of communityCards ){
      playerColor.push(board);
    }

    let isFlush = false;
    
    for ( const color of colors ){
      if ( playerColor.filter((col) => col.slice(-1) === color).length > 4 ){        
        winningColor = color;
        isFlush = true;
      }
    }

    if(isFlush){
      
      const flushRanks = [];
      for (const card of playerColor){
        if(card.slice(-1) === winningColor){
          flushRanks.push(card.slice(0,-1));
        }
      }

      sorted = flushRanks.sort( (a,b) => hierarchy.indexOf(b) - hierarchy.indexOf(a));

    } 
    
    return [isFlush, sorted.slice(0,5), sorted];
  }
  
  //check straight
  function hasStraight(holeCards: string[], communityCards: string[]) {
    
    const playerHand: string[] = [ holeCards[0].slice(0, -1), holeCards[1].slice(0, -1) ];
    let sorted = [];
    
    for (const card of communityCards){
      playerHand.push(card.slice(0, -1));
    }
    
    sorted = playerHand.sort( (a,b) => hierarchy.indexOf(b) - hierarchy.indexOf(a));
      
    let isStraight = false;
    let duplRemoved = [...new Set(sorted.reverse())]
    let ranks: string[] = [];
    
    duplRemoved = duplRemoved.reverse();

    let straightCounter = 0;
    for( let i = 0; i < duplRemoved.length - 1; i++ ){
      
      if( duplRemoved.length < 5 ) break;

      if( hierarchy.indexOf(duplRemoved[i]) - 1 == hierarchy.indexOf(duplRemoved[i+1]) ){
        
        if( !ranks.includes(duplRemoved[i])) ranks.push(duplRemoved[i]);
        if( !ranks.includes(duplRemoved[i+1])) ranks.push(duplRemoved[i+1]);
      
        straightCounter += 1;
        if ( straightCounter == 4 ) break; 
      } else {
        straightCounter = 0; 
        ranks = [];
      }
    }
    
    if ( straightCounter >=4 ){
      isStraight = true;
    }else {
      isStraight = false;
    }    
    return([isStraight, ranks.slice(0,5)])
  }
  
  // check straight with input flush
  function hasStraightFlush(holeCards: string[]) {
       
    let isStraightFlush = false;
    let ranks: string[] = [];
    
    let straightCounter = 0;
    for( let i = 0; i < holeCards.length - 1; i++ ){
      
      if( hierarchy.indexOf(holeCards[i]) - 1 == hierarchy.indexOf(holeCards[i+1]) ){
        
        if( !ranks.includes(holeCards[i])) ranks.push(holeCards[i]);
        if( !ranks.includes(holeCards[i+1])) ranks.push(holeCards[i+1]);
      
        straightCounter += 1;
        if ( straightCounter == 4 ) break; 
      } else {
        straightCounter = 0;
        ranks = [];
      }
    }
    
    if ( straightCounter >=4 ){
      isStraightFlush = true;
    }else {
      isStraightFlush = false;
    }
    
    return([isStraightFlush, ranks.slice(0,5)])
  }
  
  //check pairs
  function hasPairs(holeCards: string[], communityCards: string[]) {
    // playerhand sorted
    let playerHand: string[] = [ holeCards[0].slice(0, -1), holeCards[1].slice(0, -1) ];

    for (const card of communityCards){
      playerHand.push(card.slice(0, -1));
    }
    
    let uniqueCards: string[] = [...new Set(playerHand)];
    let cardFoundTimes: number;
    const finalResult = [];
    const results = [];
    const ranks = [];
    
    for (const card of uniqueCards){
      cardFoundTimes = playerHand.filter((car) => car === card).length;
      if ( cardFoundTimes > 1 ) {
        results.push([card, cardFoundTimes]);
      }
    }
    
    if( results.length < 1 ){
      
      finalResult.push('nothing');
      finalResult.push(uniqueCards.sort( (a,b) => hierarchy.indexOf(b) - hierarchy.indexOf(a)).slice(0,5));
      return typeof finalResult !== 'undefined' ? finalResult : [""];
      
    } else if( results.length == 1){
        // pair or three same cards
        if(results[0][1] == '2'){
          // pair
          finalResult.push('pair');
          const indexToRemove: number = playerHand.indexOf(results[0][0].toString());
          const firstEl = playerHand.splice(indexToRemove, 1);
          ranks.push(firstEl[0]);
          playerHand = playerHand.sort( (a,b) => hierarchy.indexOf(b) - hierarchy.indexOf(a));
          for(let i = 0; i < 7; i++ ){
            if(playerHand[i] !== firstEl[0] && ranks.length < 4) ranks.push(playerHand[i]);
          }
          finalResult.push(ranks);

        } else{
          // three of a kind
          finalResult.push('three-of-a-kind');
          const indexToRemove = playerHand.indexOf(results[0][0].toString());
          const firstEl = playerHand.splice(indexToRemove, 1);
          ranks.push(firstEl[0]);
          playerHand = playerHand.sort( (a,b) => hierarchy.indexOf(b) - hierarchy.indexOf(a));
          for(let i = 0; i < 7; i++ ){
            if(playerHand[i] !== firstEl[0] && ranks.length < 3) ranks.push(playerHand[i]);
          }
          finalResult.push(ranks);
      }     
      return typeof finalResult !== 'undefined' ? finalResult : [""];
      
    } else if( results.length === 2){
      // two pair
      if( results[0][1] === results[1][1] ){
        
        finalResult.push('two pair');
        ranks.push(results[0][0]);
        ranks.push(results[1][0]);
        ranks.sort( (a,b) => hierarchy.indexOf(b.toString()) - hierarchy.indexOf(a.toString()) )

        // find kicker
        uniqueCards = uniqueCards.sort( (a,b) => hierarchy.indexOf(b) - hierarchy.indexOf(a) );
        let kareIndex = uniqueCards.indexOf(results[0][0].toString());
        uniqueCards.splice(kareIndex, 1);
        kareIndex = uniqueCards.indexOf(results[1][0].toString());
        uniqueCards.splice(kareIndex, 1);
        ranks.push(uniqueCards[0]);
        // return result
        finalResult.push(ranks);
        return typeof finalResult !== 'undefined' ? finalResult : [""];
      }      
    } else {
      // changed the code in order for the ts to work! ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      const ranks: string[] = [];
      finalResult.push('nothing');
      finalResult.push(ranks);
      return finalResult;
    }
  }
  
  //check full house
  function hasFullHouse(holeCards: string[], communityCards: string[]) {
    // playerhand sorted
    const playerHand: string[] = [ holeCards[0].slice(0, -1), holeCards[1].slice(0, -1) ];

    for (const card of communityCards){
      playerHand.push(card.slice(0, -1));
    }
    
    const uniqueCards = [...new Set(playerHand)];
    let cardFoundTimes: number;
    const finalResult = [];
    const results = [];
    const ranks = [];
    
    for (const card of uniqueCards){
      cardFoundTimes = playerHand.filter((car) => car === card).length;
      if ( cardFoundTimes > 1 ) {
        results.push([card, cardFoundTimes]);
      }
    }
    if( results.length < 2 ){
      return [false, []]
      
    } else if( results.length == 2 ){
        // full house first case
        if( results[0][1] === 3 && results[1][1] === 2 ){
          finalResult.push(true);
          ranks.push(results[0][0]);
          ranks.push(results[1][0]);
          finalResult.push(ranks);
          
        } else if( results[0][1] === 2 && results[1][1] === 3 ){
          finalResult.push(true);
          ranks.push(results[1][0]);
          ranks.push(results[0][0]);
          finalResult.push(ranks);
        } else if( results[0][1] === 3 && results[1][1] === 3 ){
          finalResult.push(true);
          ranks.push(results[1][0]);
          ranks.push(results[0][0]);
          ranks.sort( (a,b) => hierarchy.indexOf(b) - hierarchy.indexOf(a));
          finalResult.push(ranks);
        }
        return finalResult; 
    } 
    return [false];
  }
  
  // check four of a kind
  function hasFour(holeCards: string[], communityCards: string[]) {
    // playerhand sorted
    const playerHand = [ holeCards[0].slice(0, -1), holeCards[1].slice(0, -1) ];

    for (const card of communityCards){
      playerHand.push(card.slice(0, -1));
    }
    
    let uniqueCards = [...new Set(playerHand)];
    let cardFoundTimes: number;
    const finalResult = [];
    const results = [];
    const ranks = [];
    
    for (const card of uniqueCards){
      cardFoundTimes = playerHand.filter((car) => car === card).length;
      if ( cardFoundTimes > 1 ) {
        results.push([card, cardFoundTimes]);
      }
    }
    
    if( results.length > 2 || results.length < 1 ){
      return [false, []]
      
    } else if( results[0][1] === 4 ) {
        // four of a kind
        finalResult.push(true);
        ranks.push(results[0][0]);
      
        uniqueCards = uniqueCards.sort( (a,b) => hierarchy.indexOf(b) - hierarchy.indexOf(a) );
        const kareIndex = uniqueCards.indexOf(results[0][0].toString())

        uniqueCards.splice(kareIndex, 1);

        ranks.push(uniqueCards[0]);
        finalResult.push(ranks);

        return finalResult; 
    } 
    return [false, []]
  }
  
  if( hasFlush(holeCards, communityCards)[0] ) {
    // check for straight-flush
    const possibleStrfl = hasFlush(holeCards, communityCards)[2];

    if( typeof possibleStrfl === 'string' && hasStraightFlush(possibleStrfl)[0] ){      
      finalType = 'straight-flush';
      finalRanks = hasStraightFlush(possibleStrfl)[1];

    } else if ( hasFour(holeCards, communityCards)[0] ) {
      finalType = 'four-of-a-kind';
      finalRanks = hasFour(holeCards, communityCards)[1];

    } else if ( hasFullHouse(holeCards, communityCards)[0] ){
      finalType = 'full house';
      finalRanks = hasFullHouse(holeCards, communityCards)[1];

    }
    else {
      finalType = 'flush';
      finalRanks = hasFlush(holeCards, communityCards)[1];

    }
   
  } else if ( hasFour(holeCards, communityCards)[0] ) {
      finalType = 'four-of-a-kind';
      finalRanks = hasFour(holeCards, communityCards)[1];

    
  } else if( hasFullHouse(holeCards, communityCards)[0] ) {
      finalType = 'full house';
      finalRanks = hasFullHouse(holeCards, communityCards)[1];


  } else if( hasStraight(holeCards, communityCards)[0] ){
    finalType = 'straight';
    finalRanks = hasStraight(holeCards, communityCards)[1];

    
  } else {

    finalType = hasPairs(holeCards, communityCards)[0];

    finalRanks = hasPairs(holeCards, communityCards)[1];

  }

  return {type: finalType, ranks: finalRanks};
}
