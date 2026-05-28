"""Run once: python seed_data.py"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models.service import Service, ServiceCategory

db = SessionLocal()

try:
    if db.query(ServiceCategory).count() > 0:
        print("Data already seeded. Skipping.")
        sys.exit(0)

    categories = [
        ServiceCategory(name="Exterior", icon_name="car-sport", display_order=1),
        ServiceCategory(name="Interior", icon_name="sparkles", display_order=2),
        ServiceCategory(name="Full Detail", icon_name="shield-checkmark", display_order=3),
        ServiceCategory(name="Paint Protection", icon_name="color-palette", display_order=4),
        ServiceCategory(name="Add-ons", icon_name="add-circle", display_order=5),
    ]
    db.add_all(categories)
    db.flush()

    cat = {c.name: c.id for c in categories}

    services = [
        Service(name="Express Wash", tagline="Quick refresh in 30 mins",
            description="Quick exterior hand wash, dry, and tyre shine.", price=499,
            duration_minutes=30, category_id=cat["Exterior"], is_active=True, is_featured=True, display_order=1),
        Service(name="Premium Exterior Detail", tagline="Showroom finish",
            description="Full exterior hand wash, clay bar, polish, and wax protection.", price=1499,
            duration_minutes=90, category_id=cat["Exterior"], is_active=True, is_featured=True, display_order=2),
        Service(name="Interior Deep Clean", tagline="Fresh inside out",
            description="Full vacuum, steam clean, dashboard conditioning, and glass cleaning.", price=1299,
            duration_minutes=120, category_id=cat["Interior"], is_active=True, is_featured=False, display_order=3),
        Service(name="Leather Conditioning", tagline="Protect your seats",
            description="Professional leather cleaning, conditioning, and protection.", price=999,
            duration_minutes=60, category_id=cat["Interior"], is_active=True, is_featured=False, display_order=4),
        Service(name="Gold Package", tagline="Best value — interior + exterior",
            description="Complete interior deep clean + premium exterior detail.", price=2499,
            duration_minutes=180, category_id=cat["Full Detail"], is_active=True, is_featured=True, display_order=5),
        Service(name="Platinum Package", tagline="Ultimate detailing experience",
            description="Gold Package + paint correction + ceramic coating application.", price=4999,
            duration_minutes=300, category_id=cat["Full Detail"], is_active=True, is_featured=True, display_order=6),
        Service(name="Ceramic Coating", tagline="1 year protection",
            description="Professional 1-year ceramic coating with full decontamination prep.", price=7999,
            duration_minutes=480, category_id=cat["Paint Protection"], is_active=True, is_featured=True, display_order=7),
        Service(name="Paint Correction", tagline="Remove swirls and scratches",
            description="Single-stage machine polish to remove swirl marks and light scratches.", price=3499,
            duration_minutes=240, category_id=cat["Paint Protection"], is_active=True, is_featured=False, display_order=8),
        Service(name="Headlight Restoration", tagline="See clearly again",
            description="Restore cloudy headlights to like-new clarity with UV protection.", price=599,
            duration_minutes=45, category_id=cat["Add-ons"], is_active=True, is_featured=False, display_order=9),
        Service(name="Engine Bay Cleaning", tagline="Clean under the hood",
            description="Professional engine bay degreasing and detailing.", price=799,
            duration_minutes=60, category_id=cat["Add-ons"], is_active=True, is_featured=False, display_order=10),
    ]
    db.add_all(services)
    db.commit()
    print(f"Seeded {len(categories)} categories and {len(services)} services.")

except Exception as e:
    db.rollback()
    print(f"Error: {e}")
    raise
finally:
    db.close()
