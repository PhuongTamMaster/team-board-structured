import { useEffect, useState, type FormEvent } from 'react'
import TaskCard from './TaskCard.tsx'
import {
  ASSIGNEE_MAX, COLUMNS, STORAGE_KEY, TITLE_MAX,
  createTask, loadTasks, saveTasks, validateTitle,
  type Status, type Task,
} from './tasks.ts'

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saveFailed, setSaveFailed] = useState(false)

  // Every user change goes through here so it is saved immediately.
  function update(next: Task[]) {
    setTasks(next)
    setSaveFailed(!saveTasks(next))
  }

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setTasks(loadTasks())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const problem = validateTitle(title)
    if (problem) {
      setError(problem)
      return
    }
    update([...tasks, createTask(title, assignee)])
    setTitle('')
    setAssignee('')
    setError(null)
  }

  const moveTask = (id: string, status: Status) =>
    update(tasks.map((t) => (t.id === id ? { ...t, status } : t)))

  const deleteTask = (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (task && window.confirm(`Delete "${task.title}"?`)) {
      update(tasks.filter((t) => t.id !== id))
    }
  }

  const remaining = TITLE_MAX - title.trim().length

  return (
    <div className="app">
      <header>
        <h1>Team Board</h1>
        <p className="subtitle">{tasks.length} task{tasks.length === 1 ? '' : 's'}</p>
      </header>

      {saveFailed && (
        <p className="banner" role="alert">
          Couldn't save to this browser's storage. Your changes will be lost when you close the tab.
        </p>
      )}

      <form className="add-form" onSubmit={handleSubmit} noValidate>
        <div className="field grow">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (error) setError(null)
            }}
            placeholder="e.g. Write PRD draft"
            aria-invalid={error ? true : undefined}
            aria-describedby="title-help"
            autoComplete="off"
          />
          <span id="title-help" className={error || remaining < 0 ? 'help error' : 'help'} role={error ? 'alert' : undefined}>
            {error ?? `${remaining} characters left`}
          </span>
        </div>
        <div className="field">
          <label htmlFor="assignee">Assignee (optional)</label>
          <input
            id="assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="e.g. Lan"
            maxLength={ASSIGNEE_MAX}
            autoComplete="off"
          />
        </div>
        <button type="submit" className="primary">Add task</button>
      </form>

      <main className="board">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status)
          return (
            <section key={col.status} className={`column column-${col.status}`} aria-labelledby={`h-${col.status}`}>
              <h2 id={`h-${col.status}`}>
                {col.label} <span className="count">{colTasks.length}</span>
              </h2>
              {colTasks.length === 0 ? (
                <p className="empty">No tasks</p>
              ) : (
                <ul className="cards">
                  {colTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onMove={moveTask} onDelete={deleteTask} />
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </main>
    </div>
  )
}
