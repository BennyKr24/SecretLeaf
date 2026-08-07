"use client";

import { useState } from "react";
import { diagnoseNodes, diagnoseResults } from "@/lib/diagnose/tree";
import type { DiagnoseCategory } from "@/lib/diagnose/tree";
import { DiagnoseResult } from "./DiagnoseResult";

type Props = {
  category: DiagnoseCategory;
  onBack: () => void;
  growId?: string | undefined;
  plantId?: string | undefined;
};

type FlowState =
  | { kind: "question"; nodeId: string; history: string[] }
  | { kind: "result"; resultId: string };

export function DiagnoseFlow({ category, onBack, growId, plantId }: Props) {
  const [state, setState] = useState<FlowState>({
    kind: "question",
    nodeId: category.startNodeId,
    history: [],
  });

  // Light fade between steps so question/result content doesn't teleport in
  // place on every click. Triggered directly from the action handlers below
  // (event-driven), not from an effect watching `state` — this repo's lint
  // config flags synchronous setState-in-effect as a cascading-render
  // anti-pattern (see TODO.md), so the visible-toggle fades elsewhere in the
  // app (grow/[id]/log/page.tsx SavedBanner/DailyCompletionBanner) are always
  // driven by the user action itself. Double rAF forces the browser to paint
  // the opacity-0 frame before flipping back to opacity-100, so the
  // transition reliably fires instead of being coalesced into one frame.
  const [stepVisible, setStepVisible] = useState(true);
  function triggerStepFade() {
    setStepVisible(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setStepVisible(true));
    });
  }
  const stepFadeClass = `transition-opacity duration-200 ease-out ${stepVisible ? "opacity-100" : "opacity-0"}`;

  function handleOption(option: { nextNodeId?: string; resultId?: string }) {
    if (option.resultId) {
      triggerStepFade();
      setState({ kind: "result", resultId: option.resultId });
      return;
    }
    if (option.nextNodeId) {
      triggerStepFade();
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
      triggerStepFade();
      setState({ kind: "question", nodeId: category.startNodeId, history: [] });
      return;
    }
    if (state.history.length === 0) {
      onBack();
      return;
    }
    const prev = state.history[state.history.length - 1] ?? category.startNodeId;
    triggerStepFade();
    setState({
      kind: "question",
      nodeId: prev,
      history: state.history.slice(0, -1),
    });
  }

  function handleReset() {
    triggerStepFade();
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
            className="flex items-center gap-1 text-sm text-muted-fg hover:text-foreground transition active:scale-[0.97]"
          >
            ← Zurück
          </button>
          <p className="text-sm text-muted-fg">Unbekanntes Ergebnis: {state.resultId}</p>
        </div>
      );
    }
    return (
      <div className={`flex flex-col gap-4 ${stepFadeClass}`}>
        {/* Back button */}
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-sm text-muted-fg hover:text-foreground transition active:scale-[0.97] self-start"
        >
          ← Neue Diagnose
        </button>
        <DiagnoseResult result={result} category={category.id} onReset={handleReset} growId={growId} plantId={plantId} />
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
          className="flex items-center gap-1 text-sm text-muted-fg hover:text-foreground transition active:scale-[0.97] self-start"
        >
          ← Zurück
        </button>
        <p className="text-sm text-red-500">Fehler: Knoten „{state.nodeId}“ nicht gefunden.</p>
      </div>
    );
  }

  const stepCount = state.history.length + 1;

  return (
    <div className={`flex flex-col gap-5 ${stepFadeClass}`}>
      {/* Header nav */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-muted-fg hover:text-foreground transition active:scale-[0.97] shrink-0"
        >
          ← Zurück
        </button>
        <div className="flex gap-1.5 items-center">
          {Array.from({ length: stepCount }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ${
                i < stepCount - 1 ? "w-6 bg-primary/40" : "w-8 bg-primary"
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
              className="text-left rounded-xl border border-border bg-background hover:bg-primary/10 hover:border-primary/40 active:scale-[0.98] transition-[transform,background-color,border-color] duration-150 px-4 py-3 text-sm text-foreground font-medium"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
