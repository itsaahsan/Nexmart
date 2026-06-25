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
    {"name": "Sports & Outdoors", "slug": "sports-outdoors", "description": "Gear for sports and outdoor adventures", "image_url": "https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=400"},
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


async def seed():
    await init_db()
    async with async_session() as db:
        existing = await db.execute(select(User).limit(1))
        if existing.scalar_one_or_none():
            print("Database already seeded")
            return

        category_objs = []
        for cat_data in CATEGORIES:
            cat = Category(**cat_data)
            db.add(cat)
            category_objs.append(cat)
        await db.flush()

        import re as slug_re
        def make_slug(text):
            text = text.lower().strip()
            text = slug_re.sub(r"[^\w\s-]", "", text)
            text = slug_re.sub(r"[-\s]+", "-", text)
            return text

        product_objs = []
        for prod_data in PRODUCTS:
            cat_name = prod_data.pop("category")
            cat = next((c for c in category_objs if c.name == cat_name), None)
            product = Product(
                **prod_data,
                slug=make_slug(prod_data["name"]),
                category=cat_name,
                category_id=cat.id if cat else None,
                rating=round(3.5 + (hash(prod_data["name"]) % 16) / 10, 1),
                review_count=hash(prod_data["name"]) % 50 + 5,
            )
            db.add(product)
            product_objs.append(product)
        await db.flush()

        await db.commit()
        print("Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
