"""
FastAPI backend for AI-Powered Fake News & Deepfake Detection System.

Endpoints:
  POST /predict/text   — fake news detection (JSON body: { "text": "..." })
  POST /predict/image  — image deepfake detection (multipart form: file)
  POST /predict/video  — video deepfake detection (multipart form: file)
  GET  /health         — health check
  GET  /               — API info

Author: Mitesh Panda | Roll: R322QRA05
"""
from __future__ import annotations

import time
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from backend.models.fake_news_model import predict_text
from backend.models.deepfake_model import predict_image, predict_video

# ── App Setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="AI-Powered Fake News & Deepfake Detection API",
    description=(
        "Multi-modal AI platform detecting misinformation in text, images, and video. "
        "By Mitesh Panda | Lovely Professional University"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Allow all origins for local dev — tighten in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request / Response Models ─────────────────────────────────────────────────

class TextRequest(BaseModel):
    text: str = Field(..., min_length=10, description="News article or headline to analyze")
    use_bert: bool = Field(False, description="Attempt BERT pipeline (requires model)")
    use_web: bool = Field(True, description="Cross-check claims against the web via DuckDuckGo")


class TextResponse(BaseModel):
    label: str
    confidence: float
    explanation: str
    top_words: list[str]
    model_used: str
    processing_time_ms: float
    linguistic_score: Optional[float] = None
    web_evidence: Optional[dict] = None


class MediaResponse(BaseModel):
    label: str
    confidence: float
    explanation: str
    model_used: str
    processing_time_ms: float
    frame_results: Optional[list[dict]] = None


# ── Middleware: request timing ────────────────────────────────────────────────

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1000
    response.headers["X-Process-Time-Ms"] = str(round(elapsed_ms, 2))
    return response


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["info"])
def root():
    return {
        "name": "Multi-Modal AI Detection API",
        "version": "1.0.0",
        "author": "Mitesh Panda",
        "endpoints": {
            "POST /predict/text": "Fake news detection",
            "POST /predict/image": "Image deepfake/AI-generated detection",
            "POST /predict/video": "Video deepfake detection",
            "GET /health": "Health check",
            "GET /docs": "Swagger UI",
        },
    }


@app.get("/health", tags=["info"])
def health():
    return {"status": "ok", "timestamp": time.time()}


@app.post("/predict/text", response_model=TextResponse, tags=["detection"])
def api_predict_text(body: TextRequest):
    """
    Analyze a news article or headline and classify it as **Real** or **Fake**.

    Returns confidence score (0–1) and key contributing words.
    """
    start = time.perf_counter()
    try:
        result = predict_text(
            body.text,
            use_bert=body.use_bert,
            use_web=body.use_web,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Model error: {exc}") from exc

    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
    return {**result, "processing_time_ms": elapsed_ms}


@app.post("/predict/image", response_model=MediaResponse, tags=["detection"])
async def api_predict_image(file: UploadFile = File(...)):
    """
    Analyze an image and classify it as **Real** or **AI-Generated / Deepfake**.

    Accepts: jpg, jpeg, png, webp, gif
    """
    allowed = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}
    ext = "." + (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in allowed:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(allowed)}",
        )

    image_bytes = await file.read()
    if len(image_bytes) < 100:
        raise HTTPException(status_code=422, detail="File appears to be empty or corrupt.")

    start = time.perf_counter()
    try:
        result = predict_image(image_bytes, filename=file.filename or "upload.jpg")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Model error: {exc}") from exc

    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
    return {**result, "processing_time_ms": elapsed_ms, "frame_results": None}


@app.post("/predict/video", response_model=MediaResponse, tags=["detection"])
async def api_predict_video(file: UploadFile = File(...)):
    """
    Analyze a video and classify it as **Real** or **AI-Generated / Deepfake**.

    Frame-by-frame analysis with aggregated verdict.
    Accepts: mp4, mov, avi, mkv, webm
    """
    allowed = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv"}
    ext = "." + (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in allowed:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(allowed)}",
        )

    # Size guard: 200MB max
    video_bytes = await file.read()
    if len(video_bytes) > 200 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Max 200MB.")
    if len(video_bytes) < 1000:
        raise HTTPException(status_code=422, detail="File appears to be empty or corrupt.")

    start = time.perf_counter()
    try:
        result = predict_video(video_bytes, filename=file.filename or "upload.mp4")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Model error: {exc}") from exc

    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
    return {
        "label": result["label"],
        "confidence": result["confidence"],
        "explanation": result["explanation"],
        "model_used": result.get("model_used", "heuristic_demo"),
        "processing_time_ms": elapsed_ms,
        "frame_results": result.get("frame_results"),
    }
