// Structured console log model shared by the executor, App state and Console UI.
export type LogKind =
    | 'system'   // lifecycle / app notifications (start, finish, export done, ...)
    | 'trace'    // internal execution steps (declare, assignment, decision) — dimmable
    | 'output'   // real program output (WRITE blocks) — shown prominently
    | 'prompt'   // an input request awaiting the user
    | 'input'    // the value the user typed (echo)
    | 'warning'  // non-fatal warnings
    | 'error';   // failures

export interface LogEntry {
    kind: LogKind;
    text: string;
    ts: number;
}

export type EmitLog = (entry: { kind: LogKind; text: string }) => void;
