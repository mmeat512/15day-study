import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { User } from "lucide-react";
import { User as UserType } from "../../types/user";

interface ProfileCardProps {
  user: UserType;
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.username}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <User className="h-8 w-8 text-gray-400" />
          )}
        </div>
        <div>
          <CardTitle>{user.username}</CardTitle>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Member since {user.createdAt.toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
