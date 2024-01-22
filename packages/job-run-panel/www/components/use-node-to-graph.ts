import { type GraphEdge, graphlib, layout } from "@dagrejs/dagre";
import type { Job } from "../interfaces/Job";
import useSWR from "swr";

type EdgeLabel = {
  id: string;
  source: string;
  target: string;
};

type NEdge = GraphEdge & EdgeLabel;

const createGraph = (
  jobs: Job[],
  relations: { source: string; target: string }[],
) => {
  const graph = new graphlib.Graph<{ job: Job }>({});

  // Set an object for the graph label
  graph.setGraph({
    ranksep: 70,
    rankdir: "LR",
  });

  // Default to assigning a new object as a label for each new edge.
  graph.setDefaultEdgeLabel((source, target): EdgeLabel => {
    return {
      id: `${source}-${target}`,
      source,
      target,
    };
  });

  // Add nodes to the graph. The first argument is the node id. The second is
  // metadata about the node. In this case we're going to add labels to each of
  // our nodes.

  jobs.forEach((job) => {
    graph.setNode(job.id, { job, label: job.name, width: 240, height: 50 });
  });

  relations.forEach((relation) =>
    graph.setEdge(relation.source, relation.target),
  );

  layout(graph);

  const layoutHeight = Math.max(
    ...graph
      .nodes()
      .map((id) => graph.node(id))
      .map((node) => Math.ceil(node.y + node.height / 2)),
    ...graph
      .edges()
      .map((id) => graph.edge(id))
      .map((edge) => Math.max(...edge.points.map((point) => point.y + 2))),
  );
  const layoutWidth = Math.max(
    ...graph
      .nodes()
      .map((id) => graph.node(id))
      .map((node) => Math.ceil(node.x + node.width / 2)),
    ...graph
      .edges()
      .map((id) => graph.edge(id))
      .map((edge) => Math.max(...edge.points.map((point) => point.x + 2))),
  );

  return {
    nodes: graph.nodes().map((id) => graph.node(id)),
    edges: graph.edges().map((id) => graph.edge(id)) as unknown as NEdge[],
    layoutHeight,
    layoutWidth,
  };
};

export const useNodeToGraph = (
  jobs: Job[],
  relations: { source: string; target: string }[],
) => {
  return useSWR([jobs, relations], async ([jobs, relations]) =>
    createGraph(jobs, relations),
  );
};
