import { useCallback, useMemo, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { sqlTree, type TreeNode } from '../../content/tree';
import { computeTreeState, STATUS_LABEL, type NodeComputed, type NodeStatus } from '../../lib/treeState';
import { useProgress } from '../progress/store';
import { useSettings } from '../../app/SettingsProvider';
import { Badge } from '../../components/ui';

// The tree is the defining experience, so it is a spatial canvas you pan, zoom,
// and focus into, not an outline you scroll. Each node carries its live status
// and mastery; hovering a node lights up its dependencies; clicking focuses the
// camera on it and opens a detail panel without leaving the map.

const COL_W = 240;
const ROW_H = 70;
const NODE_W = 200;
const NODE_H = 52;

const STATUS_ACCENT: Record<NodeStatus, string> = {
  planned: '#94a3b8',
  locked: '#94a3b8',
  available: '#3478f6',
  'in-progress': '#d99a2c',
  completed: '#10b981',
  mastered: '#059669',
  'needs-revision': '#d99a2c',
  forgotten: '#ef4444',
};

interface NodeData {
  node: TreeNode;
  computed?: NodeComputed;
  dimmed: boolean;
}

function TreeFlowNode({ data }: NodeProps<NodeData>) {
  const { node, computed, dimmed } = data;
  const status = computed?.status ?? 'planned';
  const accent = STATUS_ACCENT[status];
  const mastery = computed?.mastery ?? 0;
  return (
    <div
      className="rounded-xl bg-white px-3 py-2 shadow-card transition-all duration-150 dark:bg-slate-900"
      style={{
        width: NODE_W,
        height: NODE_H,
        borderLeft: `4px solid ${accent}`,
        opacity: dimmed ? 0.35 : 1,
      }}
    >
      <Handle type="target" position={Position.Left} className="!h-1.5 !w-1.5 !border-0 !bg-slate-300" />
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: accent }} aria-hidden="true" />
        <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{node.title}</span>
      </div>
      {computed?.hasContent ? (
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
          <div className="h-full rounded-full" style={{ width: `${mastery}%`, background: accent }} />
        </div>
      ) : (
        <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">{STATUS_LABEL[status]}</div>
      )}
      <Handle type="source" position={Position.Right} className="!h-1.5 !w-1.5 !border-0 !bg-slate-300" />
    </div>
  );
}

const nodeTypes = { tree: TreeFlowNode };

// Tidy left-to-right layout: leaves take successive rows, parents sit at the
// average height of their children, depth maps to columns.
function layout(states: Map<string, NodeComputed>) {
  const nodes: Node<NodeData>[] = [];
  const edges: Edge[] = [];
  let cursor = 0;

  function place(node: TreeNode, depth: number): number {
    let y: number;
    if (node.children && node.children.length) {
      const ys = node.children.map((c) => place(c, depth + 1));
      y = ys.reduce((a, b) => a + b, 0) / ys.length;
      node.children.forEach((c) => {
        edges.push({
          id: `${node.id}-${c.id}`,
          source: node.id,
          target: c.id,
          type: 'smoothstep',
          style: { stroke: '#cbd5e1', strokeWidth: 1.5 },
        });
      });
    } else {
      y = cursor * ROW_H;
      cursor += 1;
    }
    nodes.push({
      id: node.id,
      type: 'tree',
      position: { x: depth * COL_W, y },
      data: { node, computed: states.get(node.id), dimmed: false },
      draggable: false,
    });
    return y;
  }

  (sqlTree.root.children ?? []).forEach((section) => place(section, 0));
  return { nodes, edges };
}

