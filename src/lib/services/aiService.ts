import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Erreur lors de la génération de la description de projet:', error);
    throw error;
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

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Erreur lors de la génération de la description de mission:', error);
    throw error;
  }
}

/**
 * Génère un cahier des charges à partir des informations du projet
 */
export async function generateSpecifications(title: string, description: string, skills: string[]) {
  try {
    const specificationPrompt = `En tant qu'expert en gestion de projet informatique, génère un cahier des charges détaillé pour le projet suivant:
    Titre: ${title}
    Description: ${description}
    Compétences requises: ${skills.join(', ')}
    
    Format souhaité:
    1. Objectifs du projet
    2. Fonctionnalités principales
    3. Spécifications techniques
    4. Planning estimatif
    5. Livrables attendus`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: specificationPrompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Erreur lors de la génération du cahier des charges:', error);
    throw error;
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

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    return response.data[0]?.url;
  } catch (error) {
    console.error('Erreur lors de la génération de l\'image:', error);
    throw error;
  }
} 