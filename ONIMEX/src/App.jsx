import { useState, useEffect } from "react";
import "./App.css";
import oinme_image from './assets/onime4.jpg'
import onime1_image from   './assets/young1.jpg'
import onime2_image from   './assets/young2.jpg'
import onime3_image from   './assets/icmc.jpg'

import onime4_image from   './assets/21years.jpeg'
import onime5_image from   './assets/function_1999.jpeg'
import onime6_image from   './assets/with_children.jpg'
import onime7_image from   './assets/specka.jpg'
import onime8_image from   './assets/ibafohouse1.jpg'
import onime9_image from   './assets/rehoboth.jpg'
import onime10_image from   './assets/onime9.jpg'
import onime11_image from   './assets/minister.jpg'
import onime12_image from   './assets/asase.jpg'
import onime13_image from   './assets/office.jpg'
import onime14_image from   './assets/wecan1.jpg'
import onime15_image from   './assets/facemask.jpeg'
import onime16_image from   './assets/daystar1.jpg'

import { isSupabaseConfigured, supabase } from "./supabase";
/* ===== EDIT ME: name, age and all page content live here ===== */
const CONFIG = { name: "Onime", age: "50" };

// Memory Lane. Put a photo path in `src` (e.g. "photos/1989.jpg"); leave "" for a placeholder.
// Add or remove entries freely. Each `id` must be unique because likes are saved by id.
const MEMORIES = [
  { id: "m1", caption: "Her in her fathers house ", src: onime2_image },
  { id: "m2", caption: "Her in university", src:onime1_image },
  { id: "m3", caption: "Her at 22 years old ", src:onime4_image},
  { id: "m5", caption: "At a party with her Husband in 1999", src: onime5_image },
  { id: "m6", caption: "Her with her chlidren David, Daniel and Deborah", src: onime6_image },
  { id: "m7", caption: "Her in smecca plaza", src:onime7_image  },
  { id: "m8", caption: "Her taking sunday pictures ", src:onime8_image },
  { id: "m9", caption: "Celebrating her birthday in church Rehoboth hall", src: onime9_image },
  { id: "m10", caption: "Her after work ", src: onime10_image },
  { id: "m11", caption: "Her leading praise in ibafo church", src:onime11_image  },
  { id: "m45", caption: "Her at ICMC Graduation", src:onime3_image  },
  { id: "m12", caption: "Her taking sunday picture in assese church", src:onime12_image  },
  { id: "m13", caption: "Her at Her law firm in ikeja ", src: onime13_image },
  { id: "m14", caption: "Her in wecan school", src: onime14_image },
  { id: "m15", caption: "Her with Her Tumeric facemask", src:onime15_image },
  { id: "m16", caption: "Her taking sunday picture at daystar", src: onime16_image },
];

// const TRAITS = [
//   ["","Endlessly generous", "She gives so much of herself , time and always making sure the people she loves are happy, cared for, and never feel alone."],
//   ["", "Love", "She has a heart full of love, not just for her family but for everyone she meets. She makes people feel cared for, welcomed, and truly loved."],
//   ["", "Our safe place", "Good day or bad day, she is who we call."],
// ];

/* One Memory Lane card with its own like button */
function MemoryCard({ memory, likes, onToggle, disabled }) {
  const liked = !!likes.liked, count = likes.count || 0;
  return (
    <figure className="polaroid">
      {/* Double-click the photo to like it */}
      <div className="photo" onDoubleClick={() => !liked && onToggle(memory.id)}>
        {memory.src ? <img src={memory.src} alt={memory.caption} /> : <div className="ph">Photo</div>}
      </div>
      <figcaption>
        <div><b>{memory.year}</b>{memory.caption}</div>
        <button
          type="button"
          id="likebtn"
          className={"like" + (liked ? " on" : "")}
          aria-pressed={liked}
          aria-label={(liked ? "Unlike" : "Like") + " the photo: " + memory.caption}
          disabled={disabled}
          onClick={() => onToggle(memory.id)}
        >
          <span className="heart" aria-hidden="true">{liked ? "♥" : "♡"}</span>{count}
        </button>
      </figcaption>
    </figure>
  );
}

