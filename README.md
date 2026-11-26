# Team Board

A small Kanban board (To do / Doing / Done) for a team of 4–5 students.
React + Vite + TypeScript, plain CSS, data stored in the browser's localStorage (no backend, no login).

```sh
npm install
npm run dev      # open the URL Vite prints (usually http://localhost:5173)
npm run build    # type-check + production build
```

Source files (`src/`): `main.tsx` (entry), `App.tsx` (state, form, columns), `TaskCard.tsx` (one task),
`tasks.ts` (types, validation, localStorage), `index.css` (styles).

Note: data lives in each browser separately — teammates on different computers won't see each other's tasks until a backend is added.
