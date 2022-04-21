// Start coding here
import fetch from 'node-fetch';
import { differenceInDays } from 'date-fns';

const QUERY_BASE_URL = 'http://localhost:5000/';

const fetchProperties = async () => {
  try {
    const dataRaw = await fetch(QUERY_BASE_URL + 'properties');
    const data = await dataRaw.json();

    return data;
  } catch (e) {
    throw new Error(`>>> error when fetching data :: ${e}`);
  }
};

const dataFetched = await fetchProperties();

/*------ 1. Get all the properties with value greater then $600K ------*/
export const filterByValue = (properties, value) => {
  const res = properties.filter((item) => item.price > value);
  return res;
};

console.log('>>> 1. Get all the properties with value greater then $600K');
const propertiesMatched = filterByValue(dataFetched, 600000);
console.log(propertiesMatched);

/*------ 2. Get value of properties sold by agent 1 ------*/
export const getValueSoldByAgent = (properties, agentId) => {
  const res = properties.reduce((pre, cur) => {
    if (cur.agent && cur.agent === agentId) {
      return pre + cur.price;
    }
    return pre;
  }, 0);

  return res;
};

console.log('>>> 2. Get value of properties sold by agent 1');
console.log(getValueSoldByAgent(dataFetched, 1));

/*------ 3. Get the median price of properties sold in the year 2020 ------*/
const getYearFromISO = (date) => {
  const year = date.split('-')[0];
  return year;
};

const calculateMedian = (prices) => {
  let mid = Math.floor(prices.length / 2);
  // sort prices
  prices = [...prices].sort((a, b) => a - b);
  //   console.log(prices);
  if (prices.length % 2 === 0) {
    return (prices[mid - 1] + prices[mid]) / 2;
  } else {
    return prices[mid];
  }
};

const getPropertyPricesSoldInYear = (properties, soldYear) => {
  const res = properties.reduce((pre, cur) => {
    if (cur.soldDate && getYearFromISO(cur.soldDate) == soldYear) {
      return [...pre, cur.price];
    }
    return pre;
  }, []);

  return res;
};

const propertyPricesSoldIn2020 = getPropertyPricesSoldInYear(dataFetched, 2020);
const median = calculateMedian(propertyPricesSoldIn2020);
console.log('>>> 3. Get the median price of properties sold in the year 2020');
// console.log('prices in 2020 sorted in ASC: ');
// console.log(propertyPricesSoldIn2020.sort((a, b) => a - b));
console.log('>>> median: ' + median);

/*------ 4. Get percentage increase of average property prices in 2020 from 2019  ------*/
const calculateAverage = (arr) =>
  arr.reduce((pre, cur) => pre + cur, 0) / arr.length;

const calculateAveragePriceByYear = (properties, soldYear) => {
  const prices = getPropertyPricesSoldInYear(properties, soldYear);

  return calculateAverage(prices);
};

console.log(
  '>>> 4. Get percentage increase of average property prices in 2020 from 2019',
);
const avgPriceIn2020 = calculateAveragePriceByYear(dataFetched, 2020);
const avgPriceIn2019 = calculateAveragePriceByYear(dataFetched, 2019);
const increasePercentage =
  ((avgPriceIn2020 - avgPriceIn2019) / avgPriceIn2019) * 100;
console.log(increasePercentage.toFixed(2) + '%');

/*------ 5. Get average number of days properties are on market ------*/
const calculateOnMarketDays = (listDate, soldDate) => {
  return Math.abs(differenceInDays(new Date(listDate), new Date(soldDate)));
};

const getAllDaysOnMarket = (properties) => {
  const res = properties.reduce((pre, cur) => {
    if (cur.listDate && cur.soldDate) {
      const daysDiff = calculateOnMarketDays(cur.listDate, cur.soldDate);
      //   console.log(daysDiff);

      return [...pre, daysDiff];
    }
    return pre;
  }, []);

  return res;
};

console.log('>>> 5. Get average number of days properties are on market');
const avgDaysOnMarket = calculateAverage(getAllDaysOnMarket(dataFetched));
console.log(avgDaysOnMarket);

/*------ 6. Get the average number of properties on market by a particular real estate agency ------*/
// fetch agencies from api
const fetchAgencies = async () => {
  try {
    const dataRaw = await fetch(QUERY_BASE_URL + 'agents');
    const data = await dataRaw.json();

    return data;
  } catch (e) {
    throw new Error(`>>> error when fetching data :: ${e}`);
  }
};

const agenciesFetched = await fetchAgencies();

const getDaysOnMarketByAgency = (properties, agencyId) => {
  const res = properties.reduce((pre, cur) => {
    if (cur.listDate && cur.soldDate && cur.agent === agencyId) {
      const daysDiff = calculateOnMarketDays(cur.listDate, cur.soldDate);
      //   console.log(daysDiff);

      return [...pre, daysDiff];
    }
    return pre;
  }, []);

  return res;
};

const results = agenciesFetched.reduce((pre, cur) => {
  if (cur.id && cur.agency) {
    const daysOnMarketByAgent = getDaysOnMarketByAgency(dataFetched, cur.id);
    const avgDaysOnMarketByAgent = calculateAverage(daysOnMarketByAgent);
    return [
      ...pre,
      {
        ...cur,
        averageDaysOnMarket: avgDaysOnMarketByAgent || 'n/a',
      },
    ];
  }
  return pre;
}, []);

console.log(
  '>>> 6. Get the average number of properties on market by a particular real estate agency',
);
console.log(results);
