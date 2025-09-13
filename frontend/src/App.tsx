import { useState, useEffect } from "react";
import { ethers } from "ethers";
import EthereumProvider from "@walletconnect/ethereum-provider";
import {
  Wallet,
  LogOut,
  Moon,
  Sun,
  Loader2,
  Rocket,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import FEE_MANAGER_ABI from "./abi/FeeManager.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as string;
const RPC_URL = import.meta.env.VITE_RPC_URL as string;
const WC_PROJECT_ID = import.meta.env.VITE_WC_PROJECT_ID as string;

export default function App() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [address, setAddress] = useState<string>("");
  const [status, setStatus] = useState<string>("Idle");
  const [txHash, setTxHash] = useState<string>("");

  const [ethValue, setEthValue] = useState<string>("0.01");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Apply theme to <html> so Tailwind dark mode works properly
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);
async function connect() {
  try {
    setStatus("Connecting wallet...");

    // Check if browser has an injected wallet (MetaMask, etc.)
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const injected = (window as any).ethereum;
      const ethersProvider = new ethers.BrowserProvider(injected);
      setProvider(ethersProvider);

      const signer = await ethersProvider.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);
      setStatus("Connected via Injected Wallet");
      return;
    }

    // Fallback to WalletConnect if no injected wallet
    const ethProvider = await EthereumProvider.init({
      projectId: WC_PROJECT_ID,
      chains: [11155111], // Sepolia
      rpcMap: { 11155111: RPC_URL },
      showQrModal: true,
    });

    await ethProvider.enable();

    const ethersProvider = new ethers.BrowserProvider(ethProvider as any);
    setProvider(ethersProvider);

    const signer = await ethersProvider.getSigner();
    const addr = await signer.getAddress();
    setAddress(addr);
    setStatus(" Connected via WalletConnect");
  } catch (err: any) {
    console.error(err);
    setStatus(" Connect failed: " + (err?.message || String(err)));
  }
}

  async function disconnect() {
    setProvider(null);
    setAddress("");
    setStatus("Disconnected");
    setTxHash("");
  }

  async function execute() {
    if (!provider) {
      setStatus("Please connect wallet first!");
      return;
    }
    try {
      setStatus("Preparing transaction...");
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, FEE_MANAGER_ABI, signer);

      const valueBn = ethers.parseEther(ethValue);
      const feeBn = ethers.parseEther("0.01");
      const total = valueBn + feeBn;

      const tx = await contract.payAndCall(ethers.ZeroAddress, "0x", {
        value: total,
      });

      setTxHash(tx.hash);
      setStatus("Transaction sent...");
      await tx.wait();
      setStatus("Transaction Confirmed ");
    }catch (err: any) {
  console.error(err);

  if (err.code === "ACTION_REJECTED" || err.code === 4001) {
    setStatus("Transaction rejected by user");
  } else {
    setStatus("Execution error: " + (err?.message || String(err)));
  }
}
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition">
      {/* Theme toggle */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="px-4 py-2 flex items-center gap-2 rounded-md bg-gray-800 text-white dark:bg-gray-200 dark:text-black"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
            FeeManager DApp
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            WalletConnect v2 + Ethers.js + Sepolia
          </p>

          {/* Wallet connect/disconnect */}
          {!address ? (
            <button
              onClick={connect}
              className="w-full py-3 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Wallet size={18} /> Connect Wallet
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">
                <div className="truncate font-mono text-sm text-gray-700 dark:text-gray-200">
                  {address}
                </div>
                <button
                  onClick={disconnect}
                  className="px-3 py-1 flex items-center gap-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  <LogOut size={16} /> Disconnect
                </button>
              </div>

              {/* ETH Input */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  ETH to Send (excl. fee)
                </label>
                <input
                  className="w-full border rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:text-white"
                  value={ethValue}
                  onChange={(e) => setEthValue(e.target.value)}
                  placeholder="Enter ETH amount"
                />
              </div>

              <div className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Fixed Fee:</strong> 0.01 ETH
              </div>

              <button
                onClick={execute}
                disabled={!address}
                className="w-full py-3 flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <Rocket size={18} /> Execute Transaction
              </button>
            </div>
          )}

          {/* Status + Etherscan */}
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600 text-sm">
            <div className="flex items-center gap-2">
              {status.includes("Preparing") && <Loader2 size={16} className="animate-spin" />}
              {status.includes("Confirmed") && <CheckCircle2 size={16} className="text-green-500" />}
              {status.includes("error") && <AlertTriangle size={16} className="text-red-500" />}
              <strong>Status:</strong> {status}
            </div>
            {txHash && (
              <div className="mt-2 flex items-center gap-1">
                <ExternalLink size={14} />
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View on Etherscan
                </a>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Contract: {CONTRACT_ADDRESS}
          </div>
        </div>
      </div>
    </div>
  );
}
