"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Send, Mail } from "lucide-react";
import { AlertSettings, getAlertSettings, saveAlertSettings } from "@/lib/alerts";

export default function AlertSettingsComponent() {
  const [settings, setSettings] = useState<AlertSettings>({ enabled: false });
  const [contact, setContact] = useState("");
  const [contactType, setContactType] = useState<"telegram" | "email">("telegram");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const stored = getAlertSettings();
    setSettings(stored);
    setContact(stored.telegram || stored.email || "");
    setContactType(stored.telegram ? "telegram" : "email");
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    
    const newSettings: AlertSettings = {
      enabled: settings.enabled,
      [contactType]: contact || undefined,
    };

    // Clear the other contact method
    if (contactType === "telegram") {
      newSettings.email = undefined;
    } else {
      newSettings.telegram = undefined;
    }

    saveAlertSettings(newSettings);
    setSettings(newSettings);
    
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleToggle = () => {
    const newEnabled = !settings.enabled;
    const newSettings = { ...settings, enabled: newEnabled };
    setSettings(newSettings);
    
    if (!newEnabled) {
      saveAlertSettings(newSettings);
    }
  };

  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-cyan-400" />
        <h2 className="text-white font-semibold">HOT Token Alerts</h2>
      </div>
      
      <p className="text-gray-400 text-sm mb-6">
        Get notified instantly when tokens reach HOT status (high volume + liquidity)
      </p>

      <div className="space-y-4">
        {/* Contact Method Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setContactType("telegram")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              contactType === "telegram"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
            }`}
          >
            <Send className="w-4 h-4" />
            Telegram
          </button>
          <button
            onClick={() => setContactType("email")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              contactType === "email"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
            }`}
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
        </div>

        {/* Contact Input */}
        <div>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={
              contactType === "telegram"
                ? "Telegram @username or chat ID"
                : "your@email.com"
            }
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                settings.enabled
                  ? "bg-green-500/20 text-green-300 border border-green-500/40"
                  : "bg-gray-800 text-gray-400 border border-gray-700"
              }`}
            >
              {settings.enabled ? (
                <>
                  <Bell className="w-4 h-4" />
                  Alerts Enabled
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4" />
                  Alerts Disabled
                </>
              )}
            </button>
          </div>

          {settings.enabled && (
            <button
              onClick={handleSave}
              disabled={!contact.trim() || isSaving}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !contact.trim() || isSaving
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-cyan-500 hover:bg-cyan-400 text-black"
              }`}
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          )}
        </div>

        {/* Status */}
        {settings.enabled && contact && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="text-green-300 text-sm">
              ✅ Alerts active for {contactType === "telegram" ? "Telegram" : "Email"}: {contact}
            </p>
          </div>
        )}

        {contactType === "telegram" && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-blue-300 text-sm">
              💡 <strong>Telegram Setup:</strong> Message our bot first, then use your @username or chat ID
            </p>
          </div>
        )}
      </div>
    </div>
  );
}