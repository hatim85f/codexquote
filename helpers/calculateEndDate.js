// calculating project end date

const moment = require("moment");

const calculateEndDate = (startDate, days) => {
  return moment(startDate).add(days, "days").toDate();
};

module.exports = { calculateEndDate };
