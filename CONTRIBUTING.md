# Contributing

Use Node.js 22+. There is no compilation step or dependency install. Run `npm start`, `npm run check`, and `npm test` from this directory.

`src/server.js` owns HTTP routes and validation; `store.js` owns persistence; `cad.js` owns parametric exports; `content.js` owns document parsing; `assistant.js` owns optional language model requests; `millwright.js` owns the Windows sidecar bridge. `public/` is the browser application and original code-drawn artwork. Keep API keys server-side and escape all user text before HTML insertion.

Include a meaningful regression test for changes to persistence, imports, version handling, file uploads, exports, or authorization. Never commit personal project data, credentials or files from the reference website. Clearly label estimated specifications and provider-dependent features.
