"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code2 } from "lucide-react";

const pipelineSteps = [
    {
      title: "1) Ingestion & Job Orchestration",
      content: `
        **Purpose:** Accept upload, create processing job, store raw file.<br/>
        **Input:** meeting.mp4 from frontend.<br/>
        **Output:** job_id, stored file path (s3://.../meeting.mp4).<br/>
        **Tech:** FastAPI for API, Celery + Redis for background tasks.<br/>
        **Implementation notes:** POST /upload accepts file, generate job_id (UUID), store file to S3/MinIO, enqueue Celery task process_meeting(job_id, file_path). Return 202 Accepted with job_id and /status/{job_id} endpoint.<br/>
        **Pitfalls & mitigations:** Large uploads: use chunked uploads / presigned S3 URLs. Validate file types/sizes and provide progress feedback.
      `
    },
    {
      title: "2) Preprocessing (ffmpeg + frame extraction)",
      content: `
        **Purpose:** Extract audio and frames; normalize audio.<br/>
        **Input:** raw video file.<br/>
        **Output:** meeting.wav (16k/44.1k), frames folder (e.g., 1 fps or 2 fps), optionally higher fps for active speaker detection.<br/>
        **Tech:** ffmpeg, opencv (frame capture).<br/>
        **Implementation notes:** Audio: \`ffmpeg -i meeting.mp4 -ar 16000 -ac 1 meeting.wav\`. Frames: sample 1-2 fps for detection; sample higher (e.g., 5-10 fps) around detected speech segments for lip-sync.<br/>
        **Pitfalls & mitigations:** Long videos → store frames compressed; delete intermediate frames after processing. If multiple cameras / picture-in-picture, crop/extract sub-views if possible.
      `
    },
    {
      title: "3) Voice Activity Detection (VAD) & Segmenting",
      content: `
        **Purpose:** Split audio into speech/non-speech chunks to speed up downstream models.<br/>
        **Input:** meeting.wav<br/>
        **Output:** speech intervals [(t0,t1), ...]<br/>
        **Tech:** webrtcvad, pyannote VAD.<br/>
        **Notes:** Use VAD before diarization to reduce compute. Timestamp alignment must be precise (ms).
      `
    },
    {
        title: "4) Speaker Diarization (who spoke when)",
        content: `
            **Purpose:** Determine speaker-turn boundaries and produce speaker labels (A, B, C...).<br/>
            **Input:** filtered speech audio segments.<br/>
            **Output:** diarization segments: [{start, end, speaker_label, confidence}]<br/>
            **Tech:** pyannote.audio, optionally WhisperX diarization alignment.<br/>
            **Implementation notes:** Run pyannote on entire audio -> returns speaker clusters and timestamps. Save speaker embeddings for each speaker cluster (for later voice↔face matching).<br/>
            **Pitfalls & mitigations:** Overlapping speech: diarizers may give multiple labels or merge speakers; keep confidence and allow multi-speaker attribution. Short segments may be noisy — aggregate segments by speaker to compute stable embeddings.
        `
    },
    {
        title: "5) Speech-to-Text (ASR)",
        content: `
            **Purpose:** Convert speech segments to text with timestamps.<br/>
            **Input:** meeting.wav (or speech segments).<br/>
            **Output:** transcripts: [{start, end, text, confidence}]<br/>
            **Tech:** Whisper-large-v3 (local + GPU) or hosted OpenAI ASR.<br/>
            **Implementation notes:** Run on full audio or per-segment depending on compute. Post-process: punctuation, casing, apply custom dictionary (names/jargon), spell-check.<br/>
            **Pitfalls & mitigations:** Domain terms: maintain a custom vocabulary and treat low-confidence tokens for human review. Performance: batch long segments; use GPU.
        `
    },
    {
        title: "6) Face Detection & Tracking (appearance extraction)",
        content: `
            **Purpose:** Detect faces per frame, track across frames, produce consistent face IDs and appearance descriptors (shirt color, glasses).<br/>
            **Input:** extracted frames.<br/>
            **Output:** face tracks: [{face_id, frames: [(t, bbox)], embedding, appearance_tags}]<br/>
            **Tech:** MediaPipe Face Detection for speed; ArcFace/InsightFace for embeddings; OpenCV for tracking; clothing color via bounding box below face or person detection model.<br/>
            **Implementation notes:** Pipeline: detect faces per frame → compute embedding (ArcFace) → cluster embeddings to create \`face_id\`s → smooth tracks with tracking (SORT/Kalman) so one person across time = same face_id. For shirt color: detect person/upper-body bounding box using a person detector (YOLO), sample color patches, run k-means on RGB to get dominant color; map to name ("black", "red", "blue"). Accessory detection: small classifiers for glasses/beard using cropped face region.<br/>
            **Pitfalls & mitigations:** Occlusion / face turned away: maintain short-term track-through using motion model; if embedding confidence is low, label as unknown and update when face returns.
        `
    },
    {
        title: "7) Active Speaker Mapping (voice ↔ face)",
        content: `
            **Purpose:** Map diarization speaker labels to face IDs so transcripts say “A (black shirt)”.<br/>
            **Input:** diarization segments (time ranges) + face tracks (frame timestamps) + face mesh mouth activity.<br/>
            **Output:** mapping: speaker_label -> face_id and per-segment speaker attribution.<br/>
            **Tech:** lip-sync correlation (face mouth opening vs. audio energy), cross-modal alignment, time overlap heuristics.<br/>
            **Implementation logic (ranked heuristics):**
            <ol class="list-decimal list-inside space-y-2">
              <li>For each speech segment, find face tracks present in that time window.</li>
              <li>Compute lip-motion score for each face (difference of mouth landmarks across frames); compute audio energy for segment.</li>
              <li>Correlate mouth-motion peaks with audio envelope — the face with highest correlation likely active-speaker.</li>
              <li>If no clear lip-sync (camera off/head down), fall back to voice embedding similarity: compute speaker voice embedding from diarization and compare to stored voiceprints from earlier segments.</li>
              <li>If multiple faces speak simultaneously, assign multiple face_ids (multi-speaker support).</li>
            </ol>
            **Pitfalls & mitigations:** Cameras not showing speaker → fallback to voice-only labels (A/B) and appearance unknown. Overlapping speech may map to multiple faces; represent multi-speaker attribution in outputs.
        `
    },
    {
        title: "8) Emotion Detection (multi-modal fusion)",
        content: `
            **Purpose:** Determine emotion for each utterance per person using face, voice, and text.<br/>
            **Input:** for each utterance: text, audio segment, face frames in same time range.<br/>
            **Outputs:** emotion object: {emotion_label, probability, source_weights, raw_scores}<br/>
            **Components & Tech:**<br/>
            <ul class="list-disc list-inside space-y-1">
                <li>*Facial emotion:* AffectNet model / FER or DeepFace emotion (frame-level → aggregate to segment).</li>
                <li>*Voice emotion:* openSMILE + classifier (pretrained or RAVDESS-finetuned) → prosody/pitch features → emotion probabilities.</li>
                <li>*Text sentiment/emotion:* RoBERTa/BERT classifier for positive-neutral-negative and more granular emotions.</li>
            </ul>
            **Fusion strategy:** Normalize confidence scores from each modality. Weighted average where weights depend on modality availability & historical reliability: e.g., if face visible and high-confidence, weight face higher; else weight audio/text more. Output both composite label (e.g., positive-happy) and per-modality scores.<br/>
            **Pitfalls & mitigations:** Sarcasm: text-based model may misclassify; lower text weight if face/audio indicate incongruence. Provide confidence and human review UI.
        `
    },
    {
        title: "9) Intent & Interaction Target Detection (who are they addressing?)",
        content: `
            **Purpose:** Determine if an utterance is directed at a particular participant (so relationships can be inferred).<br/>
            **Input:** utterances, context (previous turns), names mentioned, addressing phrases ("Priya", "you", "as John said").<br/>
            **Output:** targets: list of face_ids / speaker_labels with confidence.<br/>
            **Tech:** Named Entity Recognition (NER), coreference resolution, conversational adjacency heuristics, transformer-based reply-detection model.<br/>
            **Implementation:** Detect explicit mentions: names, role-based ("Manager"), pronouns. Resolve pronouns with coref (HuggingFace coref or neuralcoref). If no name, use conversational adjacency: if B speaks within 5–10s after A and uses counter words ("I disagree", "but"), mark as likely reply target A with a score proportional to time proximity and content similarity. Use a small fine-tuned transformer pair-classifier: input = [A_utterance, B_utterance], output = reply/response probability + relation type (support/oppose/neutral).<br/>
            **Pitfalls & mitigations:** Ambiguous multi-party addressing: produce low-confidence multi-targets; expose to user to correct.
        `
    },
    {
        title: "10) Relationship Extraction & Edge Weighting",
        content: `
            **Purpose:** Convert utterance-level interactions into graph edges (support/neutral/conflict) with weights.<br/>
            **Input:** utterance sentiments + target detection + sequence of interactions.<br/>
            **Output:** Graph edges {from, to, label, weight, evidence: [utterance_ids]}<br/>
            **Algorithm:** For each utterance U by speaker S: For each detected target T: Compute interaction_score = f(sentiment_score_of_U, wording (agreement/disagreement keywords), intensity (audio emotion), historical relationship trend). Classify label: support if interaction_score > thresh_pos, conflict if < thresh_neg, neutral otherwise. Accumulate weight += abs(interaction_score). Append U.id to evidence. Normalize weights per-pair to [0..1].<br/>
            **Tech:** rule-based + small supervised classifier using labeled pairs for robust detection.<br/>
            **Pitfalls:** False positives for politeness language — mitigate by using transformer classifier trained on in-domain meeting dialogs.
        `
    },
    {
      title: "11-15) Final Steps (Graph, Storage, API, Security)",
      content: `
          This covers the final stages of the pipeline:<br/>
          <ul class="list-disc list-inside space-y-2">
              <li><strong>Graph Construction & Export:</strong> Building the final graph with NetworkX and exporting as JSON.</li>
              <li><strong>Post-processing & Enrichment:</strong> Generating summaries, participation metrics, and extracting key topics.</li>
              <li><strong>Storage & API:</strong> Persisting all results in a database (e.g., Postgres) and serving them via a \`/results/{job_id}\` API endpoint.</li>
              <li><strong>Reporting, Security & Monitoring:</strong> Generating downloadable PDF reports, ensuring data privacy with encryption and auth, and monitoring the pipeline's health.</li>
          </ul>
      `
  }
];

export default function PipelineBreakdown() {
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-md">
      <CardHeader>
        <div className="flex items-center gap-3">
            <Code2 className="w-8 h-8 text-primary"/>
            <div>
                <CardTitle>Backend Pipeline Breakdown</CardTitle>
                <CardDescription>A developer-friendly overview of the video processing pipeline.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {pipelineSteps.map((step, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-left hover:no-underline font-semibold">
                {step.title}
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: step.content }}/>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}