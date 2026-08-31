"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, Plus, QrCode, Settings, ArrowLeft } from "lucide-react";
import { useGroup, useExpenses, useSettlements } from "./../../../../lib/queries";
import { useAuth } from "./../../../../hooks/useAuth";
import { Button } from "./../../../../components/ui/button";
import { Card, CardContent } from "./../../../../components/ui/card";
import { SectionBoundary, SectionError, SectionLoading } from "./../../../../components/ui/section";
import { AddExpenseDialog } from "./../../../../components/expenses/add-expense-dialog";
import { ExpenseCard } from "./../../../../components/expenses/expense-card";
import { InviteModal } from "./../../../../components/groups/InviteModal";
import { MembersPanel } from "./../../../../components/groups/members-panel";
import { BalancesPanel } from "./../../../../components/balances/balances-panel";
import { GroupQRCode } from "./../../../../components/groups/GroupQRCode";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = typeof params?.id === "string" ? params.id : "";
  const { user } = useAuth();

  const groupQuery = useGroup(groupId);
  const expensesQuery = useExpenses(groupId);
  const settlementsQuery = useSettlements(groupId);

  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const isLoading = groupQuery.isLoading || expensesQuery.isLoading;
  const isError = groupQuery.isError || expensesQuery.isError;
  const error = groupQuery.error || expensesQuery.error;

  const group = groupQuery.data?.group;
  const members = groupQuery.data?.members ?? [];
  const expenses = expensesQuery.data?.expenses ?? [];
  const settlements = settlementsQuery.data?.settlements ?? [];

  const inviteUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/join/${groupId}` 
    : `https://mergepay.app/join/${groupId}`;

  return (
    <SectionBoundary subject="group details">
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/groups")}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back to groups
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInviteOpen(true)}
              className="gap-1"
            >
              <QrCode className="h-4 w-4" /> Invite
            </Button>
            <Button
              size="sm"
              onClick={() => setAddExpenseOpen(true)}
              className="gap-1"
            >
              <Plus className="h-4 w-4" /> Add expense
            </Button>
          </div>
        </div>

        {isLoading && (
          <SectionLoading label="Loading group details" minHeight="min-h-[20rem]" />
        )}

        {isError && (
          <SectionError
            subject="this group"
            error={error}
            onRetry={() => {
              void groupQuery.refetch();
              void expensesQuery.refetch();
            }}
          />
        )}

        {!isLoading && !isError && group && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-6 md:col-span-2">
              <Card>
                <div className="border-b-3 border-ink bg-aqua px-4 py-3">
                  <h1 className="font-display text-xl uppercase tracking-tight">{group.name}</h1>
                </div>
                <CardContent className="space-y-4 pt-4">
                  {group.description && (
                    <p className="text-sm text-ink/80">{group.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-ink/60">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {members.length} member{members.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h2 className="font-display text-base uppercase tracking-tight">Expenses</h2>
                {expenses.length === 0 ? (
                  <Card className="p-6 text-center text-sm text-ink/60">
                    No expenses recorded in this group yet.
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {expenses.map((expense) => (
                      <ExpenseCard
                        key={expense.id}
                        expense={expense}
                        groupId={groupId}
                        currentUserId={user?.id ?? ""}
                        members={members}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <GroupQRCode inviteUrl={inviteUrl} />
              <BalancesPanel groupId={groupId} members={members} expenses={expenses} settlements={settlements} currentUserId={user?.id ?? ""} />
              <MembersPanel members={members} />
            </div>
          </div>
        )}

        {groupId && (
          <AddExpenseDialog
            open={addExpenseOpen}
            onClose={() => setAddExpenseOpen(false)}
            groupId={groupId}
            members={members}
          />
        )}

        {groupId && (
          <InviteModal
            open={inviteOpen}
            onClose={() => setInviteOpen(false)}
            groupId={groupId}
          />
        )}
      </div>
    </SectionBoundary>
  );
}
