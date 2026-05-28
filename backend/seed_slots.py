"""Run once: python seed_slots.py
Generates time slots for the next 30 days (9am–6pm, every hour, Mon–Sat).
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import date, timedelta, time
from app.database import SessionLocal
from app.models.booking import TimeSlot

db = SessionLocal()

try:
    today = date.today()
    slot_times = [
        (time(9, 0),  time(10, 0)),
        (time(10, 0), time(11, 0)),
        (time(11, 0), time(12, 0)),
        (time(13, 0), time(14, 0)),
        (time(14, 0), time(15, 0)),
        (time(15, 0), time(16, 0)),
        (time(16, 0), time(17, 0)),
        (time(17, 0), time(18, 0)),
    ]

    created = 0
    for day_offset in range(30):
        d = today + timedelta(days=day_offset)
        if d.weekday() == 6:  # Skip Sunday
            continue
        for start, end in slot_times:
            exists = db.query(TimeSlot).filter(
                TimeSlot.date == d,
                TimeSlot.start_time == start,
            ).first()
            if not exists:
                db.add(TimeSlot(
                    date=d,
                    start_time=start,
                    end_time=end,
                    capacity=3,
                    booked_count=0,
                    is_blocked=False,
                ))
                created += 1

    db.commit()
    print(f"Created {created} slots across 30 days (Mon–Sat, 9am–6pm, capacity 3 each).")

except Exception as e:
    db.rollback()
    print(f"Error: {e}")
    raise
finally:
    db.close()
