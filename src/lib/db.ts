import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initial data templates
const INITIAL_EVENTS = [
  {
    month: "May",
    monthFull: "May",
    day: "07",
    title: "Welcome Tea — Founding Fifty",
    host: "Hosted by the founding hosts",
    location: "Mirador Clubhouse",
    time: "4:00 – 6:00 PM"
  },
  {
    month: "May",
    monthFull: "May",
    day: "14",
    title: "Levantine Mezze Afternoon",
    host: "Hosted by Samira",
    location: "Mirador Garden",
    time: "4:00 – 6:30 PM"
  },
  {
    month: "May",
    monthFull: "May",
    day: "21",
    title: "Watercolour Florals — Beginners Welcome",
    host: "Hosted by Priya",
    location: "Community Centre",
    time: "4:00 – 6:00 PM"
  },
  {
    month: "May",
    monthFull: "May",
    day: "28",
    title: "Garden Walk & Herb Cuttings Exchange",
    host: "Hosted by Margaret",
    location: "Saheel — Margaret's home",
    time: "8:30 – 10:30 AM"
  },
  {
    month: "Jun",
    monthFull: "June",
    day: "04",
    title: "Persian Tea & Poetry",
    host: "Hosted by Roya",
    location: "Alvorada Clubhouse",
    time: "4:30 – 6:30 PM"
  },
  {
    month: "Jun",
    monthFull: "June",
    day: "11",
    title: "Sourdough Workshop",
    host: "Hosted by Helen",
    location: "Hattan — Helen's kitchen",
    time: "10:00 AM – 12:30 PM"
  },
  {
    month: "Jun",
    monthFull: "June",
    day: "18",
    title: "Crochet Circle — Granny Squares",
    host: "Hosted by Aisha",
    location: "Saheel Community Room",
    time: "4:00 – 6:00 PM"
  },
  {
    month: "Jun",
    monthFull: "June",
    day: "25",
    title: "Memoir Writing — Our First Stories",
    host: "Hosted by Elaine",
    location: "Polo Café",
    time: "10:00 AM – 12:00 PM"
  },
  {
    month: "Jul",
    monthFull: "July",
    day: "02",
    title: "Indoor Plant Propagation",
    host: "Hosted by Anjali",
    location: "Terra Nova — Anjali's home",
    time: "4:30 – 6:30 PM"
  },
  {
    month: "Jul",
    monthFull: "July",
    day: "09",
    title: "Calligraphy & Cardmaking",
    host: "Hosted by Noor",
    location: "Community Centre",
    time: "4:00 – 6:00 PM"
  },
  {
    month: "Jul",
    monthFull: "July",
    day: "16",
    title: "Summer Gazpacho Cook-Along",
    host: "Hosted by Carmen",
    location: "Mirador — Carmen's kitchen",
    time: "5:00 – 7:00 PM"
  }
];

const INITIAL_GALLERY = [
  {
    month: "April 2026",
    title: "Spring Mezze Afternoon",
    meta: "18 ladies · Hosted by Samira",
    photos: "24 photos",
    g1: "#b8533a",
    g2: "#d9a48a",
    deco: "mezze"
  },
  {
    month: "April 2026",
    title: "First Crochet Circle",
    meta: "12 ladies · Hosted by Aisha",
    photos: "16 photos",
    g1: "#8f3d29",
    g2: "#c79a4b",
    deco: "yarn"
  },
  {
    month: "March 2026",
    title: "Rose Garden Walk",
    meta: "22 ladies · At Roya's home",
    photos: "31 photos",
    g1: "#6b6b3a",
    g2: "#c79a4b",
    deco: "leaves"
  },
  {
    month: "March 2026",
    title: "Watercolour Sunday",
    meta: "14 ladies · Community Centre",
    photos: "19 photos",
    g1: "#d9a48a",
    g2: "#b8533a",
    deco: "flower"
  },
  {
    month: "February 2026",
    title: "Persian Tea & Poetry",
    meta: "20 ladies · Alvorada Clubhouse",
    photos: "27 photos",
    g1: "#8f3d29",
    g2: "#b8533a",
    deco: "leaves"
  },
  {
    month: "February 2026",
    title: "Knit-Along — Winter Shawls",
    meta: "11 ladies · Hattan",
    photos: "14 photos",
    g1: "#6b6b3a",
    g2: "#8f3d29",
    deco: "yarn"
  }
];

