// create a padding numbers
// 0024 , 0100 , 1000

const formattedNumberWithPadding = (number) => {
  if (number < 100) {
    return number.toString().padStart(4, "0"); // Pads to at least 4 digits (e.g., 0024)
  } else if (number < 1000) {
    return number.toString().padStart(4, "0"); // Pads to at least 4 digits (e.g., 0100)
  } else {
    return number.toString(); // No padding needed for 1000 and above
  }
};

module.exports = { formattedNumberWithPadding };
