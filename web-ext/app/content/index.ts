import { bootFeatures } from "@/kernel/features";
import { onNavigate } from "@/youtube/route";
import { playlistRuntime } from "@/features/playlist-runtime";
import { shorts } from "@/features/shorts";
import { playback } from "@/features/playback";
import { profiles } from "@/features/profiles";
import { segments } from "@/features/segments";

bootFeatures([playlistRuntime, shorts, playback, profiles, segments], onNavigate);
