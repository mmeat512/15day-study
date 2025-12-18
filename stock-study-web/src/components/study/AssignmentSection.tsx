import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Assignment } from "../../types/study";

interface AssignmentSectionProps {
  assignments: Assignment[];
  onSave: (answers: Record<string, string>) => void;
}

export function AssignmentSection({
  assignments,
  onSave,
}: AssignmentSectionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleChange = (assignmentId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [assignmentId]: value }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <span>✏️ Assignments</span>
      </h2>

      {assignments.map((assignment, index) => (
        <Card key={assignment.id}>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Q{index + 1}. {assignment.questionText}
              {assignment.isRequired && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Write your answer here..."
              value={answers[assignment.id] || ""}
              onChange={(e) =>
                handleChange(assignment.id, e.target.value)
              }
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
