# OTUS React Diploma Project

Vite + React + TypeScript foundation for the OTUS diploma project. The domain layer will be selected separately: an online store or income/expense tracking.

## Stack

- React and TypeScript
- PrimeReact and Prime Icons
- React Router DOM
- Axios
- React Hook Form, Zod, and `@hookform/resolvers`

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

The development server is available at the address printed by Vite after `npm run dev`.

## Configuration

The API base URL for the next implementation steps is:

```text
http://19429ba06ff2.vps.myjino.ru/api
```

For GitHub Pages, build with the repository path in `VITE_BASE_PATH`:

```powershell
$env:VITE_BASE_PATH = '/repository-name/'
npm run build
```

Keep `VITE_BASE_PATH` unset for local development, where the app is served from `/`.
