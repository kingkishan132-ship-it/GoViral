# GoViral

GoViral is an Auto-Edit platform that turns long-form videos into short-form clips automatically.

## Core Flow

Upload → Auto Edit → Processing → Results → Edit / Export

GoViral is designed around automatic video editing rather than a traditional manual video editor.

## Current Features

- Long-video upload
- Automatic editing workflow
- Auto-selected highlight moments
- 9:16 vertical reframing concept
- Caption generation workflow
- Engagement-style clip scoring
- Clip results gallery
- Responsive mobile-first interface
- Processing progress interface
- Accessible semantic UI
- Lightweight React + Vite frontend

## Product Plans

### Free
- 3 auto-edits per month
- Captions
- 9:16 reframing
- 720p export
- GoViral watermark

### Creator — ₹199/month
- 50 clips
- 1080p export
- No watermark
- More caption styles

### Pro — ₹499/month
- 200 clips
- Advanced editing
- Premium styles

### Pro Plus — ₹1,499/month
- Unlimited / fair-use processing
- Priority processing
- Advanced Auto Edit

## Referral Rewards

- 1 genuine referral → +3 exports
- 3 referrals → 7 days Creator
- 5 referrals → 7 days Pro
- 10 referrals → 30 days Pro Plus
- 20 referrals → 90 days Pro Plus
- 50 referrals → 6 months Pro Plus

Referral rewards should only count after meaningful user activity and should include fraud prevention.

## Tech Stack

- React
- Vite
- CSS
- Vercel for frontend deployment
- FFmpeg for video processing
- Speech-to-text / transcription
- Background processing workers
- Object storage for large video uploads

## Production Architecture

The production processing pipeline should follow:

```text
User
 ↓
GoViral Frontend
 ↓
Direct / Resumable Upload
 ↓
Object Storage
 ↓
Processing Job
 ↓
Video Worker
 ├── Transcription
 ├── Highlight Detection
 ├── Clip Selection
 ├── 9:16 Reframing
 ├── Captions
 └── FFmpeg Export
 ↓
Job Status API
 ↓
GoViral Results
 ↓
Export