function MemoryLane() {
  const [likes, setLikes] = useState({});
  const [visitorId, setVisitorId] = useState("");
  const [busyIds, setBusyIds] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!supabase) {
        setStatus("Shared likes are unavailable until Supabase is configured.");
        setLoading(false);
        return;
      }
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        let userId = sessionData.session?.user.id;
        if (!userId) {
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
          userId = data.user.id;
        }
        const { data, error } = await supabase
          .from("memory_likes")
          .select("memory_id, visitor_id");
        if (error) throw error;
        if (!active) return;
        const next = {};
        for (const row of data) {
          const current = next[row.memory_id] || { liked: false, count: 0 };
          current.count += 1;
          current.liked ||= row.visitor_id === userId;
          next[row.memory_id] = current;
        }
        setVisitorId(userId);
        setLikes(next);
      } catch (error) {
        if (active) setStatus(`Could not load shared likes: ${error.message}`);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const toggle = async (id) => {
    if (!supabase || !visitorId || busyIds.includes(id)) return;
    const current = likes[id] || { liked: false, count: 0 };
    setBusyIds(prev => [...prev, id]);
    setStatus("");
    try {
      const result = current.liked
        ? await supabase.from("memory_likes").delete().eq("memory_id", id).eq("visitor_id", visitorId)
        : await supabase.from("memory_likes").insert({ memory_id: id, visitor_id: visitorId });
      if (result.error) throw result.error;
      setLikes(prev => ({
        ...prev,
        [id]: {
          liked: !current.liked,
          count: Math.max(0, current.count + (current.liked ? -1 : 1)),
        },
      }));
    } catch (error) {
      setStatus(`Could not save your like: ${error.message}`);
    } finally {
      setBusyIds(prev => prev.filter(busyId => busyId !== id));
    }
  };
  const total = Object.values(likes).reduce((n, l) => n + (l.count || 0), 0);

  return (
    <section id="memories" className="memories">
      <div className="wrap">
        <h2>Memory Lane</h2>
        <p className="lede">
          Tap the heart on the moments you love most, or double-click a photo.{" "}
          <span className="hearts-total" aria-live="polite">{total} {total === 1 ? "heart" : "hearts"} so far.</span>
        </p>
        {loading && <p className="status" role="status">Loading shared likes…</p>}
        {status && <p className="status" role="status">{status}</p>}
        <div className="gallery">
          {MEMORIES.map(m => <MemoryCard key={m.id} memory={m} likes={likes[m.id] || {}} onToggle={toggle} disabled={loading || busyIds.includes(m.id) || !visitorId} />)}
        </div>
      </div>
    </section>
  );
}

function confetti() {
  const colors = ["#c50c9d", "#ffd700", "#f1ede8", "#0f942e", "#7a0d31"];
  for (let i = 0; i < 100; i++) {
    const b = document.createElement("i");
    b.className = "bit";
    b.style.left = Math.random() * 100 + "vw";
    b.style.background = colors[i % colors.length];
    b.style.animationDuration = 2 + Math.random() * 2.5 + "s";
    b.style.animationDelay = Math.random() * 0.6 + "s";
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 5500);
  }
}

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="wrap">
        <div className="intro">
          <h1>Happy Birthday, <em>{CONFIG.name}!</em></h1>
          <p className="tagline">Another year of your laughter, your cooking, and your hugs. We wouldn't trade a single one.</p>
          <div>
            <button className="btn" type="button" onClick={confetti}>Make a wish onime</button>
            <a className="btn ghost" href="#wishes">Leave her a note</a>
          </div>
        </div>
        <div className="frame">
          <div className="photo">
            {/* Replace the div with: <img src="mom.jpg" alt="Mom smiling" /> */}
            <img src={oinme_image} alt="" />
          </div>
          <div className="badge"><div>{CONFIG.age}<small>and fabulous</small></div></div>
        </div>
      </div>
    </section>
  );
}