const INITIAL_RECOGNITION = {
  buddyOfWeek: {
    name: "Leila Khoury",
    role: "Saheel, 62",
    avatar: "L",
    story: "Leila drove Margaret to three hospital appointments this week, sat with her through each one, and brought her homemade lentil soup afterwards. Quietly, without being asked twice.",
    attribution: "— nominated by Margaret & the founding hosts"
  },
  buddyOfMonth: {
    title: "Star Buddy of the Month — Vote",
    description: "Four wonderful buddies have been nominated this month. Cast your vote — voting closes the last Sunday of the month.",
    note: "One vote per member. The Star Buddy receives a hand-written letter and her name on our Wall of Hearts.",
    nominees: [
      {
        id: "aisha",
        initial: "A",
        name: "Aisha Rahman",
        reason: "for hosting weekly crochet circles",
        votes: 12
      },
      {
        id: "helen",
        initial: "H",
        name: "Helen Pereira",
        reason: "for tech help & weekly grocery runs",
        votes: 9
      },
      {
        id: "roya",
        initial: "R",
        name: "Roya Tehrani",
        reason: "for welcoming three new members",
        votes: 15
      },
      {
        id: "samira",
        initial: "S",
        name: "Samira Khan",
        reason: "for cooking-together sessions",
        votes: 7
      }
    ]
  }
};

let isInitialized = false;

