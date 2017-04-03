function arrayMin(array) {

  let length = array.length, min = Infinity;

  while (length--) {

    if (array[length] < min) {

      min = array[length];

    }

  }

  return min;

}

function arrayMax(array) {

  let length = array.length, max = - Infinity;

  while (length--) {

    if (array[length] > max) {

      max = array[length];

    }

  }

  return max;

}

export { arrayMin, arrayMax };
