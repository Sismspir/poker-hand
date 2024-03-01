interface Iplayer {
    playerIndex: number;
    playerMoney: number;
  }
  
export function BlindsHelper(playerMoney: Iplayer[], smallBlind: number, dealerIndex: number) {

    const bigBlind: number = 2*smallBlind;
    const smallBlindIndex: number = dealerIndex !== playerMoney.length ? dealerIndex + 1 : 1;
    const bigBlindIndex: number = smallBlindIndex !== playerMoney.length ? smallBlindIndex + 1 : 1;

    // set player's changed money
    const tempMoney = [...playerMoney];
    const newMoney = tempMoney.map(player => { 
        if( player.playerIndex === smallBlindIndex) {
        // TODO -> check if player can handle the bet
            return { ...player, ['playerMoney']: (player.playerMoney - smallBlind) } } else if( player.playerIndex === bigBlindIndex){
            return { ...player, ['playerMoney']: (player.playerMoney - bigBlind) }
        } 
        return player; } );

    return newMoney;
}


export function nextPlayerIndex(arr: number[], num: number) {
    for (let i = 0; i < arr.length; i++) {

        if( num === arr[arr.length - 1] ) {
            return arr[0];
        }
        if (arr[i] > num) {
            return arr[i];
        }
    }
    return arr[0];
}
