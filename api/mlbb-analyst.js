export default async function handler(req, res) {
  const { enemyTeamString, myHero, role, mode } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;
  const MODEL_ID = "gemini-3.1-flash-lite"; 

  const personas = {
    pro: `You are a top-tier MLBB pro analyst. Provide professional, data-driven item builds and strategic advice for hero: ${myHero} playing as ${role}. Enemy team: ${enemyTeamString}. Return ONLY JSON: { 'items': ['Item1', ...], 'strategy': '...' }.`,
    dark: `You are a toxic MLBB teammate. Roast the player for their choice of ${myHero} and their lane (${role}). Enemy team: ${enemyTeamString}. Give intentionally terrible advice. Return ONLY JSON: { 'items': ['Item1', ...], 'strategy': '...' }.`,
    noob: `You are a clueless new player. You love items that 'look cool' for ${myHero} in ${role} lane. Enemy team: ${enemyTeamString}. Be enthusiastic and use exclamations. Return ONLY JSON: { 'items': ['Item1', ...], 'strategy': '...' }.`
  };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: personas[mode] || personas.pro }] },
        contents: [{ parts: [{ text: `Analyze the draft.` }] }]
      })
    });

    const data = await response.json();
    res.status(200).json(JSON.parse(data.candidates[0].content.parts[0].text));
  } catch (error) {
    res.status(500).json({ error: "API Failure", details: error.message });
  }
}
