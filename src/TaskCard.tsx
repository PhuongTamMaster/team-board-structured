import { COLUMNS, type Status, type Task } from './tasks.ts'

interface Props {
  task: Task
  onMove: (id: string, status: Status) => void
  onDelete: (id: string) => void
}

const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

export default function TaskCard({ task, onMove, onDelete }: Props) {
  const index = COLUMNS.findIndex((c) => c.status === task.status)
  const prev = COLUMNS[index - 1]
  const next = COLUMNS[index + 1]

  return (
    <li className="card">
      <p className="card-title">{task.title}</p>
      <p className="card-meta">
        <span className={task.assignee ? 'assignee' : 'assignee unassigned'}>
          {task.assignee ?? 'Unassigned'}
        </span>
        <time dateTime={task.createdAt}>{dateFormat.format(new Date(task.createdAt))}</time>
      </p>
      <div className="card-actions">
        {prev && (
          <button type="button" onClick={() => onMove(task.id, prev.status)} aria-label={`Move "${task.title}" to ${prev.label}`}>
            ← {prev.label}
          </button>
        )}
        {next && (
          <button type="button" onClick={() => onMove(task.id, next.status)} aria-label={`Move "${task.title}" to ${next.label}`}>
            {next.label} →
          </button>
        )}
        <button
          type="button"
          className="delete"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete "${task.title}"`}
          title="Delete"
        >
          ✕
        </button>
      </div>
    </li>
  )
}
