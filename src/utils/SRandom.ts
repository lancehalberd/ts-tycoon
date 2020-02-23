type Collection<T> = {[key:string]: T} | Array<T>;

const MAX_INT = 2 ** 32;

// Seeded random number generator.
class SRandom {
    _seed = Math.random();
    // Decent pseudo random number generator based on:
    // https://en.wikipedia.org/wiki/Xorshift
    // Values seem fairly evenly distributed on [0, 1)
    nextSeed(seed: number = Math.random()): number {
        let x = Math.floor(MAX_INT * seed);
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        return (x / MAX_INT) + 0.5;
    }

    normSeed(seed: number): number  {
        return this.nextSeed((Math.cos(seed) + 1 ) / 2);
    }

    random(): number {
        return this._seed = this.nextSeed(this._seed);
    }

    seed(value: number): SRandom {
        this._seed = this.normSeed(value);
        return this;
    }

    /**
     * @param {number} min  The smallest returned value
     * @param {number} max  The largest returned value
     */
    range(A:number, B:number): number {
        var min = Math.min(A, B);
        var max = Math.max(A, B);
        return Math.floor(this.random() * (max + 1 - min)) + min;
    }

    /**
     * @param {Collection} collection  The collection of elements to return random element from
     */
    element<T>(collection: Collection<T>): T {
        if (collection.constructor == Object) {
            const keys = Object.keys(collection);
            return collection[this.element(keys)];
        }
        if (collection.constructor == Array) {
            const array = collection as Array<any>;
            return array[Math.floor(this.random() * array.length)];
        }
        console.log("Warning @ Random.element: "+ collection + " is neither Array or Object");
        return null;
    }

    /**
     * @param {Array} array  The array of elements to return random element from
     */
    removeElement<T>(collection: Collection<T>): T {
        if (collection.constructor == Object) {
            const keys = Object.keys(collection);
            const key = this.element(keys);
            const value = collection[key];
            delete collection[key]
            return value;
        }
        if (collection.constructor == Array) {
            const array = collection as Array<any>;
            return array.splice(Math.floor(this.random() * (array.length - 1)), 1)[0];
        }
        console.log("Warning @ Random.removeElement: "+ collection + " is neither Array or Object");
        return null;
    }

    /**
     * Shuffles an array.
     *
     * Knuth algorithm found at:
     * http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
     *
     * @param {Array} array  The array of elements to shuffle
     */
    shuffle<T>(array:T[]):T[] {
        array = [...array];
        let currentIndex = array.length, temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
          // Pick a remaining element...
          randomIndex = Math.floor(this.random() * currentIndex);
          currentIndex -= 1;
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
        return array;
    }
};
const instance = new SRandom();
export default instance;
