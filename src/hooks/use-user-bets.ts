import { useState, useEffect } from 'react'
import { supabase, BetActivity } from '@/lib/supabase'
import { toast } from 'sonner'

export const useUserBets = (userAddress?: string) => {
    const [userBets, setUserBets] = useState<BetActivity[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch user's bet activities
    const fetchUserBets = async () => {
        if (!userAddress) {
            setUserBets([])
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            // First try user_address
            const { data: userBets, error: userError } = await supabase
                .from('bet_activities')
                .select('*')
                .eq('user_address', userAddress)
                .order('created_at', { ascending: false });

            if (userError) {
                throw userError;
            }

            // Then try original_address
            const { data: originalBets, error: originalError } = await supabase
                .from('bet_activities')
                .select('*')
                .eq('original_address', userAddress)
                .order('created_at', { ascending: false });

            if (originalError) {
                throw originalError;
            }

            // Combine and deduplicate
            const allBets = [...(userBets || []), ...(originalBets || [])];
            const uniqueBets = allBets.filter((bet, index, self) => 
                index === self.findIndex(b => b.id === bet.id)
            );

            const data = uniqueBets.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            if (error) {
                throw error
            }

            setUserBets(data)
        } catch (err: any) {
            console.error('Error fetching user bets:', err)
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Get user bets for specific market
    const getUserBetsForMarket = (marketId: string) => {
        const numericMarketId = parseInt(marketId);
        const filteredBets = userBets.filter(bet => {
            const betMarketId = typeof bet.market_id === 'string' ? parseInt(bet.market_id) : bet.market_id;
            return betMarketId === numericMarketId;
        });
        
        console.log(`🔍 getUserBetsForMarket: marketId=${marketId}, numericMarketId=${numericMarketId}`);
        console.log(`📊 Total user bets: ${userBets.length}, Filtered bets: ${filteredBets.length}`);
        console.log('📝 User bets:', userBets.map(bet => ({ id: bet.id, market_id: bet.market_id, amount: bet.amount })));
        
        return filteredBets;
    }

    // Get user's total stats
    const getUserStats = () => {
        const totalBets = userBets.length
        const totalAmount = userBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0)
        const totalShares = userBets.reduce((sum, bet) => sum + parseFloat(bet.shares), 0)
        const uniqueMarkets = new Set(userBets.map(bet => bet.market_id)).size

        return {
            totalBets,
            totalAmount,
            totalShares,
            uniqueMarkets
        }
    }

    useEffect(() => {
        fetchUserBets()
    }, [userAddress])

    return {
        userBets,
        isLoading,
        error,
        refetch: fetchUserBets,
        getUserBetsForMarket,
        getUserStats
    }
}