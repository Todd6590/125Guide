import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Camera, Save } from "lucide-react";
import { toast } from "sonner";
import UserAvatar from "@/components/user/UserAvatar";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setForm({ full_name: u?.full_name || "", phone: u?.phone || "" });
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ full_name: form.full_name, phone: form.phone });
    const updated = await base44.auth.me();
    setUser(updated);
    toast.success("Profile saved");
    setSaving(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ avatar_url: file_url });
    const updated = await base44.auth.me();
    setUser(updated);
    toast.success("Profile photo updated");
    setUploading(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-8 py-4">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account information.</p>
      </div>

      {/* Avatar section */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <UserAvatar user={user} size={96} />
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/80 transition-colors"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </div>
        <p className="text-xs text-muted-foreground">Click the camera icon to upload a photo</p>
      </div>

      {/* Form */}
      <div className="bg-card border rounded-xl p-6 space-y-4 shadow-sm">
        <div className="space-y-1.5">
          <Label>Full Name</Label>
          <Input
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            placeholder="Your full name"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={user.email || ""} disabled className="bg-muted text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
        </div>
        <div className="space-y-1.5">
          <Label>Phone Number</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <Button className="w-full gap-2" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}