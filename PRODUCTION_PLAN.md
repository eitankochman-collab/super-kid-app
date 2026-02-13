# 🚀 Super Kid App - Production Architecture Plan

## A) Database Schema (Supabase Postgres + Realtime)

### Tables

#### `profiles`
Parent/family accounts
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  family_name TEXT,
  pin_hash TEXT NOT NULL,  -- bcrypt hash of PIN
  timezone TEXT DEFAULT 'UTC',
  reset_time TIME DEFAULT '02:00:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only access their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### `kids`
Child profiles within a family
```sql
CREATE TABLE kids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  avatar_url TEXT,
  star_bank INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT positive_stars CHECK (star_bank >= 0)
);

-- Enable RLS
ALTER TABLE kids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own kids"
  ON kids FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can manage own kids"
  ON kids FOR ALL
  USING (profile_id = auth.uid());

-- Index for fast lookups
CREATE INDEX idx_kids_profile_id ON kids(profile_id);
```

#### `tasks`
Task definitions (reusable across routines)
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hebrew TEXT NOT NULL,
  english TEXT NOT NULL,
  emoji TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT false,  -- true if user-created
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can manage own tasks"
  ON tasks FOR ALL
  USING (profile_id = auth.uid());

CREATE INDEX idx_tasks_profile_id ON tasks(profile_id);
```

#### `routines`
Morning/Evening routines per kid
```sql
CREATE TYPE routine_type AS ENUM ('morning', 'evening');

CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id UUID REFERENCES kids(id) ON DELETE CASCADE,
  type routine_type NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(kid_id, type, task_id)  -- Prevent duplicate tasks in same routine
);

