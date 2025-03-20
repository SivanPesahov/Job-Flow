import { IJob } from "@/types/job.types.ts";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { cva } from "class-variance-authority";
import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "./ui/card.tsx";

import { CSS } from "@dnd-kit/utilities";
import { FaRegPlusSquare } from "react-icons/fa";
import { Link } from "react-router-dom";
import { JobSummary } from "./JobSummary.tsx";
import { ScrollArea } from "./ui/scroll-area.tsx";

export interface Column {
  title: string;
  id: number;
}

interface StatusColumnProps {
  column: Column;
  jobs?: IJob[];
  isOverlay?: boolean;
  className?: string;
}

export function StatusColumn({
  column,
  jobs = [],
  isOverlay,
}: StatusColumnProps) {
  const tasksIds = useMemo(() => {
    return jobs.map((job) => job._id);
  }, [jobs]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva(
    "max-h-[580px] w-[270px] max-w-full bg-primary-foreground flex flex-col flex-shrink-0 snap-center",
    {
      variants: {
        dragging: {
          default: "border-2 border-transparent",
          over: "ring-2 opacity-30",
          overlay: "ring-2 ring-primary",
        },
      },
    }
  );

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
    >
      <CardHeader className="p-4 font-semibold border-b-2 border-orange-200 dark:border-secondary text-left flex flex-row items-center">
        <div className="flex flex-row items-center justify-between w-full">
          <p>{column.title}</p>
          <Link to={`/dashboard/create?status=${column.id}`}>
            <FaRegPlusSquare className="text-[1.2em] text-orange-600 " />
          </Link>
        </div>
      </CardHeader>

      <ScrollArea>
        <CardContent className="flex flex-grow flex-col  gap-2 py-2 px-4">
          <SortableContext items={tasksIds}>
            {jobs.map((job) => (
              <JobSummary key={job._id} job={job} />
            ))}
          </SortableContext>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
