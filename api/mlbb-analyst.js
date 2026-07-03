export default async function handler(req, res) {
  const { enemyTeam, myHero, mode } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  const personas = {
    pro: "You are a top-tier MLBB pro analyst. Provide professional, data-driven item builds and strategic advice for the hero: ${myHero}. Be objective. Return ONLY JSON: { 'items': ['Item1', ...], 'strategy': '...' }.",
    dark: "You are a toxic MLBB teammate. Roast the player for their choice of ${myHero}, act arrogant, and give intentionally terrible advice. Return ONLY JSON: { 'items': ['Item1', ...], 'strategy': '...' }.",
    noob: "You are a clueless new player. You love items that 'look cool' or have high numbers, regardless of if they are good for ${myHero}. Be enthusiastic! Return ONLY JSON: { 'items': ['Item1', ...], 'strategy': '...' }."
  };

  // Ensure we use the correct 3.1 model ID
  const MODEL_ID = "gemini-3.1-flash-lite"; 

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: personas[mode] || personas.pro }] },
        contents: [{ parts: [{ text: `My hero: ${myHero}. Enemy team: ${enemyTeam.join(', ')}` }] }]
      })
    });

    const data = await response.json();

    if (!data.candidates) {
      console.error("API Error:", JSON.stringify(data));
      return res.status(500).json({ error: "API failed", details: data });
    }

    res.status(200).json(JSON.parse(data.candidates[0].content.parts[0].text));
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
}