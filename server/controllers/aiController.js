const Groq = require('groq-sdk');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { Recommendation } = require('../models/Models');

// Always create fresh — ensures updated .env key is used
const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are Carbon AI, an expert sustainability coach and climate scientist. 
You help users understand and reduce their carbon footprint through personalized, actionable advice.
Be encouraging, specific, and data-driven. Use emoji sparingly but effectively.
Always quantify potential savings in kg CO2 when possible.
Keep responses concise (under 200 words) unless asked for a full plan.
Never make up data — base advice on real emission factors from GHG Protocol and IPCC.`;

// ── Build user context for AI ──────────────────────────────
const buildUserContext = async (userId) => {
  const user = await User.findById(userId).select('-password');
  const recentActivities = await Activity.find({ userId })
    .sort({ date: -1 }).limit(10);
  const breakdown = await Activity.getCategoryBreakdown(userId);

  const topCategory = breakdown.length > 0 ? breakdown[0]._id : 'transport';
  const footprintSummary = `Current footprint: ${user.currentFootprint || 'unknown'} tons CO2/year. Goal: ${user.goalTarget} tons. Streak: ${user.currentStreak} days.`;
  const activitiesStr = recentActivities.map(a => `${a.activityType} (${a.category}): ${a.emissionValue} kg CO2`).join(', ');
  const breakdownStr = breakdown.map(b => `${b._id}: ${b.total.toFixed(1)} kg (${Math.round(b.percentage || 0)}%)`).join(', ');

  return `User: ${user.name}. ${footprintSummary} Top emission source: ${topCategory}. Recent activities: ${activitiesStr || 'none yet'}. 30-day breakdown: ${breakdownStr || 'no data yet'}.`;
};

// ── Chat ───────────────────────────────────────────────────
exports.chat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required.' });

    const userContext = await buildUserContext(req.userId);

    const messages = [
      { role: 'system', content: `${SYSTEM_PROMPT}\n\nUser context: ${userContext}` },
      ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const response = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 400,
      temperature: 0.7
    });

    const reply = response.choices[0]?.message?.content || 'Could not generate a response.';
    res.json({ reply, model: response.model, groq: true });
  } catch (err) {
    console.error('GROQ chat error:', JSON.stringify(err?.error || err?.message || err));
    // Return fallback — NEVER crash
    res.json({ reply: getSmartFallback(req.body.message || ''), fallback: true });
  }
};

// ── Generate 7-day Action Plan ────────────────────────────
exports.generatePlan = async (req, res, next) => {
  try {
    const userContext = await buildUserContext(req.userId);

    const prompt = `Based on this user's data: ${userContext}

Generate a structured 7-day sustainability action plan. Format as JSON with this structure:
{
  "weeklyGoal": "brief goal statement",
  "estimatedSavings": "X kg CO2",
  "days": [
    { "day": "Monday", "task": "specific action", "category": "transport|food|energy", "saving": "X kg CO2" },
    ...7 days
  ],
  "tips": ["tip1", "tip2", "tip3"]
}

Focus on the user's highest emission category. Be specific and actionable.`;

    const response = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.6
    });

    const raw = response.choices[0]?.message?.content || '{}';
    let plan;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      plan = jsonMatch ? JSON.parse(jsonMatch[0]) : getDefaultPlan();
    } catch {
      plan = getDefaultPlan();
    }

    res.json({ plan });
  } catch (err) {
    res.json({ plan: getDefaultPlan() });
  }
};

// ── Get Recommendations ────────────────────────────────────
exports.getRecommendations = async (req, res, next) => {
  try {
    const userContext = await buildUserContext(req.userId);

    const prompt = `Based on: ${userContext}

Generate exactly 5 personalized sustainability recommendations. Return JSON array:
[
  {
    "category": "transport|food|energy|shopping|lifestyle",
    "title": "short title",
    "description": "1-2 sentence specific advice",
    "potentialSavings": 120,
    "effort": "low|medium|high",
    "impact": "low|medium|high",
    "cost": "free|low|medium|high",
    "feasibility": 8
  }
]
Order by impact descending.`;

    const response = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.5
    });

    const raw = response.choices[0]?.message?.content || '[]';
    let recs;
    try {
      const match = raw.match(/\[[\s\S]*\]/);
      recs = match ? JSON.parse(match[0]) : getDefaultRecommendations();
    } catch {
      recs = getDefaultRecommendations();
    }

    // Save to DB
    await Recommendation.deleteMany({ userId: req.userId });
    const savedRecs = await Recommendation.insertMany(
      recs.map(r => ({ ...r, userId: req.userId, aiGenerated: true }))
    );

    res.json({ recommendations: savedRecs });
  } catch (err) {
    res.json({ recommendations: getDefaultRecommendations() });
  }
};

