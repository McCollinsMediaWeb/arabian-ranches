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
        time TEXT
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        month VARCHAR(30),
        title TEXT PRIMARY KEY,
        meta TEXT,
        photos VARCHAR(20),
        g1 VARCHAR(10),
        g2 VARCHAR(10),
        deco VARCHAR(20)
      )
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
        note TEXT
      )
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
  return res.rows;
}

export async function saveEvents(events: any[]) {
  await ensureInitialized();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM events");
    for (const e of events) {
      await client.query(
        "INSERT INTO events (month, month_full, day, title, host, location, time) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [e.month, e.monthFull, e.day, e.title, e.host, e.location, e.time]
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

// Gallery DB functions
export async function getGallery() {
  await ensureInitialized();
  const res = await pool.query("SELECT * FROM gallery");
  return res.rows;
}

export async function saveGallery(gallery: any[]) {
  await ensureInitialized();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM gallery");
    for (const item of gallery) {
      await client.query(
        "INSERT INTO gallery (month, title, meta, photos, g1, g2, deco) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [item.month, item.title, item.meta, item.photos, item.g1, item.g2, item.deco]
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
    note: row.note
  }));
}

export async function saveSubmission(submission: any) {
  await ensureInitialized();
  await pool.query(
    `INSERT INTO submissions (
      id, submitted_at, form_type, name, phone, email, address, age, registering, free, often, share_list, learn_list, help_list, need_list, note
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
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
      submission.note || null
    ]
  );
}