function Guestbook() {
  const [wishes, setWishes] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!supabase) {
        setStatus("Posting wishes is unavailable until Supabase is configured.");
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("wishes")
          .select("id, name, relation, message")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (!active) return;
        setWishes(data.map(wish => ({
          id: wish.id,
          text: wish.message,
          by: `${wish.name}, ${wish.relation.toLowerCase()}`,
        })));
      } catch (error) {
        if (active) setStatus(`Could not load wishes: ${error.message}`);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const d = new FormData(e.target);
    if (!supabase) {
      setStatus("Posting wishes is unavailable until Supabase is configured.");
      return;
    }
    setSubmitting(true);
    setStatus("");
    try {
      const { data, error } = await supabase
        .from("wishes")
        .insert({
          name: d.get("who").trim(),
          relation: d.get("rel"),
          message: d.get("msg").trim(),
        })
        .select("id, name, relation, message")
        .single();
      if (error) throw error;
      setWishes(prev => [{
        id: data.id,
        text: data.message,
        by: `${data.name}, ${data.relation.toLowerCase()}`,
        fresh: true,
      }, ...prev]);
      e.target.reset();
      setStatus("Thank you! Your wish was posted.");
    } catch (error) {
      setStatus(`Could not post your wish: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="guest" id="wishes">
      <div className="wrap">
        <h2>Wishes for {CONFIG.name}</h2>
        <p className="lede">Read what everyone wrote, then add your own. New wishes appear at the top of the list.</p>
        <div className="cols">
          <div className="notes" aria-live="polite">
            {loading && <p className="status" role="status">Loading wishes…</p>}
            {wishes.map(w => (
              <article className={"note" + (w.fresh ? " fresh" : "")} key={w.id}>
                <p>{w.text}</p><footer>{w.by}</footer>
              </article>
            ))}
          </div>
          <form onSubmit={submit}>
            <h3>Add your wish</h3>
            <label>Your name<input name="who" required maxLength="40" autoComplete="name" placeholder="your name"/></label>
            <label>How you know her
              <select name="rel"><option>Family</option><option>Friend</option><option>Neighbour</option><option>Colleague</option></select>
            </label>
            <label>Your message<textarea name="msg" required maxLength="400" placeholder="your wish or message to her"/></label>
            <button className="btn" type="submit" disabled={submitting || loading || !isSupabaseConfigured}>{submitting ? "Posting…" : "Post my wish"}</button>
            <p className="status" role="status">{status}</p>
          </form>
        </div>
      </div>
    </section>
  );
}

function WhyWeLoveYou() {
  return (
    <section id="love">
      <div className="wrap">
        <h2>Thank You  Onime</h2>
        <p className="lede">For the big things, the small things, and everything you  do without being asked.</p>
        <div className="love">
          <div className="card big">
            <h3>Birthday Message</h3>
            <p>Happy 50th Birthday, Onime. Today, my heart is overflowing with love and endless gratitude for the extraordinary woman you are. I love you more deeply than words could ever convey. Looking back at everything you have done, I am in awe of your countless sacrifices, your boundless patience, and the quiet strength that has always held our home together. You poured your whole soul into raising  me, never hesitating to put my needs before your own, wrapping me and the entire family in an unconditional love that made me feel safe, cherished, and deeply blessed..</p>
           <br /> <p>Through every step of my life, your encouragement has been my anchor and your wisdom my guiding light. Whenever life felt heavy, you always looked at me and reminded me that <span className="special">“Your tomorrow starts today.”</span> Living by those words gave me the courage to keep going, the hope to dream fearlessly, and the purpose to build a life you can be proud of. Everything good in me comes from you. Thank you for your endless devotion, your gentle guidance, and the beautiful life you gave all of us. Happy 50th birthday, Onime. I love and cherish you with all my heart, today and forever.</p>
          </div>
          
        </div>
      </div>
    </section>
  );
}

function App() {
  return (
    <>
      <nav aria-label="Sections">
        <a href="#home">Home</a><a href="#memories">Memory Lane</a><a href="#wishes">Wishes</a><a href="#love">Gratitude</a>
      </nav>
      <Hero />
      <MemoryLane />
      <Guestbook />
      <WhyWeLoveYou />
      <footer className="site">
        <h2>Made with love by Daniel</h2>
        <p>Thank you for every scarifice, every advice, and every time you believed in me before I did. God bless you {CONFIG.name}.</p>
        <small>Made with love for {CONFIG.name}'s {CONFIG.age}th birthday</small>
      </footer>
    </>
  );
}

document.title = "Happy Birthday, " + CONFIG.name + "!";
export default App;