// ── Daily Tip ──────────────────────────────────────────────
exports.getDailyTip = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('name currentFootprint currentStreak');
    const prompt = `Give one specific, actionable eco tip for ${user.name} who has a ${user.currentStreak}-day green streak and a ${user.currentFootprint || 3} ton annual footprint. Make it encouraging and specific. Under 60 words.`;

    const response = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
      max_tokens: 120,
      temperature: 0.8
    });

    const tip = response.choices[0]?.message?.content || '🌿 Try taking public transport today and save 2–3 kg CO₂!';
    res.json({ tip });
  } catch {
    res.json({ tip: '🌿 Switch one meal today to plant-based and save up to 5 kg CO₂. Small choices, big impact!' });
  }
};

// ── Smart Fallback (covers 30+ topics) ───────────────────
const getSmartFallback = (msg = '') => {
  const m = msg.toLowerCase();

  // Transport
  if (m.includes('car') || m.includes('driv') || m.includes('petrol') || m.includes('diesel'))
    return '🚗 **Driving Tip:** A petrol car emits ~0.21 kg CO₂ per km. Switching to public transit just twice a week can save **140 kg CO₂/year** — equivalent to planting 7 trees. Try carpooling or combining errands to cut trips by 30%.';
  if (m.includes('bus') || m.includes('metro') || m.includes('public transport') || m.includes('transit'))
    return '🚌 **Great Choice!** Public transit emits 80% less CO₂ than solo driving. The metro produces just 0.041 kg/km vs a car\'s 0.21 kg/km. If you commute 20 km daily by metro instead of car, you save **~1,000 kg CO₂/year**!';
  if (m.includes('bike') || m.includes('cycl') || m.includes('walk') || m.includes('foot'))
    return '🚲 **Zero Emission Champion!** Cycling and walking produce 0 kg CO₂. They also improve health, reducing healthcare costs. For every km you cycle instead of drive, you save 210g CO₂. A 5 km daily commute by bike saves **~385 kg CO₂/year**!';
  if (m.includes('flight') || m.includes('fly') || m.includes('airplane') || m.includes('plane'))
    return '✈️ **Flight Impact:** Aviation is highly carbon-intensive. A 1,000 km flight emits ~195 kg CO₂ per passenger. Tips: choose direct flights (layovers add 25% emissions), pick economy class (business class emits 3x more), and offset remaining emissions. Consider trains for routes under 600 km!';
  if (m.includes('electric') && (m.includes('car') || m.includes('vehicle') || m.includes('ev')))
    return '⚡ **EV Advantage:** Electric vehicles emit just 0.053 kg CO₂/km (charging on India grid) vs 0.21 kg for petrol. That\'s **75% less**. Over 50,000 km, you save ~8,000 kg CO₂. With renewable charging, the savings approach 95%!';

  // Food
  if (m.includes('beef') || m.includes('red meat') || m.includes('steak') || m.includes('burger'))
    return '🥩 **Beef Impact:** Beef is the most carbon-intensive food at **27 kg CO₂ per kg** — largely due to methane from cattle and deforestation. Replacing one weekly beef meal with chicken saves 80 kg CO₂/year. Replacing it with a plant-based meal saves 120 kg/year!';
  if (m.includes('vegan') || m.includes('plant') || m.includes('vegetarian'))
    return '🌱 **Plant Power:** Vegan diets produce up to **73% less CO₂** than meat-heavy diets. A vegan meal emits just 0.9 kg CO₂ vs 5–10 kg for beef meals. Even going vegan for just one day a week (Meatless Monday) saves ~80 kg CO₂/year — like not driving for a month!';
  if (m.includes('food') || m.includes('meal') || m.includes('eat') || m.includes('diet'))
    return '🥗 **Food Footprint:** Food accounts for ~25% of global emissions. Your biggest wins: **reduce beef and lamb** (27–39 kg CO₂/kg), choose local and seasonal produce (saves 15%), minimize food waste (8% of global emissions), and eat more plant-based meals. Small swaps = massive impact!';
  if (m.includes('chicken') || m.includes('poultry'))
    return '🍗 **Chicken vs. Beef:** Chicken emits 6.9 kg CO₂/kg — **75% less than beef**. It\'s a great transition protein if you\'re reducing red meat. Switching from beef to chicken for 3 meals/week saves ~150 kg CO₂/year. Combining with legumes (1.9 kg CO₂/kg) is even better!';
  if (m.includes('local') || m.includes('seasonal') || m.includes('organic'))
    return '🌾 **Local & Seasonal:** Locally grown food reduces transport emissions by up to 15%. Seasonal food avoids energy-intensive greenhouses. Your best bets: visit farmers markets, join a CSA, and check food labels for origin. This can cut your food footprint by 150 kg CO₂/year!';

  // Energy
  if (m.includes('electric') || m.includes('energy') || m.includes('power') || m.includes('electricity'))
    return '⚡ **Energy Savings:** India\'s grid emits 0.78 kg CO₂/kWh. Simple wins: **raise AC to 24°C** (saves 6-10% per degree), switch to LED bulbs (75% less energy), use smart power strips to eliminate standby power, and run appliances off-peak. Together these can save **300+ kg CO₂/year**!';
  if (m.includes('solar') || m.includes('renewable') || m.includes('green energy'))
    return '☀️ **Solar Impact:** Solar panels emit just 0.041 kg CO₂/kWh — **95% less than the India grid**. A 2kW rooftop system generates ~2,800 kWh/year, saving ~2,200 kg CO₂ annually. Payback period is typically 4–6 years with a 25-year lifespan. Net savings: 15+ tons CO₂!';
  if (m.includes('ac') || m.includes('air condition') || m.includes('cooling'))
    return '❄️ **AC Efficiency:** AC can account for 40–60% of home energy use. **Raising temperature by just 2°C** (e.g., 20→22°C) reduces energy use by 10%, saving ~35 kg CO₂/year. Use ceiling fans alongside AC, seal windows, use curtains in daytime, and set timer to auto-off at night!';

  // Shopping & waste
  if (m.includes('shopping') || m.includes('fashion') || m.includes('cloth') || m.includes('buy'))
    return '🛍️ **Sustainable Shopping:** A single clothing item emits ~33 kg CO₂ in production. Tips: buy second-hand (saves 82% emissions), choose quality over quantity, repair items, swap with friends, and rent for special occasions. The average person can cut fashion emissions by 60% with mindful choices!';
  if (m.includes('plastic') || m.includes('waste') || m.includes('recycle') || m.includes('trash'))
    return '♻️ **Waste Reduction:** Landfill waste emits 0.58 kg CO₂/kg as it decomposes. Recycling reduces this by 96%. Your action plan: carry reusable bags/bottles, compost food scraps (saves 0.5 kg CO₂/kg), buy products with minimal packaging, and repair electronics instead of replacing!';
  if (m.includes('water'))
    return '💧 **Water & Carbon:** Water treatment and heating is energy-intensive. A hot shower uses ~0.1 kg CO₂. Tips: reduce shower time by 2 minutes (saves 25%), install low-flow fixtures, fix leaks (a dripping tap wastes 3,000L/year), and collect rainwater for plants. Saves ~50 kg CO₂/year!';

  // General & goals
  if (m.includes('goal') || m.includes('target') || m.includes('reduce') || m.includes('improve'))
    return '🎯 **Setting Goals:** The global average is 4T CO₂/year; the 1.5°C target requires getting to 2T by 2030. Start with your **highest emission category** — typically transport (55%) or food (22%). A 20% reduction in just your top category can save 400–600 kg CO₂/year. Small, consistent actions compound!';
  if (m.includes('streak') || m.includes('habit') || m.includes('daily') || m.includes('consistent'))
    return '🔥 **Building Green Habits:** Research shows habits take 21–66 days to form. Start with one change per week: Week 1 (swap one commute), Week 2 (one plant-based meal), Week 3 (unplug devices). Your current streak is already building momentum. Each logged day earns streak bonuses and achievement badges!';
  if (m.includes('tip') || m.includes('advice') || m.includes('suggestion') || m.includes('idea'))
    return '💡 **Today\'s Top Eco Tips:**\n1. 🚌 Take transit once this week (saves ~4 kg CO₂)\n2. 🥗 Try one plant-based meal (saves ~2 kg CO₂)\n3. ⚡ Raise AC by 2°C (saves ~0.3 kg CO₂/day)\n4. 🛁 Shorten shower by 2 min (saves ~0.1 kg CO₂)\n5. 🌳 Log all activities to unlock your AI insights!';
  if (m.includes('footprint') || m.includes('emission') || m.includes('co2') || m.includes('carbon'))
    return '🌍 **Understanding Footprints:** Your carbon footprint covers transport, food, energy, and shopping. The global average is **4.0 tons/year**; India average is 1.9T. Your biggest lever is typically **transport** (often 50–60% of total). Log activities daily and I\'ll show you exactly where to cut for maximum impact!';
  if (m.includes('challenge') || m.includes('mission'))
    return '🏆 **Eco Challenges:** Joining challenges keeps you accountable and builds community. Each challenge is science-backed with estimated CO₂ savings. **No Car Friday** saves ~4 kg CO₂/week, **Green Meal Week** saves ~28 kg. Complete 5 challenges to unlock the Challenge Hero badge and earn 750+ points!';
  if (m.includes('plan') || m.includes('week') || m.includes('schedule'))
    return '📋 **Your 7-Day Eco Plan:**\n• Monday: Take public transit 🚌\n• Tuesday: Eat a plant-based meal 🥗\n• Wednesday: Unplug devices at night ⚡\n• Thursday: Walk for trips < 2km 🚶\n• Friday: No Car Friday! 🚲\n• Saturday: Shop secondhand or local 🛒\n• Sunday: Meal prep to reduce food waste 🍱\nTotal estimated savings: **~12 kg CO₂**!';
  if (m.includes('hello') || m.includes('hi') || m.includes('hey') || m.includes('start'))
    return '👋 **Hello! I\'m Carbon AI**, your personal sustainability coach.\n\nI can help you with:\n• 🚗 Transport & commute optimization\n• 🥗 Food & diet carbon reduction\n• ⚡ Home energy efficiency\n• ✈️ Flight & travel impact\n• 🎯 Setting and tracking goals\n• 📋 Creating your weekly eco plan\n\nWhat would you like to tackle first?';

  // Default — still useful
  return '🌱 **Great question!** Based on typical user profiles, your biggest carbon wins usually come from:\n\n1. 🚗 **Transport** — switching 2 commutes/week to transit saves ~140 kg CO₂/yr\n2. 🥗 **Food** — one less meat meal/week saves ~80 kg CO₂/yr  \n3. ⚡ **Energy** — raising AC by 2°C saves ~35 kg CO₂/yr\n\nLog your activities to get data-driven insights specific to **your** lifestyle. The more you log, the smarter your recommendations get!';
};

