import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

// Temporary Textarea component if not exists
function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

interface ReflectionSectionProps {
  onSave: (reflection: string) => void;
}

export function ReflectionSection({ onSave }: ReflectionSectionProps) {
  const [reflection, setReflection] = useState("");

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <span>💭 Daily Reflection</span>
      </h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            What did you learn today? Any thoughts or questions?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Share your thoughts..."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>
    </div>
  );
}
