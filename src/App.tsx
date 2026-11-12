import { useEffect, useMemo, useState } from "react";
import {
  Bell, Bookmark, Check, ChevronDown, Compass, Heart, Home, ImagePlus, Link2,
  MessageCircle, MoreHorizontal, Plus, Search, Send, Settings2, Sparkles,
  Sun, Moon, Monitor, Users, X, ArrowUpRight, Smile, SlidersHorizontal
} from "lucide-react";
import type { NavigationSection, Post, ThemePreference } from "./domain/models";
import { SocialUseCases } from "./application/ports";
import { DemoPlatformRepository, currentUser } from "./infrastructure/demoRepository";

const social = new SocialUseCases(new DemoPlatformRepository());

const navItems: { id: NavigationSection; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "profile", label: "Profile", icon: Users }
];

function App() {
  const [section, setSection] = useState<NavigationSection>("home");
  const [posts, setPosts] = useState<Post[]>([]);
  const [draft, setDraft] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    try { return (localStorage.getItem("synera-theme") as ThemePreference) || "system"; }
    catch { return "system"; }
  });
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [activeConversation, setActiveConversation] = useState("d1");
  const [messageDraft, setMessageDraft] = useState("");
  const [sentMessages, setSentMessages] = useState<Record<string, string[]>>({});
  const [showSettings, setShowSettings] = useState(false);

  const dark = themePreference === "dark" || (themePreference === "system" && systemDark);

  useEffect(() => {
    social.loadFeed().then(setPosts);
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return;
    const update = () => setSystemDark(media.matches);
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try { localStorage.setItem("synera-theme", themePreference); } catch { /* Optional local preference. */ }
  }, [dark, themePreference]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const publish = async () => {
    if (!draft.trim()) return;
    try {
      const post = await social.publish(draft);
      setPosts(current => [post, ...current]);
      setDraft("");
      notify("Your post is live in this demo.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Couldn't publish this post.");
    }
  };

  const toggleLike = async (postId: string) => {
    await social.toggleLike(postId);
    setPosts(await social.loadFeed());
  };

  const addComment = async (postId: string) => {
    const value = commentDrafts[postId] || "";
    if (!value.trim()) return;
    await social.comment(postId, value);
    setPosts(await social.loadFeed());
    setCommentDrafts(current => ({ ...current, [postId]: "" }));
    notify("Comment added.");
  };

  const filteredPosts = useMemo(() => posts.filter(post =>
    (post.body + post.author.name + post.author.handle).toLowerCase().includes(search.toLowerCase())
  ), [posts, search]);

  const navigate = (next: NavigationSection) => {
    setSection(next);
    setSearch("");
    setShowSettings(false);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate("home")} aria-label="Synera home">
          <span className="brand-mark"><span /></span>
          <span className="brand-name">synera<span className="brand-dot">.</span></span>
        </button>

        <button className="profile-switcher" onClick={() => navigate("profile")}>
          <img src={currentUser.avatar} alt="" />
          <span className="profile-switch-copy"><strong>{currentUser.name}</strong><small>@{currentUser.handle}</small></span>
          <ChevronDown size={16} />
        </button>

        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            return <button key={item.id} className={section === item.id ? "nav-item active" : "nav-item"} onClick={() => navigate(item.id)}>
              <Icon size={19} strokeWidth={1.8} /><span>{item.label}</span>
              {item.id === "messages" && <i className="nav-indicator" />}
            </button>;
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note"><Sparkles size={16} /><span>A little more connection,<br />a little less noise.</span></div>
          <button className="nav-item" onClick={() => setShowSettings(true)}><Settings2 size={19} /><span>Settings</span></button>
          <div className="sidebar-user">
            <img src={currentUser.avatar} alt="" />
            <div><strong>{currentUser.name}</strong><small>Personal account</small></div>
            <MoreHorizontal size={19} />
          </div>
        </div>
      </aside>

      <main className="main-column">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark"><span /></span><b>synera<span className="brand-dot">.</span></b></div>
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{section === "home" ? "Your feed" : section[0].toUpperCase() + section.slice(1)}</strong></div>
          <div className="topbar-actions">
            <label className="search-box"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Synera" /><kbd>⌘ K</kbd></label>
            <button className="icon-button notification-button" onClick={() => navigate("notifications")} aria-label="Notifications"><Bell size={19} /><i /></button>
          </div>
        </header>

        {section === "home" && <section className="page-content">
          <div className="page-heading">
            <div><div className="eyebrow">THURSDAY, NOVEMBER 12</div><h1>Your corner<br /><em>of the internet.</em></h1><p>A thoughtful feed from people you follow.</p></div>
            <button className="round-action" onClick={() => document.getElementById("post-composer")?.focus()}><Plus size={19} /></button>
          </div>

          <div className="composer card-surface">
            <div className="composer-top"><img src={currentUser.avatar} alt="" /><textarea id="post-composer" value={draft} onChange={e => setDraft(e.target.value)} placeholder="What's on your mind?" maxLength={500} rows={2} /></div>
            <div className="composer-bottom"><div className="composer-tools"><button onClick={() => notify("Photo uploads are coming in a future prototype update.")}><ImagePlus size={17} /><span>Photo</span></button><button onClick={() => notify("Link previews are coming soon.")}><Link2 size={17} /><span>Link</span></button><button onClick={() => notify("More post options are coming soon.")}><Smile size={17} /><span>Feeling</span></button></div><div className="publish-group"><span>{draft.length}/500</span><button className="primary-button" onClick={publish} disabled={!draft.trim()}>Share post <ArrowUpRight size={15} /></button></div></div>
          </div>

          <div className="feed-toolbar"><div><span className="section-kicker">THE LATEST</span><h2>For you</h2></div><button className="filter-button" onClick={() => notify("Your feed is showing the latest posts.")}><SlidersHorizontal size={16} /> Latest <ChevronDown size={14} /></button></div>

          <div className="feed-list">
            {filteredPosts.map(post => <article className="post-card card-surface" key={post.id}>
              <div className="post-header"><img className="avatar" src={post.author.avatar} alt="" /><div className="post-author"><strong>{post.author.name}{post.author.verified && <span className="verified"><Check size={10} /></span>}</strong><span>@{post.author.handle} <b>·</b> {post.createdAt}</span></div><button className="icon-button subtle" aria-label="More post options" onClick={() => notify("Post options are part of the next interaction pass.")}><MoreHorizontal size={20} /></button></div>
              <p className="post-body">{post.body}</p>
              {post.image && <img className="post-image" src={post.image} alt="Post attachment" />}
              <div className="post-stats"><span>{post.likes.toLocaleString()} appreciations</span><button onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}>{post.comments.length} comments</button></div>
              <div className="post-actions">
                <button className={post.likedByMe ? "post-action liked" : "post-action"} onClick={() => toggleLike(post.id)}><Heart size={18} fill={post.likedByMe ? "currentColor" : "none"} /> Appreciate</button>
                <button className="post-action" onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}><MessageCircle size={18} /> Comment</button>
                <button className="post-action save-action" onClick={() => notify("Saved to your collection (demo).")}><Bookmark size={18} /> Save</button>
              </div>
              {expandedComments === post.id && <div className="comments-panel">
                {post.comments.map(comment => <div className="comment-row" key={comment.id}><img src={comment.author.avatar} alt="" /><div><strong>{comment.author.name}</strong><p>{comment.body}</p><small>{comment.createdAt}</small></div></div>)}
                <div className="comment-input"><input value={commentDrafts[post.id] || ""} onChange={e => setCommentDrafts(current => ({ ...current, [post.id]: e.target.value }))} placeholder="Write a thoughtful reply..." maxLength={240} onKeyDown={e => e.key === "Enter" && addComment(post.id)} /><button onClick={() => addComment(post.id)}><Send size={16} /></button></div>
              </div>}
            </article>)}
            {filteredPosts.length === 0 && <div className="empty-state card-surface"><Search size={24} /><strong>No posts found</strong><span>Try another name or keyword.</span></div>}
          </div>
        </section>}

        {section === "explore" && <ExplorePage onNotify={notify} />}
        {section === "messages" && <MessagesPage active={activeConversation} setActive={setActiveConversation} sent={sentMessages} setSent={setSentMessages} draft={messageDraft} setDraft={setMessageDraft} />}
        {section === "notifications" && <NotificationsPage />}
        {section === "profile" && <ProfilePage />}
        {showSettings && <SettingsPage preference={themePreference} setPreference={setThemePreference} onClose={() => setShowSettings(false)} />}
      </main>

      <aside className="right-rail">
        <div className="rail-top"><span className="section-kicker">YOUR SPACE</span><button className="icon-button" onClick={() => setShowSettings(true)}><Settings2 size={18} /></button></div>
        <div className="welcome-card">
          <div className="welcome-orb"><span /><i /></div>
          <span className="section-kicker">A PLACE TO BE YOU</span>
          <h3>Make space<br />for <em>good things.</em></h3>
          <p>Share what matters. Find your people. Stay a little longer.</p>
          <button onClick={() => navigate("profile")}>View your profile <ArrowUpRight size={15} /></button>
        </div>
        <div className="rail-section">
          <div className="rail-heading"><div><span className="section-kicker">GOOD TO KNOW</span><h3>People to follow</h3></div><button onClick={() => navigate("explore")}>See all</button></div>
          <Suggestion avatar="https://i.pravatar.cc/100?img=49" name="Sofia Chen" handle="sofiachen" note="Product designer" onFollow={notify} />
          <Suggestion avatar="https://i.pravatar.cc/100?img=15" name="Oliver James" handle="oliverj" note="Photographer" onFollow={notify} />
          <Suggestion avatar="https://i.pravatar.cc/100?img=32" name="Amara Okafor" handle="amarao" note="Writer & curious mind" onFollow={notify} />
        </div>
        <div className="rail-footer"><span>© 2026 Synera</span><a href="#about" onClick={e => { e.preventDefault(); notify("Synera v0.0.1-alpha · A Suyziss project."); }}>About</a><a href="#guidelines" onClick={e => { e.preventDefault(); notify("Community guidelines are being drafted."); }}>Guidelines</a><span>Made with intention.</span></div>
      </aside>

      {toast && <div className="toast"><Check size={16} />{toast}</div>}
      <nav className="mobile-nav">{navItems.map(item => { const Icon = item.icon; return <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => navigate(item.id)}><Icon size={20} /><span>{item.label}</span></button>; })}</nav>
    </div>
  );
}

