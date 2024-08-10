// parsing date function to be globally used in the app
// since all the dates will come in moment.js format from the front end
// mashy ya Youssef ? :D

const parseDate = (dateString) => {
  const [day, month, year] = dateString.split("/");

  return new Date(year, month - 1, day);
};

module.exports = { parseDate };
