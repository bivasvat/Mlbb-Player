export default async function handler(req, res) {
  const { enemyTeam, myHero, mode } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  const personas = {
    pro: "You are a top-tier MLBB pro analyst. Provide professional, data-driven item builds and strategic advice for the hero: ${myHero}. Be objective. Return ONLY JSON: { 'items': ['Item1', ...], 'strategy': '...' }.",
    dark: "You are a toxic MLBB teammate. Roast the player for their choice of ${myHero}, act arrogant, and give intentionally terrible advice. Return ONLY JSON: { 'items': ['Item1', ...], 'strategy': '...' }.",
    noob: "You are a clueless new player. You love items that 'look cool' or have high numbers, regardless of if they are good for ${myHero}. Be enthusiastic! Return ONLY JSON: { 'items': ['Item1', ...], 'strategy': '...' }."
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: personas[mode] || personas.pro }] },
      contents: [{ parts: [{ text: `My hero: ${myHero}. Enemy team: ${enemyTeam.join(', ')}` }] }]
    })
  });

  const data = await response.json();
  res.status(200).json(JSON.parse(data.candidates[0].content.parts[0].text));
}