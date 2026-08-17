import random
from datetime import date, timedelta
from decimal import Decimal
from typing import List, Dict

SERVICES = [
    "Compute Services",
    "Storage Services",
    "Database Services",
    "Network & CDN",
    "API & Gateways",
    "Other Cloud Services"
]

BASE_SPEND = {
    "Compute Services": (45.0, 65.0),
    "Storage Services": (18.0, 24.0),
    "Database Services": (30.0, 42.0),
    "Network & CDN": (12.0, 18.0),
    "API & Gateways": (8.0, 14.0),
    "Other Cloud Services": (5.0, 10.0)
}

def generate_demo_costs(days: int = 30, generate_spike: bool = True) -> List[dict]:
    """Generates 30+ days of realistic daily cloud cost records with a controllable high-cost spike anomaly."""
    today = date.today()
    records = []
    
    # Deterministic seed for reproducible baseline
    random.seed(42)

    for i in range(days, 0, -1):
        record_date = (today - timedelta(days=i)).isoformat()
        
        for service in SERVICES:
            low, high = BASE_SPEND[service]
            amount = round(random.uniform(low, high), 2)
            
            # Inject a realistic high-cost anomaly on the recent date for Compute Services
            if generate_spike and i == 1 and service == "Compute Services":
                amount = 185.40

            records.append({
                "date": record_date,
                "service": service,
                "amount": float(amount),
                "currency": "USD"
            })

    return records

def collect_costs(role_arn: str = "", external_id: str = "", days: int = 30) -> List[dict]:
    """Cloud-independent cost data provider returning realistic demo cloud metrics."""
    return generate_demo_costs(days=days, generate_spike=True)
