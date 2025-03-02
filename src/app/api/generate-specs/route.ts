import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { title, description, skills } = await request.json();

    const prompt = `En tant qu'expert en développement logiciel, génère un cahier des charges détaillé et bien structuré pour le projet suivant:

Titre: ${title}
Description initiale: ${description}
Technologies mentionnées: ${skills}

Format requis en Markdown avec la structure suivante:

# ${title} - Cahier des Charges

## 1. Contexte et Objectifs
- Contexte du projet
- Objectifs principaux
- Public cible

## 2. Spécifications Fonctionnelles
- Fonctionnalités principales
- Parcours utilisateur
- Interfaces requises

## 3. Architecture Technique
- Architecture globale
- Composants principaux
- Flux de données

## 4. Stack Technologique
- Front-end
- Back-end
- Base de données
- Outils et services

## 5. Phases de Développement
- Phase 1: Préparation et Setup
- Phase 2: Développement Core
- Phase 3: Fonctionnalités Avancées
- Phase 4: Tests et Déploiement

## 6. Contraintes et Recommandations
- Contraintes techniques
- Sécurité
- Performance
- Scalabilité

## 7. Qualité et Tests
- Stratégie de test
- Critères de qualité
- Métriques de performance

Utilise des listes à puces (-) pour les détails et mets en gras (**) les points importants.
Si la description initiale manque de détails, complète-la de manière cohérente avec le contexte.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en développement logiciel chargé de rédiger des cahiers des charges détaillés et bien structurés. Utilise le Markdown pour une mise en forme claire et professionnelle."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const specifications = completion.choices[0].message.content;

    return NextResponse.json({ specifications });
  } catch (error) {
    console.error('Erreur lors de la génération du cahier des charges:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du cahier des charges' },
      { status: 500 }
    );
  }
} 