function Suggestion({ avatar, name, handle, note, onFollow }: { avatar: string; name: string; handle: string; note: string; onFollow: (message: string) => void }) {
  const [following, setFollowing] = useState(false);
  return <div className="suggestion"><img src={avatar} alt="" /><div className="suggestion-copy"><strong>{name}</strong><small>@{handle} · {note}</small></div><button className={following ? "follow-button following" : "follow-button"} onClick={() => { setFollowing(!following); onFollow(following ? "Removed from following." : "You're now following " + name + " (demo)."); }}>{following ? <Check size={15} /> : <Plus size={15} />}</button></div>;
}

function ExplorePage({ onNotify }: { onNotify: (message: string) => void }) {
  const topics = ["Design", "Photography", "Architecture", "Technology", "Slow living", "Culture"];
  return <section className="page-content subpage"><div className="eyebrow">WANDER A LITTLE</div><h1>Find your<br /><em>next thing.</em></h1><p className="subpage-intro">Ideas, people and perspectives worth discovering.</p><div className="explore-search"><Search size={18} /><input placeholder="Search people, topics and conversations" /></div><div className="feed-toolbar"><div><span className="section-kicker">EXPLORE BY INTEREST</span><h2>Topics for you</h2></div></div><div className="topic-grid">{topics.map((topic, i) => <button key={topic} className={"topic-card topic-" + i} onClick={() => onNotify("Exploring " + topic + " is coming soon.")}><span>0{i + 1}</span><strong>{topic}</strong><ArrowUpRight size={18} /></button>)}</div><div className="explore-feature"><img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=85" alt="A warm creative workspace" /><div><span className="section-kicker">THE SYNERA JOURNAL</span><h2>Curiosity looks<br /><em>good on you.</em></h2><p>A collection of ideas from across the community.</p><button onClick={() => onNotify("The journal is coming soon.")}>Discover stories <ArrowUpRight size={15} /></button></div></div></section>;
}

