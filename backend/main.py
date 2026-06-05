from fastapi import FastAPI


app = FastAPI(title="LandIQ AI API", version="0.1.0")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "LandIQ AI backend is running"}