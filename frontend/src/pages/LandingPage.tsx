// src/pages/LandingPage.tsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ───── tiny star-field canvas ───── */
const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const stars: { x: number; y: number; r: number; speed: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // seed stars
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.3,
        speed: Math.random() * 0.35 + 0.05,
        opacity: Math.random() * 0.7 + 0.3,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 200, 255, ${s.opacity})`;
        ctx.fill();
        s.y -= s.speed;
        s.opacity += (Math.random() - 0.5) * 0.02;
        s.opacity = Math.max(0.15, Math.min(0.9, s.opacity));
        if (s.y < -2) {
          s.y = canvas.height + 2;
          s.x = Math.random() * canvas.width;
        }
      }
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="lp-starfield" />;
};

/* ───── animated kanban demo board ───── */
const KanbanDemo: React.FC = () => (
  <div className="lp-kanban-demo" aria-hidden="true">
    {/* column: To Do */}
    <div className="lp-kanban-col">
      <div className="lp-kanban-col-head lp-col-todo">
        <span>To Do</span>
        <span className="lp-wip">WIP 4</span>
      </div>
      <div className="lp-kanban-card lp-card-delay-1">
        <span className="lp-card-dot lp-dot-high" />
        <div>
          <p className="lp-card-title">Design system tokens</p>
          <p className="lp-card-sub">High · UX Team</p>
        </div>
      </div>
      <div className="lp-kanban-card lp-card-delay-2">
        <span className="lp-card-dot lp-dot-med" />
        <div>
          <p className="lp-card-title">API rate-limiter</p>
          <p className="lp-card-sub">Medium · Backend</p>
        </div>
      </div>
      <div className="lp-kanban-card lp-card-delay-3">
        <span className="lp-card-dot lp-dot-low" />
        <div>
          <p className="lp-card-title">Update docs</p>
          <p className="lp-card-sub">Low · DevOps</p>
        </div>
      </div>
    </div>

    {/* column: In Progress */}
    <div className="lp-kanban-col">
      <div className="lp-kanban-col-head lp-col-progress">
        <span>In Progress</span>
        <span className="lp-wip">WIP 2</span>
      </div>
      <div className="lp-kanban-card lp-card-active lp-card-delay-2">
        <span className="lp-card-dot lp-dot-high" />
        <div>
          <p className="lp-card-title">Auth middleware</p>
          <p className="lp-card-sub">High · Backend</p>
        </div>
      </div>
      <div className="lp-kanban-card lp-card-active lp-card-delay-4">
        <span className="lp-card-dot lp-dot-med" />
        <div>
          <p className="lp-card-title">Dashboard layout</p>
          <p className="lp-card-sub">Medium · Frontend</p>
        </div>
      </div>
    </div>

    {/* column: Done */}
    <div className="lp-kanban-col">
      <div className="lp-kanban-col-head lp-col-done">
        <span>Done</span>
        <span className="lp-wip">✓</span>
      </div>
      <div className="lp-kanban-card lp-card-done lp-card-delay-1">
        <span className="lp-card-dot lp-dot-done" />
        <div>
          <p className="lp-card-title">Project scaffolding</p>
          <p className="lp-card-sub">Completed · DevOps</p>
        </div>
      </div>
      <div className="lp-kanban-card lp-card-done lp-card-delay-3">
        <span className="lp-card-dot lp-dot-done" />
        <div>
          <p className="lp-card-title">CI/CD pipeline</p>
          <p className="lp-card-sub">Completed · DevOps</p>
        </div>
      </div>
    </div>

    {/* swimlane label strip */}
    <div className="lp-swimlane-strip">
      <span className="lp-swimlane-tag">🏊 Swimlane: Engineering</span>
    </div>
  </div>
);

/* ───── feature card data ───── */
const FEATURES = [
  {
    icon: '🃏',
    title: 'Kanban Cards',
    body: 'Visual elements representing individual tasks — deadlines, assignees, priorities and descriptions all live on a single, glanceable card that moves across your board.',
  },
  {
    icon: '📊',
    title: 'Workflow Columns',
    body: 'Vertical stages mapping the value stream from initiation to completion. Start with "To Do → In Progress → Done" and customise as your process evolves.',
  },
  {
    icon: '🚦',
    title: 'WIP Limits',
    body: 'Strict capacity caps on columns prevent bottlenecks, reduce multi-tasking, and force focus on finishing existing work before pulling new tasks.',
  },
  {
    icon: '🏊',
    title: 'Swimlanes',
    body: 'Horizontal rows to categorise work by sub-teams, projects, urgency levels or individual assignees — all visible on a single board.',
  },
];

/* ───── main landing page ───── */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="lp-root">
      <Starfield />

      {/* ── nav ── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <span className="lp-logo">
            <span className="lp-logo-icon">🚀</span> Pro-Tasker
          </span>
          <div className="lp-nav-links">
            <button
              id="lp-login-btn"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
            <button
              id="lp-register-btn"
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/register')}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── hero ── */}
      <header className="lp-hero">
        <div className="lp-hero-content">
          <span className="lp-badge">✦ Agile Workflow Management</span>
          <h1 className="lp-hero-title">
            Mission Control for<br />
            <span className="lp-gradient-text">Your Projects</span>
          </h1>
          <p className="lp-hero-sub">
            A Kanban board visual workflow management tool designed to track
            work items, limit work-in-progress, and maximize team efficiency.
          </p>
          <div className="lp-hero-actions">
            <button
              id="lp-hero-cta"
              className="btn lp-btn-glow"
              onClick={() => navigate('/register')}
            >
              Launch Your Board →
            </button>
            <button
              id="lp-hero-demo"
              className="btn btn-secondary"
              onClick={() => {
                document.getElementById('lp-demo')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See It In Action
            </button>
          </div>
        </div>

        {/* orbital rings decoration */}
        <div className="lp-orbit-ring lp-orbit-1" />
        <div className="lp-orbit-ring lp-orbit-2" />
        <div className="lp-orbit-ring lp-orbit-3" />
      </header>

      {/* ── live board demo ── */}
      <section className="lp-section" id="lp-demo">
        <div className="lp-section-inner">
          <span className="lp-section-tag">Interactive Preview</span>
          <h2 className="lp-section-title">
            Your <span className="lp-gradient-text">Command Center</span>
          </h2>
          <p className="lp-section-sub">
            Originating from the Toyota production system as a way to control
            factory inventory just-in-time, Kanban has evolved into a
            cornerstone of Agile project management across software
            engineering, marketing, and human resources.
          </p>
          <KanbanDemo />
        </div>
      </section>

      {/* ── features grid ── */}
      <section className="lp-section lp-section-dark">
        <div className="lp-section-inner">
          <span className="lp-section-tag">Core Components</span>
          <h2 className="lp-section-title">
            Built for <span className="lp-gradient-text">Flow</span>
          </h2>
          <p className="lp-section-sub">
            The board visually breaks down processes into vertical columns
            representing work stages and utilizes individual task cards that
            team members pull from left to right as work progresses.
          </p>
          <div className="lp-features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="lp-feature-card">
                <span className="lp-feature-icon">{f.icon}</span>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-body">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="lp-cta-section">
        <div className="lp-cta-inner">
          <h2 className="lp-cta-title">Ready for Liftoff?</h2>
          <p className="lp-cta-sub">
            Create your free account and launch your first Kanban board in
            under a minute.
          </p>
          <div className="lp-hero-actions">
            <button
              id="lp-bottom-cta"
              className="btn lp-btn-glow"
              onClick={() => navigate('/register')}
            >
              Create Free Account
            </button>
            <button
              id="lp-bottom-login"
              className="btn btn-secondary"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── footer ── */}
      <footer className="lp-footer">
        <p>© {new Date().getFullYear()} Pro-Tasker · Built with the MERN Stack</p>
      </footer>
    </div>
  );
};
