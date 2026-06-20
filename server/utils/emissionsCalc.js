/**
 * Carbon AI — Emissions Calculation Engine
 * Sources: GHG Protocol, EPA, IEA, IPCC AR6
 */

// ── Emission Factors (kg CO2e per unit) ───────────────────
const FACTORS = {
  transport: {
    car:         { factor: 0.21,  unit: 'km',  label: 'Car (average)' },
    car_electric:{ factor: 0.053, unit: 'km',  label: 'Electric Car' },
    bus:         { factor: 0.089, unit: 'km',  label: 'Bus' },
    metro:       { factor: 0.041, unit: 'km',  label: 'Metro / Subway' },
    train:       { factor: 0.035, unit: 'km',  label: 'Train' },
    bike:        { factor: 0,     unit: 'km',  label: 'Bicycle' },
    walk:        { factor: 0,     unit: 'km',  label: 'Walking' },
    motorbike:   { factor: 0.114, unit: 'km',  label: 'Motorbike/Scooter' },
    taxi:        { factor: 0.21,  unit: 'km',  label: 'Taxi / Rideshare' }
  },
  food: {
    beef:        { factor: 27.0,  unit: 'kg',  label: 'Beef' },
    lamb:        { factor: 39.2,  unit: 'kg',  label: 'Lamb/Mutton' },
    pork:        { factor: 12.1,  unit: 'kg',  label: 'Pork' },
    chicken:     { factor: 6.9,   unit: 'kg',  label: 'Chicken' },
    fish:        { factor: 6.1,   unit: 'kg',  label: 'Fish/Seafood' },
    dairy:       { factor: 3.2,   unit: 'kg',  label: 'Dairy (milk/cheese)' },
    eggs:        { factor: 4.8,   unit: 'kg',  label: 'Eggs' },
    vegetarian:  { factor: 2.0,   unit: 'meal',label: 'Vegetarian Meal' },
    vegan:       { factor: 0.9,   unit: 'meal',label: 'Vegan Meal' },
    fast_food:   { factor: 2.5,   unit: 'meal',label: 'Fast Food Meal' }
  },
  energy: {
    electricity:       { factor: 0.78,  unit: 'kWh', label: 'Grid Electricity (India avg)' },
    electricity_solar: { factor: 0.041, unit: 'kWh', label: 'Solar Energy' },
    electricity_wind:  { factor: 0.011, unit: 'kWh', label: 'Wind Energy' },
    electricity_us:    { factor: 0.386, unit: 'kWh', label: 'Grid Electricity (US avg)' },
    electricity_eu:    { factor: 0.276, unit: 'kWh', label: 'Grid Electricity (EU avg)' },
    natural_gas:       { factor: 2.204, unit: 'm3',  label: 'Natural Gas' },
    lpg:               { factor: 1.51,  unit: 'kg',  label: 'LPG / Cooking Gas' }
  },
  flight: {
    domestic:    { factor: 0.255, unit: 'km',  label: 'Domestic Flight' },
    short_haul:  { factor: 0.195, unit: 'km',  label: 'Short-haul Flight (<3h)' },
    long_haul:   { factor: 0.147, unit: 'km',  label: 'Long-haul Flight (>6h)' },
    business:    { factor: 0.429, unit: 'km',  label: 'Business Class Flight' }
  },
  shopping: {
    clothing:    { factor: 33.4,  unit: 'item', label: 'Clothing Item' },
    electronics: { factor: 72.0,  unit: 'item', label: 'Electronics (avg)' },
    smartphone:  { factor: 70.0,  unit: 'item', label: 'Smartphone' },
    laptop:      { factor: 422.0, unit: 'item', label: 'Laptop/Computer' },
    furniture:   { factor: 44.0,  unit: 'item', label: 'Furniture Item' },
    default:     { factor: 10.0,  unit: 'item', label: 'General Item' }
  },
  waste: {
    landfill:    { factor: 0.58,  unit: 'kg',  label: 'Landfill Waste' },
    recycled:    { factor: 0.021, unit: 'kg',  label: 'Recycled Waste' },
    composted:   { factor: 0.010, unit: 'kg',  label: 'Composted Organic' }
  }
};

