import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, ProviderConfig, ModelProvider } from '../types';
import ManageModelsView from './settings/ManageModelsView';
import ConnectProviderView from './settings/ConnectProviderView';
import EditProviderView from './settings/EditProviderView';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { exportConfig, importConfig, detectConflicts, mergeSettings, overrideSettings } from '../services/configIO';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

type ViewState = 'manage' | 'connect' | 'edit';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
  const [view, setView] = useState<ViewState>('manage');

  // Staging state
  const [localSettings, setLocalSettings] = useState<AppSettings>(currentSettings);
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [newProviderType, setNewProviderType] = useState<ModelProvider | null>(null);

  // Import/Export state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importConflict, setImportConflict] = useState<{
    imported: AppSettings;
    conflictNames: string[];
    newCount: number;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(currentSettings);
      setView('manage');
      setEditingProviderId(null);
      setNewProviderType(null);
      setImportConflict(null);
      setToastMessage(null);
    }
  }, [isOpen, currentSettings]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (!isOpen) return null;

  // -- Handlers --

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setLocalSettings(newSettings);
    onSave(newSettings); // Auto-save for toggle changes on Manage view
  };

  const handleConnectProvider = () => {
    setView('connect');
  };

  const handleSelectProviderType = (type: ModelProvider) => {
    setNewProviderType(type);
    setEditingProviderId(null); // It's a new one
    setView('edit');
  };

  const handleEditProvider = (id: string) => {
    setEditingProviderId(id);
    setNewProviderType(null);
    setView('edit');
  };

  const handleSaveProvider = (providerConfig: ProviderConfig) => {
    let newProviders = [...localSettings.providers];
    const existingIndex = newProviders.findIndex(p => p.id === providerConfig.id);

    if (existingIndex >= 0) {
      newProviders[existingIndex] = providerConfig;
    } else {
      newProviders.push(providerConfig);
    }

    const updatedSettings = { ...localSettings, providers: newProviders };
    setLocalSettings(updatedSettings);
    onSave(updatedSettings);
    setView('manage');
  };

  const handleDeleteProvider = (id: string) => {
    if (!confirm("Are you sure you want to remove this provider?")) return;

    const newProviders = localSettings.providers.filter(p => p.id !== id);
    const updatedSettings = { ...localSettings, providers: newProviders };
    setLocalSettings(updatedSettings);
    onSave(updatedSettings);
    setView('manage');
  };

  const handleBack = () => {
    if (view === 'edit') {
      // If we were adding new, go back to connect. If editing, go back to manage.
      if (editingProviderId) {
        setView('manage');
      } else {
        setView('connect');
      }
    } else if (view === 'connect') {
      setView('manage');
    } else {
      onClose(); // Close if back from manage (optional, but UI implies X is close)
    }
  };

  // Get initial config for edit view
  const getInitialEditConfig = () => {
    if (editingProviderId) {
      const found = localSettings.providers.find(p => p.id === editingProviderId);
      if (found) return found;
    }
    // New
    return {
      type: newProviderType || 'custom',
      models: [],
      headers: {}
    };
  };

  // --- Import/Export Handlers ---

  const handleExportConfig = async () => {
    try {
      await exportConfig(localSettings);
      setToastMessage('Configuration exported successfully!');
    } catch (e) {
      setToastMessage(`Export failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected
    e.target.value = '';

    try {
      const result = await importConfig(file);
      const { conflicts, newProviders } = detectConflicts(localSettings, result.settings);

      if (conflicts.length === 0) {
        // No conflicts: directly merge
        const merged = mergeSettings(localSettings, result.settings);
        setLocalSettings(merged);
        onSave(merged);
        setToastMessage(`Imported ${newProviders.length} provider(s) successfully!`);
      } else {
        // Has conflicts: show confirmation dialog
        setImportConflict({
          imported: result.settings,
          conflictNames: conflicts.map(c => `${c.name} (${c.type})`),
          newCount: newProviders.length,
        });
      }
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Import failed');
    }
  };

  const handleImportMerge = () => {
    if (!importConflict) return;
    const merged = mergeSettings(localSettings, importConflict.imported);
    setLocalSettings(merged);
    onSave(merged);
    setToastMessage(`Merged: ${importConflict.newCount} new provider(s) added, models from ${importConflict.conflictNames.length} existing provider(s) merged.`);
    setImportConflict(null);
  };

  const handleImportOverride = () => {
    if (!importConflict) return;
    const overridden = overrideSettings(localSettings, importConflict.imported);
    setLocalSettings(overridden);
    onSave(overridden);
    setToastMessage(`Override complete: ${importConflict.imported.providers.length} provider(s) imported.`);
    setImportConflict(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl h-[90vh] sm:h-[600px] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-[#1a2632]">
        <DialogTitle className="sr-only">
          {view === 'manage' && 'Manage Models'}
          {view === 'connect' && 'Connect Provider'}
          {view === 'edit' && 'Edit Provider'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Manage your AI provider settings and models
        </DialogDescription>

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".prism,.json"
          className="hidden"
          onChange={handleFileSelected}
        />

        {view === 'manage' && (
          <ManageModelsView
            settings={localSettings}
            onUpdateSettings={handleUpdateSettings}
            onConnectProvider={handleConnectProvider}
            onEditProvider={handleEditProvider}
            onDeleteProvider={handleDeleteProvider}
            onExportConfig={handleExportConfig}
            onImportConfig={handleImportClick}
          />
        )}

        {view === 'connect' && (
          <ConnectProviderView
            onSelectType={handleSelectProviderType}
            onCancel={() => setView('manage')}
          />
        )}

        {view === 'edit' && (
          <EditProviderView
            initialConfig={getInitialEditConfig()}
            existingIds={localSettings.providers.map(p => p.id)}
            onSave={handleSaveProvider}
            onBack={handleBack}
            onDelete={handleDeleteProvider}
          />
        )}

        {/* Import Conflict Confirmation Dialog */}
        {importConflict && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
            <div className="bg-background rounded-xl p-6 mx-4 max-w-md w-full shadow-2xl border border-border">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-amber-500 text-xl">warning</span>
                <h3 className="text-lg font-semibold text-foreground">Import Conflict</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                The following providers already exist:
              </p>
              <div className="bg-muted/50 rounded-lg p-3 mb-4 max-h-24 overflow-y-auto">
                {importConflict.conflictNames.map((name, i) => (
                  <div key={i} className="text-sm font-medium text-foreground">
                    • {name}
                  </div>
                ))}
              </div>
              {importConflict.newCount > 0 && (
                <p className="text-sm text-muted-foreground mb-4">
                  {importConflict.newCount} new provider(s) will be added.
                </p>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setImportConflict(null)}>
                  Cancel
                </Button>
                <Button variant="outline" size="sm" onClick={handleImportMerge}>
                  <span className="material-symbols-outlined text-[16px] mr-1">merge</span>
                  Merge
                </Button>
                <Button variant="default" size="sm" onClick={handleImportOverride}>
                  <span className="material-symbols-outlined text-[16px] mr-1">swap_horiz</span>
                  Override
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2 rounded-lg text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2 z-50">
            {toastMessage}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;