export function KnowledgeTreePage() {
  const attempts = useProgress((s) => s.attempts);
  const solved = useProgress((s) => s.solved);
  const { settings } = useSettings();

  const states = useMemo(() => computeTreeState(sqlTree.root, attempts, solved), [attempts, solved]);
  const base = useMemo(() => layout(states), [states]);

  const [instance, setInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  // Connected set for dependency highlighting on hover.
  const connected = useMemo(() => {
    if (!hoverId) return null;
    const set = new Set<string>([hoverId]);
    base.edges.forEach((e) => {
      if (e.source === hoverId) set.add(e.target);
      if (e.target === hoverId) set.add(e.source);
    });
    return set;
  }, [hoverId, base.edges]);

  const nodes = useMemo(
    () =>
      base.nodes.map((n) => ({
        ...n,
        data: { ...n.data, dimmed: connected ? !connected.has(n.id) : false },
      })),
    [base.nodes, connected]
  );

  const edges = useMemo(
    () =>
      base.edges.map((e) => {
        const active = hoverId && (e.source === hoverId || e.target === hoverId);
        return active
          ? { ...e, animated: !settings.reducedMotion, style: { stroke: '#3478f6', strokeWidth: 2 } }
          : { ...e, style: { ...e.style, opacity: hoverId ? 0.3 : 1 } };
      }),
    [base.edges, hoverId, settings.reducedMotion]
  );

  const onNodeClick = useCallback(
    (_e: MouseEvent, node: Node) => {
      setSelectedId(node.id);
      if (instance) {
        instance.setCenter(node.position.x + NODE_W / 2, node.position.y + NODE_H / 2, {
          zoom: 1.25,
          duration: settings.reducedMotion ? 0 : 450,
        });
      }
    },
    [instance, settings.reducedMotion]
  );

  const selected = selectedId ? findNode(selectedId) : null;
  const selectedComputed = selectedId ? states.get(selectedId) : undefined;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Knowledge Tree</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          The whole of SQL as one map. Pan and zoom to explore, hover a node to light up what it
          depends on, and click to focus in. Colour shows where you stand.
        </p>
      </header>

      <Legend />

      <div className="relative h-[600px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onInit={setInstance}
          onNodeClick={onNodeClick}
          onNodeMouseEnter={(_e, n) => setHoverId(n.id)}
          onNodeMouseLeave={() => setHoverId(null)}
          onPaneClick={() => setSelectedId(null)}
          fitView
          minZoom={0.2}
          proOptions={{ hideAttribution: false }}
        >
          <Background gap={24} color="#e2e8f0" />
          <Controls showInteractive={false} />
          <MiniMap
            pannable
            zoomable
            nodeColor={(n) => STATUS_ACCENT[(n.data as NodeData).computed?.status ?? 'planned']}
            className="!hidden sm:!block"
          />
        </ReactFlow>

        {selected && (
          <aside className="absolute right-3 top-3 w-72 animate-fade-in rounded-xl bg-white p-4 shadow-float dark:bg-slate-900">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold">{selected.title}</h2>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Close detail"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            {selected.blurb && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{selected.blurb}</p>}

            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone={statusTone(selectedComputed?.status)}>
                {STATUS_LABEL[selectedComputed?.status ?? 'planned']}
              </Badge>
              {selected.difficulty && <Badge tone="neutral">{selected.difficulty}</Badge>}
              {selected.interviewImportance && (
                <Badge tone="accent">{selected.interviewImportance} interview value</Badge>
              )}
            </div>

            {selectedComputed?.hasContent && (
              <dl className="mt-3 space-y-1 text-sm">
                <Row label="Completion" value={`${selectedComputed.completion}%`} />
                <Row label="Mastery" value={`${selectedComputed.mastery}%`} />
                <Row label="Solved" value={`${selectedComputed.solvedQuestions}/${selectedComputed.totalQuestions}`} />
              </dl>
            )}
            {selected.estMinutes && (
              <p className="mt-2 text-xs text-slate-500">Estimated {selected.estMinutes} min</p>
            )}
            {selected.prerequisites && selected.prerequisites.length > 0 && (
              <p className="mt-2 text-xs text-slate-400">Needs first: {selected.prerequisites.join(', ')}</p>
            )}

            {selected.topicId && (
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/topic/${selected.topicId}`}
                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Lesson
                </Link>
                <Link
                  to={`/practice/${selected.topicId}`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Practice
                </Link>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function statusTone(status?: NodeStatus) {
  switch (status) {
    case 'mastered':
    case 'completed':
      return 'success' as const;
    case 'forgotten':
      return 'danger' as const;
    case 'in-progress':
    case 'needs-revision':
      return 'warn' as const;
    case 'available':
      return 'brand' as const;
    default:
      return 'neutral' as const;
  }
}

function findNode(id: string): TreeNode | null {
  const stack = [...(sqlTree.root.children ?? [])];
  while (stack.length) {
    const n = stack.pop()!;
    if (n.id === id) return n;
    if (n.children) stack.push(...n.children);
  }
  return null;
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
    <div className="flex flex-wrap gap-3 rounded-xl bg-white p-3 text-xs shadow-card dark:bg-slate-900">
      {items.map((s) => (
        <span key={s} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_ACCENT[s] }} aria-hidden="true" />
          {STATUS_LABEL[s]}
        </span>
      ))}
    </div>
  );
}
