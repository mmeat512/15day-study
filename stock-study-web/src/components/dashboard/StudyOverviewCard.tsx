import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";
import { Study } from "../../types/study";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

interface StudyOverviewProps {
  study: Study;
  currentDay: number;
  totalDays: number;
  progress: number;
}

export function StudyOverviewCard({
  study,
  currentDay,
  totalDays,
  progress,
}: StudyOverviewProps) {
  const studyUrl = `/studies/${study.studyId}`;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Study Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{study.studyName}</div>
        <p className="text-xs text-muted-foreground">{study.bookTitle}</p>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground pt-1">
            Day {currentDay} of {totalDays}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={studyUrl} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
