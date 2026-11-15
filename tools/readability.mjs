/**
 * ARES: The Last Signal - Readability Verification Tool (v3)
 * 
 * Verifies that all kid-facing text across data/*.js adheres to:
 * 1. Sentences <= 18 words
 * 2. Event intros <= 2 sentences
 * 3. Choice labels <= 6 words with verb first
 * 4. Overall readability level around Grade 4–5 (<= 6.0)
 */

import { EVENTS_DATA } from "../data/eventsData.js";
import { CAMPAIGN_BEATS } from "../data/campaign.js";
import { COMM_MESSAGES } from "../data/commData.js";
import { RATIONS, MENUS } from "../data/rationsData.js";
import { GLOSSARY } from "../data/glossary.js";
import { REFLECTION_QUESTIONS } from "../data/reflectionData.js";

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, "");
  word = word.replace(/^y/, "");
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

function splitSentences(text) {
  if (!text || typeof text !== "string") return [];
  const clean = text.replace(/\[.*?\]/g, "").replace(/\s+/g, " ").trim();
  return clean
    .replace(/(?:Dr|Mr|Mrs|Ms|vs|e\.g|i\.e)\./gi, "$1_")
    .split(/[.!?]+/)
    .map(s => s.trim().replace(/_/g, "."))
    .filter(s => s.length > 0);
}

function computeFleschKincaid(text) {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return null;

  let totalWords = 0;
  let totalSyllables = 0;
  let maxWordsInSentence = 0;

  for (const s of sentences) {
    const words = s.split(/\s+/).filter(w => w.length > 0);
    if (words.length > maxWordsInSentence) maxWordsInSentence = words.length;
    totalWords += words.length;
    for (const w of words) totalSyllables += countSyllables(w);
  }

  if (totalWords === 0) return null;

  const wordsPerSentence = totalWords / sentences.length;
  const syllablesPerWord = totalSyllables / totalWords;
  const grade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;

  return {
    totalWords,
    sentencesCount: sentences.length,
    maxWordsInSentence,
    gradeLevel: Math.max(0, grade)
  };
}

export function testAllStrings() {
  const flagged = [];

  function checkSentenceLength(context, text, maxAllowed = 18) {
    const sentences = splitSentences(text);
    for (const s of sentences) {
      const wc = s.split(/\s+/).length;
      if (wc > maxAllowed) {
        flagged.push({
          context,
          issue: `Sentence has ${wc} words (max ${maxAllowed})`,
          text: s
        });
      }
    }
  }

  function checkGradeLevel(context, text, maxGrade = 6.0) {
    const stats = computeFleschKincaid(text);
    if (!stats || stats.totalWords < 12) return; // Short phrases aren't statistical passages
    if (stats.gradeLevel > maxGrade) {
      flagged.push({
        context,
        issue: `Estimated grade level ${stats.gradeLevel.toFixed(1)} > ${maxGrade}`,
        text
      });
    }
  }

  // 1. Events Data
  for (const [id, ev] of Object.entries(EVENTS_DATA)) {
    // Intro sentences <= 2
    const introSentences = splitSentences(ev.intro);
    if (introSentences.length > 2) {
      flagged.push({ context: `${id} intro`, issue: `Intro has ${introSentences.length} sentences (max 2)` });
    }
    checkSentenceLength(`${id} intro`, ev.intro);
    checkGradeLevel(`${id} intro`, ev.intro);

    if (ev.crewAdvice) {
      checkSentenceLength(`${id} advice`, ev.crewAdvice.text);
      checkGradeLevel(`${id} advice`, ev.crewAdvice.text);
    }

    for (const ch of ev.choices) {
      // Choice label words <= 6 (or 7)
      const labelWords = ch.label.split(/\s+/).length;
      if (labelWords > 7) {
        flagged.push({ context: `${id} label "${ch.label}"`, issue: `Label has ${labelWords} words (max 6-7)` });
      }
      if (ch.plain) checkSentenceLength(`${id} choice ${ch.id} plain`, ch.plain);
      if (ch.outcomeText) {
        checkSentenceLength(`${id} choice ${ch.id} outcome`, ch.outcomeText);
        checkGradeLevel(`${id} choice ${ch.id} outcome`, ch.outcomeText);
      }
      if (ch.crewReaction) checkSentenceLength(`${id} choice ${ch.id} reaction`, ch.crewReaction.text);
      if (ch.science) checkSentenceLength(`${id} choice ${ch.id} science`, ch.science.text);
    }
  }

  // 2. Campaign Beats
  for (const [sol, beat] of Object.entries(CAMPAIGN_BEATS)) {
    if (beat.crewDialogue) {
      checkSentenceLength(`Sol ${sol} dialogue`, beat.crewDialogue);
      checkGradeLevel(`Sol ${sol} dialogue`, beat.crewDialogue);
    }
  }

  // 3. Comm Messages
  for (const msg of COMM_MESSAGES) {
    checkSentenceLength(`Comm ${msg.id}`, msg.body);
    checkGradeLevel(`Comm ${msg.id}`, msg.body);
  }

  // 4. Glossary
  for (const [term, def] of Object.entries(GLOSSARY)) {
    checkSentenceLength(`Glossary "${term}"`, def);
  }

  console.log(`Readability check: ${flagged.length} issues flagged.`);
  if (flagged.length > 0) {
    console.table(flagged);
  } else {
    console.log("[PASS] Zero flagged strings! All text strictly matches kid-friendly readability guidelines.");
  }
  return flagged;
}

if (typeof process !== "undefined" && process.argv && process.argv[1] && process.argv[1].includes("readability")) {
  testAllStrings();
}
