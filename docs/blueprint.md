# **App Name**: InsightMeet

## Core Features:

- Video Upload and Processing: Allow users to upload meeting recordings (mp4, avi, mkv) and extract audio tracks and video frames for analysis using ffmpeg.
- Speaker Identification: Detect and label participants in the video using face detection (MediaPipe), re-identification (ArcFace), and appearance tagging (clothing color, accessories).
- Automated Transcription: Transcribe the meeting audio using Whisper-large-v3, incorporating a custom dictionary for company-specific terms to ensure higher accuracy. This feature acts as a tool for creating tagged transcripts.
- Sentiment Analysis: Analyze the sentiment of each speaker's dialogue using RoBERTa-large-mnli to detect positive, neutral, and negative emotions.
- Interactive Relationship Graph: Generate a graph visualizing the relationships between participants (supportive, neutral, conflictive) using NetworkX for graph computation, and render the graph in the browser with D3.js. The display will be visual and simplified; Neo4j will not be implemented for an MVP.
- Summary Report Generation: Generate a meeting summary report including main discussion points, overall sentiment, and relationship summaries based on NLP analysis, presented in a readable format (HTML).
- User-friendly Interface: Develop a responsive web interface using React and TailwindCSS, providing an intuitive way for users to upload videos, view analysis results, and interact with the relationship graph.

## Style Guidelines:

- Primary color: Muted teal (#73A9AD) to evoke trust and reliability without being cliche.
- Background color: Light grayish-teal (#E0F4F1), complementing the primary color and creating a calm visual background.
- Accent color: Pale gold (#D4AF37), adding sophistication and highlighting important interactive elements.
- Body and headline font: 'Inter', a grotesque-style sans-serif font known for its modern and neutral appearance, which will lend readability to both headlines and body text.
- Use simple, minimalist icons to represent different interaction types and emotions, ensuring clarity and avoiding distraction.
- Design a clean and structured layout, with clear sections for each output (transcript, graph, summary). Use white space effectively to enhance readability and focus.
- Incorporate subtle transitions and animations (e.g., when updating the relationship graph or displaying sentiment changes) to enhance user experience without being distracting.