const getDefaultPlan = () => ({
  weeklyGoal: 'Reduce transport and food emissions by 20%',
  estimatedSavings: '6.5 kg CO2',
  days: [
    { day: 'Monday', task: 'Take public transport to work', category: 'transport', saving: '2.1 kg CO2' },
    { day: 'Tuesday', task: 'Have a plant-based lunch', category: 'food', saving: '1.6 kg CO2' },
    { day: 'Wednesday', task: 'Turn off AC 2 hours early', category: 'energy', saving: '0.8 kg CO2' },
    { day: 'Thursday', task: 'Walk or bike for short trips', category: 'transport', saving: '1.2 kg CO2' },
    { day: 'Friday', task: 'Try a fully vegan day', category: 'food', saving: '2.4 kg CO2' },
    { day: 'Saturday', task: 'Air-dry clothes instead of dryer', category: 'energy', saving: '0.7 kg CO2' },
    { day: 'Sunday', task: 'Plan next week\'s eco meals', category: 'food', saving: '0.5 kg CO2' }
  ],
  tips: ['Batch your errands to reduce car trips', 'Set AC to 24°C instead of 20°C', 'Choose local and seasonal produce']
});

const getDefaultRecommendations = () => [
  { category: 'transport', title: 'Switch to public transit', description: 'Take the bus or metro twice weekly instead of driving.', potentialSavings: 140, effort: 'low', impact: 'high', cost: 'low', feasibility: 9 },
  { category: 'food', title: 'Meatless Monday', description: 'Replace one meat meal per week with a plant-based option.', potentialSavings: 80, effort: 'low', impact: 'medium', cost: 'free', feasibility: 9 },
  { category: 'energy', title: 'Optimize AC usage', description: 'Raise AC temperature by 2°C and use fans when possible.', potentialSavings: 35, effort: 'low', impact: 'medium', cost: 'free', feasibility: 10 },
  { category: 'transport', title: 'Walk for short trips', description: 'Walk or cycle for any trip under 2 km instead of driving.', potentialSavings: 60, effort: 'low', impact: 'medium', cost: 'free', feasibility: 8 },
  { category: 'lifestyle', title: 'Work from home Fridays', description: 'Request one remote work day per week to eliminate commute.', potentialSavings: 50, effort: 'medium', impact: 'medium', cost: 'free', feasibility: 7 }
];

module.exports = exports;
