import { NextResponse } from 'next/server';
import { diagnoseResults, type DiagnoseResult as TreeDiagnoseResult } from '@/lib/diagnose/tree';
import { getDiagnoseKnowledgeContext } from '@/lib/diagnose/knowledge';

export type DiagnoseInput = {
  imageBase64?: string;
  context?: {
    growDay?: number;
    medium?: string;
    phaseId?: string;
    recentLogs?: string[];
    symptomHint?: string;
  };
};

export type DiagnoseResult = {
  diagnosis: string;
  problem: string;
  cause: string;
  reasoning: string;
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number;
  evidenceLevel: 'high' | 'medium' | 'low';
  recommendations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  model: 'rule-based-v1';
  sources: string[];
};

function scoreFromConfidence(confidence: TreeDiagnoseResult['confidence']): number {
  if (confidence === 'high') return 82;
  if (confidence === 'medium') return 64;
  return 42;
}

function severityFromConfidence(confidence: TreeDiagnoseResult['confidence']): DiagnoseResult['severity'] {
  if (confidence === 'high') return 'high';
  if (confidence === 'medium') return 'medium';
  return 'low';
}

function getTreeResult(resultId: keyof typeof diagnoseResults): TreeDiagnoseResult {
  const result = diagnoseResults[resultId];
  if (!result) {
    throw new Error(`Diagnose-Ergebnis ${resultId} ist nicht definiert.`);
  }
  return result;
}

function selectFallbackResult(input: DiagnoseInput): TreeDiagnoseResult {
  const haystack = [
    input.context?.symptomHint,
    ...(input.context?.recentLogs ?? []),
  ]
    .join(' ')
    .toLowerCase();

  if (haystack.includes('spitze') || haystack.includes('burn') || haystack.includes('salz')) {
    return getTreeResult('uebersalzung');
  }
  if (haystack.includes('gelb') || haystack.includes('chlorose') || haystack.includes('magnesium')) {
    return getTreeResult('mg-mangel');
  }
  if (haystack.includes('hitz') || haystack.includes('taco') || haystack.includes('heiss')) {
    return getTreeResult('hitzestress');
  }
  if (haystack.includes('spinn') || haystack.includes('milbe')) {
    return getTreeResult('spinnmilben');
  }

  return getTreeResult('lockout');
}

export async function POST(req: Request) {
  let input: DiagnoseInput;

  try {
    input = (await req.json()) as DiagnoseInput;
  } catch {
    return NextResponse.json(
      {
        error:
          'Die Diagnoseanfrage konnte nicht verarbeitet werden. Bitte prüfe das Anfrageformat und versuche es erneut.',
      },
      { status: 400 },
    );
  }

  const selected = selectFallbackResult(input);
  const knowledge = getDiagnoseKnowledgeContext(selected.id);
  const confidenceScore = Math.max(scoreFromConfidence(selected.confidence), knowledge.confidenceScore);

  const response: DiagnoseResult = {
    diagnosis: selected.title,
    problem: selected.title,
    cause: selected.cause,
    reasoning: selected.reasoning,
    confidence: selected.confidence,
    confidenceScore,
    evidenceLevel: knowledge.evidenceLevel,
    recommendations: selected.steps,
    severity: severityFromConfidence(selected.confidence),
    model: 'rule-based-v1',
    sources: knowledge.matches.map((match) => `study:${match.article.slug}`),
  };

  return NextResponse.json(response, { status: 200 });
}