function MessagesPage({ active, setActive, sent, setSent, draft, setDraft }: { active: string; setActive: (id: string) => void; sent: Record<string, string[]>; setSent: React.Dispatch<React.SetStateAction<Record<string, string[]>>>; draft: string; setDraft: (value: string) => void }) {
  const people = [
    { id: "d1", name: "Elena Rivera", handle: "elenar", avatar: "https://i.pravatar.cc/100?img=47", last: "That sounds lovely. Let's do it!", time: "2m", unread: 2 },
    { id: "d2", name: "Noah Williams", handle: "noahw", avatar: "https://i.pravatar.cc/100?img=11", last: "Sent you the references.", time: "1h", unread: 0 },
    { id: "d3", name: "Mina Park", handle: "minapark", avatar: "https://i.pravatar.cc/100?img=44", last: "Have a wonderful weekend ✨", time: "1d", unread: 0 }
  ];
  const person = people.find(p => p.id === active) || people[0];
  const send = () => { if (!draft.trim()) return; setSent(current => ({ ...current, [active]: [...(current[active] || []), draft.trim()] })); setDraft(""); };
  return <section className="page-content subpage messages-page"><div className="eyebrow">YOUR PRIVATE SPACE</div><h1>Good conversations<br /><em>start here.</em></h1><div className="messages-layout card-surface"><div className="conversation-list"><div className="conversation-title"><strong>Messages</strong><button className="icon-button"><Plus size={18} /></button></div>{people.map(p => <button key={p.id} className={active === p.id ? "conversation active" : "conversation"} onClick={() => setActive(p.id)}><img src={p.avatar} alt="" /><span><strong>{p.name}</strong><small>{p.last}</small></span><i>{p.time}{p.unread > 0 && <b>{p.unread}</b>}</i></button>)}</div><div className="chat-panel"><div className="chat-header"><img src={person.avatar} alt="" /><div><strong>{person.name}</strong><small>@{person.handle}</small></div><button className="icon-button"><MoreHorizontal size={19} /></button></div><div className="chat-history"><div className="chat-date">TODAY</div><div className="message-bubble incoming">Hey! I loved your latest post. The way you captured that light is beautiful.<small>10:42</small></div><div className="message-bubble outgoing">{person.last}<small>10:48 <Check size={12} /></small></div>{(sent[active] || []).map((message, i) => <div className="message-bubble outgoing" key={i}>{message}<small>Just now <Check size={12} /></small></div>)}</div><div className="chat-compose"><button className="icon-button"><Plus size={18} /></button><input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Write a message..." onKeyDown={e => e.key === "Enter" && send()} /><button className="send-button" onClick={send}><Send size={17} /></button></div><div className="demo-caption">Demo conversation · Messages are only stored in this page session.</div></div></div></section>;
}

