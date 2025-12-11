import { Progress } from "../ui/progress";
import { CheckCircle2, Circle } from "lucide-react";

interface DayHeaderProps {
  dayNumber: number;
  title: string;
  chapterInfo?: string;
  isCompleted: boolean;
}

export function DayHeader({
  dayNumber,
  title,
  chapterInfo,
  isCompleted,
}: DayHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Day {dayNumber} / 15
            </span>
            {isCompleted ? (
              <span className="flex items-center text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
              </span>
            ) : (
              <span className="flex items-center text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                <Circle className="w-3 h-3 mr-1" /> In Progress
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {chapterInfo && (
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {chapterInfo}
            </p>
          )}
        </div>
      </div>
      <Progress value={isCompleted ? 100 : 0} className="h-1.5" />
    </div>
  );
}
