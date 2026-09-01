import { Link } from "react-router-dom";
import "./Home.css";



const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v5c0 5-3.2 8.7-7 10-3.8-1.3-7-5-7-10V6l7-3z" />
  </svg>
);

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7a2 2 0 0 1 2-2h4.2l1.8 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
  </svg>
);

const CheckSquareIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
    <polyline points="7.5 12 10.5 15 16.5 9" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.5 20c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2" />
    <circle cx="17.2" cy="8.8" r="2.4" />
    <path d="M21.5 20c0-2.7-1.7-4.9-4.2-5.7" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <line x1="20" y1="20" x2="15.3" y2="15.3" />
  </svg>
);

const LayersIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 3.5 20.5 8 12 12.5 3.5 8" />
    <polyline points="3.5 12.5 12 17 20.5 12.5" />
    <polyline points="3.5 17 12 21.5 20.5 17" />
  </svg>
);

const BarChartIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="21" x2="5" y2="11" />
    <line x1="12" y1="21" x2="12" y2="5" />
    <line x1="19" y1="21" x2="19" y2="15" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15.5 14.2" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3.2a5 5 0 0 0-5 5v3.3c0 1-.4 2-1.2 2.7L4.5 15.5h15l-1.3-1.3c-.8-.7-1.2-1.7-1.2-2.7V8.2a5 5 0 0 0-5-5z" />
    <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
  </svg>
);



const FEATURES = [
  {
    icon: ShieldIcon,
    title: "Roles enforced on the server",
    desc: "Managers set up projects and teams; members only see what they belong to. The split can't be bypassed by editing the page.",
  },
  {
    icon: FolderIcon,
    title: "Projects that can be archived, not lost",
    desc: "Each client engagement gets a key, an owner and a description. Archiving hides it from the default view without touching its history.",
  },
  {
    icon: CheckSquareIcon,
    title: "A lifecycle with real rules",
    desc: "Backlog → In Progress → In Review → Done, with Blocked handled properly. Skip a step and the server explains why it won't allow it.",
  },
  {
    icon: UsersIcon,
    title: "Assignment across every project",
    desc: "Anyone can carry work on several projects at once, and open one list to see everything that's theirs.",
  },
  {
    icon: SearchIcon,
    title: "Search that scales",
    desc: "Filter by project, status, assignee, priority or overdue, sort by due date or priority — computed on the server, not in the browser.",
  },
  {
    icon: LayersIcon,
    title: "Bulk actions with a real report",
    desc: "Move, reassign or reschedule dozens of tasks at once, and see exactly which ones succeeded and which were rejected, and why.",
  },
  {
    icon: BarChartIcon,
    title: "A dashboard with real answers",
    desc: "Open, overdue and due-this-week counts, a breakdown by status and assignee, and eight weeks of completions in one view.",
  },
  {
    icon: ClockIcon,
    title: "A history nobody can edit",
    desc: "Every field change, assignment and comment is timestamped and permanent — even a manager can't rewrite it after the fact.",
  },
  {
    icon: BellIcon,
    title: "Alerts that reappear on purpose",
    desc: "Dismiss an overdue alert and it stays gone — until the due date changes, at which point it's back for a reason.",
  },
];

const STEPS = [
  {
    title: "Set up the workspace",
    desc: "Create your projects, add your team, and decide who owns what.",
  },
  {
    title: "Work happens as normal",
    desc: "People move their own tasks through the lifecycle and leave comments as they go.",
  },
  {
    title: "Catch up in seconds",
    desc: "Open the dashboard for the whole portfolio, or My Tasks for just what's yours.",
  },
];

const PREVIEW_TASKS = [
  { title: "Redesign client onboarding flow", priority: "High", status: "In Progress" },
  { title: "Fix invoice export for Meridian Co.", priority: "Urgent", status: "Blocked" },
  { title: "Q3 report — draft v2", priority: "Medium", status: "In Review" },
];

const ALERT_ROWS = [
  { title: "Migrate legacy client data", days: 4 },
  { title: "Send updated SOW to Harlow Ltd.", days: 1 },
];

