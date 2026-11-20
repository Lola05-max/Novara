
export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "AI is not configured yet." },
      { status: 503 }
    );
  }

  try {
    const { object, language } = await req.json();

    if (
      typeof object !== "string" ||
      !object.trim() ||
      object.length > 300
    ) {
      return Response.json(
        { error: "Please enter an object (max. 300 characters)." },
        { status: 400 }
      );
    }

    const lang = language === "de" ? "German" : "English";

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          instructions:
            "You are NOVARA AI, a creative upcycling assistant. " +
            "Suggest one practical, sustainable and safe second-life idea " +
            "for the user's object. Include materials and simple steps. " +
            "Avoid hazardous activities, dangerous tools, chemicals, " +
            "electrical repairs and unsafe projects. " +
            "If a project needs adult expertise, say so. " +
            `Respond in ${lang}.`,
          input: object.trim(),
          max_output_tokens: 350
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: "The AI service is temporarily unavailable." },
        { status: 502 }
      );
    }

    return Response.json({ idea: data.output_text || "No idea returned." });

  } catch {
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
};
