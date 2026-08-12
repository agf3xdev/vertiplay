// Prazo da seleção de histórias — inscrições até 20/08/2026, 23h59 (Brasília).
export const WRITERS_DEADLINE_ISO = "2026-08-20T23:59:00-03:00";
export const WRITERS_DEADLINE_LABEL = "20 de agosto de 2026, às 23h59";

export function isWritersSubmissionOpen(): boolean {
  return Date.now() < new Date(WRITERS_DEADLINE_ISO).getTime();
}