/**
 * Calculate emissions for an activity
 * @param {string} category - transport/food/energy/flight/shopping/waste
 * @param {string} activityType - specific type within category
 * @param {number} quantity - amount
 * @param {object} metadata - extra details (passengers, local, renewable, etc.)
 * @returns {object} { emissionValue, unit, label, equivalents }
 */
const calculateEmission = (category, activityType, quantity, metadata = {}) => {
  const catFactors = FACTORS[category];
  if (!catFactors) throw new Error(`Unknown category: ${category}`);

  const entry = catFactors[activityType] || catFactors['default'];
  if (!entry) throw new Error(`Unknown activityType: ${activityType} in ${category}`);

  let emissionValue = entry.factor * quantity;

  // Adjustments
  if (category === 'transport' && metadata.passengers > 1) {
    emissionValue = emissionValue / metadata.passengers;
  }
  if (category === 'food' && metadata.local) {
    emissionValue *= 0.85; // 15% reduction for local produce
  }
  if (category === 'energy' && metadata.renewable) {
    emissionValue *= 0.1;  // 90% reduction for renewable
  }

  emissionValue = Math.round(emissionValue * 1000) / 1000;

  return {
    emissionValue,
    unit: entry.unit,
    label: entry.label,
    factor: entry.factor,
    equivalents: getEquivalents(emissionValue)
  };
};

/**
 * Convert kg CO2e to real-world equivalents
 */
const getEquivalents = (kgCO2) => ({
  kmDriving:       Math.round(kgCO2 / 0.21),
  phoneCharges:    Math.round(kgCO2 / 0.008),
  treeDaysToAbsorb:Math.round(kgCO2 / 0.021),
  flightMinutes:   Math.round(kgCO2 / 0.09),
  beefGrams:       Math.round(kgCO2 / 0.027 * 1000)
});

/**
 * Get sustainability rating (1-5) for an emission value by category
 */
const getSustainabilityRating = (emissionValue, category) => {
  const thresholds = {
    transport: [0, 1, 3, 6, 12],
    food:      [0, 0.5, 2, 5, 10],
    energy:    [0, 2, 5, 10, 20],
    flight:    [0, 50, 150, 300, 600],
    shopping:  [0, 10, 30, 60, 120],
    waste:     [0, 0.5, 1, 2, 4]
  };
  const t = thresholds[category] || [0, 2, 5, 10, 20];
  if (emissionValue <= t[1]) return 5;
  if (emissionValue <= t[2]) return 4;
  if (emissionValue <= t[3]) return 3;
  if (emissionValue <= t[4]) return 2;
  return 1;
};

/**
 * Estimate annual footprint from quiz answers (tons CO2)
 */
const estimateFromQuiz = (answers) => {
  let total = 0;
  const t = { car: 2.4, bus: 0.8, metro: 0.4, train: 0.35, bike: 0, walk: 0, 'work from home': 0.1 };
  const d = { vegan: 0.5, vegetarian: 1.0, 'fish / chicken': 1.5, 'daily meat': 2.5 };
  const e = { low: 0.3, medium: 0.8, high: 1.4, 'very high': 2.2 };
  const r = { 'fully remote': 0, 'hybrid (3 days)': 0.3, 'fully in-office': 0.8 };
  const f = { never: 0, '1–2 short flights': 0.6, '3–5 flights': 1.5, '6+ long haul': 3.2 };

  const tKey = Object.keys(t).find(k => answers.transport?.toLowerCase().includes(k));
  const dKey = Object.keys(d).find(k => answers.diet?.toLowerCase().includes(k));
  const eKey = Object.keys(e).find(k => answers.energy?.toLowerCase().includes(k));
  const rKey = Object.keys(r).find(k => answers.remote?.toLowerCase().includes(k));
  const fKey = Object.keys(f).find(k => answers.flights?.toLowerCase().includes(k));

  total += (tKey ? t[tKey] : 1.2);
  total += (dKey ? d[dKey] : 1.5);
  total += (eKey ? e[eKey] : 0.8);
  total += (rKey ? r[rKey] : 0.3);
  total += (fKey ? f[fKey] : 0.6);

  return Math.round(total * 100) / 100;
};

module.exports = { calculateEmission, getEquivalents, getSustainabilityRating, estimateFromQuiz, FACTORS };
