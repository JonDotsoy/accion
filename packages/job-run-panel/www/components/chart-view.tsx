import { type FC, useEffect, useRef } from "react";
import "reactflow/dist/style.css";
import { type Node } from "@dagrejs/dagre";
import classNames from "classnames";
import { useNodeToGraph } from "./use-node-to-graph";
import type { Job } from "../interfaces/Job";
import { LabelJob } from "./label-job.tsx";
import { DurationFormat } from "./duration-format.tsx";
import { menuJobsJonIdFocus } from "../stores/menu-jobs-job-id-focus.ts";

const ChartViewNode: FC<{ node: Node<{ job: Job }>; autoFocus?: string }> = ({
  node,
  autoFocus,
}) => {
  const refDivAutoFocus = useRef<HTMLDivElement>(null);
  // const jobIdFocus = useStore(menuJobsJonIdFocus)

  useEffect(() => {
    const div = refDivAutoFocus.current;
    if (div) {
      const unsub = menuJobsJonIdFocus.listen((v) => {
        if (v === node.job.id) {
          div.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      });

      const h = () => {
        menuJobsJonIdFocus.set(node.job.id);
      };

      const hleave = () => {
        menuJobsJonIdFocus.set(null);
      };

      div.addEventListener("mouseover", h);
      div.addEventListener("mouseleave", hleave);

      return () => {
        unsub();
        div.removeEventListener("mouseover", h);
        div.removeEventListener("mouseleave", hleave);
      };
    }
  }, [refDivAutoFocus.current]);

  return (
    <div
      key={`${node.job.id}`}
      ref={refDivAutoFocus}
      style={
        {
          "--node-width": `${node.width}px`,
          "--node-height": `${node.height}px`,
          "--node-x": `${node.x}px`,
          "--node-y": `${node.y}px`,
        } as any
      }
      className={classNames(
        "transition-all",
        "border",
        "rounded",
        "bg-white",
        "absolute",
        "grid",
        "grid-cols-[1fr_auto]",
        "-translate-x-1/2",
        "-translate-y-1/2",
        "w-[var(--node-width)]",
        "h-[var(--node-height)]",
        "top-[var(--node-y)]",
        "left-[var(--node-x)]",
        "p-2",
        "hover:shadow",
        { shadow: node.job.id === autoFocus },
      )}
    >
      <LabelJob job={node.job}></LabelJob>
      <span className="text-gray-500 text-xs grid content-center">
        {node.job.duration && <DurationFormat value={node.job.duration} />}
      </span>
    </div>
  );
};

export type Chart = {
  jobs: Job[];
  relations: { source: string; target: string }[];
};

export const ChartView: FC<{
  /** JobID Autofocus */
  autoFocus?: string;
  chart: Chart;
}> = ({ chart, autoFocus }) => {
  const { isLoading, data } = useNodeToGraph(chart.jobs, chart.relations);

  if (isLoading) return <div>Loading...</div>;
  if (!data) return null;

  const { layoutHeight, edges, layoutWidth, nodes } = data;

  return (
    <div className="relative border rounded p-4 w-full bg-gray-50 overflow-auto">
      <div
        style={
          {
            "--layout-height": `${layoutHeight}px`,
            "--layout-width": `${layoutWidth}px`,
          } as any
        }
        className="relative h-[var(--layout-height)] w-[var(--layout-width)]"
      >
        <svg
          style={
            {
              "--layout-height": `${layoutHeight}px`,
              "--layout-width": `${layoutWidth}px`,
            } as any
          }
          className="absolute top-0 left-0 h-[var(--layout-height)] w-[var(--layout-width)]"
        >
          {edges.map((edge) => {
            const { points } = edge;
            const draw = points
              .map((point, index, points) => {
                const curveValue = 30;
                const isStart = index === 0;
                // const isEnd = index === (points.length - 1)
                if (isStart) return `M ${point.x} ${point.y}`;
                const pointLeft = points[index - 1];

                return `C ${pointLeft.x + curveValue} ${pointLeft.y} ${point.x - curveValue} ${point.y} ${point.x} ${point.y}`;
                // return `L ${point.x} ${point.y}`
              })
              .join(" ");
            return (
              <path
                className={classNames("stroke-gray-300", "fill-none")}
                key={draw}
                d={draw}
              />
            );
          })}
        </svg>
        {nodes.map((node) => (
          <ChartViewNode node={node} autoFocus={autoFocus}></ChartViewNode>
        ))}
        {edges.map((edge) => {
          return edge.points.map((point, index, points) => {
            const isStart = index === 0;
            const isEnd = points.length - 1 === index;
            const isMiddle = !isStart && !isEnd;

            if (isMiddle) return null;

            return (
              <span
                key={`${point.x}-${point.y}`}
                style={
                  {
                    "--point-x": `${point.x}px`,
                    "--point-y": `${point.y}px`,
                  } as any
                }
                className={classNames(
                  "absolute",
                  "w-2",
                  "h-2",
                  "rounded-full",
                  "bg-gray-50",
                  "border-2",
                  "border-gray-400",
                  "border-opacity-60",
                  "-translate-x-1/2",
                  "-translate-y-1/2",
                  "top-[var(--point-y)]",
                  "left-[var(--point-x)]",
                )}
              ></span>
            );
          });
        })}
      </div>
    </div>
  );
};
