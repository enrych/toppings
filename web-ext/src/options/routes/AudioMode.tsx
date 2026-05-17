import React from "react";
import PageHeader from "../../shared/components/layout/PageHeader";
import Section from "../../shared/components/layout/Section";
import SectionNav from "../../shared/components/layout/SectionNav";
import Card from "../../shared/components/layout/Card";
import Switch from "../../shared/components/form/Switch";
import Keybinding from "../../shared/components/form/Keybinding";
import Input from "../../shared/components/form/Input";
import Select from "../../shared/components/form/Select";
import Slider from "../../shared/components/form/Slider";
import FilePicker from "../../shared/components/form/FilePicker";
import Field from "../../shared/components/form/Field";
import Button from "../../shared/components/primitives/Button";
import Badge from "../../shared/components/primitives/Badge";
import Icon from "../../shared/components/primitives/Icon";
import { useStoreUpdater } from "../../shared/hooks/useStoreUpdater";
import { useToast } from "../../shared/components/feedback/ToastProvider";
import { useConfirm } from "../../shared/components/feedback/ConfirmProvider";
import {
  useChromeStorageLocal,
  useChromeStorageLocalCount,
} from "../../shared/hooks/useChromeStorageLocal";
import { STORAGE_KEY } from "@toppings/constants";

export const sectionNavItems = [
  { id: "general", label: "General" },
  { id: "screen", label: "Screen Mode" },
  { id: "visualizer", label: "Visualizer" },
  { id: "background", label: "Custom Background" },
  { id: "pinned", label: "Pinned Videos" },
];

export const SectionsRail = () => <SectionNav items={sectionNavItems} />;

export default function AudioMode() {
  const { store, update } = useStoreUpdater();
  const toast = useToast();
  const confirm = useConfirm();
  const am = store.preferences.watch.audioMode;
  const [localImage, setLocalImage] = useChromeStorageLocal<string | null>(
    STORAGE_KEY.AUDIO_MODE_GLOBAL_CUSTOM_IMAGE,
    null,
  );
  const pinnedCount = useChromeStorageLocalCount(
    STORAGE_KEY.AUDIO_MODE_PIN_PREFIX,
  );

  const handlePickImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLocalImage(reader.result);
        toast.success("Background updated", file.name);
      }
    };
    reader.onerror = () => toast.error("Failed to read image");
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setLocalImage(null);
    toast.info("Background cleared");
  };

  const handleResetPins = async () => {
    if (pinnedCount === 0) return;
    const ok = await confirm({
      title: "Reset all pinned videos?",
      message: `This will clear ${pinnedCount} video-specific audio mode override${pinnedCount === 1 ? "" : "s"}. This action cannot be undone.`,
      confirmLabel: "Reset all",
      danger: true,
    });
    if (!ok) return;
    chrome.storage.local.get(null, (items) => {
      const keys = Object.keys(items).filter((k) =>
        k.startsWith(STORAGE_KEY.AUDIO_MODE_PIN_PREFIX),
      );
      if (keys.length > 0) {
        chrome.storage.local.remove(keys, () => {
          toast.success(
            "Pinned videos reset",
            `${keys.length} pin${keys.length === 1 ? "" : "s"} cleared`,
          );
        });
      }
    });
  };

  return (
    <>
      <PageHeader
        title="Audio Mode"
        description="Listen to YouTube videos without the video — perfect for office use, multitasking, or when the visuals aren't appropriate."
      />

      <div className="tw-flex tw-flex-col tw-gap-8">
        <Section
          id="general"
          title="General"
          description="Toggle the feature and configure its keyboard shortcut."
        >
          <Card>
            <Switch
              label="Enable Audio Mode"
              description="Show the audio mode toggle button in the player."
              isEnabled={am.isEnabled}
              onToggle={(isEnabled) => {
                update((draft) => {
                  draft.preferences.watch.audioMode.isEnabled = isEnabled;
                });
              }}
            />
            <Keybinding
              label="Toggle Audio Mode Shortcut"
              description="Press this key while watching a video to toggle audio mode."
              value={am.toggleAudioMode.key}
              onChange={(key) => {
                update((draft) => {
                  draft.preferences.watch.audioMode.toggleAudioMode.key = key;
                });
              }}
            />
          </Card>
        </Section>

        <Section
          id="screen"
          title="Screen Mode"
          description="What's shown when the video is hidden. Can be changed live from the player while audio mode is active."
        >
          <Card>
            <Select<"black" | "visualizer" | "custom">
              label="Default Screen Mode"
              description="Black is fastest. Visualizer reacts to audio. Custom shows your background image."
              value={am.screenMode}
              options={[
                {
                  value: "black",
                  label: "Black Screen",
                  description: "Solid black background.",
                },
                {
                  value: "visualizer",
                  label: "Visualizer",
                  description: "Animated waveform that reacts to audio.",
                },
                {
                  value: "custom",
                  label: "Custom Image",
                  description: "Your own background image.",
                },
              ]}
              onChange={(mode) => {
                update((draft) => {
                  draft.preferences.watch.audioMode.screenMode = mode;
                });
              }}
            />
          </Card>
        </Section>

        <Section
          id="visualizer"
          title="Visualizer"
          description="Tune the animated waveform that reacts to audio."
        >
          <Card>
            <Slider
              label="Sensitivity"
              description="Higher values produce a larger, more animated wave. Lower values dampen it."
              value={parseFloat(am.visualizerSensitivity ?? "1.5")}
              min={0.25}
              max={5}
              step={0.05}
              format={(v) => `${v.toFixed(2)}×`}
              onChange={(value) => {
                update((draft) => {
                  draft.preferences.watch.audioMode.visualizerSensitivity =
                    value.toFixed(2);
                });
              }}
            />
          </Card>
        </Section>

        <Section
          id="background"
          title="Custom Background"
          description="Set the image displayed when the screen mode is set to Custom."
        >
          <Card>
            <FilePicker
              label="Background Image"
              description="Upload an image from your computer. Stored locally; not synced across devices."
              value={localImage}
              onPick={handlePickImage}
              onClear={handleClearImage}
            />
            <Input
              label="Background Image URL"
              description="Used when no local image is selected. Any image URL works."
              initialValue={am.customBackground.globalImageUrl}
              placeholder="https://…"
              inputWidthClass="tw-w-72"
              onChange={(value) => {
                update((draft) => {
                  draft.preferences.watch.audioMode.customBackground.globalImageUrl =
                    value.trim();
                });
              }}
            />
          </Card>
        </Section>

        <Section
          id="pinned"
          title="Pinned Videos"
          description="Audio mode preferences saved per-video. Pin from the player UI while audio mode is active."
        >
          <Card>
            <Field
              label="Reset Pinned Videos"
              description="Clears all video-specific pins. Cannot be undone."
            >
              <div className="tw-flex tw-items-center tw-gap-3">
                <Badge tone={pinnedCount > 0 ? "info" : "neutral"}>
                  {pinnedCount === 0
                    ? "No pinned videos"
                    : `${pinnedCount} pinned`}
                </Badge>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={pinnedCount === 0}
                  leadingIcon={<Icon name="trash" size={14} />}
                  onClick={handleResetPins}
                >
                  Reset All
                </Button>
              </div>
            </Field>
          </Card>
        </Section>
      </div>
    </>
  );
}
