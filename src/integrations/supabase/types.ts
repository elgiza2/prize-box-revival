export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ad_watch_progress: {
        Row: {
          ads_clicked_c: number
          ads_watched: number
          ads_watched_b: number
          total_claims: number
          total_claims_b: number
          total_claims_c: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ads_clicked_c?: number
          ads_watched?: number
          ads_watched_b?: number
          total_claims?: number
          total_claims_b?: number
          total_claims_c?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ads_clicked_c?: number
          ads_watched?: number
          ads_watched_b?: number
          total_claims?: number
          total_claims_b?: number
          total_claims_c?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_watch_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ads_ad_views: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          telegram_id: number
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          id?: string
          telegram_id: number
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          telegram_id?: number
        }
        Relationships: []
      }
      ads_payments: {
        Row: {
          amount_ton: number
          created_at: string
          id: string
          memo: string
          paid_at: string | null
          product: string
          status: string
          telegram_id: number
          tx_hash: string | null
        }
        Insert: {
          amount_ton: number
          created_at?: string
          id?: string
          memo: string
          paid_at?: string | null
          product: string
          status?: string
          telegram_id: number
          tx_hash?: string | null
        }
        Update: {
          amount_ton?: number
          created_at?: string
          id?: string
          memo?: string
          paid_at?: string | null
          product?: string
          status?: string
          telegram_id?: number
          tx_hash?: string | null
        }
        Relationships: []
      }
      ads_spins: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          telegram_id: number
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          id?: string
          telegram_id: number
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          telegram_id?: number
        }
        Relationships: []
      }
      ads_tasks: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          key: string
          kind: string
          link: string | null
          reward_amount: number
          reward_currency: string
          sort_order: number
          target: number
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          key: string
          kind: string
          link?: string | null
          reward_amount: number
          reward_currency: string
          sort_order?: number
          target?: number
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          key?: string
          kind?: string
          link?: string | null
          reward_amount?: number
          reward_currency?: string
          sort_order?: number
          target?: number
          title?: string
        }
        Relationships: []
      }
      ads_translations: {
        Row: {
          created_at: string
          data: Json
          lang: string
          version: number
        }
        Insert: {
          created_at?: string
          data: Json
          lang: string
          version: number
        }
        Update: {
          created_at?: string
          data?: Json
          lang?: string
          version?: number
        }
        Relationships: []
      }
      ads_user_tasks: {
        Row: {
          created_at: string
          id: string
          task_key: string
          telegram_id: number
        }
        Insert: {
          created_at?: string
          id?: string
          task_key: string
          telegram_id: number
        }
        Update: {
          created_at?: string
          id?: string
          task_key?: string
          telegram_id?: number
        }
        Relationships: []
      }
      ads_users: {
        Row: {
          ads: number
          ads_watched: number
          booster: string | null
          booster_mult: number
          booster_until: string | null
          created_at: string
          first_name: string | null
          gram: number
          id: string
          language: string
          last_ad_at: string | null
          photo_url: string | null
          referrals: number
          referred_by: number | null
          telegram_id: number
          tickets: number
          updated_at: string
          usdt: number
          username: string | null
        }
        Insert: {
          ads?: number
          ads_watched?: number
          booster?: string | null
          booster_mult?: number
          booster_until?: string | null
          created_at?: string
          first_name?: string | null
          gram?: number
          id?: string
          language?: string
          last_ad_at?: string | null
          photo_url?: string | null
          referrals?: number
          referred_by?: number | null
          telegram_id: number
          tickets?: number
          updated_at?: string
          usdt?: number
          username?: string | null
        }
        Update: {
          ads?: number
          ads_watched?: number
          booster?: string | null
          booster_mult?: number
          booster_until?: string | null
          created_at?: string
          first_name?: string | null
          gram?: number
          id?: string
          language?: string
          last_ad_at?: string | null
          photo_url?: string | null
          referrals?: number
          referred_by?: number | null
          telegram_id?: number
          tickets?: number
          updated_at?: string
          usdt?: number
          username?: string | null
        }
        Relationships: []
      }
      ads_withdrawals: {
        Row: {
          address: string
          amount: number
          created_at: string
          currency: string
          id: string
          status: string
          telegram_id: number
        }
        Insert: {
          address: string
          amount: number
          created_at?: string
          currency: string
          id?: string
          status?: string
          telegram_id: number
        }
        Update: {
          address?: string
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          status?: string
          telegram_id?: number
        }
        Relationships: []
      }
      ai_generations: {
        Row: {
          created_at: string
          id: string
          kind: string
          model: string
          profile_id: string
          prompt: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          model: string
          profile_id: string
          prompt: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          model?: string
          profile_id?: string
          prompt?: string
          url?: string
        }
        Relationships: []
      }
      ai_smart_offers: {
        Row: {
          bonus_pct: number
          context: Json
          created_at: string
          cta: string
          expires_at: string
          focus: string
          headline: string
          id: string
          message: string
          telegram_id: number
        }
        Insert: {
          bonus_pct?: number
          context?: Json
          created_at?: string
          cta?: string
          expires_at?: string
          focus?: string
          headline?: string
          id?: string
          message?: string
          telegram_id: number
        }
        Update: {
          bonus_pct?: number
          context?: Json
          created_at?: string
          cta?: string
          expires_at?: string
          focus?: string
          headline?: string
          id?: string
          message?: string
          telegram_id?: number
        }
        Relationships: []
      }
      ai_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          images_used: number
          period_start: string
          plan: string
          profile_id: string
          status: string
          updated_at: string
          videos_used: number
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          images_used?: number
          period_start?: string
          plan?: string
          profile_id: string
          status?: string
          updated_at?: string
          videos_used?: number
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          images_used?: number
          period_start?: string
          plan?: string
          profile_id?: string
          status?: string
          updated_at?: string
          videos_used?: number
        }
        Relationships: []
      }
      attacks: {
        Row: {
          attack_type: string
          character_id: string
          created_at: string
          damage: number
          id: string
          is_killing_blow: boolean | null
          metadata: Json
          ton_spent: number | null
          user_id: string
        }
        Insert: {
          attack_type?: string
          character_id: string
          created_at?: string
          damage: number
          id?: string
          is_killing_blow?: boolean | null
          metadata?: Json
          ton_spent?: number | null
          user_id: string
        }
        Update: {
          attack_type?: string
          character_id?: string
          created_at?: string
          damage?: number
          id?: string
          is_killing_blow?: boolean | null
          metadata?: Json
          ton_spent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attacks_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attacks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_notification_log: {
        Row: {
          created_at: string
          last_sent_at: string
          profile_id: string
          topic: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          last_sent_at?: string
          profile_id: string
          topic?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          last_sent_at?: string
          profile_id?: string
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_notification_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_inventory: {
        Row: {
          category: string
          created_at: string
          id: string
          package_key: string
          package_name: string
          quantity: number
          total_purchased: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          package_key: string
          package_name: string
          quantity?: number
          total_purchased?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          package_key?: string
          package_name?: string
          quantity?: number
          total_purchased?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_inventory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_settings: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      bot_updates: {
        Row: {
          created_at: string
          update_id: number
        }
        Insert: {
          created_at?: string
          update_id: number
        }
        Update: {
          created_at?: string
          update_id?: number
        }
        Relationships: []
      }
      characters: {
        Row: {
          created_at: string
          current_hp: number
          defeated_by: string | null
          id: string
          image_url: string
          is_active: boolean | null
          max_hp: number
          name: string
          ton_pool: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_hp?: number
          defeated_by?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          max_hp?: number
          name: string
          ton_pool?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_hp?: number
          defeated_by?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          max_hp?: number
          name?: string
          ton_pool?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "characters_defeated_by_fkey"
            columns: ["defeated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crash_notification_log: {
        Row: {
          created_at: string
          last_sent_at: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          last_sent_at?: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          last_sent_at?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crash_notification_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_posts: {
        Row: {
          app: string
          created_at: string
          id: string
          image_prompt: string | null
          image_url: string | null
          post_date: string
          telegram_message_id: number | null
          text: string
          topic: string | null
        }
        Insert: {
          app: string
          created_at?: string
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          post_date: string
          telegram_message_id?: number | null
          text: string
          topic?: string | null
        }
        Update: {
          app?: string
          created_at?: string
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          post_date?: string
          telegram_message_id?: number | null
          text?: string
          topic?: string | null
        }
        Relationships: []
      }
      game_bets: {
        Row: {
          created_at: string
          game_slug: string
          id: string
          meta: Json
          multiplier: number
          payout: number
          settled_at: string | null
          stake: number
          status: string
          telegram_id: number
        }
        Insert: {
          created_at?: string
          game_slug: string
          id?: string
          meta?: Json
          multiplier?: number
          payout?: number
          settled_at?: string | null
          stake: number
          status?: string
          telegram_id: number
        }
        Update: {
          created_at?: string
          game_slug?: string
          id?: string
          meta?: Json
          multiplier?: number
          payout?: number
          settled_at?: string | null
          stake?: number
          status?: string
          telegram_id?: number
        }
        Relationships: []
      }
      game_crash_rounds: {
        Row: {
          crash_multiplier: number
          created_at: string
          round_id: number
        }
        Insert: {
          crash_multiplier: number
          created_at?: string
          round_id: number
        }
        Update: {
          crash_multiplier?: number
          created_at?: string
          round_id?: number
        }
        Relationships: []
      }
      game_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mining_reminders: {
        Row: {
          created_at: string
          last_sent_at: string
          profile_id: string
          sent_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          last_sent_at?: string
          profile_id: string
          sent_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          last_sent_at?: string
          profile_id?: string
          sent_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      mining_sessions: {
        Row: {
          claimed: boolean | null
          created_at: string
          ends_at: string
          id: string
          reward_amount: number | null
          siri_reward: number
          started_at: string
          ton_reward: number
          updated_at: string
          usdt_reward: number
          user_id: string
        }
        Insert: {
          claimed?: boolean | null
          created_at?: string
          ends_at: string
          id?: string
          reward_amount?: number | null
          siri_reward?: number
          started_at?: string
          ton_reward?: number
          updated_at?: string
          usdt_reward?: number
          user_id: string
        }
        Update: {
          claimed?: boolean | null
          created_at?: string
          ends_at?: string
          id?: string
          reward_amount?: number | null
          siri_reward?: number
          started_at?: string
          ton_reward?: number
          updated_at?: string
          usdt_reward?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mining_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_tasks: {
        Row: {
          caption: string | null
          chat_id: number
          created_at: string
          id: string
          image_file_id: string | null
          partner_name: string | null
          partner_user_id: number
          partner_username: string | null
          proof_file_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          caption?: string | null
          chat_id: number
          created_at?: string
          id?: string
          image_file_id?: string | null
          partner_name?: string | null
          partner_user_id: number
          partner_username?: string | null
          proof_file_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          caption?: string | null
          chat_id?: number
          created_at?: string
          id?: string
          image_file_id?: string | null
          partner_name?: string | null
          partner_user_id?: number
          partner_username?: string | null
          proof_file_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      partnerships: {
        Row: {
          added_by: number
          app: string | null
          assigned_at: string | null
          assigned_to: number | null
          chat_id: number
          chat_title: string | null
          created_at: string
          state: string
          updated_at: string
        }
        Insert: {
          added_by: number
          app?: string | null
          assigned_at?: string | null
          assigned_to?: number | null
          chat_id: number
          chat_title?: string | null
          created_at?: string
          state?: string
          updated_at?: string
        }
        Update: {
          added_by?: number
          app?: string | null
          assigned_at?: string | null
          assigned_to?: number | null
          chat_id?: number
          chat_title?: string | null
          created_at?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      prize_broadcast_log: {
        Row: {
          delivered: boolean
          profile_id: string
          sent_at: string
        }
        Insert: {
          delivered?: boolean
          profile_id: string
          sent_at?: string
        }
        Update: {
          delivered?: boolean
          profile_id?: string
          sent_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string
          id: string
          is_banned: boolean | null
          last_name: string | null
          photo_url: string | null
          referral_code: string | null
          referred_by: string | null
          reward_balance: number | null
          reward_expires_at: string | null
          siri_balance: number | null
          telegram_id: number
          ton_balance: number | null
          updated_at: string
          usdt_balance: number | null
          user_id: string | null
          username: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          first_name?: string
          id?: string
          is_banned?: boolean | null
          last_name?: string | null
          photo_url?: string | null
          referral_code?: string | null
          referred_by?: string | null
          reward_balance?: number | null
          reward_expires_at?: string | null
          siri_balance?: number | null
          telegram_id: number
          ton_balance?: number | null
          updated_at?: string
          usdt_balance?: number | null
          user_id?: string | null
          username?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string
          id?: string
          is_banned?: boolean | null
          last_name?: string | null
          photo_url?: string | null
          referral_code?: string | null
          referred_by?: string | null
          reward_balance?: number | null
          reward_expires_at?: string | null
          siri_balance?: number | null
          telegram_id?: number
          ton_balance?: number | null
          updated_at?: string
          usdt_balance?: number | null
          user_id?: string | null
          username?: string | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_groups: {
        Row: {
          added_by: number | null
          chat_id: number
          created_at: string
          title: string | null
        }
        Insert: {
          added_by?: number | null
          chat_id: number
          created_at?: string
          title?: string | null
        }
        Update: {
          added_by?: number | null
          chat_id?: number
          created_at?: string
          title?: string | null
        }
        Relationships: []
      }
      pvp_character_owned: {
        Row: {
          character_key: string
          created_at: string
          equipped: boolean
          id: string
          profile_id: string
          ton_paid: number
          tx_hash: string | null
          updated_at: string
        }
        Insert: {
          character_key: string
          created_at?: string
          equipped?: boolean
          id?: string
          profile_id: string
          ton_paid?: number
          tx_hash?: string | null
          updated_at?: string
        }
        Update: {
          character_key?: string
          created_at?: string
          equipped?: boolean
          id?: string
          profile_id?: string
          ton_paid?: number
          tx_hash?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pvp_character_owned_character_key_fkey"
            columns: ["character_key"]
            isOneToOne: false
            referencedRelation: "pvp_characters"
            referencedColumns: ["key"]
          },
        ]
      }
      pvp_characters: {
        Row: {
          color: string
          created_at: string
          hp_mod: number
          id: string
          key: string
          name: string
          price_ton: number
          rarity: string
          sort_order: number
          speed_mod: number
          title: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          hp_mod?: number
          id?: string
          key: string
          name: string
          price_ton?: number
          rarity?: string
          sort_order?: number
          speed_mod?: number
          title?: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          hp_mod?: number
          id?: string
          key?: string
          name?: string
          price_ton?: number
          rarity?: string
          sort_order?: number
          speed_mod?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pvp_match_players: {
        Row: {
          alive: boolean
          character_key: string
          deaths: number
          id: string
          is_bot: boolean
          joined_at: string
          kills: number
          match_id: string
          photo_url: string | null
          profile_id: string | null
          score: number
          slot: number
          telegram_id: number | null
          username: string
          weapon_key: string
        }
        Insert: {
          alive?: boolean
          character_key?: string
          deaths?: number
          id?: string
          is_bot?: boolean
          joined_at?: string
          kills?: number
          match_id: string
          photo_url?: string | null
          profile_id?: string | null
          score?: number
          slot?: number
          telegram_id?: number | null
          username?: string
          weapon_key?: string
        }
        Update: {
          alive?: boolean
          character_key?: string
          deaths?: number
          id?: string
          is_bot?: boolean
          joined_at?: string
          kills?: number
          match_id?: string
          photo_url?: string | null
          profile_id?: string | null
          score?: number
          slot?: number
          telegram_id?: number | null
          username?: string
          weapon_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "pvp_match_players_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "pvp_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      pvp_matches: {
        Row: {
          arena_seed: number
          created_at: string
          ends_at: string | null
          id: string
          max_players: number
          mode: string
          prize_ton: number
          started_at: string | null
          status: string
          updated_at: string
          winner_profile_id: string | null
        }
        Insert: {
          arena_seed?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          max_players?: number
          mode?: string
          prize_ton?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          winner_profile_id?: string | null
        }
        Update: {
          arena_seed?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          max_players?: number
          mode?: string
          prize_ton?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          winner_profile_id?: string | null
        }
        Relationships: []
      }
      pvp_stats: {
        Row: {
          deaths: number
          kills: number
          matches: number
          profile_id: string
          rating: number
          ton_earned: number
          updated_at: string
          wins: number
        }
        Insert: {
          deaths?: number
          kills?: number
          matches?: number
          profile_id: string
          rating?: number
          ton_earned?: number
          updated_at?: string
          wins?: number
        }
        Update: {
          deaths?: number
          kills?: number
          matches?: number
          profile_id?: string
          rating?: number
          ton_earned?: number
          updated_at?: string
          wins?: number
        }
        Relationships: []
      }
      pvp_weapon_owned: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          ton_paid: number
          tx_hash: string | null
          weapon_key: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          ton_paid?: number
          tx_hash?: string | null
          weapon_key: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          ton_paid?: number
          tx_hash?: string | null
          weapon_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "pvp_weapon_owned_weapon_key_fkey"
            columns: ["weapon_key"]
            isOneToOne: false
            referencedRelation: "pvp_weapons"
            referencedColumns: ["key"]
          },
        ]
      }
      pvp_weapons: {
        Row: {
          bullet_speed: number
          color: string
          created_at: string
          damage: number
          fire_rate_ms: number
          is_default: boolean
          key: string
          name: string
          pellets: number
          price_ton: number
          range_px: number
          rarity: string
          sort_order: number
          spread: number
        }
        Insert: {
          bullet_speed?: number
          color?: string
          created_at?: string
          damage?: number
          fire_rate_ms?: number
          is_default?: boolean
          key: string
          name: string
          pellets?: number
          price_ton?: number
          range_px?: number
          rarity?: string
          sort_order?: number
          spread?: number
        }
        Update: {
          bullet_speed?: number
          color?: string
          created_at?: string
          damage?: number
          fire_rate_ms?: number
          is_default?: boolean
          key?: string
          name?: string
          pellets?: number
          price_ton?: number
          range_px?: number
          rarity?: string
          sort_order?: number
          spread?: number
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          created_at: string
          id: string
          referred_user_id: string
          referrer_id: string
          source_id: string | null
          source_type: string
          ton_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          referred_user_id: string
          referrer_id: string
          source_id?: string | null
          source_type: string
          ton_amount?: number
        }
        Update: {
          created_at?: string
          id?: string
          referred_user_id?: string
          referrer_id?: string
          source_id?: string | null
          source_type?: string
          ton_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      servers: {
        Row: {
          attack_boost: number | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          mining_boost: number | null
          name: string
          price_ton: number
          rarity: string
          ton_mining_rate: number | null
          updated_at: string
          usdt_mining_rate: number | null
        }
        Insert: {
          attack_boost?: number | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          mining_boost?: number | null
          name: string
          price_ton: number
          rarity?: string
          ton_mining_rate?: number | null
          updated_at?: string
          usdt_mining_rate?: number | null
        }
        Update: {
          attack_boost?: number | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          mining_boost?: number | null
          name?: string
          price_ton?: number
          rarity?: string
          ton_mining_rate?: number | null
          updated_at?: string
          usdt_mining_rate?: number | null
        }
        Relationships: []
      }
      stakes: {
        Row: {
          amount: number
          apr: number
          claimed_yield: number
          closed_at: string | null
          created_at: string
          currency: string
          duration_days: number
          early_exit_fee_pct: number
          ends_at: string
          funded_amount: number
          id: string
          last_claim_at: string
          plan_id: string
          profile_id: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          apr: number
          claimed_yield?: number
          closed_at?: string | null
          created_at?: string
          currency: string
          duration_days: number
          early_exit_fee_pct?: number
          ends_at: string
          funded_amount: number
          id?: string
          last_claim_at?: string
          plan_id: string
          profile_id: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          apr?: number
          claimed_yield?: number
          closed_at?: string | null
          created_at?: string
          currency?: string
          duration_days?: number
          early_exit_fee_pct?: number
          ends_at?: string
          funded_amount?: number
          id?: string
          last_claim_at?: string
          plan_id?: string
          profile_id?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakes_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "staking_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staking_personal_offers: {
        Row: {
          created_at: string
          currency: string
          expires_at: string
          id: string
          is_active: boolean
          message_sent_at: string | null
          multiplier: number
          profile_id: string
          starts_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          expires_at: string
          id?: string
          is_active?: boolean
          message_sent_at?: string | null
          multiplier?: number
          profile_id: string
          starts_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          message_sent_at?: string | null
          multiplier?: number
          profile_id?: string
          starts_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staking_personal_offers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staking_plans: {
        Row: {
          apr: number
          created_at: string
          currency: string
          duration_days: number
          early_exit_fee_pct: number
          id: string
          is_active: boolean
          max_amount: number | null
          min_amount: number
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          apr: number
          created_at?: string
          currency: string
          duration_days: number
          early_exit_fee_pct?: number
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          apr?: number
          created_at?: string
          currency?: string
          duration_days?: number
          early_exit_fee_pct?: number
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      star_payments: {
        Row: {
          charge_id: string | null
          created_at: string
          id: string
          meta: Json
          paid_at: string | null
          payload: string
          product: string
          profile_id: string | null
          stars: number
          status: string
          telegram_id: number | null
        }
        Insert: {
          charge_id?: string | null
          created_at?: string
          id?: string
          meta?: Json
          paid_at?: string | null
          payload: string
          product: string
          profile_id?: string | null
          stars: number
          status?: string
          telegram_id?: number | null
        }
        Update: {
          charge_id?: string | null
          created_at?: string
          id?: string
          meta?: Json
          paid_at?: string | null
          payload?: string
          product?: string
          profile_id?: string | null
          stars?: number
          status?: string
          telegram_id?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_pinned: boolean
          link: string | null
          reward_amount: number
          reward_type: string
          task_type: string
          title: string
          updated_at: string
          verification_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_pinned?: boolean
          link?: string | null
          reward_amount: number
          reward_type?: string
          task_type?: string
          title: string
          updated_at?: string
          verification_type?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_pinned?: boolean
          link?: string | null
          reward_amount?: number
          reward_type?: string
          task_type?: string
          title?: string
          updated_at?: string
          verification_type?: string
        }
        Relationships: []
      }
      telegram_admins: {
        Row: {
          created_at: string
          label: string | null
          telegram_id: number
          welcome_image_url: string | null
        }
        Insert: {
          created_at?: string
          label?: string | null
          telegram_id: number
          welcome_image_url?: string | null
        }
        Update: {
          created_at?: string
          label?: string | null
          telegram_id?: number
          welcome_image_url?: string | null
        }
        Relationships: []
      }
      telegram_notifications: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message: string
          metadata: Json
          notification_type: string
          profile_id: string
          scheduled_for: string
          sent_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message: string
          metadata?: Json
          notification_type: string
          profile_id: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string
          metadata?: Json
          notification_type?: string
          profile_id?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_task_drafts: {
        Row: {
          created_at: string
          draft: Json
          telegram_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          draft?: Json
          telegram_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          draft?: Json
          telegram_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      ton_payment_intents: {
        Row: {
          action: string
          amount_nano: number
          base_amount_nano: number | null
          boc: string | null
          confirmed_at: string | null
          created_at: string
          credited_at: string | null
          discount_pct: number
          discount_reason: string | null
          expires_at: string
          failure_reason: string | null
          id: string
          memo: string
          metadata: Json
          status: string
          telegram_id: number
          tx_hash: string | null
          updated_at: string
          wallet_address: string | null
        }
        Insert: {
          action: string
          amount_nano: number
          base_amount_nano?: number | null
          boc?: string | null
          confirmed_at?: string | null
          created_at?: string
          credited_at?: string | null
          discount_pct?: number
          discount_reason?: string | null
          expires_at?: string
          failure_reason?: string | null
          id?: string
          memo: string
          metadata?: Json
          status?: string
          telegram_id: number
          tx_hash?: string | null
          updated_at?: string
          wallet_address?: string | null
        }
        Update: {
          action?: string
          amount_nano?: number
          base_amount_nano?: number | null
          boc?: string | null
          confirmed_at?: string | null
          created_at?: string
          credited_at?: string | null
          discount_pct?: number
          discount_reason?: string | null
          expires_at?: string
          failure_reason?: string | null
          id?: string
          memo?: string
          metadata?: Json
          status?: string
          telegram_id?: number
          tx_hash?: string | null
          updated_at?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          status: string
          tx_hash: string | null
          type: string
          updated_at: string
          user_id: string
          verification_status: string
          wallet_address: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          status?: string
          tx_hash?: string | null
          type: string
          updated_at?: string
          user_id: string
          verification_status?: string
          wallet_address?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          status?: string
          tx_hash?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          verification_status?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tt_ai_bots: {
        Row: {
          balance: number
          created_at: string
          deposit: number
          id: string
          pnl: number
          risk: string
          status: string
          telegram_id: number
          tx_hash: string | null
          updated_at: string
          verified: boolean
          verified_at: string | null
          wallet_address: string | null
        }
        Insert: {
          balance?: number
          created_at?: string
          deposit?: number
          id?: string
          pnl?: number
          risk?: string
          status?: string
          telegram_id: number
          tx_hash?: string | null
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          balance?: number
          created_at?: string
          deposit?: number
          id?: string
          pnl?: number
          risk?: string
          status?: string
          telegram_id?: number
          tx_hash?: string | null
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      tt_ai_trades: {
        Row: {
          actual_ask_amount: number | null
          actual_offer_amount: number | null
          bot_id: string
          closed_at: string | null
          confirmed_at: string | null
          entry_price: number
          exit_price: number | null
          id: string
          opened_at: string
          pair: string
          pnl: number
          side: string
          size: number
          status: string
          telegram_id: number
          tx_hash: string | null
        }
        Insert: {
          actual_ask_amount?: number | null
          actual_offer_amount?: number | null
          bot_id: string
          closed_at?: string | null
          confirmed_at?: string | null
          entry_price: number
          exit_price?: number | null
          id?: string
          opened_at?: string
          pair: string
          pnl?: number
          side: string
          size: number
          status?: string
          telegram_id: number
          tx_hash?: string | null
        }
        Update: {
          actual_ask_amount?: number | null
          actual_offer_amount?: number | null
          bot_id?: string
          closed_at?: string | null
          confirmed_at?: string | null
          entry_price?: number
          exit_price?: number | null
          id?: string
          opened_at?: string
          pair?: string
          pnl?: number
          side?: string
          size?: number
          status?: string
          telegram_id?: number
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tt_ai_trades_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "tt_ai_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      tt_stakes: {
        Row: {
          amount: number
          apy: number
          coin: string
          created_at: string
          ends_at: string
          id: string
          lock_days: number
          rewards_claimed: number
          sender_address: string | null
          started_at: string
          status: string
          telegram_id: number
          tier: string
          ton_paid: number
          tx_hash: string | null
          verified: boolean
          verified_at: string | null
          wallet_address: string | null
        }
        Insert: {
          amount: number
          apy: number
          coin?: string
          created_at?: string
          ends_at: string
          id?: string
          lock_days: number
          rewards_claimed?: number
          sender_address?: string | null
          started_at?: string
          status?: string
          telegram_id: number
          tier: string
          ton_paid?: number
          tx_hash?: string | null
          verified?: boolean
          verified_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          amount?: number
          apy?: number
          coin?: string
          created_at?: string
          ends_at?: string
          id?: string
          lock_days?: number
          rewards_claimed?: number
          sender_address?: string | null
          started_at?: string
          status?: string
          telegram_id?: number
          tier?: string
          ton_paid?: number
          tx_hash?: string | null
          verified?: boolean
          verified_at?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      tt_users: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          telegram_id: number
          updated_at: string
          username: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          telegram_id: number
          updated_at?: string
          username?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          telegram_id?: number
          updated_at?: string
          username?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      tt_wallet_ops: {
        Row: {
          amount: number
          created_at: string
          detail: Json
          id: string
          kind: string
          ref_id: string | null
          sender_address: string | null
          status: string
          telegram_id: number | null
          tx_hash: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          detail?: Json
          id?: string
          kind: string
          ref_id?: string | null
          sender_address?: string | null
          status?: string
          telegram_id?: number | null
          tx_hash?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          detail?: Json
          id?: string
          kind?: string
          ref_id?: string | null
          sender_address?: string | null
          status?: string
          telegram_id?: number | null
          tx_hash?: string | null
        }
        Relationships: []
      }
      tt_withdrawals: {
        Row: {
          admin_note: string | null
          admin_telegram_id: number | null
          amount: number
          coin: string
          created_at: string
          decided_at: string | null
          id: string
          status: string
          telegram_id: number
          tx_hash: string | null
          username: string | null
          wallet_address: string
        }
        Insert: {
          admin_note?: string | null
          admin_telegram_id?: number | null
          amount: number
          coin?: string
          created_at?: string
          decided_at?: string | null
          id?: string
          status?: string
          telegram_id: number
          tx_hash?: string | null
          username?: string | null
          wallet_address: string
        }
        Update: {
          admin_note?: string | null
          admin_telegram_id?: number | null
          amount?: number
          coin?: string
          created_at?: string
          decided_at?: string | null
          id?: string
          status?: string
          telegram_id?: number
          tx_hash?: string | null
          username?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      user_nfts: {
        Row: {
          created_at: string
          id: string
          image_url: string
          name: string
          price_ton: number
          profile_id: string | null
          rarity: string
          storage_path: string | null
          telegram_id: number
          tx_hash: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          name?: string
          price_ton?: number
          profile_id?: string | null
          rarity?: string
          storage_path?: string | null
          telegram_id: number
          tx_hash?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          price_ton?: number
          profile_id?: string | null
          rarity?: string
          storage_path?: string | null
          telegram_id?: number
          tx_hash?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_servers: {
        Row: {
          id: string
          purchased_at: string
          server_id: string
          ton_paid: number
          user_id: string
        }
        Insert: {
          id?: string
          purchased_at?: string
          server_id: string
          ton_paid: number
          user_id: string
        }
        Update: {
          id?: string
          purchased_at?: string
          server_id?: string
          ton_paid?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_servers_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_servers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tasks: {
        Row: {
          completed_at: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      winner_broadcast: {
        Row: {
          created_at: string
          failed: number
          id: number
          image_url: string
          sent: number
          status: string
          updated_at: string
          winner_profile_id: string | null
          winner_username: string | null
        }
        Insert: {
          created_at?: string
          failed?: number
          id?: number
          image_url: string
          sent?: number
          status?: string
          updated_at?: string
          winner_profile_id?: string | null
          winner_username?: string | null
        }
        Update: {
          created_at?: string
          failed?: number
          id?: number
          image_url?: string
          sent?: number
          status?: string
          updated_at?: string
          winner_profile_id?: string | null
          winner_username?: string | null
        }
        Relationships: []
      }
      winner_broadcast_log: {
        Row: {
          delivered: boolean
          profile_id: string
          sent_at: string
        }
        Insert: {
          delivered: boolean
          profile_id: string
          sent_at?: string
        }
        Update: {
          delivered?: boolean
          profile_id?: string
          sent_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ad_click_claim: { Args: { _telegram_id: number }; Returns: Json }
      ad_click_get_progress: { Args: { _telegram_id: number }; Returns: Json }
      ad_click_increment: { Args: { _telegram_id: number }; Returns: Json }
      ad_watch_claim:
        | { Args: { _telegram_id: number }; Returns: Json }
        | { Args: { _telegram_id: number; _tier?: string }; Returns: Json }
      ad_watch_get_progress: { Args: { _telegram_id: number }; Returns: Json }
      ad_watch_increment: {
        Args: { _telegram_id: number; _tier?: string }
        Returns: Json
      }
      admin_activate_character_for_telegram: {
        Args: { _character_id: string; _telegram_id: number }
        Returns: Json
      }
      admin_activate_reward_for_telegram: {
        Args: { _reward_amount: number; _telegram_id: number }
        Returns: Json
      }
      admin_broadcast_notification_for_telegram: {
        Args: { _message: string; _telegram_id: number; _title: string }
        Returns: Json
      }
      admin_cleanup_expired_rewards: { Args: never; Returns: Json }
      admin_create_character_for_telegram:
        | {
            Args: {
              _image_url: string
              _max_hp: number
              _name: string
              _telegram_id: number
            }
            Returns: Json
          }
        | {
            Args: {
              _image_url: string
              _max_hp: number
              _name: string
              _telegram_id: number
            }
            Returns: Json
          }
      admin_create_server_for_telegram:
        | {
            Args: {
              _attack_boost: number
              _image_url: string
              _mining_boost: number
              _name: string
              _price_ton: number
              _rarity: string
              _telegram_id: number
              _ton_mining_rate: number
              _usdt_mining_rate: number
            }
            Returns: Json
          }
        | {
            Args: {
              _attack_boost: number
              _image_url: string
              _mining_boost: number
              _name: string
              _price_ton: number
              _rarity: string
              _telegram_id: number
              _ton_mining_rate: number
              _usdt_mining_rate: number
            }
            Returns: Json
          }
      admin_delete_task_for_telegram: {
        Args: { _task_id: string; _telegram_id: number }
        Returns: Json
      }
      admin_get_dashboard_for_telegram: {
        Args: { _telegram_id: number }
        Returns: Json
      }
      admin_pin_task_for_telegram: {
        Args: { _is_pinned: boolean; _task_id: string; _telegram_id: number }
        Returns: Json
      }
      admin_set_welcome_image_for_telegram: {
        Args: { _telegram_id: number; _url: string }
        Returns: Json
      }
      admin_toggle_ban_for_telegram: {
        Args: { _is_banned: boolean; _profile_id: string; _telegram_id: number }
        Returns: Json
      }
      admin_toggle_task_for_telegram: {
        Args: { _is_active: boolean; _task_id: string; _telegram_id: number }
        Returns: Json
      }
      admin_upsert_task_for_telegram: {
        Args: {
          _link: string
          _reward_amount: number
          _reward_type: string
          _task_id: string
          _task_type: string
          _telegram_id: number
          _title: string
        }
        Returns: Json
      }
      ai_activate_plan: {
        Args: { _plan: string; _price: number; _profile_id: string }
        Returns: {
          created_at: string
          expires_at: string | null
          id: string
          images_used: number
          period_start: string
          plan: string
          profile_id: string
          status: string
          updated_at: string
          videos_used: number
        }
        SetofOptions: {
          from: "*"
          to: "ai_subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ai_activate_plan_with_intent: {
        Args: {
          _intent_id: string
          _plan: string
          _profile_id: string
          _telegram_id: number
        }
        Returns: {
          created_at: string
          expires_at: string | null
          id: string
          images_used: number
          period_start: string
          plan: string
          profile_id: string
          status: string
          updated_at: string
          videos_used: number
        }
        SetofOptions: {
          from: "*"
          to: "ai_subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ai_get_subscription: {
        Args: { _profile_id: string }
        Returns: {
          created_at: string
          expires_at: string | null
          id: string
          images_used: number
          period_start: string
          plan: string
          profile_id: string
          status: string
          updated_at: string
          videos_used: number
        }
        SetofOptions: {
          from: "*"
          to: "ai_subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      all_prize_broadcast_targets: {
        Args: { _limit?: number; _offset?: number }
        Returns: {
          first_name: string
          id: string
          telegram_id: number
        }[]
      }
      attach_referral_for_telegram: {
        Args: { _code: string; _telegram_id: number }
        Returns: Json
      }
      complete_task_for_telegram: {
        Args: { _task_id: string; _telegram_id: number }
        Returns: Json
      }
      consume_ton_intent: {
        Args: { _action: string; _intent_id: string; _telegram_id: number }
        Returns: number
      }
      create_smart_offer_for_telegram: {
        Args: { _surface?: string; _telegram_id: number }
        Returns: Json
      }
      credit_ton_deposit_with_intent: {
        Args: {
          _intent_id: string
          _telegram_id: number
          _wallet_address?: string
        }
        Returns: Json
      }
      expire_prize_rewards: { Args: never; Returns: number }
      game_crash_cashout: {
        Args: { _at: number; _bet_id: string; _telegram_id: number }
        Returns: Json
      }
      game_crash_history: {
        Args: { _limit?: number }
        Returns: {
          crash_multiplier: number
          round_id: number
        }[]
      }
      game_crash_pick: { Args: { _u: number; _v: number }; Returns: number }
      game_crash_players: {
        Args: { _exclude?: number; _limit?: number; _round: number }
        Returns: {
          name: string
          photo_url: string
        }[]
      }
      game_crash_round_result: { Args: { _round_id: number }; Returns: number }
      game_crash_start:
        | { Args: { _stake: number; _telegram_id: number }; Returns: Json }
        | {
            Args: { _round_id?: number; _stake: number; _telegram_id: number }
            Returns: Json
          }
      game_create_own_profile: {
        Args: {
          _first_name: string
          _last_name: string
          _photo_url: string
          _telegram_id: number
          _username: string
        }
        Returns: Json
      }
      game_create_transaction: {
        Args: {
          _amount: number
          _currency: string
          _status?: string
          _telegram_id: number
          _tx_hash?: string
          _type: string
          _wallet_address: string
        }
        Returns: Json
      }
      game_credit_referral: {
        Args: { _source: string; _ton_paid: number; _user_id: string }
        Returns: number
      }
      game_get_own_profile: { Args: { _telegram_id: number }; Returns: Json }
      game_is_wallet_verified: {
        Args: { _telegram_id: number }
        Returns: boolean
      }
      game_place_bet_for_telegram: {
        Args: { _game_slug: string; _stake: number; _telegram_id: number }
        Returns: Json
      }
      game_play_round: {
        Args: {
          _game_slug: string
          _params?: Json
          _stake: number
          _telegram_id: number
        }
        Returns: Json
      }
      game_profile_id: { Args: { _telegram_id: number }; Returns: string }
      game_public_profiles: {
        Args: { _ids: string[] }
        Returns: {
          first_name: string
          id: string
          photo_url: string
          username: string
        }[]
      }
      game_settle_bet_for_telegram: {
        Args: { _bet_id: string; _telegram_id: number; _won: boolean }
        Returns: Json
      }
      get_battle_inventory_for_telegram: {
        Args: { _telegram_id: number }
        Returns: Json
      }
      get_payment_discount_for_telegram: {
        Args: { _telegram_id: number }
        Returns: Json
      }
      get_referral_summary_for_telegram: {
        Args: { _telegram_id: number }
        Returns: Json
      }
      get_server_time: { Args: never; Returns: string }
      grant_prize_to_all: { Args: never; Returns: Json }
      grant_referral_reward: {
        Args: {
          _buyer_profile_id: string
          _source_id: string
          _source_type: string
          _ton_amount: number
        }
        Returns: number
      }
      grant_welcome_prize: { Args: { _telegram_id: number }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_telegram_admin: { Args: { _telegram_id: number }; Returns: boolean }
      next_prize_broadcast_targets: {
        Args: { _limit: number }
        Returns: {
          first_name: string
          id: string
          telegram_id: number
        }[]
      }
      perform_attack_for_telegram: {
        Args: {
          _attack_type?: string
          _package_key?: string
          _telegram_id: number
        }
        Returns: Json
      }
      purchase_battle_item_for_telegram: {
        Args: {
          _category: string
          _package_key: string
          _package_name: string
          _quantity: number
          _telegram_id: number
          _ton_paid: number
          _tx_hash?: string
          _wallet_address?: string
        }
        Returns: Json
      }
      purchase_battle_item_with_balance: {
        Args: {
          _category: string
          _package_key: string
          _package_name: string
          _price: number
          _quantity: number
          _telegram_id: number
        }
        Returns: Json
      }
      purchase_battle_item_with_intent: {
        Args: {
          _category: string
          _intent_id: string
          _package_key: string
          _package_name: string
          _quantity: number
          _telegram_id: number
          _wallet_address?: string
        }
        Returns: Json
      }
      purchase_server_for_telegram: {
        Args: {
          _server_id: string
          _telegram_id: number
          _ton_paid: number
          _tx_hash?: string
          _wallet_address?: string
        }
        Returns: Json
      }
      purchase_server_with_balance: {
        Args: { _server_id: string; _telegram_id: number }
        Returns: Json
      }
      purchase_server_with_intent: {
        Args: {
          _intent_id: string
          _server_id: string
          _telegram_id: number
          _wallet_address?: string
        }
        Returns: Json
      }
      pvp_add_bots: {
        Args: { _count: number; _match_id: string }
        Returns: Json
      }
      pvp_buy_character: {
        Args: {
          _character_key: string
          _telegram_id: number
          _ton_paid: number
          _tx_hash: string
        }
        Returns: Json
      }
      pvp_buy_weapon: {
        Args: {
          _telegram_id: number
          _ton_paid: number
          _tx_hash: string
          _weapon_key: string
        }
        Returns: Json
      }
      pvp_equip_character: {
        Args: { _character_key: string; _telegram_id: number }
        Returns: Json
      }
      pvp_find_or_create_match: {
        Args: { _mode?: string; _telegram_id: number; _weapon_key?: string }
        Returns: Json
      }
      pvp_finish_match: {
        Args: { _match_id: string; _telegram_id: number }
        Returns: Json
      }
      pvp_get_characters: { Args: { _telegram_id: number }; Returns: Json }
      pvp_get_loadout: { Args: { _telegram_id: number }; Returns: Json }
      pvp_leaderboard: { Args: { _limit?: number }; Returns: Json }
      pvp_report_frag: {
        Args: {
          _alive: boolean
          _deaths: number
          _kills: number
          _match_id: string
          _score: number
          _telegram_id: number
        }
        Returns: Json
      }
      pvp_set_match_character: {
        Args: {
          _character_key: string
          _match_id: string
          _telegram_id: number
        }
        Returns: Json
      }
      pvp_start_match: { Args: { _match_id: string }; Returns: Json }
      queue_telegram_notification: {
        Args: {
          _message: string
          _metadata?: Json
          _notification_type: string
          _profile_id: string
          _scheduled_for?: string
          _title: string
        }
        Returns: string
      }
      request_withdrawal_for_telegram: {
        Args: {
          _amount: number
          _currency: string
          _telegram_id: number
          _wallet_address?: string
        }
        Returns: Json
      }
      staking_claim_for_telegram: {
        Args: { _stake_id: string; _telegram_id: number }
        Returns: Json
      }
      staking_create_for_telegram: {
        Args: { _amount: number; _plan_id: string; _telegram_id: number }
        Returns: Json
      }
      staking_get_overview_for_telegram: {
        Args: { _telegram_id: number }
        Returns: Json
      }
      staking_pending_yield: {
        Args: { _stake: Database["public"]["Tables"]["stakes"]["Row"] }
        Returns: number
      }
      staking_unstake_for_telegram: {
        Args: { _stake_id: string; _telegram_id: number }
        Returns: Json
      }
      start_mining_for_telegram: {
        Args: { _telegram_id: number }
        Returns: Json
      }
      sync_mining_for_telegram: {
        Args: { _telegram_id: number }
        Returns: Json
      }
      trigger_daily_post: { Args: { _app: string }; Returns: undefined }
      verify_wallet_with_intent: {
        Args: {
          _intent_id: string
          _telegram_id: number
          _wallet_address?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
