import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FlaskConical, Plus, Play, History, Users, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import ParticipantForm from "@/components/ndt/ParticipantForm.jsx";
import ParticipantTable from "@/components/ndt/ParticipantTable.jsx";
import NDTResultReport from "@/components/ndt/NDTResultReport.jsx";
import NDTSessionHistory from "@/components/ndt/NDTSessionHistory.jsx";
import { runNDT } from "@/lib/ndtEngine.js";

export default function NondiscriminationTesting() {
  const queryClient = useQueryClient();
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [testYear, setTestYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState("participants"); // participants | results | history
  const [participantFormOpen, setParticipantFormOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [lastResults, setLastResults] = useState(null);
  const [viewingSession, setViewingSession] = useState(null);
  const [running, setRunning] = useState(false);

  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: () => base44.entities.PlanDocument.list("-created_date"),
  });

  const { data: participants = [], isLoading: loadingParticipants } = useQuery({
    queryKey: ["participants", selectedPlanId],
    queryFn: () =>
      selectedPlanId
        ? base44.entities.Participant.filter({ plan_id: selectedPlanId })
        : [],
    enabled: !!selectedPlanId,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["ndt-sessions", selectedPlanId],
    queryFn: () =>
      selectedPlanId
        ? base44.entities.NDTSession.filter({ plan_id: selectedPlanId }, "-run_date")
        : [],
    enabled: !!selectedPlanId,
  });

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const handleSaveParticipant = async (data) => {
    if (editingParticipant) {
      await base44.entities.Participant.update(editingParticipant.id, data);
      toast.success("Participant updated");
    } else {
      await base44.entities.Participant.create({
        ...data,
        plan_id: selectedPlanId,
        plan_name: selectedPlan?.plan_name || "",
      });
      toast.success("Participant added");
    }
    queryClient.invalidateQueries({ queryKey: ["participants", selectedPlanId] });
    setParticipantFormOpen(false);
    setEditingParticipant(null);
  };

  const handleEditParticipant = (p) => {
    setEditingParticipant(p);
    setParticipantFormOpen(true);
  };

  const handleDeleteParticipant = async () => {
    await base44.entities.Participant.delete(deleteId);
    queryClient.invalidateQueries({ queryKey: ["participants", selectedPlanId] });
    toast.success("Participant removed");
    setDeleteId(null);
  };

  const handleRunTests = async () => {
    if (!participants.length) {
      toast.error("Add participants before running tests.");
      return;
    }
    setRunning(true);
    const results = runNDT(participants);
    setLastResults(results);

    // Save session
    await base44.entities.NDTSession.create({
      plan_id: selectedPlanId,
      plan_name: selectedPlan?.plan_name || "",
      test_year: testYear,
      run_date: format(new Date(), "yyyy-MM-dd"),
      overall_result: results.overall,
      eligibility_test_pass: results.eligibilityPass,
      benefits_test_pass: results.benefitsPass,
      concentration_test_pass: results.concentrationPass,
      adp_test_pass: results.adpPass,
      test_results_json: results,
      participant_count: participants.length,
      hce_count: results.stats.hceCount,
      nhce_count: results.stats.nhceCount,
    });

    queryClient.invalidateQueries({ queryKey: ["ndt-sessions", selectedPlanId] });
    setActiveTab("results");
    setRunning(false);
    toast.success(`Test complete — ${results.overall === "pass" ? "All tests passed!" : "Some tests failed. Review remediation steps."}`);
  };

  const handleDeleteSession = async (id) => {
    await base44.entities.NDTSession.delete(id);
    queryClient.invalidateQueries({ queryKey: ["ndt-sessions", selectedPlanId] });
    toast.success("Session deleted");
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Nondiscrimination Testing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter participant data and run IRS Section 125 NDT — Eligibility, Benefits, Concentration, and ADP tests.
          </p>
        </div>
      </div>

      {/* Plan + Year selectors */}
      <div className="flex flex-wrap gap-3 items-center p-4 rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Select Plan</label>
          <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a plan…" />
            </SelectTrigger>
            <SelectContent>
              {plans.filter(p => !p.is_sample).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.plan_name} {p.employer_name ? `— ${p.employer_name}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Test Year</label>
          <Select value={String(testYear)} onValueChange={(v) => setTestYear(Number(v))}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedPlanId ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-xl bg-muted/20 text-center">
          <FlaskConical className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="font-medium text-muted-foreground">Select a plan above to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
            {[
              { id: "participants", label: "Participants", Icon: Users },
              { id: "results", label: "Test Results", Icon: FlaskConical },
              { id: "history", label: "History", Icon: History },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === id
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {id === "participants" && participants.length > 0 && (
                  <Badge className="text-xs bg-primary/10 text-primary ml-1">{participants.length}</Badge>
                )}
              </button>
            ))}
          </div>

          {/* Participants Tab */}
          {activeTab === "participants" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {participants.length} participant{participants.length !== 1 ? "s" : ""} entered
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => { setEditingParticipant(null); setParticipantFormOpen(true); }}
                  >
                    <Plus className="w-4 h-4" /> Add Participant
                  </Button>
                  <Button
                    className="gap-2"
                    onClick={handleRunTests}
                    disabled={running || !participants.length}
                  >
                    {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Run NDT
                  </Button>
                </div>
              </div>

              {loadingParticipants ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : participants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-xl bg-muted/20 text-center">
                  <Users className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="font-medium text-muted-foreground">No participants yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Add participants to run nondiscrimination tests.</p>
                  <Button
                    className="mt-4 gap-2"
                    size="sm"
                    onClick={() => { setEditingParticipant(null); setParticipantFormOpen(true); }}
                  >
                    <Plus className="w-4 h-4" /> Add First Participant
                  </Button>
                </div>
              ) : (
                <ParticipantTable
                  participants={participants}
                  onEdit={handleEditParticipant}
                  onDelete={setDeleteId}
                />
              )}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === "results" && (
            <div>
              {lastResults ? (
                <NDTResultReport
                  results={lastResults}
                  planName={selectedPlan?.plan_name || ""}
                  testYear={testYear}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-xl bg-muted/20 text-center">
                  <FlaskConical className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="font-medium text-muted-foreground">No results yet — run the tests first.</p>
                  <Button className="mt-4 gap-2" size="sm" onClick={() => setActiveTab("participants")}>
                    <Users className="w-4 h-4" /> Go to Participants
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <NDTSessionHistory
              sessions={sessions}
              onView={(s) => {
                setViewingSession(s);
              }}
              onDelete={handleDeleteSession}
            />
          )}
        </div>
      )}

      {/* Participant Form Dialog */}
      <Dialog open={participantFormOpen} onOpenChange={setParticipantFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingParticipant ? "Edit Participant" : "Add Participant"}</DialogTitle>
          </DialogHeader>
          <ParticipantForm
            initial={editingParticipant}
            onSave={handleSaveParticipant}
            onCancel={() => { setParticipantFormOpen(false); setEditingParticipant(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Session Viewer Dialog */}
      <Dialog open={!!viewingSession} onOpenChange={() => setViewingSession(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Test Session — {viewingSession?.plan_name} ({viewingSession?.test_year})</DialogTitle>
          </DialogHeader>
          {viewingSession?.test_results_json && (
            <NDTResultReport
              results={viewingSession.test_results_json}
              planName={viewingSession.plan_name}
              testYear={viewingSession.test_year}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this participant?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the participant from this plan's census.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteParticipant}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}