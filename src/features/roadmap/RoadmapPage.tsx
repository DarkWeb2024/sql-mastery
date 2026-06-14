import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  Position,
  Handle,
  type NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { allTopics } from '../../content/topics';
import { useProgress } from '../../features/progress/store';
import type { Topic } from '../../types';

interface NodeData {
  topic: Topic;
  completed: boolean;
}

// Depth of a topic is the longest prerequisite chain leading to it. It places
// foundational topics on the left and advanced ones to the right.
function computeDepths(topics: Topic[]): Map<string, number> {
  const byId = new Map(topics.map((t) => [t.id, t]));
  const depths = new Map<string, number>();
  const visiting = new Set<string>();

  function depthOf(id: string): number {
    if (depths.has(id)) return depths.get(id)!;
    if (visiting.has(id)) return 0; // guard against accidental cycles
    visiting.add(id);
    const topic = byId.get(id);
    const prereqs = topic?.prerequisites ?? [];
    const d = prereqs.length === 0 ? 0 : 1 + Math.max(...prereqs.map(depthOf));
    visiting.delete(id);
    depths.set(id, d);
    return d;
  }

  topics.forEach((t) => depthOf(t.id));
  return depths;
}

function TopicNode({ data }: NodeProps<NodeData>) {
  const { topic, completed } = data;
  const soon = topic.comingSoon;
  const base = 'w-52 rounded-xl border p-3 text-left shadow-sm transition-colors';
  const tone = soon
    ? 'border-dashed border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500'
    : completed
      ? 'border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-100'
      : 'border-brand-300 bg-white text-slate-800 hover:border-brand-500 dark:border-brand-700 dark:bg-slate-900 dark:text-slate-100';
  return (
    <div className={`${base} ${tone}`}>
      <Handle type="target" position={Position.Left} className="!bg-slate-400" />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
          {topic.category}
        </span>
        {soon && <span className="rounded bg-slate-300 px-1.5 py-0.5 text-[10px] dark:bg-slate-700">soon</span>}
        {completed && !soon && <span className="text-emerald-600 dark:text-emerald-300">done</span>}
      </div>
      <div className="mt-1 text-sm font-semibold leading-tight">{topic.title}</div>
      <Handle type="source" position={Position.Right} className="!bg-slate-400" />
    </div>
  );
}

const nodeTypes = { topic: TopicNode };

export function RoadmapPage() {
  const navigate = useNavigate();
  const completedTopics = useProgress((s) => s.completedTopics);

  const { nodes, edges } = useMemo(() => {
    const depths = computeDepths(allTopics);
    const rowCounter = new Map<number, number>();

    const nodes: Node<NodeData>[] = allTopics.map((topic) => {
      const depth = depths.get(topic.id) ?? 0;
      const row = rowCounter.get(depth) ?? 0;
      rowCounter.set(depth, row + 1);
      return {
        id: topic.id,
        type: 'topic',
        position: { x: depth * 280, y: row * 110 },
        data: { topic, completed: Boolean(completedTopics[topic.id]) },
      };
    });

    const edges: Edge[] = allTopics.flatMap((topic) =>
      topic.prerequisites.map((pre) => ({
        id: `${pre}-${topic.id}`,
        source: pre,
        target: topic.id,
        animated: false,
        style: { stroke: '#94a3b8' },
      }))
    );

    return { nodes, edges };
  }, [completedTopics]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">SQL Roadmap</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Follow the path from the basics to advanced topics. Click any available node to open its
          lessons and practice. Dashed nodes are on the way.
        </p>
      </div>

      <div className="h-[560px] rounded-xl border border-slate-200 dark:border-slate-800">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: false }}
          onNodeClick={(_, node) => {
            const topic = (node.data as NodeData).topic;
            if (!topic.comingSoon) navigate(`/topic/${topic.id}`);
          }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
