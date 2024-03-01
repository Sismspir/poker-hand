export function generate(){

    const numbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']; 
    const colors = ['♠', '♦', '♥', '♣'];
    // generates and shuffles the deck
    const cards: string[] = [];

    const shuffle = (array: string[]) => { 
        return array.map((a) => ({ sort: Math.random(), value: a }))
            .sort((a, b) => a.sort - b.sort)
            .map((a) => a.value); 
    };
    
    for(const val of numbers){
      for(const col of colors){
        cards.push(`${val}${col}`);
      }
    }

    return shuffle(cards);
}