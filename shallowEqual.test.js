const shallowEqual = require('./shallowEqual');

describe('shallowEqual', () => {
    const obj1 = { data1: "ala ma kota", data2: "kot ma ale" };
    const obj2 = { data1: "ala ma kota", data2: "ala ma kota" };
    const obj3 = { data1: "ala ma kota", data2: "kot ma ale" };
    it('when object are not equal returns false', () => {
        expect(shallowEqual(obj1, obj2)).toBe(false);
    });
    it('when objects are equal returs true', () => {
        expect(shallowEqual(obj1, obj3)).toBe(true);
    });
});
