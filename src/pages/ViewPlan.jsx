import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2, FileText, Loader2, Download, History, Shield, Sparkles } from "lucide-react";
import { generatePlanPDF } from "@/lib/generatePlanPDF";
import { toast } from "sonner";
import PlanDocumentPreview from "@/components/plans/PlanDocumentPreview";
import ErisaWrapPreview from "@/components/plans/ErispWrapPreview";
import PlanSummaryCard from "@/components/plans/PlanSummaryCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VersionHistory from "@/components/plans/VersionHistory";

export default function ViewPlan() {
  const params = new URLSearchParams(window.location.search);
  const planId = window.location.pathname.split("/plan/")[1];
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => base44.entities.PlanDocument.list("-created_date"),
    initialData: [],
  });

  const plan = plans.find((p) => p.id === planId);

  const handleDelete = async () => {
    await base44.entities.PlanDocument.delete(planId);
    queryClient.invalidateQueries({ queryKey: ["plans"] });
    toast.success("Plan deleted");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">Plan not found.</p>
        <Link to="/">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/">
          <Button variant="ghost" className="gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Link to={`/edit/${plan.id}`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="w-4 h-4" /> Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this plan document?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The plan document will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="flex-wrap">
          <TabsTrigger value="summary" className="gap-2">
            <Sparkles className="w-4 h-4" /> Summary
          </TabsTrigger>
          <TabsTrigger value="document" className="gap-2">
            <FileText className="w-4 h-4" /> Plan Document
          </TabsTrigger>
          <TabsTrigger value="spd" className="gap-2">
            <Shield className="w-4 h-4" /> ERISA SPD
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" /> Version History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <div className="bg-card rounded-xl border p-6 md:p-8 shadow-sm">
            <PlanSummaryCard plan={plan} />
          </div>
        </TabsContent>

        <TabsContent value="document" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => generatePlanPDF(plan)} className="gap-2">
              <Download className="w-4 h-4" /> Download PDF
            </Button>
          </div>
          <PlanDocumentPreview plan={plan} />
        </TabsContent>

        <TabsContent value="spd" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => generatePlanPDF(plan)} variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Download Full PDF
            </Button>
          </div>
          <ErisaWrapPreview plan={plan} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="bg-card rounded-xl border p-6 md:p-8 shadow-sm">
            <div className="mb-5">
              <h3 className="font-serif text-xl font-semibold">Version History</h3>
              <p className="text-sm text-muted-foreground mt-1">Each save creates a snapshot. Click any version to see what changed, or revert to it.</p>
            </div>
            <VersionHistory plan={plan} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}