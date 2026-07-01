import { getDiagnoseKnowledge } from "@/lib/knowledge/graph";

export function getRelatedDiagnoseArticles(resultId: string) {
  return getDiagnoseKnowledge(resultId).map((match) => match.article);
}

export function getDiagnoseKnowledgeContext(resultId: string) {
  const matches = getDiagnoseKnowledge(resultId);
  const evidenceLevel = matches.reduce<"low" | "medium" | "high">((current, match) => {
    if (match.evidenceLevel === "high") return "high";
    if (current === "high") return current;
    if (match.evidenceLevel === "medium") return "medium";
    return current;
  }, "low");
  const confidenceScore = matches.length > 0
    ? Math.round(matches.reduce((sum, match) => sum + match.confidenceScore, 0) / matches.length)
    : 54;

  return {
    matches,
    evidenceLevel,
    confidenceScore,
  };
}