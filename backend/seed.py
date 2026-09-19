import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import async_session, init_db
from models.user import User
from models.product import Product
from models.category import Category

CATEGORIES = [
    {"name": "Electronics", "slug": "electronics", "description": "Gadgets, devices, and tech accessories", "image_url": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400"},
    {"name": "Clothing", "slug": "clothing", "description": "Fashion and apparel for all", "image_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400"},
    {"name": "Home & Kitchen", "slug": "home-kitchen", "description": "Furnishings and kitchen essentials", "image_url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"},
    {"name": "Sports & Outdoors", "slug": "sports-outdoors", "description": "Gear for sports and outdoor adventures", "image_url": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400"},
    {"name": "Books & Media", "slug": "books-media", "description": "Books, music, and entertainment", "image_url": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400"},
]

PRODUCTS = [
    {"name": "Wireless Noise-Cancelling Headphones", "description": "Premium over-ear headphones with active noise cancellation. 30-hour battery life, comfortable memory foam ear cups, and crystal-clear audio.", "price": 249.99, "compare_price": 349.99, "category": "Electronics", "brand": "AudioMax", "stock": 45, "sku": "ELEC-001", "is_featured": True, "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600", "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"]},
    {"name": "Ultra-Slim Laptop Stand", "description": "Ergonomic aluminum laptop stand with adjustable height. Foldable design, anti-slip pads, and improved airflow for your laptop.", "price": 49.99, "category": "Electronics", "brand": "TechFlow", "stock": 120, "sku": "ELEC-002", "is_featured": True, "image_url": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600", "images": ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600"]},
    {"name": "Smart Fitness Watch Pro", "description": "Advanced fitness tracker with GPS, heart rate monitor, sleep tracking, and 7-day battery life. Water-resistant to 50m.", "price": 199.99, "compare_price": 249.99, "category": "Electronics", "brand": "FitTech", "stock": 65, "sku": "ELEC-003", "is_featured": True, "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600", "images": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"]},
    {"name": "Portable Bluetooth Speaker", "description": "Compact waterproof speaker with 360-degree sound. 12-hour battery, Bluetooth 5.0, and built-in microphone.", "price": 79.99, "category": "Electronics", "brand": "SoundWave", "stock": 80, "sku": "ELEC-004", "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600", "images": ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600"]},
    {"name": "Premium Cotton T-Shirt", "description": "100% organic cotton classic fit t-shirt. Pre-shrunk, reinforced stitching, available in multiple colors.", "price": 34.99, "category": "Clothing", "brand": "UrbanThread", "stock": 200, "sku": "CLTH-001", "is_featured": True, "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600", "images": ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600"]},
    {"name": "Slim Fit Denim Jeans", "description": "Modern slim fit jeans with stretch fabric for comfort. Classic five-pocket design, premium denim.", "price": 89.99, "compare_price": 120.00, "category": "Clothing", "brand": "DenimCraft", "stock": 90, "sku": "CLTH-002", "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600", "images": ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"]},
    {"name": "Waterproof Running Jacket", "description": "Lightweight waterproof jacket with breathable membrane. Reflective details, adjustable hood, and zippered pockets.", "price": 129.99, "category": "Clothing", "brand": "ActivePeak", "stock": 55, "sku": "CLTH-003", "is_featured": True, "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600", "images": ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"]},
    {"name": "Merino Wool Hoodie", "description": "Ultra-soft merino wool blend hoodie. Temperature regulating, moisture-wicking, and naturally odor-resistant.", "price": 119.99, "category": "Clothing", "brand": "WoolCraft", "stock": 40, "sku": "CLTH-004", "image_url": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600", "images": ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600"]},
    {"name": "Stainless Steel Cookware Set", "description": "10-piece professional cookware set. Induction compatible, oven safe to 500F, dishwasher safe.", "price": 299.99, "compare_price": 399.99, "category": "Home & Kitchen", "brand": "ChefElite", "stock": 30, "sku": "HOME-001", "is_featured": True, "image_url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600", "images": ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600"]},
    {"name": "Memory Foam Pillow", "description": "Contour memory foam pillow with cooling gel layer. Hypoallergenic cover, adjustable loft, and neck support.", "price": 59.99, "category": "Home & Kitchen", "brand": "SleepWell", "stock": 150, "sku": "HOME-002", "image_url": "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600", "images": ["https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600"]},
    {"name": "Ceramic Plant Pot Set", "description": "Set of 3 minimalist ceramic plant pots with drainage holes. Matte finish, modern design.", "price": 44.99, "category": "Home & Kitchen", "brand": "GreenThumb", "stock": 75, "sku": "HOME-003", "image_url": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600", "images": ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600"]},
    {"name": "Bamboo Cutting Board", "description": "Large bamboo cutting board with juice groove. Antibacterial, knife-friendly surface, easy to clean.", "price": 29.99, "category": "Home & Kitchen", "brand": "EcoKitchen", "stock": 100, "sku": "HOME-004", "image_url": "https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=600", "images": ["https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=600"]},
    {"name": "Carbon Fiber Tennis Racket", "description": "Professional grade carbon fiber tennis racket. Lightweight, vibration dampening, and powerful sweet spot.", "price": 189.99, "compare_price": 229.99, "category": "Sports & Outdoors", "brand": "ProSport", "stock": 35, "sku": "SPRT-001", "is_featured": True, "image_url": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600", "images": ["https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600"]},
    {"name": "Yoga Mat Premium", "description": "Extra thick non-slip yoga mat. Eco-friendly TPE material, alignment lines, and carrying strap included.", "price": 69.99, "category": "Sports & Outdoors", "brand": "ZenFlow", "stock": 85, "sku": "SPRT-002", "image_url": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600", "images": ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600"]},
    {"name": "Hiking Backpack 40L", "description": "Durable 40L hiking backpack with rain cover. Multiple compartments, hydration compatible, and padded hip belt.", "price": 139.99, "category": "Sports & Outdoors", "brand": "TrailMaster", "stock": 45, "sku": "SPRT-003", "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600", "images": ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"]},
    {"name": "Insulated Water Bottle", "description": "Double-wall vacuum insulated water bottle. Keeps drinks cold 24h or hot 12h. BPA-free, leak-proof.", "price": 34.99, "category": "Sports & Outdoors", "brand": "HydroKeep", "stock": 200, "sku": "SPRT-004", "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600", "images": ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600"]},
    {"name": "The Art of Programming", "description": "A comprehensive guide to modern software engineering. From fundamentals to advanced patterns.", "price": 44.99, "category": "Books & Media", "brand": "TechPress", "stock": 60, "sku": "BOOK-001", "image_url": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600", "images": ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600"]},
    {"name": "Vinyl Record Player", "description": "Modern turntable with built-in speakers. Bluetooth output, USB recording, and adjustable speed.", "price": 159.99, "compare_price": 199.99, "category": "Books & Media", "brand": "RetroSound", "stock": 25, "sku": "BOOK-002", "is_featured": True, "image_url": "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=600", "images": ["https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=600"]},
    {"name": "LED Desk Lamp", "description": "Adjustable LED desk lamp with 5 color temperatures and 10 brightness levels. USB charging port and timer.", "price": 54.99, "category": "Electronics", "brand": "LightPro", "stock": 95, "sku": "ELEC-005", "image_url": "https://images.unsplash.com/photo-1534073737927-85f1ebff1f5d?w=600", "images": ["https://images.unsplash.com/photo-1534073737927-85f1ebff1f5d?w=600"]},
    {"name": "Canvas Backpack", "description": "Vintage canvas and leather backpack. Multiple pockets, padded laptop sleeve, and adjustable straps.", "price": 79.99, "category": "Clothing", "brand": "HeritageCo", "stock": 70, "sku": "CLTH-005", "image_url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600", "images": ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600"]},
    {"name": "Wireless Mechanical Keyboard", "description": "Compact 75% wireless mechanical keyboard with RGB backlight. Hot-swappable switches, USB-C and Bluetooth connectivity.", "price": 89.99, "compare_price": 119.99, "category": "Electronics", "brand": "KeyCraft", "stock": 60, "sku": "ELEC-006", "is_featured": True, "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600", "images": ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600"]},
    {"name": "USB-C Hub Adapter", "description": "7-in-1 USB-C hub with HDMI 4K, USB 3.0 ports, SD card reader, and 100W power delivery passthrough.", "price": 39.99, "category": "Electronics", "brand": "TechFlow", "stock": 150, "sku": "ELEC-007", "image_url": "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600", "images": ["https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600"]},
    {"name": "Webcam HD Pro", "description": "1080p HD webcam with auto-focus, noise-cancelling microphone, and built-in ring light. Plug and play USB.", "price": 69.99, "category": "Electronics", "brand": "ClearView", "stock": 85, "sku": "ELEC-008", "image_url": "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600", "images": ["https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600"]},
    {"name": "Running Shoes Ultra", "description": "Lightweight responsive running shoes with carbon plate. Breathable mesh upper, energy-return foam midsole.", "price": 149.99, "compare_price": 189.99, "category": "Sports & Outdoors", "brand": "SpeedStep", "stock": 70, "sku": "SPRT-005", "is_featured": True, "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600", "images": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"]},
    {"name": "Camping Tent 2-Person", "description": "Ultralight 2-person dome tent. Waterproof 3000mm rating, quick setup in 5 minutes, includes carry bag.", "price": 179.99, "category": "Sports & Outdoors", "brand": "TrailMaster", "stock": 30, "sku": "SPRT-006", "image_url": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600", "images": ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600"]},
    {"name": "Resistance Bands Set", "description": "Set of 5 fabric resistance bands with different tension levels. Non-slip, latex-free, includes carrying pouch.", "price": 24.99, "category": "Sports & Outdoors", "brand": "ZenFlow", "stock": 200, "sku": "SPRT-007", "image_url": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600", "images": ["https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600"]},
    {"name": "Stainless Steel Water Bottle", "description": "32oz insulated stainless steel water bottle. Triple-wall vacuum insulation, keeps cold 36h or hot 18h.", "price": 29.99, "category": "Sports & Outdoors", "brand": "HydroKeep", "stock": 180, "sku": "SPRT-008", "image_url": "https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=600", "images": ["https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=600"]},
    {"name": "Non-Stick Frying Pan", "description": "12-inch ceramic non-stick frying pan. PFOA-free, induction compatible, cool-touch ergonomic handle.", "price": 34.99, "category": "Home & Kitchen", "brand": "ChefElite", "stock": 110, "sku": "HOME-005", "image_url": "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600", "images": ["https://images.unsplash.com/photo-1585515320310-259814833e62?w=600"]},
    {"name": "Aromatherapy Diffuser", "description": "500ml ultrasonic essential oil diffuser. 7 LED color options, timer settings, auto shut-off, whisper-quiet.", "price": 39.99, "compare_price": 54.99, "category": "Home & Kitchen", "brand": "ZenFlow", "stock": 95, "sku": "HOME-006", "image_url": "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600", "images": ["https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600"]},
    {"name": "Robot Vacuum Cleaner", "description": "Smart robot vacuum with LiDAR navigation. 200-minute runtime, app control, auto-empty dock, works on all floors.", "price": 299.99, "compare_price": 399.99, "category": "Home & Kitchen", "brand": "CleanBot", "stock": 25, "sku": "HOME-007", "is_featured": True, "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600", "images": ["https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600"]},
    {"name": "Linen Bed Sheet Set", "description": "100% French linen bed sheet set. Pre-washed softness, breathable, fits mattresses up to 16 inches deep.", "price": 129.99, "compare_price": 169.99, "category": "Home & Kitchen", "brand": "SleepWell", "stock": 45, "sku": "HOME-008", "image_url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600", "images": ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600"]},
    {"name": "Wool Overcoat", "description": "Classic wool-blend overcoat. Slim fit, notched lapels, dual front pockets, fully lined interior.", "price": 249.99, "compare_price": 349.99, "category": "Clothing", "brand": "HeritageCo", "stock": 30, "sku": "CLTH-006", "image_url": "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600", "images": ["https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600"]},
    {"name": "Leather Belt", "description": "Full-grain leather belt with brushed nickel buckle. Reversible black/brown, adjustable sizing.", "price": 44.99, "category": "Clothing", "brand": "HeritageCo", "stock": 120, "sku": "CLTH-007", "image_url": "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600", "images": ["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600"]},
    {"name": "Sunglasses Polarized", "description": "Premium polarized sunglasses with UV400 protection. Lightweight titanium frame, scratch-resistant lenses.", "price": 79.99, "compare_price": 99.99, "category": "Clothing", "brand": "UrbanThread", "stock": 90, "sku": "CLTH-008", "image_url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600", "images": ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600"]},
    {"name": "Sci-Fi Novel Collection", "description": "Box set of 5 bestselling sci-fi novels. Includes bookmark, author signed bookplate, and reading guide.", "price": 59.99, "category": "Books & Media", "brand": "StarLit Press", "stock": 40, "sku": "BOOK-003", "image_url": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600", "images": ["https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600"]},
    {"name": "Wireless Earbuds Pro", "description": "True wireless earbuds with active noise cancellation. 30-hour total battery, IPX5 waterproof, wireless charging case.", "price": 129.99, "compare_price": 169.99, "category": "Electronics", "brand": "AudioMax", "stock": 75, "sku": "ELEC-009", "is_featured": True, "image_url": "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600", "images": ["https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600"]},
    {"name": "Portable Power Bank", "description": "20000mAh portable power bank with fast charging. Dual USB-C/A output, LED display, airplane safe.", "price": 34.99, "category": "Electronics", "brand": "ChargeMax", "stock": 130, "sku": "ELEC-010", "image_url": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600", "images": ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600"]},
]


# --- Generated catalog: expands curated PRODUCTS to 500+ items ---
# Deterministic generator so seeds are stable across runs/environments.
# Every image URL below was verified reachable (HTTP 200) AND visually checked
# so the photo subject matches the product type exactly.
# Uniqueness: within a type, photo[(idx//1) % k] + variant[(idx//k) % 13 + 1];
# every type's count fits in k*13 slots, and photos are exclusive per type,
# so no two products share an image_url (curated rows use bare URLs).
_IMG_VARIANTS = [
    "",  # original framing (index 0 never used for GEN; keeps GEN disjoint from curated)
    "&h=600&fit=crop&crop=entropy",
    "&h=600&fit=crop&crop=top",
    "&h=600&fit=crop&crop=bottom",
    "&h=600&fit=crop&crop=left",
    "&h=600&fit=crop&crop=right",
    "&h=600&fit=crop&crop=faces",
    "&h=600&fit=crop&crop=edges",
    "&h=600&fit=crop&flip=h",
    "&h=600&fit=crop&flip=v",
    "&h=600&fit=crop&crop=top&flip=h",
    "&h=600&fit=crop&crop=bottom&flip=h",
    "&h=600&fit=crop&crop=left&flip=h",
    "&h=600&fit=crop&crop=right&flip=h",
    "&h=600&fit=crop&crop=faces&flip=h",
    "&h=600&fit=crop&crop=edges&flip=h",
    "&h=600&fit=crop&crop=entropy&flip=v",
    "&h=600&fit=crop&crop=top&flip=v",
    "&h=600&fit=crop&crop=bottom&flip=v",
    "&h=600&fit=crop&crop=left&flip=v",
    "&h=600&fit=crop&crop=right&flip=v",
    "&h=600&fit=crop&crop=faces&flip=v",
    "&h=600&fit=crop&crop=edges&flip=v",
]
_VARIANT_SLOTS = len(_IMG_VARIANTS) - 1  # 21 usable (skip index 0)

_U = "https://images.unsplash.com/{0}?w=600"

# Exact-subject photo per product type (photo IDs visually verified).
_TYPE_PHOTOS = {
    "Electronics": {
        "Headphones": ["photo-1505740420928-5e560c06d30e", "photo-1583394838336-acd977736f90", "photo-1498049794561-7780e7231661"],
        "Smartwatch": ["photo-1523275335684-37898b6baf30", "photo-1434493789847-2f02dc6ca35d", "photo-1508685096489-7aacd43bd3b1"],
        "Earbuds": ["photo-1606220588913-b3aacb4d2f46", "photo-1590658268037-6bf12165a8df", "photo-1606220945770-b5b6c2c55bf1"],
        "Keyboard": ["photo-1587829741301-dc798b83add3", "photo-1550009158-9ebf69173e03"],
        "Charger": ["photo-1601784551446-20c9e07cdbdb", "photo-1511707171634-5f897ff02aa9"],
        "Speaker": ["photo-1608043152269-423dbba4e7e1"],
        "Laptop Stand": ["photo-1527864550417-7fd91fc51a46"],
        "Desk Lamp": ["photo-1534073737927-85f1ebff1f5d"],
        "USB-C Hub": ["photo-1625842268584-8f3296236761"],
        "Webcam": ["photo-1587826080692-f439cd0b70da"],
        "Power Bank": ["photo-1609091839311-d5365f9ff1c5"],
        "Laptop": ["photo-1593642632823-8f785ba67e45"],
        "SSD Drive": ["photo-1518770660439-4636190af475"],
        "Mouse": ["photo-1615663245857-ac93bb7c39e7"],
    },
    "Clothing": {
        "T-Shirt": ["photo-1521572163474-6864f9cf17ab", "photo-1523381210434-271e8be1f52b", "photo-1576566588028-4147f3842f27", "photo-1618354691373-d851c5c3a990"],
        "Sneakers": ["photo-1549298916-b41d501d3772", "photo-1560769629-975ec94e6a86", "photo-1595950653106-6c9ebd614d3a"],
        "Jacket": ["photo-1551028719-00167b16eac5", "photo-1445205170230-053b83016050"],
        "Hoodie": ["photo-1591047139829-d91aecb6caea", "photo-1620799140408-edc6dcb6d633"],
        "Jeans": ["photo-1542272604-787c3835535d"],
        "Cap": ["photo-1556306535-0f09a537f0a3"],
        "Polo Shirt": ["photo-1596755094514-f87e34085b2c"],
        "Backpack": ["photo-1548036328-c9fa89d128fa"],
        "Overcoat": ["photo-1539533018447-63fcce2678e3"],
        "Belt": ["photo-1624222247344-550fb60583dc"],
        "Sunglasses": ["photo-1572635196237-14b3f281503f"],
    },
    "Home & Kitchen": {
        "Pillow": ["photo-1631679706909-1844bbd07221", "photo-1567016432779-094069958ea5"],
        "Lamp": ["photo-1507473885765-e6ed057f782c", "photo-1586023492125-27b2c045efd7"],
        "Cookware Set": ["photo-1556909114-f6e7ad7d3136"],
        "Plant Pot": ["photo-1485955900006-10f4d324d411"],
        "Cutting Board": ["photo-1594226801341-41427b4e5c22"],
        "Vacuum Cleaner": ["photo-1518611012118-696072aa579a"],
        "Bed Sheet Set": ["photo-1522771739844-6a9f6d5f14af"],
        "Frying Pan": ["photo-1585515320310-259814833e62"],
        "Aromatherapy Diffuser": ["photo-1602928321679-560bb453f190"],
        "Wall Shelf": ["photo-1595428774223-ef52624120d2"],
    },
    "Sports & Outdoors": {
        "Yoga Mat": ["photo-1601925260368-ae2f83cf8b7f", "photo-1544367567-0f2fcb009e0b", "photo-1552196563-55cd4e45efb3"],
        "Dumbbell Set": ["photo-1534438327276-14e5300c3a48", "photo-1541534741688-6078c6bfb5c5", "photo-1517836357463-d25dfeac3438"],
        "Water Bottle": ["photo-1602143407151-7111542de6e8", "photo-1570831739435-6601aa3fa4fb"],
        "Running Shoes": ["photo-1542291026-7eec264c27ff", "photo-1476480862126-209bfaa8edc8"],
        "Tennis Racket": ["photo-1622279457486-62dcc4a431d6"],
        "Backpack": ["photo-1553062407-98eeb64c6a62"],
        "Tent": ["photo-1504280390367-361c6d9f38f4"],
        "Resistance Bands": ["photo-1598289431512-b97b0917affc"],
        "Cycling Helmet": ["photo-1517649763962-0c623066013b"],
    },
    "Books & Media": {
        "Programming Guide": ["photo-1544947950-fa07a98d237f"],
        "Sci-Fi Novel": ["photo-1495446815901-a7297e633e8d"],
        "Art Book": ["photo-1481627834876-b7833e8f5570"],
        "Mystery Box Set": ["photo-1507842217343-583bb7270b66"],
        "History Atlas": ["photo-1512820790803-83ca734da794"],
        "Poetry Collection": ["photo-1457369804613-52c61a468e7d"],
        "Language Course": ["photo-1519682337058-a94d519337bc"],
        "Record Player": ["photo-1539375665275-f9de415ef9ac"],
        "Study Planner": ["photo-1499750310107-5fef28a66643"],
    },
}

_GENERATOR_SPECS = {
    "Electronics": {
        "code": "ELEC",
        "brands": ["AudioMax", "TechFlow", "FitTech", "SoundWave", "KeyCraft", "ClearView", "ChargeMax", "LightPro"],
        "types": ["Headphones", "Smartwatch", "Earbuds", "Keyboard", "Charger", "Speaker", "Laptop Stand", "Desk Lamp", "USB-C Hub", "Webcam", "Power Bank", "Laptop", "SSD Drive", "Mouse"],
        "adjectives": ["Wireless", "Ultra", "Pro", "Elite", "Smart", "Compact", "Deluxe", "Turbo", "Nano", "Quantum"],
        "price": (19.99, 399.99),
    },
    "Clothing": {
        "code": "CLTH",
        "brands": ["UrbanThread", "DenimCraft", "ActivePeak", "WoolCraft", "HeritageCo"],
        "types": ["T-Shirt", "Sneakers", "Jacket", "Hoodie", "Jeans", "Cap", "Polo Shirt", "Backpack", "Overcoat", "Belt", "Sunglasses"],
        "adjectives": ["Classic", "Slim Fit", "Premium", "Vintage", "Sport", "Organic", "Stretch", "Waterproof", "Lightweight", "Thermal"],
        "price": (14.99, 249.99),
    },
    "Home & Kitchen": {
        "code": "HOME",
        "brands": ["ChefElite", "SleepWell", "GreenThumb", "EcoKitchen", "CleanBot"],
        "types": ["Pillow", "Lamp", "Cookware Set", "Plant Pot", "Cutting Board", "Vacuum Cleaner", "Bed Sheet Set", "Frying Pan", "Aromatherapy Diffuser", "Wall Shelf"],
        "adjectives": ["Premium", "Eco", "Deluxe", "Compact", "Ceramic", "Bamboo", "Smart", "Non-Stick", "Insulated", "Minimalist"],
        "price": (12.99, 349.99),
    },
    "Sports & Outdoors": {
        "code": "SPRT",
        "brands": ["ProSport", "ZenFlow", "TrailMaster", "HydroKeep", "SpeedStep"],
        "types": ["Yoga Mat", "Dumbbell Set", "Water Bottle", "Running Shoes", "Tennis Racket", "Backpack", "Tent", "Resistance Bands", "Cycling Helmet"],
        "adjectives": ["Pro", "Ultralight", "Insulated", "Carbon", "Waterproof", "Extra Thick", "Durable", "Lightweight", "Thermal", "Compression"],
        "price": (9.99, 299.99),
    },
    "Books & Media": {
        "code": "BOOK",
        "brands": ["TechPress", "RetroSound", "StarLit Press", "PageTurner", "MediaHub"],
        "types": ["Programming Guide", "Sci-Fi Novel", "Art Book", "Mystery Box Set", "History Atlas", "Poetry Collection", "Language Course", "Record Player", "Study Planner"],
        "adjectives": ["Complete", "Deluxe", "Illustrated", "Bestselling", "Collector's", "Ultimate", "Essential", "Limited", "Classic", "Modern"],
        "price": (9.99, 199.99),
    },
}


def _build_full_catalog(target_per_category: int = 110):
    """Return curated PRODUCTS plus deterministic generated items (>=500 total).

    Image rule: each product's photo depicts its type exactly (visually
    verified mapping in _TYPE_PHOTOS). Uniqueness comes from per-type photo
    rotation x crop variants; every type's count fits its k*13 slots and
    photos are exclusive per type, so image_urls are globally unique.
    """
    import hashlib

    full = [dict(p) for p in PRODUCTS]
    existing_skus = {p["sku"] for p in full}
    type_seq: dict[tuple[str, str], int] = {}

    for cat_name, spec in _GENERATOR_SPECS.items():
        made = sum(1 for p in full if p.get("category") == cat_name)
        need = max(0, target_per_category - made)
        lo, hi = spec["price"]
        type_photos = _TYPE_PHOTOS[cat_name]
        for i in range(need):
            n = len([p for p in full if p.get("category") == cat_name])
            adj = spec["adjectives"][i % len(spec["adjectives"])]
            typ = spec["types"][(i // len(spec["adjectives"])) % len(spec["types"])]
            series = (i // (len(spec["adjectives"]) * len(spec["types"]))) + 1
            name = f"{adj} {typ} Series {series:02d}"
            # Ensure unique name if collision with curated items
            suffix = 0
            candidate = name
            existing_names = {p["name"] for p in full}
            while candidate in existing_names:
                suffix += 1
                candidate = f"{name} Mk{suffix}"
            name = candidate
            h = int(hashlib.md5(f"{cat_name}:{name}".encode()).hexdigest()[:8], 16)
            price = round(lo + (h % int((hi - lo) * 100)) / 100, 2)
            brand = spec["brands"][h % len(spec["brands"])]
            # Subject-exact photo for this type; per-type sequence -> unique URL
            photos = type_photos[typ]
            t_idx = type_seq.get((cat_name, typ), 0)
            type_seq[(cat_name, typ)] = t_idx + 1
            img = _U.format(photos[t_idx % len(photos)]) + _IMG_VARIANTS[((t_idx // len(photos)) % _VARIANT_SLOTS) + 1]
            sku = f"{spec['code']}-GEN-{n + 1:04d}"
            while sku in existing_skus:
                n += 1
                sku = f"{spec['code']}-GEN-{n + 1:04d}"
            existing_skus.add(sku)
            full.append({
                "name": name,
                "description": f"{name} in {cat_name}. Quality {brand} craftsmanship with durable materials and modern design. Ideal for everyday use.",
                "price": price,
                "compare_price": round(price * 1.25, 2) if h % 4 == 0 else None,
                "category": cat_name,
                "brand": brand,
                "stock": 10 + (h % 190),
                "sku": sku,
                "is_featured": (h % 12 == 0),
                "image_url": img,
                "images": [img],
            })
    return full


SEED_VERSION = 4  # bump when the catalog/mapping changes to force reconciliation


async def _seed_marker(db) -> str | None:
    from sqlalchemy import text as sa_text

    try:
        await db.execute(
            sa_text(
                "CREATE TABLE IF NOT EXISTS seed_meta "
                "(key TEXT PRIMARY KEY, value TEXT)"
            )
        )
        row = (
            await db.execute(
                sa_text("SELECT value FROM seed_meta WHERE key = 'version'")
            )
        ).scalar_one_or_none()
        return row
    except Exception:
        return None


async def _set_seed_marker(db, value: str) -> None:
    from sqlalchemy import text as sa_text

    try:
        await db.execute(
            sa_text(
                "INSERT INTO seed_meta (key, value) VALUES ('version', :v) "
                "ON CONFLICT (key) DO UPDATE SET value = :v"
            ),
            {"v": value},
        )
    except Exception as e:
        print(f"Seed marker skipped: {e}")


async def seed():
    await init_db()
    async with async_session() as db:
        from sqlalchemy import delete as sa_delete
        from sqlalchemy import func as sa_func
        from sqlalchemy import update as sa_update
        from models.order import OrderItem
        # Fast path: steady-state cold starts skip all reconciliation work.
        try:
            marker = await _seed_marker(db)
            total_fast = (
                await db.execute(select(sa_func.count(Product.id)))
            ).scalar() or 0
            if marker == str(SEED_VERSION) and total_fast >= 550:
                print(f"Seed up to date (v{marker}, {total_fast} products)")
                await db.commit()
                return
        except Exception as e:
            print(f"Seed fast-path skipped: {e}")
        # Ensure categories exist (get-or-create by slug)
        existing_cats = (await db.execute(select(Category))).scalars().all()
        by_slug = {c.slug: c for c in existing_cats}
        category_objs = list(existing_cats)
        for cat_data in CATEGORIES:
            if cat_data["slug"] not in by_slug:
                cat = Category(**cat_data)
                db.add(cat)
                category_objs.append(cat)
        await db.flush()

        catalog = _build_full_catalog(target_per_category=110)

        # Deduplicate (bulk): concurrent serverless cold starts may have
        # inserted the same SKU twice. Keep order-referenced rows, else oldest.
        # Runs in ~4 queries regardless of catalog size.
        all_rows = (
            await db.execute(
                select(Product.id, Product.sku, Product.created_at)
            )
        ).all()
        by_sku: dict[str, list] = {}
        for pid, sku, created in all_rows:
            by_sku.setdefault(sku, []).append((pid, created))
        dup_groups = {s: r for s, r in by_sku.items() if len(r) > 1}
        removed = 0
        if dup_groups:
            dup_ids = [pid for rows in dup_groups.values() for pid, _ in rows]
            ref_rows = (
                await db.execute(
                    select(OrderItem.product_id)
                    .where(OrderItem.product_id.in_(dup_ids))
                    .group_by(OrderItem.product_id)
                )
            ).scalars().all()
            referenced = set(ref_rows)
            delete_ids: list = []
            for sku, rows in dup_groups.items():
                rows_sorted = sorted(rows, key=lambda t: (t[1], t[0]))
                ref_here = [pid for pid, _ in rows_sorted if pid in referenced]
                if ref_here:
                    if len(ref_here) == len(rows_sorted):
                        continue  # all referenced; cannot dedup safely
                    keep = set(ref_here)
                else:
                    keep = {rows_sorted[0][0]}
                delete_ids.extend(
                    pid for pid, _ in rows_sorted if pid not in keep
                )
            for i in range(0, len(delete_ids), 200):
                await db.execute(
                    sa_delete(Product).where(
                        Product.id.in_(delete_ids[i : i + 200])
                    )
                )
            removed = len(delete_ids)
            print(f"Removed {removed} duplicate product rows")
        await db.flush()

        import re as slug_re
        def make_slug(text):
            text = text.lower().strip()
            text = slug_re.sub(r"[^\w\s-]", "", text)
            text = slug_re.sub(r"[-\s]+", "-", text)
            return text

        # Heal the one known-broken legacy image (was 404) wherever it lingers
        BROKEN_IMG = "https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=600"
        BROKEN_CAT_IMG = "https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=400"
        SPORTS_IMG = "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600"
        for cat in category_objs:
            if cat.image_url in (BROKEN_IMG, BROKEN_CAT_IMG):
                cat.image_url = "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400"
        await db.flush()
        healed = (
            await db.execute(
                select(Product).where(Product.image_url == BROKEN_IMG)
            )
        ).scalars().all()
        for p in healed:
            p.image_url = SPORTS_IMG
            p.images = [SPORTS_IMG]
        if healed:
            print(f"Healed {len(healed)} products with broken image")
        await db.flush()

        catalog = _build_full_catalog(target_per_category=110)

        # Backfill: reconcile name/description/brand/image for existing GEN rows
        # (type renames + subject-exact photos). Slugs, prices, stock and
        # ratings are left untouched. Idempotent, 1 SELECT + batched UPDATEs.
        desired = {
            p["sku"]: p for p in catalog if "-GEN-" in p["sku"]
        }
        if desired:
            existing_rows = (
                await db.execute(
                    select(
                        Product.sku,
                        Product.name,
                        Product.description,
                        Product.brand,
                        Product.image_url,
                    ).where(Product.sku.in_(list(desired)))
                )
            ).all()
            mismatch_skus = [
                sku
                for sku, name, desc, brand, img in existing_rows
                if (
                    img != desired[sku]["image_url"]
                    or name != desired[sku]["name"]
                    or brand != desired[sku]["brand"]
                )
            ]
            for i in range(0, len(mismatch_skus), 100):
                batch = mismatch_skus[i : i + 100]
                for sku in batch:
                    want = desired[sku]
                    await db.execute(
                        sa_update(Product)
                        .where(Product.sku == sku)
                        .values(
                            name=want["name"],
                            description=want["description"],
                            brand=want["brand"],
                            image_url=want["image_url"],
                            images=[want["image_url"]],
                        )
                    )
            if mismatch_skus:
                print(f"Backfilled {len(mismatch_skus)} products (name+image match)")
        await db.flush()

        # Skip only when we already have a full 500+ catalog with nothing missing
        try:
            total_existing = (await db.execute(select(sa_func.count(Product.id)))).scalar() or 0
        except Exception:
            total_existing = 0
        existing_skus = set(
            (await db.execute(select(Product.sku))).scalars().all()
        )
        missing = [p for p in catalog if p["sku"] not in existing_skus]
        if total_existing >= 500 and not missing:
            print(f"Database already seeded ({total_existing} products)")
            await _set_seed_marker(db, str(SEED_VERSION))
            await db.commit()
            return

        inserted = 0
        for prod_data in catalog:
            if prod_data["sku"] in existing_skus:
                continue
            data = dict(prod_data)  # do not mutate global PRODUCTS
            cat_name = data.pop("category")
            cat = next((c for c in category_objs if c.name == cat_name), None)
            # Deterministic rating/reviews stable across runs
            import hashlib as _hl
            _h = int(_hl.md5(data["name"].encode()).hexdigest()[:8], 16)
            product = Product(
                **data,
                slug=f"{make_slug(data['name'])}-{data['sku'].lower()}",
                category=cat_name,
                category_id=cat.id if cat else None,
                rating=round(3.5 + (_h % 16) / 10, 1),
                review_count=_h % 195 + 5,
            )
            db.add(product)
            inserted += 1
        try:
            await db.flush()
            await _set_seed_marker(db, str(SEED_VERSION))
            await db.commit()
        except Exception as e:
            # Another instance likely won the race on the same SKUs (UNIQUE).
            # Roll back; dedup + missing-insert heal it on the next start.
            await db.rollback()
            print(f"Seed commit raced, rolled back ({e})")
            return
        print(f"Database seeded successfully! inserted={inserted} catalog={len(catalog)}")


if __name__ == "__main__":
    asyncio.run(seed())
