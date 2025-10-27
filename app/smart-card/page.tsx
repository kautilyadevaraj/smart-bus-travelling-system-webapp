"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  CreditCard,
  Check,
  AlertCircle,
  Smartphone,
  Lock,
  Zap,
  Plus,
  History,
  Wallet,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "ride" | "recharge";
  amount: number;
  description: string;
  date: string;
  time: string;
}

export default function SmartCardPage() {
  const [step, setStep] = useState<
    "intro" | "linking" | "verify" | "success" | "recharge"
  >("intro");
  const [cardUID, setCardUID] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [linkedCard, setLinkedCard] = useState<string | null>("B3:9E:38:F6");
  const [cardBalance, setCardBalance] = useState(312.5);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [status, setStatus] = useState("");

  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "ride",
      amount: -45.5,
      description: "Bus Route #12 - Downtown",
      date: "Oct 25",
      time: "09:30 AM",
    },
    {
      id: "2",
      type: "recharge",
      amount: 500,
      description: "Card Recharge",
      date: "Oct 24",
      time: "02:15 PM",
    },
    {
      id: "3",
      type: "ride",
      amount: -32.0,
      description: "Bus Route #5 - Airport",
      date: "Oct 23",
      time: "06:45 PM",
    },
    {
      id: "4",
      type: "ride",
      amount: -28.75,
      description: "Bus Route #8 - Station",
      date: "Oct 22",
      time: "08:20 AM",
    },
  ]);

  const startCardDetection = async () => {
    setStatus("Waiting... Please tap your card on the reader.");
    setStep("linking");
    setIsLoading(true);

    try {
      const response = await fetch("/api/card/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        setStatus(error.error || "Failed to detect card");
        setIsLoading(false);
        setStep("intro");
        return;
      }

      const data = await response.json();
      setCardUID(data.cardUID);
      setStatus(`Card ${data.cardUID} detected! Verifying...`);
      setIsLoading(false);
      setStep("verify");
    } catch (error) {
      console.error("Card detection error:", error);
      setStatus("Error connecting to reader. Please try again.");
      setIsLoading(false);
      setStep("intro");
    }
  };

  const handleConfirmLink = async () => {
    setIsLoading(true);
    setStatus("Linking card to your account...");

    try {
      // Simulate API call to register card
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setLinkedCard(cardUID);
      setStatus(`Success! Card ${cardUID} is now linked.`);
      setStep("success");
      setTimeout(() => {
        setStep("intro");
        setCardUID("");
        setStatus("");
      }, 3000);
    } catch (error) {
      setStatus("Error linking card. Please try again.");
      setIsLoading(false);
    }
  };

  const handleRecharge = async () => {
    if (!rechargeAmount || Number.parseFloat(rechargeAmount) <= 0) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const amount = Number.parseFloat(rechargeAmount);
      setCardBalance(cardBalance + amount);
      setRechargeAmount("");
      setStep("intro");
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Smart Card Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Link, manage, and recharge your smart card for seamless travel
        </p>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-card-foreground">
              Quick Boarding
            </h3>
            <p className="text-sm text-muted-foreground">
              Tap and go - no need to show tickets
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-card-foreground">
              Secure Payments
            </h3>
            <p className="text-sm text-muted-foreground">
              Encrypted transactions for your safety
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-card-foreground">
              Easy Tracking
            </h3>
            <p className="text-sm text-muted-foreground">
              Monitor all your rides in one place
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {step === "intro" && (
        <>
          {/* Card Status Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <CreditCard className="w-5 h-5" />
                  {linkedCard ? "Linked Smart Card" : "Link Your Smart Card"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {linkedCard ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-2">
                        Current Linked Card
                      </p>
                      <p className="text-2xl font-mono font-bold text-primary">
                        {linkedCard}
                      </p>
                    </div>
                    {/* <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <Check className="w-5 h-5 text-green-500" />
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Card successfully linked and active
                      </p>
                    </div> */}
                    <Button
                      onClick={startCardDetection}
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                    >
                      Link Different Card
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 bg-muted rounded-lg border border-border text-center">
                      <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">
                        No smart card linked yet
                      </p>
                    </div>
                    <Button
                      onClick={startCardDetection}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Link Smart Card
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card Balance Section */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Wallet className="w-5 h-5" />
                  Card Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-lg border border-emerald-500/20">
                  <p className="text-xs text-muted-foreground">
                    Available Balance
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{cardBalance.toFixed(2)}
                  </p>
                </div>
                <Button
                  onClick={() => setStep("recharge")}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Money
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Transaction History */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <History className="w-5 h-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          transaction.type === "ride"
                            ? "bg-blue-500/10"
                            : "bg-green-500/10"
                        }`}
                      >
                        {transaction.type === "ride" ? (
                          <ArrowDown
                            className={`w-5 h-5 ${
                              transaction.type === "ride"
                                ? "text-blue-500"
                                : "text-green-500"
                            }`}
                          />
                        ) : (
                          <ArrowUp className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground text-sm">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.date} at {transaction.time}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-semibold text-sm ${
                        transaction.type === "ride"
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {transaction.type === "ride" ? "-" : "+"}₹
                      {Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Linking Step */}
      {step === "linking" && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Link Your Card
            </CardTitle>
            <CardDescription>Waiting for card detection...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-8 bg-muted rounded-lg border border-border text-center space-y-4">
              <div className="flex justify-center">
                <Spinner className="w-12 h-12 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-card-foreground">
                  Ready to detect card
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please tap your smart card on the reader
                </p>
              </div>
            </div>

            {status && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {status}
                </p>
              </div>
            )}

            <Button
              onClick={() => {
                setStep("intro");
                setStatus("");
                setIsLoading(false);
              }}
              variant="outline"
              className="w-full border-border text-foreground hover:bg-muted"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Verification Step */}
      {step === "verify" && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Verify Card</CardTitle>
            <CardDescription>
              Confirm the card details before linking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground mb-2">
                Card UID Detected
              </p>
              <p className="text-2xl font-mono font-bold text-primary">
                {cardUID}
              </p>
            </div>

            <div className="space-y-3 p-4 bg-muted rounded-lg border border-border">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-card-foreground text-sm">
                    Please Confirm
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Make sure this is your smart card. You can only link one
                    card at a time.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setStep("intro");
                  setCardUID("");
                  setStatus("");
                }}
                variant="outline"
                className="flex-1 border-border text-foreground hover:bg-muted"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmLink}
                disabled={isLoading}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-4 h-4" />
                    Linking...
                  </>
                ) : (
                  "Confirm & Link"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Step */}
      {step === "success" && (
        <Card className="bg-card border-border">
          <CardContent className="pt-12 pb-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">
                Card Linked Successfully!
              </h2>
              <p className="text-muted-foreground mt-2">
                Your smart card is now active and ready to use
              </p>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm font-mono text-green-700 dark:text-green-400">
                {cardUID}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Redirecting in a moment...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recharge Step */}
      {step === "recharge" && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Add Money to Card
            </CardTitle>
            <CardDescription>Recharge your smart card balance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-2">
                Current Balance
              </p>
              <p className="text-2xl font-bold text-card-foreground">
                ₹{cardBalance.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">
                Recharge Amount
              </label>
              <Input
                type="number"
                placeholder="Enter amount (e.g., 500)"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                className="bg-muted border-border text-card-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
                min="1"
                step="1"
              />
              <p className="text-xs text-muted-foreground">
                Minimum recharge: ₹100
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[100, 250, 500].map((amount) => (
                <Button
                  key={amount}
                  onClick={() => setRechargeAmount(amount.toString())}
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted"
                  disabled={isLoading}
                >
                  ₹{amount}
                </Button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setStep("intro");
                  setRechargeAmount("");
                }}
                variant="outline"
                className="flex-1 border-border text-foreground hover:bg-muted"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRecharge}
                disabled={
                  !rechargeAmount ||
                  Number.parseFloat(rechargeAmount) < 100 ||
                  isLoading
                }
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-4 h-4" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add ₹{rechargeAmount || "0"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