function NotificationsPage() {
  const items = [
    { avatar: "https://i.pravatar.cc/100?img=47", name: "Elena Rivera", action: "appreciated your post.", time: "12 min ago", type: "heart" },
    { avatar: "https://i.pravatar.cc/100?img=11", name: "Noah Williams", action: "started following you.", time: "1 hour ago", type: "user" },
    { avatar: "https://i.pravatar.cc/100?img=44", name: "Mina Park", action: "mentioned you in a comment.", time: "Yesterday", type: "comment" }
  ];
  return <section className="page-content subpage"><div className="eyebrow">A LITTLE SOMETHING FOR YOU</div><h1>You're in<br /><em>the loop.</em></h1><div className="feed-toolbar"><div><span className="section-kicker">RECENT ACTIVITY</span><h2>Notifications</h2></div><button className="filter-button">All activity <ChevronDown size={14} /></button></div><div className="notification-list card-surface">{items.map((item, i) => <div className="notification-row" key={i}><img src={item.avatar} alt="" /><div><p><strong>{item.name}</strong> {item.action}</p><small>{item.time}</small></div><span className="notification-type">{item.type === "heart" ? <Heart size={16} /> : item.type === "user" ? <Users size={16} /> : <MessageCircle size={16} />}</span></div>)}</div></section>;
}

function ProfilePage() {
  const [tab, setTab] = useState("Posts");
  return <section className="page-content subpage profile-page"><div className="profile-cover"><div className="cover-orbit" /></div><div className="profile-main"><img className="profile-large-avatar" src={currentUser.avatar} alt="" /><button className="outline-button" onClick={() => window.alert("Profile editing will be added in a future prototype update.")}>Edit profile</button><h1>{currentUser.name} <span className="verified"><Check size={11} /></span></h1><span className="profile-handle">@{currentUser.handle}</span><p>{currentUser.bio}</p><span className="profile-location">{currentUser.location} · Joined recently</span><div className="profile-counts"><span><strong>{currentUser.following}</strong> Following</span><span><strong>{currentUser.followers.toLocaleString()}</strong> Followers</span></div><div className="profile-tabs">{["Posts", "Replies", "Media", "Likes"].map(t => <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>{t}</button>)}</div><div className="profile-empty"><Sparkles size={22} /><strong>Your story starts here.</strong><span>Your {tab.toLowerCase()} will appear here as you share more.</span></div></div></section>;
}

function SettingsPage({ preference, setPreference, onClose }: { preference: ThemePreference; setPreference: (value: ThemePreference) => void; onClose: () => void }) {
  return <div className="settings-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="settings-panel"><div className="settings-header"><div><span className="section-kicker">MAKE IT YOURS</span><h2>Settings</h2></div><button className="icon-button" onClick={onClose}><X size={20} /></button></div><div className="settings-section"><h3>Appearance</h3><p>Choose how Synera looks on this device.</p><div className="theme-options">{([{ id: "light", label: "Light", icon: Sun }, { id: "dark", label: "Dark", icon: Moon }, { id: "system", label: "System", icon: Monitor }] as const).map(option => { const Icon = option.icon; return <button key={option.id} className={preference === option.id ? "theme-option selected" : "theme-option"} onClick={() => setPreference(option.id)}><Icon size={19} /><span>{option.label}</span>{preference === option.id && <Check size={15} />}</button>; })}</div></div><div className="settings-section"><h3>About Synera</h3><p>Version 0.0.1-alpha · A Suyziss project.</p><p className="settings-muted">This is an early visual prototype. Some controls are illustrative and account data is local to this browser.</p></div><button className="primary-button settings-done" onClick={onClose}>Done</button></section></div>;
}

export default App;
