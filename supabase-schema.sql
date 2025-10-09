-- PushPredict Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    chain_namespace TEXT DEFAULT 'eip155:42101',
    original_address TEXT,
    username TEXT,
    avatar_url TEXT,
    bio TEXT,
    total_volume DECIMAL(20, 8) DEFAULT 0,
    total_bets INTEGER DEFAULT 0,
    win_rate DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Markets table
CREATE TABLE IF NOT EXISTS public.markets (
    id BIGINT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    category INTEGER NOT NULL,
    creator_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    min_bet DECIMAL(20, 8) NOT NULL,
    max_bet DECIMAL(20, 8) NOT NULL,
    status INTEGER DEFAULT 0,
    outcome INTEGER,
    resolved BOOLEAN DEFAULT FALSE,
    total_option_a_shares DECIMAL(20, 8) DEFAULT 0,
    total_option_b_shares DECIMAL(20, 8) DEFAULT 0,
    total_pool DECIMAL(20, 8) DEFAULT 0,
    image_url TEXT,
    supported_chains TEXT[] DEFAULT ARRAY['eip155:42101', 'eip155:11155111', 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'],
    is_universal BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bet activities table
CREATE TABLE IF NOT EXISTS public.bet_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    market_id BIGINT NOT NULL REFERENCES public.markets(id),
    user_address TEXT NOT NULL,
    chain_namespace TEXT DEFAULT 'eip155:42101',
    original_address TEXT,
    option INTEGER NOT NULL CHECK (option IN (0, 1)),
    amount DECIMAL(20, 8) NOT NULL,
    shares DECIMAL(20, 8) NOT NULL,
    tx_hash TEXT NOT NULL,
    block_number BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User positions table
CREATE TABLE IF NOT EXISTS public.user_positions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    market_id BIGINT NOT NULL REFERENCES public.markets(id),
    user_address TEXT NOT NULL,
    chain_namespace TEXT DEFAULT 'eip155:42101',
    original_address TEXT,
    option_a_shares DECIMAL(20, 8) DEFAULT 0,
    option_b_shares DECIMAL(20, 8) DEFAULT 0,
    total_invested DECIMAL(20, 8) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(market_id, user_address)
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    market_id BIGINT NOT NULL REFERENCES public.markets(id),
    user_address TEXT NOT NULL,
    chain_namespace TEXT DEFAULT 'eip155:42101',
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.comments(id),
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market resolutions table
CREATE TABLE IF NOT EXISTS public.market_resolutions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    market_id BIGINT NOT NULL REFERENCES public.markets(id),
    resolver_address TEXT NOT NULL,
    outcome INTEGER NOT NULL CHECK (outcome IN (0, 1)),
    tx_hash TEXT NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cross-chain bets tracking
CREATE TABLE IF NOT EXISTS public.cross_chain_bets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    market_id BIGINT NOT NULL REFERENCES public.markets(id),
    user_address TEXT NOT NULL,
    origin_chain TEXT NOT NULL,
    origin_address TEXT NOT NULL,
    destination_chain TEXT DEFAULT 'eip155:42101',
    tx_hash TEXT NOT NULL,
    bridge_tx_hash TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Leaderboard view
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    u.wallet_address,
    u.username,
    u.avatar_url,
    u.total_volume,
    u.total_bets,
    u.win_rate,
    COUNT(DISTINCT ba.market_id) as markets_participated,
    SUM(CASE WHEN m.resolved AND 
        ((ba.option = 0 AND m.outcome = 0) OR (ba.option = 1 AND m.outcome = 1))
        THEN ba.amount ELSE 0 END) as total_winnings
FROM public.users u
LEFT JOIN public.bet_activities ba ON u.wallet_address = ba.user_address
LEFT JOIN public.markets m ON ba.market_id = m.id
GROUP BY u.wallet_address, u.username, u.avatar_url, u.total_volume, u.total_bets, u.win_rate
ORDER BY u.total_volume DESC;

-- Market statistics view
CREATE OR REPLACE VIEW public.market_stats AS
SELECT 
    m.*,
    COUNT(DISTINCT ba.user_address) as unique_participants,
    COUNT(ba.id) as total_bets,
    CASE 
        WHEN m.total_option_a_shares + m.total_option_b_shares > 0 
        THEN (m.total_option_a_shares / (m.total_option_a_shares + m.total_option_b_shares)) * 100
        ELSE 50 
    END as option_a_probability
FROM public.markets m
LEFT JOIN public.bet_activities ba ON m.id = ba.market_id
GROUP BY m.id;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_chain_namespace ON public.users(chain_namespace);
CREATE INDEX IF NOT EXISTS idx_markets_status ON public.markets(status);
CREATE INDEX IF NOT EXISTS idx_markets_end_time ON public.markets(end_time);
CREATE INDEX IF NOT EXISTS idx_markets_category ON public.markets(category);
CREATE INDEX IF NOT EXISTS idx_bet_activities_market_id ON public.bet_activities(market_id);
CREATE INDEX IF NOT EXISTS idx_bet_activities_user_address ON public.bet_activities(user_address);
CREATE INDEX IF NOT EXISTS idx_bet_activities_created_at ON public.bet_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_user_positions_market_user ON public.user_positions(market_id, user_address);
CREATE INDEX IF NOT EXISTS idx_comments_market_id ON public.comments(market_id);
CREATE INDEX IF NOT EXISTS idx_cross_chain_bets_market_id ON public.cross_chain_bets(market_id);
CREATE INDEX IF NOT EXISTS idx_cross_chain_bets_status ON public.cross_chain_bets(status);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bet_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_chain_bets ENABLE ROW LEVEL SECURITY;

-- Public read access for most tables
CREATE POLICY "Public read access" ON public.markets FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.bet_activities FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.user_positions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.market_resolutions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.cross_chain_bets FOR SELECT USING (true);

-- Insert policies (authenticated users can insert their own data)
CREATE POLICY "Users can insert own data" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert bet activities" ON public.bet_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert positions" ON public.user_positions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert cross-chain bets" ON public.cross_chain_bets FOR INSERT WITH CHECK (true);

-- Update policies
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Users can update own positions" ON public.user_positions FOR UPDATE USING (true);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (true);

-- Admin policies for markets and resolutions (you'll need to adjust these based on your admin setup)
CREATE POLICY "Admin can manage markets" ON public.markets FOR ALL USING (true);
CREATE POLICY "Admin can manage resolutions" ON public.market_resolutions FOR ALL USING (true);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON public.markets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_positions_updated_at BEFORE UPDATE ON public.user_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data insertion (optional - for testing)
-- You can uncomment these if you want some test data

/*
-- Insert sample user
INSERT INTO public.users (wallet_address, chain_namespace, username) 
VALUES ('0x71197e7a1CA5A2cb2AD82432B924F69B1E3dB123', 'eip155:42101', 'PushPredict Admin')
ON CONFLICT (wallet_address) DO NOTHING;

-- Insert sample markets (these should match your on-chain markets)
INSERT INTO public.markets (
    id, title, description, option_a, option_b, category, creator_address, 
    created_at, end_time, min_bet, max_bet, image_url
) VALUES 
(5, 'Bitcoin Price Prediction - Will BTC reach $150,000 by December 31, 2025?', 
 'Predict whether Bitcoin (BTC) will reach or exceed $150,000 USD by December 31, 2025. This market leverages Push Network''s universal cross-chain technology for seamless participation from any supported blockchain.',
 'Yes - BTC will reach $150,000', 'No - BTC will stay below $150,000', 1, 
 '0x71197e7a1CA5A2cb2AD82432B924F69B1E3dB123', NOW(), '2026-01-01 02:59:59+00', 
 0.01, 10.0, '/bitcoin.png'),
(6, 'Ethereum Price Prediction - Will ETH reach $6,000 by December 31, 2025?',
 'Predict whether Ethereum (ETH) will reach or exceed $6,000 USD by December 31, 2025. This market leverages Push Network''s universal features for seamless cross-chain participation from Ethereum, Solana, and Push Network.',
 'Yes - ETH will reach $6,000', 'No - ETH will stay below $6,000', 1,
 '0x71197e7a1CA5A2cb2AD82432B924F69B1E3dB123', NOW(), '2026-01-01 02:59:59+00',
 0.005, 5.0, '/ethereum.jpg')
ON CONFLICT (id) DO NOTHING;
*/