// Ensure database tables exist and seed them if empty
export async function ensureInitialized() {
  if (isInitialized) return;

  const client = await pool.connect();
  try {
    // 1. Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        day VARCHAR(5),
        month VARCHAR(10),
        month_full VARCHAR(20),
        title TEXT PRIMARY KEY,
        host TEXT,
        location TEXT,
        time TEXT,
        bring_options JSONB DEFAULT '[]'::jsonb
      )
    `);

    await client.query(`
      ALTER TABLE events ADD COLUMN IF NOT EXISTS bring_options JSONB DEFAULT '[]'::jsonb
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        month VARCHAR(30),
        title TEXT PRIMARY KEY,
        meta TEXT,
        photos VARCHAR(20),
        g1 VARCHAR(10),
        g2 VARCHAR(10),
        deco VARCHAR(20),
        cover_photo TEXT,
        images JSONB DEFAULT '[]'::jsonb
      )
    `);

    await client.query(`
      ALTER TABLE gallery ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb
    `);

    await client.query(`
      ALTER TABLE gallery ADD COLUMN IF NOT EXISTS cover_photo TEXT
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS recognition (
        key VARCHAR(30) PRIMARY KEY,
        data JSONB
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(50) PRIMARY KEY,
        submitted_at TIMESTAMP,
        form_type VARCHAR(20),
        name TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        age TEXT,
        registering TEXT,
        free TEXT,
        often TEXT,
        share_list JSONB,
        learn_list JSONB,
        help_list JSONB,
        need_list JSONB,
        note TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        assigned_buddy_id VARCHAR(50),
        assigned_buddy_name TEXT,
        assigned_buddy_phone TEXT
      )
    `);

    await client.query(`
      ALTER TABLE submissions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'
    `);

    await client.query(`
      ALTER TABLE submissions
        ADD COLUMN IF NOT EXISTS assigned_buddy_id VARCHAR(50),
        ADD COLUMN IF NOT EXISTS assigned_buddy_name TEXT,
        ADD COLUMN IF NOT EXISTS assigned_buddy_phone TEXT
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS snapshots (
        id VARCHAR(50) PRIMARY KEY,
        image_url TEXT,
        caption TEXT,
        p1 VARCHAR(10),
        p2 VARCHAR(10),
        rotation INTEGER,
        margin_top VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS team (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100),
        role VARCHAR(100),
        location VARCHAR(100),
        bio TEXT,
        image TEXT,
        g1 VARCHAR(10),
        g2 VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS rsvps (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        event_title TEXT REFERENCES events(title) ON DELETE CASCADE,
        whatsapp TEXT,
        bring_items JSONB DEFAULT '[]'::jsonb,
        status VARCHAR(20) DEFAULT 'pending',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP
      )
    `);

    await client.query(`
      ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS whatsapp TEXT
    `);

    await client.query(`
      ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS bring_items JSONB DEFAULT '[]'::jsonb
    `);

    // 2. Seed default data if empty
    const eventsCount = await client.query("SELECT COUNT(*) FROM events");
    if (parseInt(eventsCount.rows[0].count) === 0) {
      for (const e of INITIAL_EVENTS) {
        await client.query(
          "INSERT INTO events (month, month_full, day, title, host, location, time) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING",
          [e.month, e.monthFull, e.day, e.title, e.host, e.location, e.time]
        );
      }
    }

    const galleryCount = await client.query("SELECT COUNT(*) FROM gallery");
    if (parseInt(galleryCount.rows[0].count) === 0) {
      for (const item of INITIAL_GALLERY) {
        await client.query(
          "INSERT INTO gallery (month, title, meta, photos, g1, g2, deco) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING",
          [item.month, item.title, item.meta, item.photos, item.g1, item.g2, item.deco]
        );
      }
    }

    const recCount = await client.query("SELECT COUNT(*) FROM recognition");
    if (parseInt(recCount.rows[0].count) === 0) {
      await client.query(
        "INSERT INTO recognition (key, data) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        ["buddy_data", JSON.stringify(INITIAL_RECOGNITION)]
      );
    }

    const snapshotsCount = await client.query("SELECT COUNT(*) FROM snapshots");
    if (parseInt(snapshotsCount.rows[0].count) === 0) {
      const INITIAL_SNAPSHOTS = [
        {
          id: "seed-1",
          image_url: null,
          caption: "Persian Tea\n& Poetry",
          p1: "#b8533a",
          p2: "#d9a48a",
          rotation: -4,
          margin_top: "30px"
        },
        {
          id: "seed-2",
          image_url: null,
          caption: "Crochet\nCircle",
          p1: "#8f3d29",
          p2: "#c79a4b",
          rotation: 2,
          margin_top: "0px"
        },
        {
          id: "seed-3",
          image_url: null,
          caption: "Garden Walk\n& Cuttings",
          p1: "#6b6b3a",
          p2: "#c79a4b",
          rotation: -2,
          margin_top: "40px"
        },
        {
          id: "seed-4",
          image_url: null,
          caption: "Sourdough\nWednesdays",
          p1: "#d9a48a",
          p2: "#b8533a",
          rotation: 5,
          margin_top: "10px"
        }
      ];
      for (const s of INITIAL_SNAPSHOTS) {
        await client.query(
          "INSERT INTO snapshots (id, image_url, caption, p1, p2, rotation, margin_top) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING",
          [s.id, s.image_url, s.caption, s.p1, s.p2, s.rotation, s.margin_top]
        );
      }
    }

    const teamCount = await client.query("SELECT COUNT(*) FROM team");
    if (parseInt(teamCount.rows[0].count) === 0) {
      const INITIAL_TEAM = [
        {
          id: "member-1",
          name: "Linda",
          role: "~ Book Club Host ~",
          location: "Mirador · 42",
          bio: "Avid reader who loves sharing stories and hosting weekend book club discussions over homemade cookies.",
          image: "/team/linda.jpg",
          g1: "#d9a48a",
          g2: "#b8533a"
        },
        {
          id: "member-2",
          name: "Dimple",
          role: "~ Yoga & Wellness ~",
          location: "Saheel · 38",
          bio: "Certified yoga instructor passionate about helping neighbours find peace and mindfulness in their lives.",
          image: "/team/dimple.jpg",
          g1: "#c79a4b",
          g2: "#8f3d29"
        },
        {
          id: "member-3",
          name: "Meghna",
          role: "~ Gardening Enthusiast ~",
          location: "Alvorada · 47",
          bio: "Transforms desert yards into blooming sanctuaries and leads our community gardening and seed sharing workshops.",
          image: "/team/meghna.jpg",
          g1: "#6b6b3a",
          g2: "#c79a4b"
        },
        {
          id: "member-4",
          name: "Maya",
          role: "~ Cooking Circles ~",
          location: "Hattan · 12",
          bio: "Brings people together through cooking masterclasses and culinary storytelling sessions featuring global flavours.",
          image: "/team/maya.jpg",
          g1: "#b8533a",
          g2: "#d9a48a"
        },
        {
          id: "member-5",
          name: "Sandya",
          role: "~ Youth Mentor ~",
          location: "Mirador · 15",
          bio: "Retired school counsellor who organises youth tutoring networks and summer camps for the neighborhood children.",
          image: "/team/sandya.jpg",
          g1: "#8f3d29",
          g2: "#c79a4b"
        }
      ];
      for (const m of INITIAL_TEAM) {
        await client.query(
          "INSERT INTO team (id, name, role, location, bio, image, g1, g2) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING",
          [m.id, m.name, m.role, m.location, m.bio, m.image, m.g1, m.g2]
        );
      }
    }

    isInitialized = true;
  } catch (err) {
    console.error("Database initialization failed:", err);
    throw err;
  } finally {
    client.release();
  }
}

// Events DB functions
export async function getEvents() {
  await ensureInitialized();
  const res = await pool.query("SELECT * FROM events");
  return res.rows.map((row: any) => ({
    day: row.day,
    month: row.month,
    monthFull: row.month_full,
    title: row.title,
    host: row.host,
    location: row.location,
    time: row.time,
    bringOptions: row.bring_options || []
  }));
}

export async function saveEvents(events: any[]) {
  await ensureInitialized();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const e of events) {
      await client.query(
        `INSERT INTO events (month, month_full, day, title, host, location, time, bring_options)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (title) DO UPDATE SET
           month = EXCLUDED.month,
           month_full = EXCLUDED.month_full,
           day = EXCLUDED.day,
           host = EXCLUDED.host,
           location = EXCLUDED.location,
           time = EXCLUDED.time,
           bring_options = EXCLUDED.bring_options`,
        [e.month, e.monthFull, e.day, e.title, e.host, e.location, e.time, JSON.stringify(e.bringOptions || [])]
      );
    }
    const titles = events.map((event) => event.title);
    if (titles.length === 0) {
      await client.query("DELETE FROM events");
    } else {
      await client.query("DELETE FROM events WHERE NOT (title = ANY($1::text[]))", [titles]);
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Gallery DB functions
export async function getGallery() {
  await ensureInitialized();
  const res = await pool.query("SELECT * FROM gallery");
  return res.rows.map((row: any) => ({
    month: row.month,
    title: row.title,
    meta: row.meta,
    photos: row.photos,
    g1: row.g1,
    g2: row.g2,
    deco: row.deco,
    coverPhoto: row.cover_photo || "",
    images: row.images ? (typeof row.images === "string" ? JSON.parse(row.images) : row.images) : []
  }));
}

export async function saveGallery(gallery: any[]) {
  await ensureInitialized();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM gallery");
    for (const item of gallery) {
      await client.query(
        "INSERT INTO gallery (month, title, meta, photos, g1, g2, deco, cover_photo, images) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [
          item.month,
          item.title,
          item.meta,
          item.photos,
          item.g1,
          item.g2,
          item.deco,
          item.coverPhoto || "",
          JSON.stringify(item.images || [])
        ]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Recognition DB functions
export async function getRecognition() {
  await ensureInitialized();
  const res = await pool.query("SELECT data FROM recognition WHERE key = 'buddy_data'");
  if (res.rows.length === 0) return INITIAL_RECOGNITION;
  return res.rows[0].data;
}

export async function saveRecognition(recognition: any) {
  await ensureInitialized();
  await pool.query(
    "INSERT INTO recognition (key, data) VALUES ('buddy_data', $1) ON CONFLICT (key) DO UPDATE SET data = $1",
    [JSON.stringify(recognition)]
  );
}

// Submissions DB functions
export async function getSubmissions() {
  await ensureInitialized();
  const res = await pool.query("SELECT * FROM submissions ORDER BY submitted_at DESC");
  return res.rows.map((row: any) => ({
    id: row.id,
    submittedAt: row.submitted_at,
    formType: row.form_type,
    name: row.name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    age: row.age,
    registering: row.registering,
    free: row.free,
    often: row.often,
    shareList: row.share_list || [],
    learnList: row.learn_list || [],
    helpList: row.help_list || [],
    needList: row.need_list || [],
    note: row.note,
    status: row.status || "pending",
    assignedBuddyId: row.assigned_buddy_id,
    assignedBuddyName: row.assigned_buddy_name,
    assignedBuddyPhone: row.assigned_buddy_phone
  }));
}

export async function saveSubmission(submission: any) {
  await ensureInitialized();
  await pool.query(
    `INSERT INTO submissions (
      id, submitted_at, form_type, name, phone, email, address, age, registering, free, often, share_list, learn_list, help_list, need_list, note, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
    [
      submission.id,
      submission.submittedAt || new Date().toISOString(),
      submission.formType,
      submission.name || null,
      submission.phone || null,
      submission.email || null,
      submission.address || null,
      submission.age || null,
      submission.registering || null,
      submission.free || null,
      submission.often || null,
      JSON.stringify(submission.shareList || []),
      JSON.stringify(submission.learnList || []),
      JSON.stringify(submission.helpList || []),
      JSON.stringify(submission.needList || []),
      submission.note || null,
      submission.status || "pending"
    ]
  );
}

