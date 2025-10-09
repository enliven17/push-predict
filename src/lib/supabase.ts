import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface BetActivity {
  id: string
  market_id: number | string
  user_address: string
  chain_namespace?: string
  original_address?: string
  option: number
  amount: string
  shares: string
  tx_hash: string
  block_number?: number
  created_at: string
  market_title?: string
  option_a?: string
  option_b?: string
}

export interface Comment {
  id: string
  market_id: string
  user_address: string
  content: string
  created_at: string
  updated_at: string
}