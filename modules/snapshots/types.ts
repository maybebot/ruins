import type { UiDataRow } from "@ruins/types";

export interface RuinsSnapshotView {
  name: string;
  label: string;
  columns: string[];
  rows: UiDataRow[];
  status: "available" | "unavailable";
  error?: string;
}

export interface RuinsSnapshotModule {
  name: string;
  label: string;
  views: RuinsSnapshotView[];
}

export interface RuinsProjectSnapshot {
  version: 1;
  id: string;
  createdAt: string;
  asOf: string;
  source: "manual" | "git-history";
  configSource?: "historical" | "current";
  period?: { start: string; end: string };
  commitHash?: string;
  modules: RuinsSnapshotModule[];
}

export interface RuinsSnapshotHistoryEntry {
  id: string;
  asOf: string;
  source: RuinsProjectSnapshot["source"];
  period?: RuinsProjectSnapshot["period"];
  configSource?: RuinsProjectSnapshot["configSource"];
  module?: RuinsSnapshotModule;
}

export interface SnapshotCollectorFailure {
  module: string;
  command: string;
  error: string;
}
