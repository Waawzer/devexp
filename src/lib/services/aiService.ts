import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 seconds timeout for API requests
});

// Helper function to implement timeout for promises
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};

/**
 * Génère une description améliorée pour un projet
 */
export async function generateProjectDescription(description: string) {
  try {
    const prompt = `En tant qu'expert en communication technique, améliore et structure la description suivante d'un projet informatique pour la rendre plus détaillée et professionnelle. Utilise des puces (•) pour lister les fonctionnalités principales. La description doit être claire, concise et bien organisée.

Description actuelle: ${description}

Format souhaité:
- Un paragraphe d'introduction expliquant le concept général du projet
- Liste des fonctionnalités principales avec des puces (•)
- Un paragraphe de conclusion sur les cas d'usage et l'impact potentiel du projet`;

    // Add timeout of 30 seconds
    const responsePromise = openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    try {
      const response = await withTimeout(responsePromise, 30000);
      return response.choices[0].message.content;
    } catch (timeoutError) {
      console.warn('Timeout lors de la génération de la description:', timeoutError);
      return description; // Return original description on timeout
    }
  } catch (error) {
    console.error('Erreur lors de la génération de la description de projet:', error);
    // Return the original description if there's an error
    return description;
  }
}

/**
 * Génère une description améliorée pour une mission
 */
export async function generateMissionDescription(description: string) {
  try {
    const prompt = `En tant qu'expert en gestion de projet, améliore et structure la description suivante d'une mission ou tâche informatique pour la rendre plus claire et actionnable. La description doit être précise et orientée vers les résultats attendus.

Description actuelle: ${description}

Format souhaité:
- Un paragraphe expliquant clairement l'objectif de la mission
- Liste des tâches spécifiques à accomplir avec des puces (•)
- Précision des livrables attendus
- Critères de succès pour évaluer l'achèvement de la mission`;

    const responsePromise = openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    try {
      const response = await withTimeout(responsePromise, 30000);
      return response.choices[0].message.content;
    } catch (timeoutError) {
      console.warn('Timeout lors de la génération de la description de mission:', timeoutError);
      return description; // Return original description on timeout
    }
  } catch (error) {
    console.error('Erreur lors de la génération de la description de mission:', error);
    return description;
  }
}

/**
 * Génère un cahier des charges à partir des informations du projet
 */
export async function generateSpecifications(
  title: string,
  description: string,
  skills: string[] | string
): Promise<string> {
  try {
    // Normaliser les skills en chaîne de caractères
    const skillsText = typeof skills === 'string' 
      ? skills 
      : Array.isArray(skills) 
        ? skills.join(', ') 
        : '';

    const prompt = `
      Génère un cahier des charges détaillé pour un projet de développement web avec les informations suivantes:
      
      Titre du projet: ${title}
      Description: ${description}
      Compétences techniques: ${skillsText}
      
      Le cahier des charges doit inclure:
      1. Contexte et objectifs du projet
      2. Fonctionnalités principales
      3. Spécifications techniques
      4. Livrables attendus
      5. Contraintes et exigences particulières
      
      Formate le texte en markdown.
    `;

    const responsePromise = openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Tu es un expert en rédaction de cahiers des charges pour des projets de développement web." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    try {
      const response = await withTimeout(responsePromise, 45000); // Longer timeout for specifications
      return response.choices[0].message.content || "";
    } catch (timeoutError) {
      console.warn('Timeout lors de la génération des spécifications:', timeoutError);
      // Return a basic specification on timeout
      return `# Cahier des charges: ${title}\n\n## Contexte et objectifs\n${description}\n\n## Compétences techniques\n${skills}`;
    }
  } catch (error) {
    console.error("Erreur lors de la génération du cahier des charges:", error);
    // Return a basic specification on error
    return `# Cahier des charges: ${title}\n\n## Contexte et objectifs\n${description}\n\n## Compétences techniques\n${skills}`;
  }
}

/**
 * Génère une image pour un projet à partir de sa description
 */
export async function generateProjectImage(title: string, description: string) {
  try {
    const imagePrompt = `Une illustration moderne et professionnelle pour un projet informatique intitulé "${title}". 
    Le projet concerne: ${description}. 
    Style: Minimaliste, technologique, avec des couleurs douces et professionnelles.`;

    const responsePromise = openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    try {
      const response = await withTimeout(responsePromise, 45000); // Longer timeout for image generation
      return response.data[0]?.url;
    } catch (timeoutError) {
      console.warn('Timeout lors de la génération de l\'image:', timeoutError);
      // Return null on timeout, the calling code should handle this
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la génération de l\'image:', error);
    return null;
  }
} 