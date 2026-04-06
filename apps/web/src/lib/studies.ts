"use client";

import type { CreateStudyInput, StudiesListResponse, StudyRecord } from "./types";
import type { SessionData } from "./types";

export type StudyQuality = "good" | "pending" | "bad";

export type FetchStudiesOptions = {
  page?: number;
  limit?: number;
  quality?: StudyQuality | "all";
  tag?: string;
  q?: string;
};

export function getStudyQuality(study: StudyRecord): StudyQuality {
  return study.qualityStatus;
}

function authHeaders(session?: SessionData | null): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
  };
}

export async function fetchStudies(
  session?: SessionData | null,
  options?: FetchStudiesOptions
): Promise<StudiesListResponse> {
  const params = new URLSearchParams();
  if (options?.page) params.set("page", String(options.page));
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.quality && options.quality !== "all") params.set("quality", options.quality);
  if (options?.tag && options.tag.trim().length > 0) params.set("tag", options.tag.trim().toLowerCase());
  if (options?.q && options.q.trim().length > 0) params.set("q", options.q.trim());

  const query = params.toString();
  const response = await fetch(`/api/studies${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: authHeaders(session),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ error: "Failed to fetch studies" }))) as {
      error?: string;
    };
    throw new Error(body.error ?? "Failed to fetch studies");
  }

  const body = (await response.json()) as StudiesListResponse;
  return {
    studies: body.studies ?? [],
    total: body.total ?? 0,
    pagination: body.pagination ?? {
      page: options?.page ?? 1,
      limit: options?.limit ?? 25,
      totalPages: 1,
      hasNext: false,
    },
  };
}

export async function createStudy(
  input: CreateStudyInput,
  session?: SessionData | null
): Promise<StudyRecord> {
  const response = await fetch("/api/studies", {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ error: "Failed to create study" }))) as {
      error?: string;
    };
    throw new Error(body.error ?? "Failed to create study");
  }

  const body = (await response.json()) as { study: StudyRecord };
  return body.study;
}

export async function updateStudyTags(
  studyId: string,
  tags: string[],
  session?: SessionData | null
): Promise<StudyRecord> {
  const response = await fetch(`/api/studies/${studyId}`, {
    method: "PATCH",
    headers: authHeaders(session),
    body: JSON.stringify({ tags }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ error: "Failed to update study" }))) as {
      error?: string;
    };
    throw new Error(body.error ?? "Failed to update study");
  }

  const body = (await response.json()) as { study: StudyRecord };
  return body.study;
}

export async function updateStudyReview(
  studyId: string,
  payload: {
    qualityStatus?: StudyQuality;
    reviewNote?: string;
    tags?: string[];
  },
  session?: SessionData | null
): Promise<StudyRecord> {
  const response = await fetch(`/api/studies/${studyId}`, {
    method: "PATCH",
    headers: authHeaders(session),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ error: "Failed to update study review" }))) as {
      error?: string;
    };
    throw new Error(body.error ?? "Failed to update study review");
  }

  const body = (await response.json()) as { study: StudyRecord };
  return body.study;
}

export type StudyQueryOptions = {
  search?: string | undefined;
  tag?: string | undefined;
};

export function filterStudies(studies: StudyRecord[], options: StudyQueryOptions): StudyRecord[] {
  const search = options.search?.trim().toLowerCase() ?? "";
  const tag = options.tag?.trim().toLowerCase() ?? "";

  return studies.filter((study) => {
    const matchesSearch =
      !search ||
      study.title.toLowerCase().includes(search) ||
      (study.description?.toLowerCase().includes(search) ?? false) ||
      (study.source?.toLowerCase().includes(search) ?? false) ||
      study.tags.some((entry) => entry.toLowerCase().includes(search));

    const matchesTag = !tag || study.tags.some((entry) => entry.toLowerCase() === tag);

    return matchesSearch && matchesTag;
  });
}
