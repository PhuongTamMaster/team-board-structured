export type Status = 'todo' | 'doing' | 'done'

export interface Task {
  id: string
  title: string
  assignee?: string
  status: Status
  createdAt: string // ISO date-time
}

export const COLUMNS: { status: Status; label: string }[] = [
  { status: 'todo', label: 'To do' },
  { status: 'doing', label: 'Doing' },
  { status: 'done', label: 'Done' },
]

export const TITLE_MAX = 80
export const ASSIGNEE_MAX = 40
export const STORAGE_KEY ='team-board.tasks.v1'
const STATUSES: readonly string[] = COLUMNS.map((c) => c.status)

/** Trims input and checks the rules. Returns an error message, or null if valid. */
export function validateTitle(raw: string): string | null {
  const title = raw.trim()
  if (!title) return 'Title is required.'
  if (title.length > TITLE_MAX) return `Title must be at most ${TITLE_MAX} characters (now ${title.length}).`
  return null
}

export function createTask(title: string, assignee: string): Task {
  const name = assignee.trim().slice(0, ASSIGNEE_MAX)
  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    ...(name ? { assignee: name } : {}),
    status: 'todo',
    createdAt: new Date().toISOString(),
  }
}

/** Accepts only well-formed tasks, so hand-edited or old data can't crash the app. */
function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false
  const t = value as Record<string, unknown>
  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    t.title.trim() !== '' &&
    (t.assignee === undefined || typeof t.assignee === 'string') &&
    typeof t.status === 'string' && STATUSES.includes(t.status) &&
    typeof t.createdAt === 'string' && !Number.isNaN(Date.parse(t.createdAt))
  )
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isTask) : []
  } catch {
    return [] // corrupt JSON or storage blocked (e.g. some private-browsing modes)
  }
}

/** Returns false if the browser refused to save (storage full or disabled). */
export function saveTasks(tasks: Task[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    return true
  } catch {
    return false
  }
}
