"use client";

import { useEffect, useRef } from "react";

const learnSections = [
  {
    id: "what-is-credit-predict",
    title: "What Is PushPredict",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        PushPredict is a revolutionary universal cross-chain prediction platform built on 
        Push Network's cutting-edge technology. Participants use PC tokens and other supported 
        cryptocurrencies to express beliefs about future events by staking on either a Yes or 
        a No outcome. The platform leverages Push Network's universal features to enable 
        seamless cross-chain participation from Ethereum, Solana, and other supported blockchains.
        The distribution of stakes across outcomes reflects the community's implied
        probability for each event.
      </p>
    ),
  },
  {
    id: "how-it-works",
    title: "How PushPredict Works",
    content: (
      <ul className="list-none space-y-2 text-gray-300 text-sm leading-relaxed">
        <li>
          <span className="font-semibold text-gray-100">Pick a Market:</span>{" "}
          Each market resolves to either Yes or No.
        </li>
        <li>
          <span className="font-semibold text-gray-100">Stake Universally:</span>{" "}
          Choose your side and stake PC tokens or other supported cryptocurrencies from any 
          connected chain. Stakes are locked in Push Network's universal smart contracts until resolution.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Cross-Chain Consensus:
          </span>{" "}
          The ratio of stakes from all supported chains indicates the market's current
          universal consensus across the entire ecosystem.
        </li>
        <li>
          <span className="font-semibold text-gray-100">Resolution:</span> When
          the outcome becomes known, the contract finalizes the winning side
          based on predefined rules.
        </li>
        <li>
          <span className="font-semibold text-gray-100">Payouts:</span> After
          deducting any applicable fee, the remaining pool is distributed
          proportionally to winners.
        </li>
      </ul>
    ),
  },
  {
    id: "why-use",
    title: "Why Use PushPredict",
    content: (
      <ul className="list-none space-y-2 text-gray-300 text-sm leading-relaxed">
        <li>
          <span className="font-semibold text-gray-100">Powered by Push Network:</span>{" "}
          Revolutionary universal cross-chain technology enabling seamless multi-blockchain interactions.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Universal Access:
          </span>{" "}
          Participate from any supported blockchain - Ethereum, Solana, Push Network, and more.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Cross-Chain Transparency:
          </span>{" "}
          Stakes, resolutions, and payouts are verifiable across all supported blockchains.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Global Collective Intelligence:
          </span>{" "}
          Market consensus aggregated from participants across multiple blockchain ecosystems.
        </li>
        <li>
          <span className="font-semibold text-gray-100">No House Edge:</span>{" "}
          PushPredict is a neutral universal protocol; it is not your counterparty.
        </li>
      </ul>
    ),
  },
  {
    id: "prediction-markets",
    title: "Prediction Markets Overview",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        Prediction markets are mechanisms where participants buy or stake value
        on future outcomes. Prices or stake ratios act as real-time
        probabilities. Incentives for correctness drive more accurate
        forecasting than polls in many contexts. Common categories include
        sports, politics, crypto, finance, culture, and other verifiable events.
      </p>
    ),
  },
  {
    id: "considerations",
    title: "Important Considerations",
    content: (
      <ul className="list-none space-y-2 text-gray-300 text-sm leading-relaxed">
        <li>
          <span className="font-semibold text-gray-100">Cross-Chain Risk:</span> If your
          prediction is incorrect, you may lose your staked PC tokens or other cryptocurrencies. 
          Cross-chain interactions may involve additional risks. Only stake what you can afford to lose.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Restricted Regions:
          </span>{" "}
          PushPredict is not available in the USA or jurisdictions that prohibit
          or restrict cryptocurrency, cross-chain protocols, or prediction market use.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            No Financial Advice:
          </span>{" "}
          PushPredict provides an information and education platform; it does not
          provide investment or legal advice.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Universal Transparency:
          </span>{" "}
          All activity is public, immutable, and auditable across Push Network
          and all supported blockchains.
        </li>
      </ul>
    ),
  },
  {
    id: "getting-started",
    title: "Getting Started",
    content: (
      <ul className="list-none space-y-2 text-gray-300 text-sm leading-relaxed">
        <li>
          <span className="font-semibold text-gray-100">
            Create Universal Wallet:
          </span>{" "}
          Use a Push Network-compatible wallet (MetaMask for EVM chains, Phantom for Solana) 
          and secure your seed phrase.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Acquire PC Tokens:
          </span>{" "}
          Get PC tokens via Push Network testnet faucet or bridge from supported chains 
          and transfer them to your wallet.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Connect to PushPredict:
          </span>{" "}
          Visit the platform and link your universal wallet from any supported chain.
        </li>
        <li>
          <span className="font-semibold text-gray-100">Explore Universal Markets:</span>{" "}
          Browse cross-chain active markets, choose an outcome, and stake PC or other supported tokens.
        </li>
        <li>
          <span className="font-semibold text-gray-100">Track & Withdraw:</span>{" "}
          Monitor events and claim payouts after resolution if you were correct.
        </li>
      </ul>
    ),
  },
  {
    id: "use-cases",
    title: "Educational Use Cases",
    content: (
      <ul className="list-none space-y-2 text-gray-300 text-sm leading-relaxed">
        <li>
          <span className="font-semibold text-gray-100">
            Learn Blockchain and Smart Contracts:
          </span>{" "}
          Observe how on-chain logic secures value and automates payouts.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Study Probability and Game Theory:
          </span>{" "}
          See how incentives shape collective forecasts.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Alternative Data for Analysis:
          </span>{" "}
          Use market consensus as an input for research and analytics.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Community Engagement:
          </span>{" "}
          Coordinate predictions around governance or social outcomes.
        </li>
      </ul>
    ),
  },
  {
    id: "payout-calculation",
    title: "Payout Calculation",
    content: (
      <div className="space-y-4">
        <p className="text-gray-300 text-sm leading-relaxed">
          PushPredict distributes winnings using a proportional (pro-rata) model across
          all supported chains. After deducting any platform or market-level fee, the remaining pool
          is split among all participants on the correct outcome in proportion
          to their stake, regardless of which blockchain they participated from.
        </p>
        <p className="text-gray-300 text-sm leading-relaxed">
          <span className="font-semibold text-gray-100">Formula:</span>
          <br />
          Payout = (User's Stake ÷ Total Winning Stake) × (Total Pool − Fee)
        </p>
        <p className="text-gray-300 text-sm leading-relaxed">
          <span className="font-semibold text-gray-100">Worked Example:</span>
          <br />
          Total Pool: 1,000 PC | Platform Fee: 2.5% (25 PC) | Remaining Pool:
          975 PC
          <br />
          Outcome A (Winner): 400 PC | Outcome B (Loser): 600 PC
          <br />
          Emma stakes 100 PC on Outcome A → Emma's share = 100 ÷ 400 = 25% →
          Payout = 25% × 975 = 243.75 PC
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300 border-collapse">
            <thead>
              <tr className="bg-[#2a2c38] text-gray-100">
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Stake (PC)</th>
                <th className="p-2 text-left">Outcome Picked</th>
                <th className="p-2 text-left">Result</th>
                <th className="p-2 text-left">Payout (PC)</th>
                <th className="p-2 text-left">Profit (PC)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-700">
                <td className="p-2">Emma</td>
                <td className="p-2">100</td>
                <td className="p-2">A (Winner)</td>
                <td className="p-2">Win</td>
                <td className="p-2">243.75</td>
                <td className="p-2">+143.75</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2">Liam</td>
                <td className="p-2">150</td>
                <td className="p-2">A (Winner)</td>
                <td className="p-2">Win</td>
                <td className="p-2">365.63</td>
                <td className="p-2">+215.63</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2">Sophia</td>
                <td className="p-2">150</td>
                <td className="p-2">A (Winner)</td>
                <td className="p-2">Win</td>
                <td className="p-2">365.63</td>
                <td className="p-2">+215.63</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2">Noah</td>
                <td className="p-2">600</td>
                <td className="p-2">B (Loser)</td>
                <td className="p-2">Lose</td>
                <td className="p-2">0.00</td>
                <td className="p-2">−600.00</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-gray-400 text-xs italic mt-2">
          Note: Fees and parameters may vary by market and are disclosed before
          you stake. All values and examples above are illustrative.
        </p>
      </div>
    ),
  },
];

const Page = () => {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToSection = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, learnSections.length);
  }, []);

  return (
    <div className="text-white min-h-screen flex flex-col mt-4">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          PushPredict Learn
        </h1>
        <p className="text-gray-200 text-sm mt-2">
          Effective Date: October 7, 2025 | Last Updated: October 7, 2025
        </p>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Sidebar */}
        <aside className="lg:w-1/4 bg-[#1a1c26] p-4 rounded-lg lg:sticky lg:top-8 h-fit">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Sections</h2>
          <ul className="space-y-2">
            {learnSections.map((section, index) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(index)}
                  className="text-sm text-gray-400 hover:text-[#e91e63] transition-colors duration-150 w-full text-left py-1"
                >
                  {index + 1}. {section.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="lg:w-3/4 space-y-8">
          {learnSections.map((section, index) => (
            <div
              key={section.id}
              ref={(el) => {
                if (el) sectionRefs.current[index] = el;
              }}
              className="p-6"
            >
              <h2 className="text-lg font-semibold text-gray-100 mb-3">
                {index + 1}. {section.title}
              </h2>
              {section.content}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

export default Page;