export async function updateSubmissionStatus(id: string, status: string) {
  await ensureInitialized();
  const res = await pool.query(
    "UPDATE submissions SET status = $1 WHERE id = $2 RETURNING *",
    [status, id]
  );
  if (res.rows.length === 0) return null;
  return res.rows[0];
}

export async function assignBuddyToRequest(requestId: string, buddyId: string) {
  await ensureInitialized();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const requestResult = await client.query(
      "SELECT * FROM submissions WHERE id = $1 FOR UPDATE",
      [requestId]
    );
    const buddyResult = await client.query(
      "SELECT * FROM submissions WHERE id = $1 FOR UPDATE",
      [buddyId]
    );

    const buddyRequest = requestResult.rows[0];
    const buddy = buddyResult.rows[0];
    if (!buddyRequest || buddyRequest.form_type !== "request-buddy") {
      throw new Error("Buddy request not found");
    }
    if (buddyRequest.status !== "pending") {
      throw new Error("This buddy request has already been processed");
    }
    if (!buddy || buddy.form_type !== "become-buddy" || buddy.status !== "approved") {
      throw new Error("The selected buddy is not available");
    }

    const existingAssignment = await client.query(
      "SELECT id FROM submissions WHERE assigned_buddy_id = $1 AND status = 'assigned' LIMIT 1",
      [buddyId]
    );
    if (existingAssignment.rows.length > 0) {
      throw new Error("The selected buddy has already been assigned");
    }

    const updated = await client.query(
      `UPDATE submissions
       SET status = 'assigned', assigned_buddy_id = $1, assigned_buddy_name = $2, assigned_buddy_phone = $3
       WHERE id = $4
       RETURNING *`,
      [buddy.id, buddy.name, buddy.phone, requestId]
    );

    await client.query("COMMIT");
    return updated.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Snapshots DB functions
export async function getSnapshots() {
  await ensureInitialized();
  const res = await pool.query("SELECT * FROM snapshots ORDER BY created_at ASC");
  return res.rows.map((row: any) => ({
    id: row.id,
    imageUrl: row.image_url,
    caption: row.caption,
    p1: row.p1,
    p2: row.p2,
    rotation: row.rotation,
    marginTop: row.margin_top,
    createdAt: row.created_at
  }));
}

export async function addSnapshot(s: any) {
  await ensureInitialized();
  await pool.query(
    `INSERT INTO snapshots (id, image_url, caption, p1, p2, rotation, margin_top)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      s.id || Date.now().toString(),
      s.imageUrl || null,
      s.caption || "",
      s.p1 || "#b8533a",
      s.p2 || "#d9a48a",
      s.rotation || 0,
      s.marginTop || "0px"
    ]
  );
}

export async function deleteSnapshot(id: string) {
  await ensureInitialized();
  await pool.query("DELETE FROM snapshots WHERE id = $1", [id]);
}

// Team DB functions
export async function getTeamMembers() {
  await ensureInitialized();
  const res = await pool.query("SELECT * FROM team ORDER BY created_at ASC");
  return res.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    location: row.location,
    bio: row.bio,
    image: row.image,
    g1: row.g1,
    g2: row.g2,
    createdAt: row.created_at
  }));
}

export async function addTeamMember(m: any) {
  await ensureInitialized();
  await pool.query(
    `INSERT INTO team (id, name, role, location, bio, image, g1, g2)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (id) DO UPDATE 
     SET name = EXCLUDED.name, role = EXCLUDED.role, location = EXCLUDED.location, 
         bio = EXCLUDED.bio, image = COALESCE(EXCLUDED.image, team.image), g1 = EXCLUDED.g1, g2 = EXCLUDED.g2`,
    [
      m.id || Date.now().toString(),
      m.name,
      m.role,
      m.location,
      m.bio,
      m.image || null,
      m.g1 || "#d9a48a",
      m.g2 || "#b8533a"
    ]
  );
}

export async function deleteTeamMember(id: string) {
  await ensureInitialized();
  await pool.query("DELETE FROM team WHERE id = $1", [id]);
}

// Users, Sessions, RSVPs DB functions
export async function findOrCreateUser(sub: string, email: string, name: string, picture: string) {
  await ensureInitialized();
  await pool.query(
    `INSERT INTO users (id, email, name, picture)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE
     SET email = EXCLUDED.email, name = EXCLUDED.name, picture = EXCLUDED.picture`,
    [sub, email, name, picture]
  );
  return { id: sub, email, name, picture };
}

export async function createSession(userId: string, token: string, expiresAt: Date) {
  await ensureInitialized();
  await pool.query(
    `INSERT INTO sessions (id, user_id, expires_at)
     VALUES ($1, $2, $3)`,
    [token, userId, expiresAt]
  );
}

export async function getSessionUser(token: string) {
  await ensureInitialized();
  const res = await pool.query(
    `SELECT u.* FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.id = $1 AND s.expires_at > CURRENT_TIMESTAMP`,
    [token]
  );
  if (res.rows.length === 0) return null;
  return res.rows[0];
}

export async function deleteSession(token: string) {
  await ensureInitialized();
  await pool.query("DELETE FROM sessions WHERE id = $1", [token]);
}

export async function getUserRsvps(userId: string) {
  await ensureInitialized();
  const res = await pool.query(
    "SELECT event_title, status FROM rsvps WHERE user_id = $1",
    [userId]
  );
  return res.rows;
}

export async function createRsvp(id: string, userId: string, eventTitle: string, whatsapp: string, bringItems: string[] = []) {
  await ensureInitialized();
  await pool.query(
    `INSERT INTO rsvps (id, user_id, event_title, whatsapp, bring_items, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')`,
    [id, userId, eventTitle, whatsapp, JSON.stringify(bringItems)]
  );
}

export async function getAllRsvps() {
  await ensureInitialized();
  const res = await pool.query(
    `SELECT r.id, r.event_title, r.whatsapp, r.bring_items, r.status, r.submitted_at, r.approved_at,
            u.name as user_name, u.email as user_email, u.picture as user_picture,
            e.host as event_host, e.location as event_location, e.time as event_time,
            e.day as event_day, e.month as event_month, e.month_full as event_month_full
     FROM rsvps r
     JOIN users u ON r.user_id = u.id
     LEFT JOIN events e ON r.event_title = e.title
     ORDER BY r.submitted_at DESC`
  );
  return res.rows.map((row: any) => ({
    id: row.id,
    eventTitle: row.event_title,
    whatsapp: row.whatsapp,
    bringItems: row.bring_items || [],
    status: row.status,
    submittedAt: row.submitted_at,
    approvedAt: row.approved_at,
    userName: row.user_name,
    userEmail: row.user_email,
    userPicture: row.user_picture,
    eventHost: row.event_host,
    eventLocation: row.event_location,
    eventTime: row.event_time,
    eventDay: row.event_day,
    eventMonth: row.event_month,
    eventMonthFull: row.event_month_full
  }));
}

export async function updateRsvpStatus(id: string, status: string) {
  await ensureInitialized();
  
  // Update status
  const queryText = status === "approved" 
    ? "UPDATE rsvps SET status = $1, approved_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *"
    : "UPDATE rsvps SET status = $1, approved_at = NULL WHERE id = $2 RETURNING *";
    
  const rsvpRes = await pool.query(queryText, [status, id]);
  if (rsvpRes.rows.length === 0) return null;
  
  const rsvp = rsvpRes.rows[0];
  
  // Get user details
  const userRes = await pool.query("SELECT name, email FROM users WHERE id = $1", [rsvp.user_id]);
  const user = userRes.rows[0];
  
  return {
    id: rsvp.id,
    eventTitle: rsvp.event_title,
    whatsapp: rsvp.whatsapp,
    status: rsvp.status,
    userName: user.name,
    userEmail: user.email
  };
}
