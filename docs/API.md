# Local HTTP API

Base URL: `http://127.0.0.1:5180/api`. Obtain the HttpOnly session cookie with `GET /session` before using private routes. All writes require `Content-Type: application/json`. Browser requests must come from the same origin. This single-user installation is loopback-only.

| Method | Path | Behavior |
|---|---|---|
| GET | `/session` | Session, profile and non-secret integration status |
| GET/PATCH | `/models` | Discover installed/configured models and save the active selection |
| GET/POST/PUT | `/projects/:id/wiring` | Inspect, enrich or edit typed wiring nodes and edges |
| GET/POST/PUT | `/projects/:id/assembly` | Inspect, rebuild or edit conceptual assembly envelopes |
| GET | `/projects/:id/assembly/export` | Export editable layout-envelope SCAD |
| POST | `/projects/:id/instructions/generate` | Generate grouped 13-step build guide |
| PATCH | `/projects/:id/details` | Save a source-reviewed details report |
| PATCH | `/profile` | Update local name and email label |
| GET/POST | `/projects` | List projects or create `{name, template, description}` |
| GET/PATCH | `/projects/:id` | Read or update a project |
| POST | `/projects/:id/duplicate` | Create an independent editable copy |
| POST | `/import` | Import a validated `{project}` JSON object |
| GET | `/projects/:id/export` | Download portable project metadata |
| GET | `/projects/:id/bom` | Download CSV bill of materials |
| POST | `/projects/:id/parts` | Create component |
| PATCH/DELETE | `/projects/:id/parts/:part` | Edit/remove component and clean connections |
| GET | `/projects/:id/parts/:part/cad?format=scad` | Parametric OpenSCAD export |
| GET | `/projects/:id/parts/:part/cad?format=stl` | Triangulated bracket export |
| POST/DELETE | `/projects/:id/chat` | Ask: answer only; Edit: atomic design workflow; DELETE: clear messages |
| PUT | `/projects/:id/instructions` | Save assembly steps/checklist |
| POST | `/projects/:id/uploads` | Save `{name, data}` where data is base64 |
| GET | `/projects/:id/uploads/:upload` | Read saved source file |
| POST | `/projects/:id/uploads/:upload/analyze` | Parse or interpret source once |
| POST/DELETE | `/projects/:id/publish` | Publish/update or revoke a read-only snapshot |
| GET | `/shared/:token` | Read a published snapshot without owner session |
| GET | `/community` | List this installation’s published snapshots |
| GET | `/millwright/status` | Real tool discovery and sidecar health |
| GET | `/health` | Service and provider configuration status |

Write requests accept the last read `version`; a stale version returns `409`. The browser always supplies it for component, chat and instruction mutations. Error responses are JSON `{error: string}`. Uploads accept PNG/JPEG/WebP/PDF/TXT/Markdown/CSV with server-side file checks. AI is invoked only if explicitly configured; source interpretation is triggered by Collect all the details or an Edit workflow that includes uploaded images. General Edit requests invoke the selected model for a validated structured plan; successful responses include a persisted workflow summary, linked tab stages, and the updated project. Malformed plans fail without a partial save.

Exports contain project metadata and source-file references, not embedded copies of original attachments. Back up the data directory to preserve original files. Imported projects receive new project IDs and exclude source-file references, published tokens, and private history from the source installation.

MCP integration: `GET /mcp` returns local launch configuration; `GET /projects/:id/revision` returns the current version for browser synchronization; `POST /projects/:id/workflow` applies a client-supplied validated plan with required `version`, `request`, and `plan`. It does not invoke another model. See `src/mcp-server.js` for tool schemas.
