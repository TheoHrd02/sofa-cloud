"""
SOFA-CLOUD — Delivery Estimate Endpoint
GET /api/v1/delivery/estimate
Calcul dynamique des délais de livraison par produit.
"""

from fastapi import APIRouter, Query, HTTPException
from datetime import datetime, timedelta
from data.mock_products import MOCK_PRODUCTS, VARIANT_SIZES

router = APIRouter()

# Délais base en jours ouvrés selon niveau de stock
DELIVERY_CONFIG = {
    "high_stock": {"min": 14, "max": 21, "threshold": 8},   # > 8 unités
    "mid_stock":  {"min": 21, "max": 28, "threshold": 3},   # 3-8 unités
    "low_stock":  {"min": 28, "max": 42, "threshold": 0},   # < 3 unités
}

CARRIERS = {
    "premium": "DHL Express Premium",
    "standard": "Chronopost Mobilier",
}


def add_working_days(start: datetime, days: int) -> datetime:
    """Ajoute N jours ouvrés (lun-ven) à une date."""
    count = 0
    current = start
    while count < days:
        current += timedelta(days=1)
        if current.weekday() < 5:  # Lun=0 ... Ven=4
            count += 1
    return current


def format_date_fr(dt: datetime) -> str:
    """Formate une date en français : 'vendredi 7 mars 2025'"""
    jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
    mois = ["janvier", "février", "mars", "avril", "mai", "juin",
            "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
    return f"{jours[dt.weekday()]} {dt.day} {mois[dt.month - 1]}"


@router.get("/estimate", summary="Estimation délai de livraison")
async def delivery_estimate(
    product_handle: str = Query(..., description="Handle du produit (ex: le-montaigne)"),
    size: str = Query(default="3 Places", description="Taille sélectionnée"),
    zip_code: str = Query(default="75001", description="Code postal destinataire"),
):
    """
    Retourne les délais de livraison estimés pour un produit.
    Prend en compte le stock disponible pour la taille sélectionnée.
    """
    # Trouver le produit mock
    product = next((p for p in MOCK_PRODUCTS if p["handle"] == product_handle), None)
    if not product:
        raise HTTPException(status_code=404, detail=f"Produit '{product_handle}' introuvable.")

    # Stock pour la taille demandée
    size_data = next((s for s in VARIANT_SIZES if s["option"] == size), VARIANT_SIZES[1])
    stock = size_data["stock"]

    # Calcul délai selon stock
    today = datetime.utcnow()
    if stock >= DELIVERY_CONFIG["high_stock"]["threshold"]:
        cfg = DELIVERY_CONFIG["high_stock"]
        carrier = CARRIERS["premium"]
    elif stock >= DELIVERY_CONFIG["mid_stock"]["threshold"]:
        cfg = DELIVERY_CONFIG["mid_stock"]
        carrier = CARRIERS["standard"]
    else:
        cfg = DELIVERY_CONFIG["low_stock"]
        carrier = CARRIERS["standard"]

    delivery_min = add_working_days(today, cfg["min"])
    delivery_max = add_working_days(today, cfg["max"])

    # Prix livraison (offerte si prix > 1500 €)
    is_free = True  # Tous nos produits > 1500 €

    return {
        "product_handle": product_handle,
        "product_title": product["title"],
        "size": size,
        "zip_code": zip_code,
        "stock_level": stock,
        "carrier": carrier,
        "min_days": cfg["min"],
        "max_days": cfg["max"],
        "delivery_min_date": delivery_min.isoformat(),
        "delivery_max_date": delivery_max.isoformat(),
        "label_min": format_date_fr(delivery_min),
        "label_max": format_date_fr(delivery_max),
        "label": f"Livré entre le {format_date_fr(delivery_min)} et le {format_date_fr(delivery_max)}",
        "free_delivery": is_free,
        "installation_included": True,
        "assembly_included": True,
    }
