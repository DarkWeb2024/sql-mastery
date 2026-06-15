import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { subjectTrees, type TreeNode } from '../../content/tree';
import { computeTreeState, STATUS_LABEL, type NodeComputed, type NodeStatus } from '../../lib/treeState';
import { useProgress } from '../progress/store';

const STATUS_STYLE: Record<NodeStatus, string> = {
  planned: 'border-dashed border-slate-300 text-slate-400 dark:border-slate-700',
  locked: 'border-slate-300 text-slate-400 dark:border-slate-700',
  available: 'border-brand-300 dark:border-brand-700',
  'in-progress': 'border-amber-300 dark:border-amber-700',
  completed: 'border-emerald-300 dark:border-emerald-700',
  mastered: 'border-emerald-500 dark:border-emerald-500',
  'needs-revision': 'border-amber-400 dark:border-amber-600',
  forgotten: 'border-red-400 dark:border-red-700',
};

const STATUS_DOT: Record<NodeStatus, string> = {
  planned: 'bg-slate-300',
  locked: 'bg-slate-400',
  available: 'bg-brand-500',
  'in-progress': 'bg-amber-500',
  completed: 'bg-emerald-400',
  mastered: 'bg-emerald-600',
  'needs-revision': 'bg-amber-500',
  forgotten: 'bg-red-500',
};

function importanceLabel(v?: string) {
  return v ? `${v} interview value` : '';
}

function Row({
  node,
  depth,
  states,
}: {
  node: TreeNode;
  depth: number;
  states: Map<string, NodeComputed>;
}) {
  const computed = states.get(node.id);
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = Boolean(node.children && node.children.length);
  const status = computed?.status ?? 'planned';

  return (
    <li>
      <div
        className={`flex flex-wrap items-center gap-2 rounded-lg border bg-white p-3 dark:bg-slate-900 ${STATUS_STYLE[status]}`}
        style={{ marginLeft: depth * 16 }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={`${open ? 'Collapse' : 'Expand'} ${node.title}`}
            className="grid h-6 w-6 place-items-center rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {open ? '−' : '+'}
          </button>
        ) : (
          <span className="inline-block h-6 w-6" aria-hidden="true" />
        )}

        <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[status]}`} aria-hidden="true" />

        <span className="font-medium">{node.title}</span>

        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {STATUS_LABEL[status]}
        </span>

        {node.difficulty && (
          <span className="text-[11px] uppercase tracking-wide text-slate-400">{node.difficulty}</span>
        )}

        <span className="ml-auto flex items-center gap-3 text-xs text-slate-500">
          {node.estMinutes ? <span>{node.estMinutes} min</span> : null}
          {node.interviewImportance ? <span className="hidden sm:inline">{importanceLabel(node.interviewImportance)}</span> : null}
        </span>

        {node.topicId && (
          <span className="flex gap-2">
            <Link to={`/topic/${node.topicId}`} className="text-xs font-medium text-brand-600 hover:underline">
              Lesson
            </Link>
            <Link to={`/practice/${node.topicId}`} className="text-xs font-medium text-brand-600 hover:underline">
              Practice
            </Link>
          </span>
        )}
      </div>

      {/* Progress and dependency detail */}
      {computed?.hasContent && (
        <div className="mb-1 ml-12 mt-1 flex items-center gap-3 text-[11px] text-slate-500" style={{ marginLeft: depth * 16 + 48 }}>
          <Meter label="Completion" value={computed.completion} />
          <Meter label="Mastery" value={computed.mastery} />
          <span>
            {computed.solvedQuestions}/{computed.totalQuestions} solved
          </span>
        </div>
      )}
      {node.prerequisites && node.prerequisites.length > 0 && (
        <p className="ml-12 text-[11px] text-slate-400" style={{ marginLeft: depth * 16 + 48 }}>
          Needs first: {node.prerequisites.join(', ')}
        </p>
      )}

      {hasChildren && open && (
        <ul className="mt-1 space-y-1">
          {node.children!.map((c) => (
            <Row key={c.id} node={c} depth={depth + 1} states={states} />
          ))}
        </ul>
      )}
    </li>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-center gap-1" title={`${label} ${value}%`}>
      <span className="hidden sm:inline">{label}</span>
      <span className="inline-block h-1.5 w-16 rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
        <span className="block h-full rounded-full bg-brand-500" style={{ width: `${value}%` }} />
      </span>
      <span>{value}%</span>
    </span>
  );
}

export function KnowledgeTreePage() {
  const attempts = useProgress((s) => s.attempts);
  const solved = useProgress((s) => s.solved);

  const sql = subjectTrees.find((s) => s.id === 'sql')!;
  const states = useMemo(() => computeTreeState(sql.root, attempts, solved), [sql.root, attempts, solved]);

  const comingSoon = subjectTrees.filter((s) => s.status === 'coming-soon');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Knowledge Tree</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          The full path to SQL mastery. Each node shows where you stand and what unlocks next. Colour
          and label both signal status, so it reads without relying on colour alone.
        </p>
      </header>

      <Legend />

      <section aria-label="SQL knowledge tree">
        <ul className="space-y-1">
          {sql.root.children?.map((node) => (
            <Row key={node.id} node={node} depth={0} states={states} />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">More subjects</h2>
        <p className="mb-3 text-sm text-slate-500">
          The same tree structure will hold every future subject, a learning operating system rather
          than a single course.
        </p>
        <div className="flex flex-wrap gap-2">
          {comingSoon.map((s) => (
            <span
              key={s.id}
              className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-400 dark:border-slate-700"
            >
              {s.title} — soon
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function Legend() {
  const items: NodeStatus[] = [
    'available',
    'in-progress',
    'completed',
    'mastered',
    'needs-revision',
    'forgotten',
    'locked',
    'planned',
  ];
  return (
    <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-800">
      {items.map((s) => (
        <span key={s} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[s]}`} aria-hidden="true" />
          {STATUS_LABEL[s]}
        </span>
      ))}
    </div>
  );
}
