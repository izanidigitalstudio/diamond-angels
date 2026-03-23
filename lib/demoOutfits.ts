const IMG = 'https://api.a0.dev/assets/image';

export const OUTFIT_CATEGORIES = ['All', 'Events', 'Promotions', 'Club', 'Golf Days', 'Activations', 'Fashion Shows'];

export const DEMO_OUTFITS = [
  // ── Events (10) ──
  {
    id: 'e1', name: 'Elegant Gold Bodycon', category: 'Events', price: 1200,
    description: 'Sleek gold bodycon dress perfect for corporate events and award ceremonies. Features a subtle shimmer finish.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Gold', 'Black', 'Silver'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('elegant gold bodycon dress, corporate event fashion, luxury, dark background')}&aspect=3:4&seed=9001`,
  },
  {
    id: 'e2', name: 'Classic Black Cocktail', category: 'Events', price: 950,
    description: 'Timeless black cocktail dress with modern cut. Ideal for conferences, galas, and upscale evening events.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Navy', 'Burgundy'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('classic black cocktail dress, elegant modern cut, luxury fashion')}&aspect=3:4&seed=9002`,
  },
  {
    id: 'e3', name: 'Red Carpet Gown', category: 'Events', price: 2500,
    description: 'Stunning floor-length gown for award ceremonies and high-profile events.',
    sizes: ['S', 'M', 'L'], colors: ['Red', 'Emerald', 'Royal Blue'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('stunning red floor-length evening gown, red carpet fashion, glamorous')}&aspect=3:4&seed=9003`,
  },
  {
    id: 'e4', name: 'Champagne Satin Slip', category: 'Events', price: 1100,
    description: 'Luxurious satin slip dress in champagne tones. Effortlessly chic for cocktail receptions and evening dinners.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Champagne', 'Blush', 'Ivory'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('champagne satin slip dress, elegant cocktail reception, soft lighting')}&aspect=3:4&seed=9101`,
  },
  {
    id: 'e5', name: 'Navy Structured Blazer Dress', category: 'Events', price: 1350,
    description: 'Sharp double-breasted blazer dress. Powerful silhouette for corporate galas and awards nights.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Navy', 'Black', 'Charcoal'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('navy structured blazer dress, corporate gala fashion, power dressing')}&aspect=3:4&seed=9102`,
  },
  {
    id: 'e6', name: 'Emerald Velvet Midi', category: 'Events', price: 1450,
    description: 'Rich emerald velvet midi dress with a sweetheart neckline. Ideal for winter galas and formal dinners.',
    sizes: ['S', 'M', 'L'], colors: ['Emerald', 'Burgundy', 'Midnight Blue'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('emerald green velvet midi dress, winter gala fashion, elegant')}&aspect=3:4&seed=9103`,
  },
  {
    id: 'e7', name: 'White Column Gown', category: 'Events', price: 2200,
    description: 'Minimalist white column gown with sculptural shoulders. Statement piece for charity balls.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Ivory', 'Blush'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('white column gown, sculptural shoulders, charity ball fashion, minimalist elegance')}&aspect=3:4&seed=9104`,
  },
  {
    id: 'e8', name: 'Beaded Cape Dress', category: 'Events', price: 2800,
    description: 'Showstopping beaded cape overlay dress. Premium choice for product launches and VIP evenings.',
    sizes: ['S', 'M', 'L'], colors: ['Silver', 'Gold', 'Black'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('beaded cape overlay dress, VIP event fashion, luxury silver beading')}&aspect=3:4&seed=9105`,
  },
  {
    id: 'e9', name: 'Blush Tulle A-Line', category: 'Events', price: 1650,
    description: 'Romantic blush tulle A-line dress. Dreamy look for garden parties and evening receptions.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Blush', 'Lavender', 'Mint'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('blush pink tulle A-line dress, garden party fashion, romantic dreamy')}&aspect=3:4&seed=9106`,
  },
  {
    id: 'e10', name: 'Metallic Wrap Dress', category: 'Events', price: 1050,
    description: 'Flattering metallic wrap dress that catches every light. Versatile for cocktail hours and corporate awards.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Rose Gold', 'Silver', 'Bronze'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('metallic rose gold wrap dress, cocktail fashion, shimmering fabric')}&aspect=3:4&seed=9107`,
  },
  // ── Promotions (10) ──
  {
    id: 'p1', name: 'Branded Polo Set', category: 'Promotions', price: 450,
    description: 'Professional branded polo shirt set with matching skirt. Perfect for in-store promotions and brand activations.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Red', 'Royal Blue'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('professional white polo shirt and skirt set, brand ambassador uniform')}&aspect=3:4&seed=9004`,
  },
  {
    id: 'p2', name: 'Promo Bodysuit & Shorts', category: 'Promotions', price: 380,
    description: 'Eye-catching bodysuit and high-waisted shorts combo for outdoor promotions and festivals.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Black', 'Pink', 'Yellow'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('stylish bodysuit and high-waisted shorts set, promotional model outfit')}&aspect=3:4&seed=9005`,
  },
  {
    id: 'p3', name: 'Branded Crop Top & Leggings', category: 'Promotions', price: 420,
    description: 'Sporty crop top and leggings set. Maximum branding space, perfect for fitness and wellness promotions.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Neon Green', 'Orange'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('sporty branded crop top and leggings set, fitness promotion outfit')}&aspect=3:4&seed=9201`,
  },
  {
    id: 'p4', name: 'Wraparound Apron Dress', category: 'Promotions', price: 350,
    description: 'Cute wraparound apron dress for food & beverage brand promotions. Easy branding on front panel.',
    sizes: ['S', 'M', 'L', 'XL'], colors: ['Red', 'White', 'Black', 'Green'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('wraparound apron dress, food brand promotion outfit, cheerful')}&aspect=3:4&seed=9202`,
  },
  {
    id: 'p5', name: 'Branded A-Line Mini', category: 'Promotions', price: 480,
    description: 'Structured A-line mini dress with large brandable chest and back panels. Ideal for experiential activations.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Black', 'Red'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('white A-line mini dress, brand activation outfit, clean modern')}&aspect=3:4&seed=9203`,
  },
  {
    id: 'p6', name: 'Tech Expo Jumpsuit', category: 'Promotions', price: 520,
    description: 'Modern slim-fit jumpsuit for tech expos and trade shows. Clean lines with zip-front detail.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Black', 'White', 'Grey'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('modern slim fit jumpsuit, tech expo promotional outfit, futuristic')}&aspect=3:4&seed=9204`,
  },
  {
    id: 'p7', name: 'Festival Bralette & Skirt', category: 'Promotions', price: 360,
    description: 'Fun bralette and flared skirt combo for outdoor festivals and sampling events.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Yellow', 'Pink', 'White', 'Turquoise'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('colorful bralette and flared skirt set, outdoor festival promo outfit')}&aspect=3:4&seed=9205`,
  },
  {
    id: 'p8', name: 'Promo Blazer & Hot Pants', category: 'Promotions', price: 550,
    description: 'Sharp cropped blazer paired with tailored hot pants. Premium look for liquor and lifestyle brands.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'White', 'Red', 'Gold'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('cropped blazer and tailored hot pants, luxury brand promotion outfit')}&aspect=3:4&seed=9206`,
  },
  {
    id: 'p9', name: 'Sampler Tee & Mini', category: 'Promotions', price: 300,
    description: 'Casual branded tee tucked into a high-waisted mini skirt. Budget-friendly for large teams.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Red', 'Blue', 'Green'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('casual branded t-shirt and mini skirt, promotional sampling outfit')}&aspect=3:4&seed=9207`,
  },
  {
    id: 'p10', name: 'High-Vis Branded Vest Set', category: 'Promotions', price: 400,
    description: 'High-visibility branded vest with matching shorts. Great for outdoor road-shows and sports events.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Neon Yellow', 'Neon Orange', 'Neon Pink'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('neon high-vis branded vest and shorts, outdoor roadshow promotional')}&aspect=3:4&seed=9208`,
  },
  // ── Club (10) ──
  {
    id: 'c1', name: 'Sequin Mini Dress', category: 'Club', price: 850,
    description: 'Show-stopping sequin mini dress for club events and nightlife. Dazzling under club lights.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Silver', 'Gold', 'Black', 'Pink'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('sequin mini dress, nightclub fashion, sparkly glamorous, dark neon lighting')}&aspect=3:4&seed=9006`,
  },
  {
    id: 'c2', name: 'Bottle Girl Corset Set', category: 'Club', price: 680,
    description: 'Premium corset top and matching skirt set designed for bottle service. Customizable with venue branding.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Red', 'White', 'Gold'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('black corset top and mini skirt set, VIP bottle service outfit')}&aspect=3:4&seed=9007`,
  },
  {
    id: 'c3', name: 'Neon Mesh Bodysuit', category: 'Club', price: 580,
    description: 'Bold neon mesh bodysuit for themed club nights. Semi-sheer with built-in modesty panels.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Neon Pink', 'Neon Green', 'Neon Blue'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('neon mesh bodysuit, nightclub themed party outfit, UV glow')}&aspect=3:4&seed=9301`,
  },
  {
    id: 'c4', name: 'Vinyl Biker Shorts Set', category: 'Club', price: 620,
    description: 'Edgy vinyl bralette and biker shorts set. Perfect for hip-hop nights and urban club events.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Red', 'White'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('vinyl bralette and biker shorts set, urban nightclub fashion, edgy')}&aspect=3:4&seed=9302`,
  },
  {
    id: 'c5', name: 'Crystal Fringe Dress', category: 'Club', price: 1200,
    description: 'Dazzling crystal fringe mini dress that moves with every step. A head-turner on the dance floor.',
    sizes: ['XS', 'S', 'M'], colors: ['Silver', 'Gold', 'Iridescent'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('crystal fringe mini dress, dance floor fashion, sparkling movement')}&aspect=3:4&seed=9303`,
  },
  {
    id: 'c6', name: 'Velvet Bustier Mini', category: 'Club', price: 750,
    description: 'Rich velvet bustier mini dress with boning detail. Sophisticated nightlife elegance.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Burgundy', 'Black', 'Emerald', 'Navy'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('velvet bustier mini dress, sophisticated nightclub fashion, moody lighting')}&aspect=3:4&seed=9304`,
  },
  {
    id: 'c7', name: 'Cut-Out Bandage Dress', category: 'Club', price: 780,
    description: 'Strategic cut-out bandage dress that sculpts the body. Paired perfectly with strappy heels.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'White', 'Red', 'Nude'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('cut-out bandage dress, body sculpting nightclub fashion, sexy elegant')}&aspect=3:4&seed=9305`,
  },
  {
    id: 'c8', name: 'Metallic Halter Top Set', category: 'Club', price: 550,
    description: 'Metallic halter top with matching high-waist pants. Futuristic glam for themed club nights.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Silver', 'Gold', 'Rose Gold'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('metallic halter top and pants set, futuristic club outfit, shiny')}&aspect=3:4&seed=9306`,
  },
  {
    id: 'c9', name: 'Feather Trim Mini', category: 'Club', price: 950,
    description: 'Statement feather trim mini dress. Dramatic and glamorous for VIP and exclusive club events.',
    sizes: ['XS', 'S', 'M'], colors: ['Black', 'White', 'Pink', 'Red'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('feather trim mini dress, exclusive VIP club fashion, dramatic glamorous')}&aspect=3:4&seed=9307`,
  },
  {
    id: 'c10', name: 'Lace-Up Catsuit', category: 'Club', price: 720,
    description: 'Figure-hugging lace-up catsuit for theme nights and dance events. Full stretch comfort.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Red', 'White'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('lace-up catsuit, figure hugging nightclub outfit, dance event fashion')}&aspect=3:4&seed=9308`,
  },
  // ── Golf Days (10) ──
  {
    id: 'g1', name: 'Golf Day Dress', category: 'Golf Days', price: 550,
    description: 'Elegant yet sporty golf day dress. Perfect for corporate golf days with room for branding.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Navy', 'Light Blue', 'Pink'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('sporty elegant white golf dress, women golf fashion, green course background')}&aspect=3:4&seed=9008`,
  },
  {
    id: 'g2', name: 'Golf Polo & Pleated Skort', category: 'Golf Days', price: 480,
    description: 'Classic polo top with pleated skort combo. Clean corporate look for golf day hospitality.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Navy', 'Pink', 'Mint'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('golf polo and pleated skort, women golf hospitality outfit, green course')}&aspect=3:4&seed=9401`,
  },
  {
    id: 'g3', name: 'Sleeveless Golf Shift', category: 'Golf Days', price: 520,
    description: 'Breezy sleeveless shift dress for warm-weather golf days. UV-protective fabric.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Coral', 'Light Blue', 'Lemon'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('sleeveless shift dress, summer golf day fashion, bright and airy')}&aspect=3:4&seed=9402`,
  },
  {
    id: 'g4', name: 'Athletic Golf Jumpsuit', category: 'Golf Days', price: 600,
    description: 'Sporty one-piece golf jumpsuit. Moves with you and looks sharp on and off the course.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Black', 'Navy'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('athletic women golf jumpsuit, sporty one-piece, green course background')}&aspect=3:4&seed=9403`,
  },
  {
    id: 'g5', name: 'Zip-Front Golf Dress', category: 'Golf Days', price: 530,
    description: 'Modern zip-front golf dress with moisture-wicking fabric. Functional and fashionable.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Hot Pink', 'Turquoise'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('zip-front golf dress, modern sporty women fashion, golf course')}&aspect=3:4&seed=9404`,
  },
  {
    id: 'g6', name: 'Golf Vest & Shorts', category: 'Golf Days', price: 460,
    description: 'Casual golf vest paired with tailored shorts. Perfect for relaxed corporate golf outings.',
    sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'Navy', 'Khaki', 'Sage'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('golf vest and tailored shorts set, casual corporate golf outing')}&aspect=3:4&seed=9405`,
  },
  {
    id: 'g7', name: 'Striped Golf Midi', category: 'Golf Days', price: 540,
    description: 'Preppy striped midi dress with collar detail. Classic country club aesthetic.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Navy/White', 'Green/White', 'Pink/White'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('striped midi dress with collar, preppy country club golf fashion')}&aspect=3:4&seed=9406`,
  },
  {
    id: 'g8', name: 'Performance Golf Skirt Set', category: 'Golf Days', price: 490,
    description: 'High-performance moisture-wicking top and tennis-style skirt set with built-in shorts.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Coral', 'Mint'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('performance golf skirt and top set, athletic women golf fashion')}&aspect=3:4&seed=9407`,
  },
  {
    id: 'g9', name: 'Golf Caddy Romper', category: 'Golf Days', price: 470,
    description: 'Cute caddy-style romper with utility pockets. Fun and functional for course activations.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Khaki', 'Light Blue'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('caddy-style romper, women golf utility outfit, cute and functional')}&aspect=3:4&seed=9408`,
  },
  {
    id: 'g10', name: 'Elegant Golf Cardigan Set', category: 'Golf Days', price: 620,
    description: 'Lightweight cardigan over a fitted dress for early-morning tee-offs. Layers beautifully.',
    sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'Cream', 'Blush', 'Navy'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('elegant golf cardigan and dress set, early morning golf fashion, layered')}&aspect=3:4&seed=9409`,
  },
  // ── Activations (10) ──
  {
    id: 'a1', name: 'Activation Jumpsuit', category: 'Activations', price: 620,
    description: 'Versatile branded jumpsuit for activations and outdoor events. Maximum branding space.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Red'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('stylish women jumpsuit, brand activation fashion, modern promotional')}&aspect=3:4&seed=9009`,
  },
  {
    id: 'a2', name: 'Brand Ambassador Dress', category: 'Activations', price: 580,
    description: 'Sleek fitted dress with large branding zones front and back. The go-to for brand ambassador teams.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Red', 'Blue'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('sleek fitted dress, brand ambassador outfit, clean branding zones')}&aspect=3:4&seed=9501`,
  },
  {
    id: 'a3', name: 'Activation Cargo Pants Set', category: 'Activations', price: 540,
    description: 'Crop top and cargo pants combo. Urban-cool look for street activations and pop-up events.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Khaki', 'White', 'Olive'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('crop top and cargo pants, urban street activation outfit, cool')}&aspect=3:4&seed=9502`,
  },
  {
    id: 'a4', name: 'Experiential Bodycon', category: 'Activations', price: 500,
    description: 'Bold bodycon dress for experiential marketing events. Sculpted fit with stretch comfort.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Red', 'White', 'Electric Blue'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('bold bodycon dress, experiential marketing event outfit, vibrant')}&aspect=3:4&seed=9503`,
  },
  {
    id: 'a5', name: 'Tradeshow Blazer Set', category: 'Activations', price: 700,
    description: 'Cropped blazer and wide-leg trouser set. Professional yet stylish for trade shows.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Black', 'White', 'Navy', 'Grey'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('cropped blazer and wide-leg trousers, tradeshow professional outfit')}&aspect=3:4&seed=9504`,
  },
  {
    id: 'a6', name: 'Pop-Up Dungaree', category: 'Activations', price: 440,
    description: 'Fun branded dungaree with a fitted tee. Playful and approachable for sampling campaigns.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Denim', 'White', 'Black', 'Red'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('branded dungaree and tee, sampling campaign pop-up outfit, playful')}&aspect=3:4&seed=9505`,
  },
  {
    id: 'a7', name: 'LED Panel Dress', category: 'Activations', price: 1200,
    description: 'Innovative dress with integrated LED panels for digital branding. Showstopper at tech activations.',
    sizes: ['S', 'M', 'L'], colors: ['Black', 'White'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('futuristic LED panel dress, tech activation fashion, glowing digital')}&aspect=3:4&seed=9506`,
  },
  {
    id: 'a8', name: 'Sports Activation Tank Set', category: 'Activations', price: 400,
    description: 'Athletic tank top and track pants set. Built for sport sponsorship and fitness activations.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Neon Green', 'Red'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('athletic tank top and track pants, sports activation outfit, energetic')}&aspect=3:4&seed=9507`,
  },
  {
    id: 'a9', name: 'Activation Windbreaker Set', category: 'Activations', price: 520,
    description: 'Lightweight branded windbreaker and shorts. Weather-ready for outdoor activations.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Yellow', 'Blue'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('branded windbreaker and shorts, outdoor activation outfit, weather-ready')}&aspect=3:4&seed=9508`,
  },
  {
    id: 'a10', name: 'Branded Maxi Wrap', category: 'Activations', price: 650,
    description: 'Flowing maxi wrap dress with brandable sash. Elegant choice for luxury brand activations.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Black', 'Champagne', 'Dusty Rose'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('flowing maxi wrap dress with sash, luxury brand activation, elegant')}&aspect=3:4&seed=9509`,
  },
  // ── Fashion Shows (10) ──
  {
    id: 'f1', name: 'Runway Silk Dress', category: 'Fashion Shows', price: 1800,
    description: 'Luxurious silk midi dress designed for fashion show appearances. Elegant draping with modern silhouette.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Champagne', 'Emerald', 'Midnight Blue'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('luxurious silk midi dress, high fashion runway style, elegant draping')}&aspect=3:4&seed=9010`,
  },
  {
    id: 'f2', name: 'Avant-Garde Asymmetric', category: 'Fashion Shows', price: 2200,
    description: 'Bold asymmetric design with sculptural elements. Statement piece for runway presentations.',
    sizes: ['XS', 'S', 'M'], colors: ['Black', 'White', 'Crimson'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('avant-garde asymmetric dress, sculptural fashion, runway presentation')}&aspect=3:4&seed=9601`,
  },
  {
    id: 'f3', name: 'Sheer Overlay Gown', category: 'Fashion Shows', price: 2600,
    description: 'Ethereal sheer overlay gown with delicate embroidery. High fashion drama for the catwalk.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Ivory', 'Black', 'Blush'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('sheer overlay gown, delicate embroidery, high fashion catwalk, ethereal')}&aspect=3:4&seed=9602`,
  },
  {
    id: 'f4', name: 'Structured Origami Dress', category: 'Fashion Shows', price: 2400,
    description: 'Architectural origami-inspired design with crisp folds. A sculptural masterpiece for the runway.',
    sizes: ['S', 'M', 'L'], colors: ['White', 'Black', 'Red'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('origami structured dress, architectural fashion design, crisp folds, runway')}&aspect=3:4&seed=9603`,
  },
  {
    id: 'f5', name: 'Couture Feather Gown', category: 'Fashion Shows', price: 3500,
    description: 'Opulent feather-adorned gown. Full couture impact for finale walks and show closers.',
    sizes: ['XS', 'S', 'M'], colors: ['White', 'Black', 'Pastel Pink'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('couture feather gown, opulent fashion show finale, luxury catwalk')}&aspect=3:4&seed=9604`,
  },
  {
    id: 'f6', name: 'Deconstructed Tailoring', category: 'Fashion Shows', price: 1950,
    description: 'Deconstructed tailored jacket and asymmetric skirt. Contemporary edge for editorial shows.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Charcoal', 'Camel'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('deconstructed tailored jacket and skirt, editorial fashion show, contemporary')}&aspect=3:4&seed=9605`,
  },
  {
    id: 'f7', name: 'Holographic Mini', category: 'Fashion Shows', price: 1600,
    description: 'Futuristic holographic mini dress that shifts color with movement. Cutting-edge runway fashion.',
    sizes: ['XS', 'S', 'M'], colors: ['Holographic Silver', 'Holographic Pink'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('holographic mini dress, futuristic fashion show, iridescent color-shifting')}&aspect=3:4&seed=9606`,
  },
  {
    id: 'f8', name: 'Pleated Palazzo Set', category: 'Fashion Shows', price: 1750,
    description: 'Dramatic pleated palazzo pants with matching bandeau top. Fluid movement perfection on the catwalk.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Emerald', 'Cobalt', 'Terracotta', 'Ivory'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('pleated palazzo pants and bandeau top, dramatic fluid fashion show')}&aspect=3:4&seed=9607`,
  },
  {
    id: 'f9', name: 'Chain Mail Dress', category: 'Fashion Shows', price: 2800,
    description: 'Metallic chain mail dress inspired by medieval armor. Unforgettable statement for avant-garde shows.',
    sizes: ['S', 'M', 'L'], colors: ['Silver', 'Gold', 'Gunmetal'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('metallic chain mail dress, avant-garde medieval inspired fashion, dramatic')}&aspect=3:4&seed=9608`,
  },
  {
    id: 'f10', name: 'Cape Train Gown', category: 'Fashion Shows', price: 3200,
    description: 'Floor-length gown with dramatic cape train. The ultimate show-closing statement piece.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Red', 'Royal Purple', 'White'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('floor-length gown with dramatic cape train, fashion show finale, regal')}&aspect=3:4&seed=9609`,
  },
];

export type DemoOutfit = (typeof DEMO_OUTFITS)[number];
