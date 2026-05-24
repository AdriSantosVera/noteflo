export default function Home() {
  return (
    <main className="page-shell">
      <section className="page-panel">
        <div className="hero-row">
          <div>
            <p className="eyebrow">NoteFlow API</p>
            <h1 className="page-title">Dashboard técnico del backend.</h1>
          </div>

          <div className="status-stack">
            <div className="status-badge">
              <span className="status-dot" />
              API operativa
            </div>
            <div className="status-badge status-badge-muted">Next.js + Neon + Zod</div>
          </div>
        </div>

        <p className="page-description">
          Servicio REST independiente para gestionar notas, checklists e ideas
          desde NoteFlow Dev. Esta interfaz resume el estado operativo del
          backend y sirve como panel de referencia rápida para desarrollo local.
        </p>

        <div className="pill-row">
          <span className="pill">Next.js App Router</span>
          <span className="pill">TypeScript</span>
          <span className="pill">Neon PostgreSQL</span>
          <span className="pill">Zod</span>
          <span className="pill">API REST</span>
        </div>

        <div className="metrics-grid">
          <article className="metric-card">
            <p className="metric-label">Base URL</p>
            <p className="metric-value">localhost:3000</p>
            <p className="metric-hint">Entorno local de desarrollo</p>
          </article>

          <article className="metric-card">
            <p className="metric-label">Recursos</p>
            <p className="metric-value">2</p>
            <p className="metric-hint">notes · checklist-items</p>
          </article>

          <article className="metric-card">
            <p className="metric-label">Persistencia</p>
            <p className="metric-value">Neon</p>
            <p className="metric-hint">PostgreSQL serverless</p>
          </article>

          <article className="metric-card">
            <p className="metric-label">Validación</p>
            <p className="metric-value">Zod</p>
            <p className="metric-hint">Entrada segura en endpoints</p>
          </article>
        </div>

        <div className="section-grid section-grid-wide">
          <article className="info-card info-card-featured">
            <div className="card-header">
              <h2>Estado del servicio</h2>
              <span className="card-tag">Health</span>
            </div>
            <p>
              El backend está preparado para exponer operaciones CRUD sobre
              notas y items de checklist. La app móvil todavía no consume esta
              API, así que este panel sirve como entorno aislado de validación.
            </p>

            <div className="service-list">
              <div className="service-row">
                <span className="service-name">GET /api/notes</span>
                <span className="service-state">Disponible</span>
              </div>
              <div className="service-row">
                <span className="service-name">CRUD /api/notes/:id</span>
                <span className="service-state">Disponible</span>
              </div>
              <div className="service-row">
                <span className="service-name">Checklist items</span>
                <span className="service-state">Disponible</span>
              </div>
            </div>
          </article>

          <article className="info-card">
            <div className="card-header">
              <h2>Arranque local</h2>
              <span className="card-tag">CLI</span>
            </div>
            <p>
              Copia <code>.env.example</code> a <code>.env.local</code>, añade
              tu <code>DATABASE_URL</code> de Neon y lanza el servidor con:
            </p>
            <div className="code-block">npm run dev</div>
          </article>

          <article className="info-card">
            <div className="card-header">
              <h2>Consulta inicial</h2>
              <span className="card-tag">HTTP</span>
            </div>
            <p>Con el servidor levantado, la comprobación base es:</p>
            <div className="code-block">GET http://localhost:3000/api/notes</div>
          </article>

          <article className="info-card">
            <div className="card-header">
              <h2>Recursos activos</h2>
              <span className="card-tag">REST</span>
            </div>
            <ul className="list">
              <li><code>/api/notes</code> para listado y creación</li>
              <li><code>/api/notes/:id</code> para lectura, edición y borrado</li>
              <li><code>/api/checklist-items/:itemId</code> para toggle y delete</li>
              <li><code>docs/</code> y <code>sql/</code> como soporte técnico</li>
            </ul>
          </article>

          <article className="info-card">
            <div className="card-header">
              <h2>Ejemplo rápido</h2>
              <span className="card-tag">POST</span>
            </div>
            <div className="code-block">{`POST /api/notes
{
  "title": "Preparar backend",
  "type": "note",
  "content": "Definir CRUD y esquema SQL"
}`}</div>
          </article>

          <article className="info-card">
            <div className="card-header">
              <h2>Documentación</h2>
              <span className="card-tag">Docs</span>
            </div>
            <ul className="list">
              <li><code>README.md</code> con setup y endpoints</li>
              <li><code>docs/backend-teoria.md</code> con fundamentos</li>
              <li><code>docs/seguridad-api.md</code> con seguridad y SQL injection</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
