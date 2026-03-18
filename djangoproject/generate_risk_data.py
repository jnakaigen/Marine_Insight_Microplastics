import random
import csv

rows = []

for _ in range(600):
    total = random.randint(5, 120)

    fiber = random.uniform(0.2, 0.9)
    pellet = random.uniform(0.0, 0.3)
    fragment = random.uniform(0.0, 0.6)
    film = random.uniform(0.0, 0.3)

    s = fiber + pellet + fragment + film
    fiber, pellet, fragment, film = fiber/s, pellet/s, fragment/s, film/s

    avg_area = random.uniform(50, 1800)
    min_area = random.uniform(10, avg_area)

    risk_score = (
        fiber * 40 +
        (1 - min(avg_area / 1800, 1)) * 30 +
        min(total / 120, 1) * 20 +
        pellet * 10
    )

    rows.append({
        "total_count": total,
        "fiber_ratio": round(fiber, 3),
        "pellet_ratio": round(pellet, 3),
        "fragment_ratio": round(fragment, 3),
        "film_ratio": round(film, 3),
        "avg_area": round(avg_area, 2),
        "min_area": round(min_area, 2),
        "risk_score": round(min(100, risk_score), 2)
    })

with open("risk_training_data.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)

print("✅ risk_training_data.csv created")
