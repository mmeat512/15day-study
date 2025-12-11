import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { DayPlan } from "../../types/study";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface TodayAssignmentProps {
  dayPlan: DayPlan;
  isCompleted: boolean;
}

export function TodayAssignmentCard({
  dayPlan,
  isCompleted,
}: TodayAssignmentProps) {
  const assignmentUrl = `/studies/${dayPlan.studyId}/day/${dayPlan.dayNumber}`;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>
            Day {dayPlan.dayNumber}: {dayPlan.title}
          </span>
          {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
        </CardTitle>
        <CardDescription>{dayPlan.chapterInfo}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {dayPlan.learningGoal}
        </p>
      </CardContent>
      <CardFooter>
        <Link href={assignmentUrl} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            {isCompleted ? "Review Submission" : "Start Assignment"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
