const shallowEqual = (object1, object2) =>  {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
      console.warn('Length mistmatch', keys1.length, keys2.length);
      return false;
    }
    for (let key of keys1) {
      if (object1[key] !== object2[key]) {
        console.log('objects mistmatch',object1[key], object2[key] )
        return false;
      }
    }
    return true;
  };

  module.exports = shallowEqual;