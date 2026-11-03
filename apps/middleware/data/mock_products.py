"""
SOFA-CLOUD — Mock Data : 10 Canapés Haut de Gamme
Utilisé comme seed data pour le développement et les tests.
Chaque produit a 3 variantes (2/3/4 places) avec SKU, poids et stock.
"""

from decimal import Decimal

# ─── Constantes de variantes ──────────────────────────────────────────────────
VARIANT_SIZES = [
    {"option": "2 Places", "size_multiplier": 0.85, "weight_kg": 52.0, "stock": 8},
    {"option": "3 Places", "size_multiplier": 1.00, "weight_kg": 68.0, "stock": 12},
    {"option": "4 Places", "size_multiplier": 1.18, "weight_kg": 84.0, "stock": 5},
]

# ─── Catalogue Mock ───────────────────────────────────────────────────────────
MOCK_PRODUCTS = [
    {
        "supplier_ref": "SUP-001-MONTAIGNE",
        "title": "Le Montaigne",
        "handle": "le-montaigne",
        "supplier_price": Decimal("620.00"),
        "material": "Velours côtelé charbon",
        "style": "Contemporain",
        "color_family": "Gris anthracite",
        "tags": ["velours", "contemporain", "gris", "bestseller"],
        "body_html": """
        <p><strong>Le Montaigne</strong> incarne l'élégance contemporaine à son apogée.
        Son velours côtelé charbon profond absorbe la lumière pour un effet visuel saisissant.
        La structure en hêtre massif garantit une longévité exceptionnelle, tandis que
        les coussins en plume d'oie vous enveloppent dans un confort absolu.</p>
        <ul>
            <li>Revêtement : Velours côtelé 100% polyester (résistant aux taches)</li>
            <li>Structure : Hêtre massif + lattes de suspension</li>
            <li>Garnissage : Mousse haute résilience 35 kg/m³ + plume d'oie</li>
            <li>Pieds : Chêne huilé naturel</li>
            <li>Entretien : Nettoyage à sec recommandé</li>
        </ul>""",
        "image_placeholder": "https://res.cloudinary.com/sofa-cloud/image/upload/v1/products/montaigne",
    },
    {
        "supplier_ref": "SUP-002-EDINBURGH",
        "title": "L'Édimbourg",
        "handle": "l-edimbourg",
        "supplier_price": Decimal("780.00"),
        "material": "Cuir pleine fleur cognac",
        "style": "Chesterfield",
        "color_family": "Cognac",
        "tags": ["cuir", "chesterfield", "cognac", "premium", "capitonné"],
        "body_html": """
        <p><strong>L'Édimbourg</strong> rend hommage au légendaire canapé Chesterfield
        avec une interprétation moderne et luxueuse. Son cuir pleine fleur cognac,
        tanné végétalement, développe une patine unique au fil du temps.</p>
        <ul>
            <li>Revêtement : Cuir pleine fleur tannage végétal, épaisseur 1.8mm</li>
            <li>Capitonnage : Main réalisé à la main, 72 boutons par assise</li>
            <li>Structure : Châssis acier renforcé + sangles élastiques 8 voies</li>
            <li>Pieds : Laiton vieilli massif</li>
            <li>Entretien : Crème nourrissante cuir incluse</li>
        </ul>""",
        "image_placeholder": "https://res.cloudinary.com/sofa-cloud/image/upload/v1/products/edimbourg",
    },
    {
        "supplier_ref": "SUP-003-SERENITE",
        "title": "La Sérénité",
        "handle": "la-serenite",
        "supplier_price": Decimal("450.00"),
        "material": "Lin stonewashed naturel",
        "style": "Minimaliste",
        "color_family": "Naturel",
        "tags": ["lin", "minimaliste", "naturel", "écologique", "slow-living"],
        "body_html": """
        <p><strong>La Sérénité</strong> est une ode au minimalisme conscient.
        Son lin stonewashed naturel, issu de culture biologique française,
        apporte une texture vivante et authentique à chaque intérieur épuré.</p>
        <ul>
            <li>Revêtement : Lin biologique OEKO-TEX® stonewashed</li>
            <li>Structure : Pin sylvestre certifié FSC</li>
            <li>Garnissage : Mousse biosourcée + ouate recyclée</li>
            <li>Pieds : Acier thermolaqué noir mat</li>
            <li>Entretien : Lavage en machine 30°C (housse amovible)</li>
        </ul>""",
        "image_placeholder": "https://res.cloudinary.com/sofa-cloud/image/upload/v1/products/serenite",
    },
    {
        "supplier_ref": "SUP-004-PALERMO",
        "title": "Le Palermo",
        "handle": "le-palermo",
        "supplier_price": Decimal("390.00"),
        "material": "Tissu outdoor traité ivoire",
        "style": "Méridional",
        "color_family": "Ivoire",
        "tags": ["outdoor", "ivoire", "méditerranéen", "résistant", "soleil"],
        "body_html": """
        <p><strong>Le Palermo</strong> capture l'art de vivre méditerranéen.
        Son tissu outdoor haute performance Teflon® résiste aux UV, à l'humidité
        et aux taches pour un usage intérieur comme extérieur.</p>
        <ul>
            <li>Revêtement : Tissu Teflon® outdoor, résistance UV indice 50+</li>
            <li>Structure : Aluminium traité époxy anti-corrosion</li>
            <li>Garnissage : Mousse éco-certifiée + fibre de polyester</li>
            <li>Pieds : Teck certifié FSC</li>
            <li>Entretien : Nettoyage à l'eau savonneuse, séchage rapide</li>
        </ul>""",
        "image_placeholder": "https://res.cloudinary.com/sofa-cloud/image/upload/v1/products/palermo",
    },
    {
        "supplier_ref": "SUP-005-ARCADIA",
        "title": "L'Arcadia",
        "handle": "l-arcadia",
        "supplier_price": Decimal("520.00"),
        "material": "Boucle crème",
        "style": "Scandinave",
        "color_family": "Crème",
        "tags": ["boucle", "scandinave", "crème", "nordique", "tendance"],
        "body_html": """
        <p><strong>L'Arcadia</strong> sublime l'esthétique scandinave avec sa boucle
        crème texturée, matière emblématique des intérieurs nordiques contemporains.
        Ses pieds effilés en bois de frêne créent une légèreté visuelle incomparable.</p>
        <ul>
            <li>Revêtement : Boucle laine-polyester (60/40), OEKO-TEX®</li>
            <li>Structure : Contreplaqué bouleau + ressorts ensachés</li>
            <li>Garnissage : Mousse HR 40 kg/m³ + duvet synthétique</li>
            <li>Pieds : Frêne massif vernis naturel</li>
            <li>Entretien : Aspiration douce, taches : essorage léger</li>
        </ul>""",
        "image_placeholder": "https://res.cloudinary.com/sofa-cloud/image/upload/v1/products/arcadia",
    },
    {
        "supplier_ref": "SUP-006-RIVIERA",
        "title": "Le Riviera",
        "handle": "le-riviera",
        "supplier_price": Decimal("850.00"),
        "material": "Velours émeraude reflets dorés",
        "style": "Art Déco",
        "color_family": "Émeraude",
        "tags": ["velours", "art-deco", "émeraude", "or", "statement", "luxe"],
        "body_html": """
        <p><strong>Le Riviera</strong> est une déclaration de style absolue.
        Son velours émeraude aux reflets irisés dorés capte la lumière pour
        transformer chaque salon en scène cinématographique.</p>
        <ul>
            <li>Revêtement : Velours de soie mélangée, 520 g/m² (reflets or)</li>
            <li>Structure : Ossature acier + assise en ressorts biconiques</li>
            <li>Garnissage : Plume blanche calibrée + mousse mémoire de forme</li>
            <li>Pieds : Or brossé 24 carats</li>
            <li>Personnalisation : Broderie monogramme disponible (+45 jours)</li>
        </ul>""",
        "image_placeholder": "https://res.cloudinary.com/sofa-cloud/image/upload/v1/products/riviera",
    },
    {
        "supplier_ref": "SUP-007-BASTIDE",
        "title": "La Bastide",
        "handle": "la-bastide",
        "supplier_price": Decimal("410.00"),
        "material": "Coton lavé ocre",
        "style": "Provençal moderne",
        "color_family": "Ocre",
        "tags": ["coton", "provençal", "ocre", "chaleureux", "familial"],
        "body_html": """
        <p><strong>La Bastide</strong> évoque la douceur des mas provençaux.
        Son coton lavé ocre soleil, aux teintes chaudes et authentiques,
        crée une atmosphère chaleureuse et accueillante dès le premier regard.</p>
        <ul>
            <li>Revêtement : Coton lavé 100%, effet stonewashed, non-délavant</li>
            <li>Structure : Hêtre massif massif + ressorts sinusoïdaux</li>
            <li>Garnissage : Mousse polyuréthane 32 kg/m³ densité confort</li>
            <li>Pieds : Fer forgé peint ivoire</li>
            <li>Entretien : Housse lavable 40°C (déhoussable intégralement)</li>
        </ul>""",
        "image_placeholder": "https://res.cloudinary.com/sofa-cloud/image/upload/v1/products/bastide",
    },
    {
        "supplier_ref": "SUP-008-NEUILLY",
        "title": "Le Neuilly",
        "handle": "le-neuilly",
        "supplier_price": Decimal("920.00"),
        "material": "Soie mélangée champagne",
        "style": "Classique parisien",
        "color_family": "Champagne",
        "tags": ["soie", "classique", "champagne", "parisien", "haute-couture", "exclusif"],
        "body_html": """
        <p><strong>Le Neuilly</strong> représente le summum du savoir-faire artisanal français.
        Sa soie mélangée champagne, tissée en Île-de-France, lui confère une luminosité
        et une douceur sans équivalent dans l'univers du mobilier de luxe.</p>
        <ul>
            <li>Revêtement : Soie naturelle (40%) mélangée viscose, tissage jacquard</li>
            <li>Structure : Châssis bois exotique séché 3 ans + ressorts boudins</li>
            <li>Garnissage : Duvet d'oie blanchi + mousse latex naturel</li>
            <li>Pieds : Bronze patiné, fonte à la main</li>
            <li>Garantie : 10 ans structure, 5 ans garniture</li>
        </ul>""",
        "image_placeholder": "https://res.cloudinary.com/sofa-cloud/image/upload/v1/products/neuilly",
    },
    {
        "supplier_ref": "SUP-009-ATELIER",
        "title": "L'Atelier",
        "handle": "l-atelier",
        "supplier_price": Decimal("480.00"),
        "material": "Microfibre ardoise texturée",
        "style": "Industriel",
        "color_family": "Ardoise",
        "tags": ["microfibre", "industriel", "ardoise", "urbain", "loft"],
        "body_html": """
        <p><strong>L'Atelier</strong> capture l'esprit des grands lofts industriels.
        Sa microfibre ardoise texturée imite le grain du béton ciré pour un rendu
        authentiquement urbain, sans compromis sur le confort.</p>
        <ul>
            <li>Revêtement : Microfibre 320 g/m², effet béton, anti-peluche</li>
            <li>Structure : Acier tubulaire noir mat, soudure certifiée ISO</li>
            <li>Garnissage : Mousse haute densité 45 kg/m³ (assise ferme)</li>
            <li>Pieds : Acier brut brossé avec protection antirouille</li>
            <li>Entretien : Nettoyage humide, séchage instantané</li>
        </ul>""",
        "image_placeholder": "https://res.cloudinary.com/sofa-cloud/image/upload/v1/products/atelier",
    },
    {
        "supplier_ref": "SUP-010-CAPRI",
        "title": "Le Capri",
        "handle": "le-capri",
        "supplier_price": Decimal("730.00"),
        "material": "Bouclé blanc cassé premium",
        "style": "Island Luxe",
        "color_family": "Blanc cassé",
        "tags": ["boucle", "blanc", "island-luxe", "resort", "détente", "statement"],
        "body_html": """
        <p><strong>Le Capri</strong> transpose l'art de vivre des îles méditerranéennes
        dans votre intérieur. Sa bouclé blanc cassé premium, aux textures organiques,
        évoque les voiles gonflées par la brise marine.</p>
        <ul>
            <li>Revêtement : Bouclé laine mérinos (70%) cachemire (30%), certifié RWS</li>
            <li>Structure : Bois de teck recyclé + cerclage acier inox</li>
            <li>Garnissage : Latex naturel certifié Rainforest Alliance</li>
            <li>Pieds : Rotin naturel laqué blanc</li>
            <li>Coussin lombaire : Inclus, rembourrage plume</li>
        </ul>""",
        "image_placeholder": "https://res.cloudinary.com/sofa-cloud/image/upload/v1/products/capri",
    },
]
