const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const prompt = `
      Generate a fun love-related multiple-choice quiz question with:
      1. Four options (labeled A, B, C, D)
      2. Mark the correct answer explicitly with "Correct Answer: [letter]"
      3. Format: 
         Question: [Your question]
         A) [Option 1]
         B) [Option 2]
         C) [Option 3]
         D) [Option 4]
         Correct Answer: [Letter]
    `;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const quizText = data.choices[0]?.message?.content;
    
    // Parse the response
    const parsedQuiz = parseQuizResponse(quizText);
    res.status(200).json(parsedQuiz);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
}

// Helper function to parse the AI response
function parseQuizResponse(text) {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const question = lines[0].replace('Question: ', '').trim();
  const options = lines.slice(1, 5).map(line => line.trim());
  const correctAnswer = lines[5]?.match(/Correct Answer: ([A-D])/i)?.[1];

  return {
    question,
    options,
    correctAnswer
  };
}