const STATUS_CLASS = {
  "In Progress": "home-status-progress",
  "In Review": "home-status-review",
  Blocked: "home-status-blocked",
  Done: "home-status-done",
  Backlog: "home-status-backlog",
};

export default function Home() {
  return (
    <div className="home">
      <main>
        <section className="home-hero">
          <div className="home-hero-text">
            <h1 style={{marginBottom:"1rem"}}>Know what's overdue before your client does.</h1>
            <p className="home-hero-sub">
              TaskFlow gives managers one view of every project running at once,
              and gives your team one place to see what's theirs — no more
              digging through spreadsheets and old chat threads for an answer.
            </p>
            <div className="home-hero-actions">
              <Link to="/auth?mode=signup" className="home-btn home-btn-primary">
                Create your workspace
              </Link>
              <a href="#how-it-works" className="home-btn home-btn-ghost">
                See how it works
              </a>
            </div>
          </div>

          <div className="home-hero-visual" aria-hidden="true">
            <div className="home-preview-card">
              <p className="home-preview-label">Portfolio overview</p>

              <div className="home-preview-stats">
                <div className="home-stat">
                  <span className="home-stat-num">24</span>
                  <span className="home-stat-label">Open</span>
                </div>
                <div className="home-stat home-stat-danger">
                  <span className="home-stat-num">3</span>
                  <span className="home-stat-label">Overdue</span>
                </div>
                <div className="home-stat">
                  <span className="home-stat-num">7</span>
                  <span className="home-stat-label">Due this week</span>
                </div>
                <div className="home-stat">
                  <span className="home-stat-num">12</span>
                  <span className="home-stat-label">Done this week</span>
                </div>
              </div>

              <div className="home-preview-tasks">
                {PREVIEW_TASKS.map((task) => (
                  <div className="home-preview-task" key={task.title}>
                    <span className="home-task-title">{task.title}</span>
                    <span className="home-task-priority">{task.priority}</span>
                    <span className={`home-task-status ${STATUS_CLASS[task.status]}`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="home-features" id="features">
          <h2>Everything the portfolio needs, none of the guesswork</h2>
          <div className="home-features-grid">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <article className="home-feature-card" key={f.title}>
                  <div className="home-feature-icon">
                    <Icon />
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="home-spotlight">
          <div className="home-spotlight-inner">
            <div className="home-spotlight-text">
              <h2>Nothing slips through the cracks</h2>
              <p>
                A task's timeline records who changed what, and when —
                permanently. Overdue work surfaces on its own, with a badge in
                the nav, and stays dismissed only until the due date actually
                moves.
              </p>
            </div>

            <div className="home-spotlight-visual" aria-hidden="true">
              <div className="home-alert-card">
                <p className="home-alert-heading">
                  <BellIcon />
                  Overdue
                  <span className="home-alert-badge">2</span>
                </p>
                {ALERT_ROWS.map((a) => (
                  <div className="home-alert-row" key={a.title}>
                    <span>{a.title}</span>
                    <span className="home-alert-days">{a.days}d overdue</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="home-steps" id="how-it-works">
          <h2>From spreadsheet chaos to one shared view</h2>
          <div className="home-steps-grid">
            {STEPS.map((s, i) => (
              <div className="home-step" key={s.title}>
                <span className="home-step-num">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

       
      </main>

      <footer className="home-footer">
        <div className="home-footer-top">
          <div className="home-footer-brand">
            <span className="home-logo-mark">T</span>
            <span>TaskFlow</span>
            <p>Built for teams running more than one client project at a time.</p>
          </div>

          <div className="home-footer-col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
          </div>

          <div className="home-footer-col">
            <h4>Account</h4>
            <Link to="/auth">Sign in</Link>
            <Link to="/auth?mode=signup">Create account</Link>
          </div>
        </div>

        <div className="home-footer-bottom">
          <span>© {new Date().getFullYear()} Project Task Tracker  , Rajit Chadar</span>
        </div>
      </footer>
    </div>
  );
}