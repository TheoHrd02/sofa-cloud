"""
SOFA-CLOUD — Pricing Engine ⭐
Moteur de calcul de prix fournisseur → Shopify.

Formule : Shopify_TTC = round((Supplier_Price × multiplier) + fees, 2) × (1 + vat_rate)
"""

from decimal import Decimal, ROUND_HALF_UP
from dataclasses import dataclass


@dataclass
class PricingResult:
    """Résultat complet du calcul pour un produit."""
    supplier_price: Decimal
    price_ht: Decimal
    price_ttc: Decimal
    compare_at_price_ht: Decimal
    compare_at_price_ttc: Decimal
    margin_euros: Decimal
    margin_pct: float

    def to_dict(self) -> dict:
        return {
            "supplier_price": float(self.supplier_price),
            "price_ht": float(self.price_ht),
            "price_ttc": float(self.price_ttc),
            "compare_at_price_ht": float(self.compare_at_price_ht),
            "compare_at_price_ttc": float(self.compare_at_price_ttc),
            "margin_euros": float(self.margin_euros),
            "margin_pct": round(self.margin_pct, 1),
        }


class PricingEngine:
    """
    Moteur de calcul de prix Sofa-Cloud.

    Paramètres par défaut (surchargeable par theme.config.json pour multi-tenant) :
        multiplier              : 2.5   → coefficient marge (Supplier × 2.5)
        fees                    : 150.0 → frais fixes HT (livraison premium, assurance)
        vat_rate                : 0.20  → TVA française 20%
        compare_at_multiplier   : 3.2   → prix barré (pseudo prix avant remise)

    Exemple (canapé à 620 € fournisseur) :
        620 × 2.5 = 1550
        1550 + 150 = 1700 € HT
        1700 × 1.20 = 2040 € TTC  ← shopify price
        Prix barré : 620 × 3.2 = 1984 → 1984 + 150 = 2134 HT → 2560.80 TTC
        Marge brute : 1700 - 620 = 1080 € HT (63.5%)
    """

    def __init__(
        self,
        multiplier: float = 2.5,
        fees: float = 150.0,
        vat_rate: float = 0.20,
        compare_at_multiplier: float = 3.2,
    ):
        self.multiplier = Decimal(str(multiplier))
        self.fees = Decimal(str(fees))
        self.vat_rate = Decimal(str(vat_rate))
        self.compare_at_multiplier = Decimal(str(compare_at_multiplier))

    def calculate(self, supplier_price: float | Decimal) -> PricingResult:
        """
        Calcule tous les prix pour un produit donné.

        Args:
            supplier_price: Prix brut HT fournisseur en euros.

        Returns:
            PricingResult avec tous les champs calculés.
        """
        cost = Decimal(str(supplier_price))

        # ── Prix HT Sofa-Cloud ────────────────────────────────────
        price_ht = (cost * self.multiplier + self.fees).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        # ── Prix TTC (Shopify price) ──────────────────────────────
        price_ttc = (price_ht * (1 + self.vat_rate)).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        # ── Prix barré HT ─────────────────────────────────────────
        compare_at_ht = (cost * self.compare_at_multiplier + self.fees).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        # ── Prix barré TTC ────────────────────────────────────────
        compare_at_ttc = (compare_at_ht * (1 + self.vat_rate)).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        # ── Marge brute HT ────────────────────────────────────────
        margin_euros = price_ht - cost
        margin_pct = float((margin_euros / price_ht) * 100)

        return PricingResult(
            supplier_price=cost,
            price_ht=price_ht,
            price_ttc=price_ttc,
            compare_at_price_ht=compare_at_ht,
            compare_at_price_ttc=compare_at_ttc,
            margin_euros=margin_euros,
            margin_pct=margin_pct,
        )

    def calculate_variant(
        self,
        supplier_price: float | Decimal,
        size_multiplier: float = 1.0,
    ) -> PricingResult:
        """
        Calcule le prix d'une variante (ex: 4 places = +15% vs 3 places).

        Args:
            supplier_price: Prix de base fournisseur.
            size_multiplier: Facteur taille (1.0 = 3 places, 0.85 = 2 places, 1.15 = 4 places).
        """
        adjusted_price = Decimal(str(supplier_price)) * Decimal(str(size_multiplier))
        return self.calculate(adjusted_price)
