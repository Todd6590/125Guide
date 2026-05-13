import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AmendmentEmailModal({ open, onClose, alerts }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) { toast.error("Please enter a recipient email."); return; }
    setSending(true);
    try {
      const res = await base44.functions.invoke("emailAmendment", {
        alertIds: alerts.map(a => a.id),
        recipientEmail: email,
        recipientName: name,
        notes,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setSent(true);
      toast.success(`Amendment sent to ${email}`);
    } catch (e) {
      toast.error("Failed to send: " + e.message);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setSent(false);
    setEmail("");
    setName("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Email Amendment Document
          </DialogTitle>
          <DialogDescription>
            Send {alerts.length} amendment{alerts.length !== 1 ? "s" : ""} as a formatted email with draft language ready for attorney review.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <p className="font-semibold text-foreground">Sent successfully!</p>
            <p className="text-sm text-muted-foreground text-center">
              Amendment document delivered to <strong>{email}</strong>
            </p>
            <Button className="mt-2" onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="email">Recipient Email <span className="text-destructive">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="attorney@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Recipient Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                id="name"
                placeholder="John Smith"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Additional Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                id="notes"
                placeholder="Please review and advise on effective dates…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Summary */}
            <div className="bg-muted/40 rounded-lg p-3 border">
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Amendments to be sent:</p>
              <ul className="space-y-1">
                {alerts.slice(0, 4).map(a => (
                  <li key={a.id} className="text-xs text-foreground flex items-start gap-1.5">
                    <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.severity === 'critical' ? 'bg-red-500' : a.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    {a.issue}
                  </li>
                ))}
                {alerts.length > 4 && (
                  <li className="text-xs text-muted-foreground pl-3">+{alerts.length - 4} more…</li>
                )}
              </ul>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
              <Button className="flex-1 gap-2" onClick={handleSend} disabled={sending}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {sending ? "Sending…" : "Send Amendment"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}