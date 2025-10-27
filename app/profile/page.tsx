"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Mail, CreditCard, Edit2, Phone } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information
        </p>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <Input
                value="John Doe"
                readOnly
                className="bg-muted border-border text-card-foreground cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <Input
                value="john.doe@example.com"
                readOnly
                className="bg-muted border-border text-card-foreground cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <Input
                value="+91 98765 43210"
                readOnly
                className="bg-muted border-border text-card-foreground cursor-not-allowed"
              />
            </div>

            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Smart Card Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              My Smart Card
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-2">Card UID</p>
              <p className="text-lg font-mono font-bold text-card-foreground">
                B3:9E:38:F6
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-2">Card Balance</p>
              <p className="text-lg font-bold text-card-foreground">₹312.50</p>
            </div>
            <p className="text-sm text-muted-foreground">
              This is your unique Smart Card identifier used for all
              transactions. Keep it safe and secure.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Preferences */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground">
                Email Notifications
              </p>
              <p className="text-sm text-muted-foreground">
                Receive ride updates via email
              </p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>
          <div className="border-t border-border pt-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground">
                SMS Notifications
              </p>
              <p className="text-sm text-muted-foreground">
                Receive ride updates via SMS
              </p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
