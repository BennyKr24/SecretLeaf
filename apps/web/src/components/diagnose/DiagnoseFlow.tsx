"use client";

import { useState } from "react";
import { diagnoseNodes, diagnoseResults } from "@/lib/diagnose/tree";
import type { DiagnoseCategory } from "@/lib/diagnose/tree";
import { DiagnoseResult } from "./DiagnoseResult";

type Props = {
  category: DiagnoseCategory;
  onBack: () => void;
};

type FlowState =
  | { kind: "question"; nodeId: string; history: string[] }
  | { kind: "result"; resultId: string };

export function DiagnoseFlow({ category, onBack }: Props) {
  const [state, setState] = useState<FlowState>({
    kind: "question",
    nodeId: category.startNodeId,
    history: [],
  });

  function handleOption(option: { nextNodeId?: string; resultId?: string }) {
    if (option.resultId) {
      setState({ kind: "result", resultId: option.resultId });
      return;
    }
    if (option.nextNodeId) {
      setState((prev) => ({
        kind: "question",
        nodeId: option.nextNodeId!,
        history: prev.kind === "question" ? [...prev.history, prev.nodeId] : [],
      }));
    }
  }

  function handleBack() {
    if (state.kind === "result") {
      // Find the last node that led to this result — just go back to start
      setState({ kind: "question", nodeId: category.startNodeId, history: [] });
      return;
    }
    if (state.history.length === 0) {
      onBack();
      return;
    }
    const prev = state.history[state.history.length - 1] ?? category.startNodeId;
    setState({
      kind: "question",
      nodeId: prev,
      history: state.history.slice(0, -1),
    });
  }

  function handleReset() {
    setState({ kind: "question", nodeId: category.startNodeId, history: [] });
  }

  // Result screen
  if (state.kind === "result") {
    const result = diagnoseResults[state.resultId];
    if (!result) {
      return (
        <div className="flex flex-col gap-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-sm text-muted-fg hover:text-foreground/80 transition"
          >
            ← Zurück
          </button>
          <p className="text-sm text-muted-fg">Unbekanntes Ergebnis: {state.resultId}</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-4">
        {/* Back button */}
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-sm text-muted-fg hover:text-foreground/80 transition self-start"
        >
          ← Neue Diagnose
        </button>
        <DiagnoseResult result={result} category={category.id} onReset={handleReset} />
      </div>
    );
  }

  // Question screen
  const node = diagnoseNodes[state.nodeId];
  if (!node) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-muted-fg hover:text-foreground/80 transition self-start"
        >
          ← Zurück
        </button>
        <p className="text-sm text-red-500">Fehler: Knoten „{state.nodeId}“ nicht gefunden.</p>
      </div>
    );
  }

  const stepCount = state.history.length + 1;

  return (
    <div className="flex flex-col gap-5">
      {/* Header nav */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-muted-fg hover:text-foreground/80 transition shrink-0"
        >
          ← Zurück
        </button>
        <div className="flex gap-1.5 items-center">
          {Array.from({ length: stepCount }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i < stepCount - 1 ? "w-6 bg-emerald-300" : "w-8 bg-emerald-500"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Category label */}
      <div className="flex items-center gap-2">
        <category.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-fg">
          {category.label}
        </span>
      </div>

      {/* Question card */}
      <div className="rounded-2xl bg-card border border-border shadow-sm p-5 flex flex-col gap-4">
        <p className="text-base font-semibold text-foreground leading-snug">{node.question}</p>
        {node.hint && (
          <p className="text-xs text-muted-fg italic leading-relaxed">{node.hint}</p>
        )}

        <div className="flex flex-col gap-2 mt-1">
          {node.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleOption(option)}
              className="text-left rounded-xl border border-border bg-background hover:bg-emerald-50 hover:border-emerald-200 active:scale-[0.98] transition-all px-4 py-3 text-sm text-foreground font-medium"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
