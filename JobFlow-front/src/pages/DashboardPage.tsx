import { JobSummary } from "@/components/JobSummary.tsx";
import { StatusColumn } from "@/components/StatusColumn.tsx";
import { useUpdateJob } from "@/mutations/job.mutations.ts";
import { useGetFilteredJobs } from "@/queries/job.query.ts";

import { IJob } from "@/types/job.types.ts";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Outlet } from "react-router-dom";

type DashboardPageProps = {};

export const columns = [
  "Wishlist",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
];

export default function DashboardPage({}: DashboardPageProps) {
  const { data: jobs = [] } = useGetFilteredJobs("");
  useEffect(() => {
    console.log(`DashboardPage: `, jobs);
  }, [jobs]);

  const [selectedJob, setSelectedJob] = useState<IJob | null>(null);

  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function onDragStart(event: DragStartEvent) {
    const data = event.active.data.current;

    if (data?.type === "Job") {
      setSelectedJob({ ...data.job });
      return;
    }
  }

  const update = useUpdateJob();

  function onDragEnd(event: DragEndEvent) {
    setSelectedJob(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const activeStatus = activeData.job.status;
    const activeOrder = activeData.job.order;

    const prevStatus = selectedJob.status;
    const prevOrder = selectedJob.order;

    if (activeStatus !== prevStatus) {
      console.log(`DashboardPage: not same status,updating`);
      update.mutate(jobs[activeStatus].concat(jobs[prevStatus]));
    } else if (activeOrder != prevOrder) {
      console.log(`DashboardPage: not same order,updating`);
      update.mutate(jobs[activeStatus]);
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const isActiveAJob = activeData?.type === "Job";
    const isOverAJob = overData?.type === "Job";

    if (!isActiveAJob) return;

    const activeJob = activeData.job;
    const activeStatus = activeJob.status;

    // Im dropping a Task over another Task
    if (isActiveAJob && isOverAJob) {
      const overJob = overData.job;
      const overStatus = overJob.status;
      if (activeJob && overJob && activeStatus !== overStatus) {
        console.log(`DashboardPage: drop on job different status`);
        return queryClient.setQueryData(["jobs"], (oldjobs: IJob[][]) => {
          const copy = oldjobs.map((jobs) => jobs && [...jobs]);
          copy[activeStatus].splice(activeJob.order, 1);
          copy[activeStatus] = copy[activeStatus].map((job, index) => ({
            ...job,
            order: index,
          }));
          activeJob.status = overStatus;
          copy[overStatus].splice(overJob.order, 0, activeJob);
          copy[overStatus] = copy[overStatus].map((job, index) => ({
            ...job,
            order: index,
          }));
          return copy;
        });
      }

      console.log(`DashboardPage: drop on job same status`);
      return queryClient.setQueryData(["jobs"], (oldjobs: IJob[][]) => {
        const newjobs = arrayMove(
          oldjobs[activeStatus],
          activeJob.order,
          overJob.order
        ).map((job, index) => ({
          ...job,
          order: index,
        }));

        return oldjobs.map((jobs, index) =>
          index === activeStatus ? newjobs : jobs && [...jobs]
        );
      });
    }

    const isOverAColumn = overData?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveAJob && isOverAColumn) {
      console.log(`DashboardPage: drop over column`, overId);
      const overStatus = overId as number;

      return queryClient.setQueryData(["jobs"], (oldjobs: IJob[][]) => {
        const copy = oldjobs.map((jobs) => jobs && [...jobs]);
        copy[activeStatus].splice(activeJob.order, 1);
        copy[activeStatus] = copy[activeStatus].map((job, index) => ({
          ...job,
          order: index,
        }));

        activeJob.status = overStatus;
        if (copy[overStatus]) {
          copy[overStatus].push(activeJob);
        } else {
          copy[overStatus] = [activeJob];
        }
        copy[overStatus] = copy[overStatus].map((job, index) => ({
          ...job,
          order: index,
        }));
        return copy;
      });
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex flex-grow gap-6  flex-wrap lg:items-stretch items-center lg:flex-row flex-col justify-center py-6 bg-gradient-to-tr from-orange-100 via-pink-200 to-red-300 dark:bg-gradient-to-tr dark:from-gray-800 dark:via-gray-900 dark:to-black">
          {columns.map((title, index) => (
            <StatusColumn
              key={index}
              column={{ title, id: index }}
              jobs={jobs[index]}
            />
          ))}
        </div>
        {"document" in window &&
          createPortal(
            <DragOverlay>
              {selectedJob && (
                <div className="p-2 bg-gradient-to-r from-pink-100 via-red-200 to-orange-300 dark:bg-gradient-to-r dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 rounded-2xl transform transition-transform duration-200 ease-in-out">
                  <JobSummary job={selectedJob} isOverlay />
                </div>
              )}
            </DragOverlay>,
            document.body
          )}
      </DndContext>
      <Outlet />
    </>
  );
}