-- Enable RLS
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own routines"
  ON routines FOR SELECT
  USING (
    kid_id IN (
      SELECT id FROM kids WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own routines"
  ON routines FOR ALL
  USING (
    kid_id IN (
      SELECT id FROM kids WHERE profile_id = auth.uid()
    )
  );

CREATE INDEX idx_routines_kid_id ON routines(kid_id);
CREATE INDEX idx_routines_task_id ON routines(task_id);
```

#### `task_completions`
Daily task completion tracking (resets daily)
```sql
CREATE TABLE task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id UUID REFERENCES kids(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  routine_type routine_type NOT NULL,
  completed BOOLEAN DEFAULT false,
  stars_awarded INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(kid_id, task_id, routine_type, date),  -- One completion per task per day
  CONSTRAINT positive_stars_awarded CHECK (stars_awarded >= 0)
);

-- Enable RLS
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions"
  ON task_completions FOR SELECT
  USING (
    kid_id IN (
      SELECT id FROM kids WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own completions"
  ON task_completions FOR ALL
  USING (
    kid_id IN (
      SELECT id FROM kids WHERE profile_id = auth.uid()
    )
  );

CREATE INDEX idx_completions_kid_date ON task_completions(kid_id, date);
CREATE INDEX idx_completions_date ON task_completions(date);
```

#### `rewards`
Reward catalog per family
```sql
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  star_cost INTEGER NOT NULL,
  emoji TEXT DEFAULT '🎁',
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT positive_cost CHECK (star_cost > 0)
);

-- Enable RLS
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards"
  ON rewards FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can manage own rewards"
  ON rewards FOR ALL
  USING (profile_id = auth.uid());

CREATE INDEX idx_rewards_profile_id ON rewards(profile_id);
```

#### `reward_redemptions`
Track when rewards are redeemed
```sql
CREATE TABLE reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id UUID REFERENCES kids(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES rewards(id) ON DELETE SET NULL,
  stars_spent INTEGER NOT NULL,
  reward_title TEXT NOT NULL,  -- Snapshot in case reward is deleted
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions"
  ON reward_redemptions FOR SELECT
  USING (
    kid_id IN (
      SELECT id FROM kids WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create redemptions"
  ON reward_redemptions FOR INSERT
  WITH CHECK (
    kid_id IN (
      SELECT id FROM kids WHERE profile_id = auth.uid()
    )
  );

CREATE INDEX idx_redemptions_kid_id ON reward_redemptions(kid_id);
CREATE INDEX idx_redemptions_date ON reward_redemptions(redeemed_at);
```

### Database Functions

#### Daily Reset Function
```sql
CREATE OR REPLACE FUNCTION reset_daily_completions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Archive old completions or just delete them
  -- For now, we keep them for history

  -- Delete completions older than 30 days (optional retention policy)
  DELETE FROM task_completions
  WHERE date < CURRENT_DATE - INTERVAL '30 days';

  -- No need to manually reset - the UNIQUE constraint on (kid_id, task_id, routine_type, date)
  -- ensures new day = new completions
END;
$$;
```

#### Realtime Trigger for Star Bank Updates
```sql
CREATE OR REPLACE FUNCTION update_star_bank()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Add stars to kid's bank
    UPDATE kids
    SET star_bank = star_bank + (NEW.stars_awarded - COALESCE(OLD.stars_awarded, 0)),
        updated_at = NOW()
    WHERE id = NEW.kid_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Remove stars from kid's bank
    UPDATE kids
    SET star_bank = GREATEST(0, star_bank - OLD.stars_awarded),
        updated_at = NOW()
    WHERE id = OLD.kid_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER star_bank_update_trigger
AFTER INSERT OR UPDATE OR DELETE ON task_completions
FOR EACH ROW
EXECUTE FUNCTION update_star_bank();
```

### Supabase Realtime Configuration

Enable realtime for tables that need live updates:
```sql
-- Enable realtime on these tables
ALTER PUBLICATION supabase_realtime ADD TABLE kids;
ALTER PUBLICATION supabase_realtime ADD TABLE task_completions;
ALTER PUBLICATION supabase_realtime ADD TABLE rewards;
ALTER PUBLICATION supabase_realtime ADD TABLE reward_redemptions;
```

### Scheduled Daily Reset (Supabase Edge Function + Cron)

Create an Edge Function that runs daily at 2:00 AM:

```typescript
// supabase/functions/daily-reset/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Call the reset function
  const { error } = await supabase.rpc('reset_daily_completions');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ message: 'Daily reset completed successfully' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});
```

Configure in Supabase Dashboard:
- Set up a cron trigger to call this Edge Function daily at 2:00 AM
- Or use pg_cron extension:

```sql
-- Install pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily reset at 2:00 AM
SELECT cron.schedule(
  'daily-reset',
  '0 2 * * *',
  $$SELECT reset_daily_completions()$$
);
```

---

## B) Production App Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand (lightweight, better than Redux for this use case)
- **Backend**: Supabase (Postgres + Realtime + Auth + Edge Functions)
- **Auth**: Supabase Auth (Email/Password + Magic Links)
- **Hosting**: Vercel or Netlify (for frontend)

### State Management Strategy

**Use Zustand for global state:**

```typescript
// stores/useAppStore.ts
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppStore {
  // User & Session
  user: User | null;
  isAuthenticated: boolean;

  // Kids & Tasks
  kids: Kid[];
  tasks: Task[];
  completions: TaskCompletion[];
  rewards: Reward[];

  // PIN Unlock State (client-only, not persisted)
  pinUnlockedUntil: number | null;

  // Actions
  setUser: (user: User | null) => void;
  setKids: (kids: Kid[]) => void;
  updateKid: (kidId: string, updates: Partial<Kid>) => void;
  toggleTaskCompletion: (completion: TaskCompletion) => void;
  awardStar: (kidId: string, taskId: string) => void;
  redeemReward: (kidId: string, rewardId: string) => void;
  unlockPin: () => void;
  lockPin: () => void;
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        kids: [],
        tasks: [],
        completions: [],
        rewards: [],
        pinUnlockedUntil: null,

        // Actions
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setKids: (kids) => set({ kids }),
        updateKid: (kidId, updates) =>
          set((state) => ({
            kids: state.kids.map((kid) =>
              kid.id === kidId ? { ...kid, ...updates } : kid
            ),
          })),
        toggleTaskCompletion: (completion) => {
          // Call Supabase mutation
          // State will be updated via realtime subscription
        },
        // ... other actions
      }),
      {
        name: 'super-kid-storage',
        partialize: (state) => ({
          // Only persist these fields (exclude PIN unlock state)
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);
```

### Realtime Sync Strategy

**Use Supabase Realtime subscriptions:**

```typescript
// hooks/useRealtimeSync.ts
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../stores/useAppStore';

export function useRealtimeSync() {
  const { user, setKids } = useAppStore();

  useEffect(() => {
    if (!user) return;

    // Subscribe to kids updates
    const kidsChannel = supabase
      .channel('kids-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kids',
          filter: `profile_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Kids updated:', payload);
          // Refetch kids or update state directly
          fetchKids();
        }
      )
      .subscribe();

    // Subscribe to task completions
    const completionsChannel = supabase
      .channel('completions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_completions',
        },
        (payload) => {
          console.log('Completions updated:', payload);
          // Update local state
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(kidsChannel);
      supabase.removeChannel(completionsChannel);
    };
  }, [user]);

  async function fetchKids() {
    const { data, error } = await supabase
      .from('kids')
      .select('*')
      .eq('profile_id', user.id)
      .order('display_order');

    if (!error) {
      setKids(data);
    }
  }
}
```

### Authentication Flow

1. **Parent Registration/Login**:
   - Email/password or magic link
   - Set up family name and PIN
   - PIN stored as bcrypt hash in database

2. **PIN Verification**:
   - Client-side PIN entry
   - Verify against stored hash via Supabase Edge Function
   - Set 5-minute unlock window in client state

3. **Multi-device Sync**:
   - Parent logs in on tablet, phone, web
   - All devices sync in realtime via Supabase Realtime
   - PIN unlock is per-device (not synced)

### Offline Support (Future)

Use **Supabase Local First** or **TanStack Query** with offline mutations:

```typescript
import { useMutation } from '@tanstack/react-query';

const toggleTaskMutation = useMutation({
  mutationFn: async (completion: TaskCompletion) => {
    return supabase.from('task_completions').upsert(completion);
  },
  onMutate: async (newCompletion) => {
    // Optimistically update UI
    useAppStore.getState().updateCompletion(newCompletion);
  },
  onError: (error, newCompletion, context) => {
    // Rollback on error
  },
});
```

### Security Considerations

1. **Row Level Security (RLS)**: Enforced on all tables
2. **PIN Security**:
   - Never store plaintext PIN
   - Use bcrypt with high cost factor
   - Implement rate limiting on PIN verification
3. **API Rate Limiting**: Use Supabase built-in rate limiting
4. **Input Validation**: Validate all inputs on client and server
5. **HTTPS Only**: Enforce HTTPS in production

---

## C) Next Steps (Priority Order)

### Phase 1: Database Setup (Week 1)
1. ✅ Set up Supabase project
2. ✅ Run database migration scripts
3. ✅ Configure RLS policies
4. ✅ Set up Realtime on required tables
5. ✅ Create Edge Function for daily reset
6. ✅ Configure pg_cron or cron trigger
7. ✅ Test database schema with sample data

### Phase 2: Authentication & Multi-tenant Setup (Week 1-2)
1. ✅ Implement Supabase Auth integration
2. ✅ Create registration/login flows
3. ✅ Build PIN setup and verification system
4. ✅ Add email verification
5. ✅ Create profile management UI
6. ✅ Test multi-device sync

### Phase 3: Migrate Demo to Production Backend (Week 2-3)
1. ✅ Replace localStorage with Supabase
2. ✅ Implement Zustand store
3. ✅ Add Supabase client and mutations
4. ✅ Set up Realtime subscriptions
5. ✅ Test data sync across devices
6. ✅ Handle offline scenarios gracefully
7. ✅ Add loading states and error handling

### Phase 4: Admin Features (Week 3)
1. ✅ Build admin dashboard for parents
2. ✅ Add kid management (create, edit, delete)
3. ✅ Add task customization UI
4. ✅ Add reward customization UI
5. ✅ Add routine builder (drag-drop task ordering)
6. ✅ Add analytics dashboard (star trends, completion rates)

### Phase 5: Enhanced Features (Week 4)
1. ✅ Add avatar uploads (Supabase Storage)
2. ✅ Add custom sound/celebration preferences
3. ✅ Add notifications (push notifications for parents)
4. ✅ Add task history and trends
5. ✅ Add reward redemption approval flow
6. ✅ Add multi-language support (Hebrew/English toggle)

### Phase 6: Testing & Polish (Week 5)
1. ✅ Write unit tests (Vitest)
2. ✅ Write integration tests (Playwright)
3. ✅ Test on real tablets (iPad, Android)
4. ✅ Performance optimization
5. ✅ A11y audit and fixes
6. ✅ UX polish (animations, micro-interactions)

### Phase 7: Deployment (Week 5-6)
1. ✅ Set up CI/CD (GitHub Actions)
2. ✅ Deploy frontend to Vercel/Netlify
3. ✅ Configure custom domain
4. ✅ Set up error tracking (Sentry)
5. ✅ Set up analytics (PostHog or Plausible)
6. ✅ Set up uptime monitoring
7. ✅ Write deployment documentation

### Phase 8: Beta Testing (Week 6-8)
1. ✅ Onboard 5-10 beta families
2. ✅ Gather feedback
3. ✅ Fix bugs and iterate
4. ✅ Improve onboarding flow
5. ✅ Add help documentation

### Phase 9: Launch (Week 8+)
1. ✅ Public launch
2. ✅ Marketing (social media, parenting forums)
3. ✅ Monitor usage and errors
4. ✅ Iterate based on user feedback

---

## Additional Considerations

### Scalability
- Supabase handles up to 100k+ concurrent connections
- Postgres scales vertically (upgrade instance size)
- Add read replicas if needed
- Use Supabase Edge Functions for compute-heavy tasks

### Cost Estimation (Supabase)
- **Free Tier**: Up to 500 MB database, 2 GB bandwidth, 1 GB storage
- **Pro Tier** ($25/month): 8 GB database, 250 GB bandwidth, 100 GB storage
- **Estimated for 1000 families**: ~$25-50/month

### Monitoring & Observability
- Use Supabase Dashboard for database metrics
- Set up Sentry for error tracking
- Use PostHog for product analytics
- Set up alerts for critical failures

### Compliance (if needed)
- **GDPR**: Implement data export/deletion
- **COPPA**: No data collection from kids (only parents)
- **Privacy Policy**: Clearly state data usage

---

## Summary

This production plan provides:
- ✅ **Scalable database schema** with RLS for security
- ✅ **Realtime sync** for multi-device support
- ✅ **Automated daily reset** at 2:00 AM
- ✅ **Modern tech stack** (Supabase + React + Zustand)
- ✅ **Clear roadmap** for 8-week implementation

The architecture is designed to scale from 1 family to 10,000+ families without major rewrites.
