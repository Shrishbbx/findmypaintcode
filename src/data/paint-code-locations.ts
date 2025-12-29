/**
 * Paint Code Location Database
 *
 * Contains detailed information about where to find VIN tags and paint codes
 * for different car manufacturers.
 */

export interface PaintCodeLocation {
  brand: string;
  vinTagLocations: string[];
  paintCodeLocations: string[];
  paintCodeLabel: string;
  detailedSteps: string[];
  notes?: string;
  commonYearRanges?: string;
}

export const paintCodeLocations: PaintCodeLocation[] = [
  // DOMESTIC BRANDS
  {
    brand: "PLYMOUTH",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)", "Engine compartment"],
    paintCodeLocations: ["Driver's side door jamb", "Firewall (under hood)", "Strut towers"],
    paintCodeLabel: "PAINT",
    detailedSteps: [
      "Open the driver's side door and look on the door jamb for the VIN sticker",
      "Locate the 'PAINT' heading on the sticker (usually under the barcode)",
      "The paint code is typically 3 digits long (numbers and letters)",
      "If not on door jamb, open the hood and check the firewall and strut towers"
    ],
    notes: "Pre-1950s Plymouth vehicles do not have VINs. Paint codes usually appear under the barcode on the VIN sticker."
  },
  {
    brand: "BUICK",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Glove box", "Spare tire cover", "Trunk", "Passenger door jamb"],
    paintCodeLabel: "BC/CC",
    detailedSteps: [
      "Open the driver's side door and look for the Service Parts Identification sticker",
      "Look for the 'BC/CC' heading (Base Coat/Clear Coat)",
      "The paint code appears to the right of 'BC/CC'",
      "If not found, check the glove box, trunk, or spare tire cover",
      "Paint codes usually start with 'WA' and are 3-4 characters long"
    ],
    notes: "Newer vehicles have silver labels, older vehicles have white paper labels. BC/CC stands for basecoat/clearcoat."
  },
  {
    brand: "CADILLAC",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Glove box", "Driver's side door jamb", "Spare tire well in trunk"],
    paintCodeLabel: "BC/CC",
    detailedSteps: [
      "First check inside the glove box for the Service Parts Identification sticker",
      "If not there, open the driver's side door and check the door jamb",
      "Look in the trunk under the spare tire cover for the RPO tag",
      "Locate the 'BC/CC' heading at the bottom of the sticker",
      "The paint code appears next to BC/CC, often prefixed with 'U'"
    ],
    notes: "Newer vehicles have silver labels, older vehicles have white paper labels. You can also call Cadillac at 1-866-694-6546 with your VIN."
  },
  {
    brand: "Chevrolet",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Passenger door jamb", "Glove box", "Trunk", "Spare tire well"],
    paintCodeLabel: "BC/CC U or WA",
    detailedSteps: [
      "Open the driver's side door and look on the door jamb",
      "Locate the Service Parts Identification sticker (white, silver, or black)",
      "Look for 'BC/CC U' or 'WA' - the code follows these letters",
      "The code is typically 4 characters long",
      "If not found, check the glove box, passenger door, or trunk"
    ],
    notes: "BC/CC stands for basecoat/clearcoat, U stands for upper/body color. Paint codes often start with 'WA'."
  },
  {
    brand: "CHRYSLER",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Core support (under hood)", "Glove box"],
    paintCodeLabel: "PNT",
    detailedSteps: [
      "Open the driver's side door and locate the sticker on the door jamb",
      "Look for 'PNT:' label (short for Paint Code)",
      "The paint code is typically 3 digits starting with 'P' (e.g., PX8)",
      "If not found on door jamb, check under the hood on the core support",
      "Alternative location: inside the glove box"
    ],
    notes: "Paint codes are 3 digits long with letters and numbers, typically starting with 'P'. VIN does not contain paint code."
  },
  {
    brand: "DODGE",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Under hood (firewall/radiator)", "Under passenger seat panel"],
    paintCodeLabel: "EXT PNT or PNT",
    detailedSteps: [
      "Open the driver's side door and look on the door jamb",
      "Find the safety certification label with VIN and barcode",
      "Look at the bottom for 'PNT:xxx' or 'EXT PNT:'",
      "The paint code is 3 characters under the barcode, typically starting with 'P'",
      "Alternative locations: under hood, behind battery, or under passenger seat"
    ],
    notes: "Paint codes are always 3 digits, prefixed by 'P'. Older models may have codes on radiator support."
  },
  {
    brand: "FORD",
    vinTagLocations: ["Driver's side door jamb (B-pillar)", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb"],
    paintCodeLabel: "EXT PNT",
    detailedSteps: [
      "Open the driver's side door",
      "Look on the door jamb (B-pillar where door latches)",
      "Find the Safety Compliance Certification Label",
      "Locate 'EXT PNT:' followed by 2-3 characters",
      "This is your paint code"
    ],
    notes: "Older vehicles may have more than 2 characters. Color codes consist of numbers and/or letters."
  },
  {
    brand: "GMC",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Glove box (most common)", "Driver's side door jamb", "Passenger door"],
    paintCodeLabel: "BC/CC",
    detailedSteps: [
      "First check inside the glove box for the Service Parts Identification sticker",
      "If not there, check the driver's side door jamb",
      "Also check the passenger door rear",
      "Look for the 'BC/CC' heading (Base Coat/Clear Coat)",
      "The paint code appears to the right of 'BC/CC'"
    ],
    notes: "Unlike most trucks, GMC usually has the paint code in the glove box. Codes are 2-6 digits long with numbers and letters."
  },
  {
    brand: "JEEP",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Radiator support (older models)", "Firewall", "Under driver seat"],
    paintCodeLabel: "PNT",
    detailedSteps: [
      "Open the driver's side door and look on the door jamb",
      "Find the VIN sticker (white, silver, or black)",
      "Look for 'PNT:' followed by a 3-digit code",
      "The code is under the barcode next to the 'PAINT' header",
      "For older models, check radiator support, firewall, or under driver seat"
    ],
    notes: "Paint codes are 3 digits beginning with 'P'. VIN does not contain the paint code."
  },
  {
    brand: "OLDSMOBILE",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Glove box", "Spare tire well/cover", "Trunk lid", "Trunk wheel-house", "Jack compartment", "Under driver seat"],
    paintCodeLabel: "BC/CC U or WA",
    detailedSteps: [
      "Check the glove box first (very common location)",
      "If not there, check the spare tire well or cover",
      "Also check inside the trunk lid and jack compartment",
      "Look for 'BC/CC U' or 'WA' followed by the code",
      "Be persistent - Oldsmobile used many different locations"
    ],
    notes: "Oldsmobile paint codes are notoriously difficult to find. They used many locations throughout the years. Most commonly found in glove box or spare tire area."
  },
  {
    brand: "PONTIAC",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Glove box", "Spare tire cover", "Trunk deck lid", "Rear console"],
    paintCodeLabel: "BC/CC U or WA",
    detailedSteps: [
      "Check the driver's side door jamb for the Service Parts Identification sticker",
      "Model-specific locations: Firebird (door jam/rear console), G6/Solstice/Vibe (glove box)",
      "Grand Prix (trunk deck lid or spare tire cover)",
      "Look for 'BC/CC U' or codes starting with 'WA'",
      "Alternative locations vary by model - check glove box and trunk"
    ],
    notes: "Location varies significantly by model. BC/CC stands for basecoat/clearcoat, U stands for upper/body color."
  },
  {
    brand: "SATURN",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Door edge", "Spare tire cover/wheel well", "Glove box", "Under hood (firewall)"],
    paintCodeLabel: "BC/CC U or WA",
    detailedSteps: [
      "Open the driver's side door and check the door jamb or door edge",
      "Look for the VIN tag with 'BC/CC' heading",
      "The paint code appears next to 'BC/CC', prefixed with 'U'",
      "Model-specific: Vue (door jamb), Outlook/Relay/Sky (glove box)",
      "Codes usually start with 'WA' or a letter + 4 numbers"
    ],
    notes: "BC/CC stands for basecoat/clearcoat, U stands for upper/body color. VIN does not include paint code."
  },
  {
    brand: "LINCOLN",
    vinTagLocations: ["Driver's side door jamb (B-Pillar)", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb"],
    paintCodeLabel: "EXT PNT",
    detailedSteps: [
      "Open the driver's side door",
      "Look on the edge or door latch pillar (B-Pillar)",
      "Find the Safety Compliance Certification Label",
      "Locate 'EXT PNT:' followed by 2-3 characters",
      "This is your exterior paint code"
    ],
    notes: "Older vehicles may have more than 2 characters. Color codes consist of numbers and/or letters."
  },
  {
    brand: "MERCURY",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Door edge"],
    paintCodeLabel: "EXT PNT or EXTERIOR PAINT",
    detailedSteps: [
      "Open the driver's side door",
      "Look inside the door or beneath where the door latches",
      "Find the VIN number sticker with barcode",
      "Look under the barcode for the paint code",
      "Code appears next to 'EXT PNT:' or above 'EXTERIOR PAINT'"
    ],
    notes: "Paint codes are typically 2 digits (numbers and/or letters) like G3 or UH."
  },
  {
    brand: "RAM",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Firewall (under hood)", "Strut tower", "Radiator area"],
    paintCodeLabel: "PNT or PT",
    detailedSteps: [
      "Open the driver's side door and look on the door jamb",
      "Find the white or silver sticker near the bottom of the jamb",
      "Look at the bottom under the barcode for 'PNT:xxx'",
      "The paint code is typically 3 characters (2-3 digit combination)",
      "Alternative locations: firewall, strut tower, or radiator area under hood"
    ],
    notes: "Paint code is usually 2-3 characters with letters and numbers. Located underneath barcode."
  },

  // JAPANESE BRANDS
  {
    brand: "ACURA",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb"],
    paintCodeLabel: "Color code under barcode",
    detailedSteps: [
      "Open the driver's side door",
      "Look for the sticker on the inside edge of the door jamb near the striker pin",
      "Find the barcode on the sticker",
      "The paint code is directly underneath the barcode",
      "Codes usually start with 'NH' and include letters, dashes, and numbers"
    ],
    notes: "Check for a factory code in the lower right corner or as the 11th digit of VIN for exact color matching."
  },
  {
    brand: "HONDA",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)", "Engine bay (firewall)"],
    paintCodeLocations: ["Driver's side door jamb", "Engine bay firewall"],
    paintCodeLabel: "Color code under barcode",
    detailedSteps: [
      "Open the driver's side door and check the door jamb",
      "Locate the service tag with horizontal barcode",
      "The paint code is directly under the barcode in the very center",
      "If not on door, check the engine bay near the firewall",
      "Check for factory code in lower right corner of tag or as 11th digit of VIN"
    ],
    notes: "Codes are 4-8 characters containing letters and numbers. Factory code may be needed for exact color match."
  },
  {
    brand: "NISSAN",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Passenger side firewall", "Radiator support"],
    paintCodeLabel: "EXT PNT or COLOR",
    detailedSteps: [
      "Open the driver's side door and look on the door jamb (may need to get low to read)",
      "Find the certification label/VIN sticker",
      "Look for 'Exterior Trim Color (EXT PNT)' or 'COLOR'",
      "The paint code is typically 3 digits (e.g., KH3, K23)",
      "Alternative locations: passenger side firewall or radiator support"
    ],
    notes: "If label is removed, call Nissan at 1-800-647-7261 with your VIN for paint code."
  },
  {
    brand: "INFINITI",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Firewall (driver/passenger side)", "Engine compartment"],
    paintCodeLabel: "COLOR",
    detailedSteps: [
      "Open the driver's side door and check the door jamb (may need to look low)",
      "Find the sticker with 'COLOR' heading",
      "The paint code sits just above the barcode",
      "Code is typically 3 letters or letter/number combination",
      "Alternative locations: firewall or engine compartment"
    ],
    notes: "VIN does not include paint code. Sticker may be white, black, or silver."
  },
  {
    brand: "ISUZU",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Firewall (driver/center/passenger)", "Glove box"],
    paintCodeLabel: "COLOR/TRIM",
    detailedSteps: [
      "Open the driver's side door and check the door jamb",
      "If not there, open the hood and check the firewall (all three sections)",
      "Also check inside the glove box",
      "Look for 'COLOR/TRIM' heading",
      "Paint code is 3 digits next to this heading"
    ],
    notes: "Location varies by model (Ascender, Trucks, Rodeo). Check firewall thoroughly including both core supports."
  },
  {
    brand: "TOYOTA",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb"],
    paintCodeLabel: "C/TR",
    detailedSteps: [
      "Open the driver's side door",
      "Look on the door jamb for the certification label",
      "Find 'C/TR:' near the bottom left corner",
      "The paint code directly follows 'C/TR:' (3 digits)",
      "All Toyota models have the code in the same location"
    ],
    notes: "Toyota consistently places codes in the same location. Codes are 3 digits with letters and numbers."
  },
  {
    brand: "LEXUS",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb"],
    paintCodeLabel: "C/TR",
    detailedSteps: [
      "Open the driver's side door",
      "Locate the color ID plate on the door jamb",
      "Find the letters 'C/TR' on the sticker",
      "The next 2-3 letters/numbers after 'C/TR' are the paint code",
      "Code is usually at the bottom right, at the end of the barcode"
    ],
    notes: "Consistent location for all Lexus models. If sticker is missing, call dealer with VIN."
  },
  {
    brand: "MAZDA",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Engine compartment (firewall)"],
    paintCodeLabel: "BODY COLOR CODE or COLOR CODE",
    detailedSteps: [
      "Open the driver's side door and check the door jamb",
      "Find the vehicle information sticker with VIN and barcode",
      "Look under the barcode at the bottom for 'body color code'",
      "The 3-digit code follows this label",
      "If not on door, check the firewall in the engine compartment"
    ],
    notes: "Paint codes are 2-3 characters (letters and numbers) like 46G, 41V, 38L, 16W."
  },
  {
    brand: "MITSUBISHI",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Radiator support", "Firewall (passenger/center/driver side)", "Driver's side door jamb", "Under passenger seat carpet (vans)"],
    paintCodeLabel: "COLOR INT",
    detailedSteps: [
      "Open the hood and check the radiator support first",
      "Check the firewall on all three sections (passenger, center, driver)",
      "If not found, check the driver's side door jamb",
      "For vans, check under the passenger seat carpet",
      "Look for 'COLOR INT' heading - code is at bottom left of sticker"
    ],
    notes: "Paint codes are 3 characters with letters and numbers. Common locations are firewall and radiator support."
  },
  {
    brand: "SUBARU",
    vinTagLocations: ["Passenger side door jamb/door edge", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Passenger side door jamb (most common)", "Driver side strut tower (older models)", "Driver door jamb"],
    paintCodeLabel: "BODY COLOR CODE or COLOR/PAINT/PNT",
    detailedSteps: [
      "Check the passenger side door jamb first (most common for recent models)",
      "Look for the sticker with VIN",
      "At the bottom, find 'body color code' followed by a 3-digit code",
      "For older models, open the hood and check the driver's side strut tower",
      "Alternative: check driver's side door jamb"
    ],
    notes: "Recent models use passenger door jamb. Older models use driver strut tower. Codes are 3 digits (numbers and letters)."
  },
  {
    brand: "SUZUKI",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Driver's side door edge", "Under hood (firewall/fender wall)", "Spare tire cover (Swift)", "Glove box"],
    paintCodeLabel: "COLOR",
    detailedSteps: [
      "Check the driver's side door jamb and door edge",
      "If not there, open the hood and check the firewall",
      "Also check the side by the fender wall close to the firewall",
      "For Swift models, check the spare tire cover",
      "Additional location: glove box",
      "Look for 'COLOR' heading followed by the code"
    ],
    notes: "Codes are typically 3 characters (letters and numbers). Consistent location regardless of model or year."
  },
  {
    brand: "SCION",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb"],
    paintCodeLabel: "C/TR",
    detailedSteps: [
      "Open the driver's side door",
      "Find the color ID plate on the door jamb",
      "Look for the letters 'C/TR:' at the bottom left",
      "The 3-digit code follows 'C/TR:'",
      "Code is underneath the long barcode"
    ],
    notes: "All Scion models have the code in the same location. Codes are 3 digits (letters and numbers). First code is paint, second is trim."
  },

  // KOREAN BRANDS
  {
    brand: "HYUNDAI",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Core support", "Firewall"],
    paintCodeLabel: "PAINT",
    detailedSteps: [
      "Open the driver's side door and check the door jamb",
      "Look for the decal with barcode",
      "Find the word 'PAINT' in the top right corner of the decal",
      "The 2-3 digit code is next to 'PAINT'",
      "Alternative locations: core support or firewall under hood"
    ],
    notes: "Paint codes are 2-3 digits (letters and numbers) like T4, YR7, PR2. Can call dealer with VIN if sticker is missing."
  },
  {
    brand: "KIA",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb"],
    paintCodeLabel: "PAINT or EXTERIOR PAINT COLORS",
    detailedSteps: [
      "Open the driver's side door",
      "Find the VIN label (typically black) on the door jamb",
      "Look for 'PAINT' heading in the top right of the sticker",
      "The 2-3 digit code appears next to or above 'exterior paint colors'",
      "All Kia models have the code in the same location"
    ],
    notes: "Codes are 2-3 digits (letters and numbers) like HO, GWP, 9H. If not found, call Kia dealer."
  },
  {
    brand: "GENESIS",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Door edge", "B-pillar near latch", "Engine compartment"],
    paintCodeLabel: "PAINT or EXT COLOR or PAINT CODE",
    detailedSteps: [
      "Open the driver's side door and check the door jamb",
      "Look on the edge of the door or B-pillar near the latch area",
      "Find the label marked 'PAINT', 'EXT COLOR', or 'PAINT CODE'",
      "The code is typically 2-3 characters (usually letters)",
      "Alternative location: under the hood in engine compartment"
    ],
    notes: "Paint codes are usually 2 letters, sometimes with a number. Examples: AF (Phantom Black Pearl), NGA (Tsukuba Red)."
  },

  // GERMAN BRANDS
  {
    brand: "AUDI",
    vinTagLocations: ["Dashboard (visible through windshield)", "Driver's side door jamb (some models)"],
    paintCodeLocations: ["Spare tire area in trunk", "Trunk spare wheel compartment", "Under trunk carpet"],
    paintCodeLabel: "Paint No. or L-code",
    detailedSteps: [
      "Open the trunk and locate the spare tire area",
      "Look for a white paper tag or sticker in the spare wheel compartment",
      "Check underneath the trunk carpet on the right side",
      "The paint code is in the middle of the sticker referred to as 'Paint No.'",
      "Code may include or omit the 'L' prefix (e.g., LY9K or Y9K)"
    ],
    notes: "Unlike most manufacturers, Audi uses trunk/spare tire area. Paper tags can fall off and disappear. Not on door jamb."
  },
  {
    brand: "BMW",
    vinTagLocations: ["Driver's side door jamb (newer models)", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb (newer models)", "Under hood on driver side shock tower (older models)"],
    paintCodeLabel: "Paint or Farbcode or Color or Lacknummer",
    detailedSteps: [
      "For newer BMWs: Open driver's door and check the door jamb area",
      "Look at the bottom right of the VIN label for the paint code",
      "Code is labeled as 'Paint', 'Farbcode', 'Color', or 'Lacknummer'",
      "For older models: Open hood and check driver side shock tower",
      "Code is 3 digits, bottom left corner of tag (older models)"
    ],
    notes: "BMW changed from shock tower (older) to door jamb (newer). Code is usually 3 digits, sometimes with letter or German color name."
  },
  {
    brand: "MERCEDES",
    vinTagLocations: ["Driver's side door jamb/B-pillar", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb/B-pillar", "Radiator crossover/support bar (older models)", "Engine compartment hood underside"],
    paintCodeLabel: "PAINT or C/TR",
    detailedSteps: [
      "Open the driver's side door and look on the door jamb/B-pillar",
      "Find the black and white sticker on the inner edge facing the driver's seat",
      "Look for 'PAINT' or 'C/TR' - code is the 4th group of numbers at top",
      "Code is typically 3 digits (numbers only)",
      "For older models: check radiator crossover or under hood"
    ],
    notes: "Newer models use door jamb. Older models have paint code stamped on metal plate on slam panel. Codes are 3 numbers."
  },
  {
    brand: "PORSCHE",
    vinTagLocations: ["Driver's door edge", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Spare tire area (most models)", "Driver's door edge", "Frunk or trunk", "Glove compartment", "Service/warranty booklet"],
    paintCodeLabel: "Paint code on white/silver label",
    detailedSteps: [
      "Most Porsche models: Check around the spare tire area",
      "Look for a white or silver label (often paper that can fall off)",
      "Cayenne models: Check inside the boot",
      "Alternative locations: door jamb, frunk, trunk, glove compartment",
      "Check the first page of owner's manual or service booklet"
    ],
    notes: "Difficult to find - paper tags often fall off. Not on Cayenne door jamb. Contact Porsche dealer with last 8 VIN digits if not found."
  },
  {
    brand: "VOLKSWAGEN",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb (below door lock strike plate)", "Door edge", "Trunk (deck lid, fuse box cover, spare tire well)", "Under hood (firewall)", "Glove compartment"],
    paintCodeLabel: "Paint Code or Color Code or Farbcode",
    detailedSteps: [
      "Check the driver's side door jamb below the door lock strike plate",
      "Look for a sticker on the edge of the door",
      "If not there, check the trunk: under deck lid, fuse box cover, spare tire well",
      "Additional location: under hood near firewall",
      "Code is 3-4 digit alphanumeric (e.g., LC5, LY9)",
      "May be labeled as 'Paint Code', 'Color Code', or 'Farbcode'"
    ],
    notes: "VW is notorious for not having paint code stickers on some newer models. Check owner's manual or contact VW dealer with VIN."
  },
  {
    brand: "MINI",
    vinTagLocations: ["Driver's side door jamb (some models)", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Under hood on right-hand side (driver side) inner fender above tire", "Passenger door jamb (2nd gen)", "Firewall/strut tower", "VIN tag"],
    paintCodeLabel: "Paint code (3-4 digit alphanumeric)",
    detailedSteps: [
      "Open the hood and look on the right-hand side (driver side)",
      "Find the sticker on the inner fender wall above the tire",
      "For 2nd generation: Check passenger-side door jamb for black label",
      "If paint code tag is missing, check VIN tag bottom right corner",
      "Code is typically 3-4 digit alphanumeric, often with 'A' or 'B' prefix (e.g., A94, A88)"
    ],
    notes: "Unlike most cars, MINI uses under-hood location. Some newer models don't have paint code decals - dealer can look up from VIN."
  },
  {
    brand: "SMART",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Firewall under hood", "Trunk lid area"],
    paintCodeLabel: "Code above barcode (no specific label)",
    detailedSteps: [
      "Check the driver's side door jamb on the VIN sticker",
      "Look on the right-hand side of the tag near the bottom, just above the bar code",
      "The code appears without a header to identify it",
      "Code is 3-4 digits (letters and/or numbers) like 9696, C46L, EA4",
      "Alternative locations: firewall under hood or trunk lid"
    ],
    notes: "Paint code often has no identifying label - positioned just above barcode on right side of VIN tag."
  },

  // EUROPEAN BRANDS
  {
    brand: "VOLVO",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Rear passenger side door jamb (some models)", "Under hood (firewall, strut tower, radiator support)"],
    paintCodeLabel: "Paint code under VIN on right side (no header)",
    detailedSteps: [
      "Open the driver's side door and check the door jamb",
      "Some models: check rear passenger side door jamb",
      "Find the VIN sticker and look underneath it on the right-hand side",
      "The paint code is 3 numbers only (e.g., 707, 614, 477, 426)",
      "Alternative locations: firewall, strut tower, or radiator support under hood"
    ],
    notes: "Codes are always 3 digits (numbers only). Volvo doesn't indicate the code with a heading. Ignore dashes and additional numbers."
  },
  {
    brand: "SAAB",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Driver's side door edge", "Glove box", "Spare tire compartment", "Firewall (passenger or driver side)", "Radiator support"],
    paintCodeLabel: "BODY COLOR",
    detailedSteps: [
      "Check the driver's side door jamb first",
      "If not there, check the driver's side door edge",
      "Other locations: glove box, spare tire compartment",
      "Under hood: check firewall (both sides) and radiator support",
      "Look for 'BODY COLOR' heading - code is to the right"
    ],
    notes: "Paint codes are typically 3 numbers but can be longer and include letters. Check all locations thoroughly."
  },
  {
    brand: "ALFA",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Door shut/jamb (newer models)", "Left or right front door sill above latch striker plate", "Under bonnet (older models)", "Boot lid", "Door frame"],
    paintCodeLabel: "Paint code on chrome sticker or VIN sticker",
    detailedSteps: [
      "For newer models: Check the door shut/jamb area",
      "Look on the left or right front door sill above the door latch striker plate",
      "For older models: Check under the bonnet (hood)",
      "Alternative locations: boot lid or door frame",
      "Code is 3-4 digits, may be letter/number combination on chrome sticker"
    ],
    notes: "Location varies by model age. Can call Parts Department with registration to obtain code if sticker not found."
  },
  {
    brand: "FIAT",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "Under hood (firewall)", "Trunk lid (underside)", "Spare tire area", "Boot lid", "Under bonnet"],
    paintCodeLabel: "Code",
    detailedSteps: [
      "Check the driver's side doorframe/door jamb first (newer models)",
      "Look for chrome sticker next to 'Code' heading",
      "If not there, check trunk: underside of lid or spare tire area",
      "Under hood: check the firewall",
      "Code is 3-4 digits, may be letter/number combination (e.g., 601, 268A, 695, 842B)"
    ],
    notes: "Fiat makes spotting the code easy with 'Code' heading. May include color name. Common formats: 3-4 digits or letter/number combos."
  },
  {
    brand: "JAGUAR",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb", "B-pillar", "Inside edge of driver's door (older cars)"],
    paintCodeLabel: "PAINT",
    detailedSteps: [
      "Open the driver's side door and check the door jamb",
      "Look for VIN sticker (white, black, or silver)",
      "Find 'PAINT' heading at the bottom of the tag next to VIN",
      "Code is 3-4 digits (letters and/or numbers only)",
      "Some users report finding code on bottom of passenger B-pillar",
      "For older models: check inside edge of driver's door"
    ],
    notes: "Factory paint codes are ALWAYS 3-letter codes. On older cars, code can be anywhere. Contact dealer if tag missing."
  },
  {
    brand: "LAND ROVER",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb (later models)", "Radiator support bar (older models)", "Door edge", "Under hood", "Owner's manual"],
    paintCodeLabel: "Paint code on build sticker",
    detailedSteps: [
      "Later models: Open driver's side door and check the door jamb",
      "Look on the door edge for the build sticker - bottom left has 3-digit number",
      "Older models: Open hood and check radiator support bar",
      "Look for a separate black card with written color and paint code underneath",
      "Alternative: check owner's manual or VIN label under hood"
    ],
    notes: "Newer models use door jamb, older use radiator support. Codes vary in length (e.g., LRC867, 867/1AA/NER, HAF)."
  },

  // EMERGING BRANDS
  {
    brand: "TESLA",
    vinTagLocations: ["Driver's side door jamb (US/non-China)", "Passenger side door jamb (China-manufactured)", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb (US/non-China)", "Passenger side door jamb (China-manufactured)"],
    paintCodeLabel: "PNT",
    detailedSteps: [
      "For US-manufactured vehicles: Open driver's side door and check door jamb",
      "For China-manufactured vehicles: Check passenger side door jamb",
      "Find the manufacturing certification label",
      "Look in the lower left-hand corner by the letters 'PNT'",
      "Code is 4 letters (e.g., PPSR, PMMB, PPMR)"
    ],
    notes: "Paint code location varies by manufacturing location. All Tesla paint codes are 4 letters. Can also check Tesla app or contact Service Center."
  },
  {
    brand: "RIVIAN",
    vinTagLocations: ["Driver's side door jamb", "Dashboard (visible through windshield)"],
    paintCodeLocations: ["Driver's side door jamb (likely)", "Vehicle settings screen (Settings/About)"],
    paintCodeLabel: "TBD",
    detailedSteps: [
      "Check the driver's side door jamb for VIN plate (halfway down door)",
      "Look for paint code on the same sticker as VIN and tire specifications",
      "Alternative: Check vehicle settings screen in the vehicle (Settings/About)",
      "If not found, use window sticker lookup service with VIN",
      "Contact Rivian dealership with VIN for paint code"
    ],
    notes: "Limited documentation available. VIN plate contains tire info and specs. Paint code may be available via vehicle screen or window sticker lookup."
  }
];

/**
 * Get paint code location information for a specific brand
 */
export function getPaintCodeLocationByBrand(brand: string): PaintCodeLocation | undefined {
  return paintCodeLocations.find(
    (location) => location.brand.toLowerCase() === brand.toLowerCase()
  );
}

/**
 * Get all brands with paint code location data
 */
export function getAllBrands(): string[] {
  return paintCodeLocations.map((location) => location.brand);
}
