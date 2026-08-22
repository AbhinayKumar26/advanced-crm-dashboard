"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SettingsPage() {
  // Profile State
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@greentiq.com");
  const [isSaving, setIsSaving] = useState(false);

  // Preferences State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Mock Save Function
  const handleSaveProfile = () => {
    setIsSaving(true);
    
    // Simulate a 1-second backend API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile details updated successfully!");
    }, 1000);
  };

  // Theme Toggle Function
  const handleThemeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      toast.success("Dark mode enabled.");
    } else {
      document.documentElement.classList.remove("dark");
      toast.info("Light mode enabled.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings Card */}
        <div className="rounded-md border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-medium text-foreground">Profile Information</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Update your account details and public profile.
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="bg-background" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background" 
              />
            </div>

            <Button 
              onClick={handleSaveProfile} 
              disabled={isSaving || !name || !email} 
              className="mt-2 w-full sm:w-auto"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="rounded-md border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-medium text-foreground">App Preferences</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Manage your dashboard behavior and notifications.
          </p>
          
          <div className="space-y-4">
            
            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-background">
              <div>
                <p className="font-medium text-sm text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive daily summary reports.</p>
              </div>
              <div 
                onClick={() => {
                  setEmailNotifs(!emailNotifs);
                  toast.info(`Email notifications ${!emailNotifs ? 'enabled' : 'disabled'}.`);
                }}
                className={`h-5 w-9 rounded-full relative cursor-pointer border transition-colors flex items-center px-[2px] ${
                  emailNotifs ? "bg-primary border-primary" : "bg-secondary border-border"
                }`}
              >
                <div className={`h-3.5 w-3.5 bg-background rounded-full transition-transform duration-200 ${
                  emailNotifs ? "translate-x-4" : "translate-x-0"
                }`}></div>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-background">
              <div>
                <p className="font-medium text-sm text-foreground">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Toggle between light and dark themes.</p>
              </div>
              <div 
                onClick={handleThemeToggle}
                className={`h-5 w-9 rounded-full relative cursor-pointer border transition-colors flex items-center px-[2px] ${
                  darkMode ? "bg-primary border-primary" : "bg-secondary border-border"
                }`}
              >
                <div className={`h-3.5 w-3.5 bg-background rounded-full transition-transform duration-200 ${
                  darkMode ? "translate-x-4" : "translate-x-0"
                }`}></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}