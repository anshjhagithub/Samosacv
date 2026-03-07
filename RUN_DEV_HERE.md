# Run dev server from THIS folder only

To see all code changes:

1. Open this folder in Cursor / VS Code: **D:\Resume builder**
2. In the terminal, run: **npm run dev**
3. Use the flow: **Get Started** → **Start from scratch** → fill Basics → Experience → Template → **Projects** → **Build My Resume**

The API is only called when you click **Build My Resume** on the Projects page. You should see in the terminal: `[generate-from-minimal] POST received`

---

## If you see CORS errors for `get-limits` on `/create` or "still showing older version"

The `/create` page does **not** fetch limits; only the Pricing page does (via `/api/limits`). CORS on `get-limits` from `localhost:3000` usually means an **old cached bundle** is running.

1. **Stop** the dev server (Ctrl+C).
2. **Delete** the build cache: remove the `.next` folder in this directory.
3. **Start** again: `npm run dev`.
4. **Hard refresh** the browser on `/create`: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac).

To confirm you’re on the new bundle: open DevTools → Elements, select the main content area on `/create`. You should see `data-create-version="no-limits"` on the root div. If that attribute is missing, the old bundle is still loading.
