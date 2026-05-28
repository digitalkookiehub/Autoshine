import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.exceptions import AppException

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "code": exc.code},
    )


@app.get("/health")
async def health():
    return {"status": "healthy", "version": settings.VERSION}


from app.routers import auth, services, bookings, garage, gallery
from app.routers import memberships, reviews, notifications, home, admin, profile, studio
from app.routers.services import category_router
from app.routers.memberships import loyalty_router
from app.routers.reviews import service_reviews_router
from app.routers.bookings import slots_router

app.include_router(auth.router, prefix="/api/v1")
app.include_router(services.router, prefix="/api/v1")
app.include_router(category_router, prefix="/api/v1")
app.include_router(bookings.router, prefix="/api/v1")
app.include_router(slots_router, prefix="/api/v1")
app.include_router(garage.router, prefix="/api/v1")
app.include_router(gallery.router, prefix="/api/v1")
app.include_router(memberships.router, prefix="/api/v1")
app.include_router(loyalty_router, prefix="/api/v1")
app.include_router(reviews.router, prefix="/api/v1")
app.include_router(service_reviews_router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(home.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(studio.router, prefix="/api/v1")


@app.on_event("startup")
def create_studio_table():
    from app.database import engine
    from app.models.studio import StudioSettings
    StudioSettings.__table__.create(bind=engine, checkfirst=True)
