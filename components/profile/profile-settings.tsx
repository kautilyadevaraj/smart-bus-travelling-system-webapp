import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, SquareActivity as Security } from "lucide-react";

interface ProfileSettingsProps {
  user: {
    email: string;
    card_uid: string | null;
  };
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  return (
    <div className="space-y-4">
      {/* Payment Method */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900">
            <CreditCard className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Payment Method</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {user.card_uid
                ? `${user.card_uid}`
                : "No payment method added"}
            </p>
            <Button variant="outline" size="sm" className="mt-3 bg-transparent">
              {user.card_uid ? "Update Card" : "Add Card"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Information */}
      <Card className="p-6">
        <h3 className="font-semibold">Account Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="mt-2"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Email verified through Google OAuth
          </p>
        </div>
      </Card>
    </div>
  );
}
