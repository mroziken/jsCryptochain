const cryptoHash = require('./crypto-hash');

describe('Crypto Hash', () =>{
    const fooSha256 = 'b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b';
    it('generate SHA-256 outpout', () => {
        expect(cryptoHash('foo')).toEqual(fooSha256);
    })
    it('produces the same has with the same input arguments in any order', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('three', 'one', 'two'));
    });
    it('change the value of the hash when object details have changed', () => {
        const foo = {};
        const originalHash = cryptoHash(foo);
        foo['a']='a';
        expect(cryptoHash(foo)).not.toEqual(originalHash);
    });
});