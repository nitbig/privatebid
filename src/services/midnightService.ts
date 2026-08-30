// src/services/midnightService.ts
import { sha256 } from 'js-sha256';

// Explicit States representing the smart contract ledger Status enum
export type AuctionStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'RESULT_AVAILABLE' | 'CANCELLED';
export type AuctionType = 'LOWEST_VALID_BID' | 'HIGHEST_VALID_BID';

export interface PublicLedgerState {
  address: string;
  owner: string;
  status: AuctionStatus;
  deadline: number; // UNIX timestamp
  auctionType: AuctionType;
  bidCount: number;
  isWinnerDetermined: boolean;
  winningBidder: string | null;
  winningBidValue: number | null;
  commitments: Record<string, string>; // bidderPublicKey -> commitmentHash
}

export interface WalletState {
  connected: boolean;
  address: string | null; // 64-character hex public key representing Midnight wallet address
  connecting: boolean;
}

export interface BidderPrivateData {
  bidValue: number;
  salt: string; // 32-byte hex salt
  commitment: string; // SHA-256 commitment hash
}

// In-memory ledger storage representing the blockchain node's public state
const LEDGER_STORAGE_KEY = 'privatebid_ledger_state';
const USER_PRIVATE_DATA_KEY = 'privatebid_user_private_data';

const DEFAULT_AUCTIONS: Record<string, PublicLedgerState> = {
  'pb_auction_nh33': {
    address: 'mn192a83bcdef0192837465f8a7d6e5d4c3b2a109876543210fedcba98765432',
    owner: 'mn000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
    status: 'OPEN',
    deadline: Date.now() + 2 * 60 * 60 * 1000, // 2 hours from now
    auctionType: 'LOWEST_VALID_BID',
    bidCount: 3,
    isWinnerDetermined: false,
    winningBidder: null,
    winningBidValue: null,
    commitments: {
      'mn_bidder_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e': 'c59501861053a478832a8219ef66bdf20b9213bc589a1bde3347f8ae26c11a2f',
      'mn_bidder_f9e8d7c6b5a493827160eeddccbbaa0099887766554433221100ffeeeedd': 'f7d2f9e422f98e72b4c10de53a7b689a716c59d8ba6a12bde64a7c8ae2361bfa',
      'mn_bidder_99887766554433221100ffeeeeddaabbccddeeff00112233445566778899': 'a9b2c3d4e5f6192837465f8a7d6e5d4c3b2a109876543210fedcba9876543210'
    }
  },
  'pb_auction_drainage': {
    address: 'mn9876543210fedcba9876543210abcdef0192837465f8a7d6e5d4c3b2a10987',
    owner: 'mn000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
    status: 'CLOSED',
    deadline: Date.now() - 30 * 60 * 1000, // Closed 30 minutes ago
    auctionType: 'LOWEST_VALID_BID',
    bidCount: 2,
    isWinnerDetermined: true,
    winningBidder: 'mn_bidder_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e',
    winningBidValue: 6500000,
    commitments: {
      'mn_bidder_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      'mn_bidder_f9e8d7c6b5a493827160eeddccbbaa0099887766554433221100ffeeeedd': '8798e09e3e9d89ee5d4d3a2b109e2b109e201bda6a12bde64a7c8ae2361bfa82a'
    }
  },
  'pb_auction_bridge': {
    address: 'mn5555555555555555555555555555555555555555555555555555555555555555',
    owner: 'mn1111111111111111111111111111111111111111111111111111111111111111',
    status: 'RESULT_AVAILABLE',
    deadline: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
    auctionType: 'LOWEST_VALID_BID',
    bidCount: 4,
    isWinnerDetermined: true,
    winningBidder: 'mn_bidder_contractor_c',
    winningBidValue: 3950000,
    commitments: {
      'mn_bidder_contractor_a': '938e21a09df2bc394a1b0928e3b0920df38a1bde3347f8ae26c11a2f9012a9be',
      'mn_bidder_contractor_b': 'c59501861053a478832a8219ef66bdf20b9213bc589a1bde3347f8ae26c11a2f',
      'mn_bidder_contractor_c': '59a842fbc9ea0283bd7a810d9e2a1bde02f1a2384a1bde02f3a47f8ae2361bfa',
      'mn_bidder_contractor_d': 'a9b2c3d4e5f6192837465f8a7d6e5d4c3b2a109876543210fedcba9876543210'
    }
  }
};

export class MidnightService {
  private static loadState(): Record<string, PublicLedgerState> {
    const raw = localStorage.getItem(LEDGER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(DEFAULT_AUCTIONS));
      return DEFAULT_AUCTIONS;
    }
    return JSON.parse(raw);
  }

  private static saveState(state: Record<string, PublicLedgerState>) {
    localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(state));
  }

  private static loadUserPrivateBids(): Record<string, BidderPrivateData> {
    const raw = localStorage.getItem(USER_PRIVATE_DATA_KEY);
    return raw ? JSON.parse(raw) : {};
  }

  private static saveUserPrivateBid(auctionId: string, data: BidderPrivateData) {
    const bids = this.loadUserPrivateBids();
    bids[auctionId] = data;
    localStorage.setItem(USER_PRIVATE_DATA_KEY, JSON.stringify(bids));
  }

  // --- Real Cryptographic Helper (Off-chain Commitment) ---
  // Calculates: hash("privatebid:bid:" + salt_hex + hex(bidValue))
  public static calculateCommitment(bidValue: number, salt: string): string {
    const domain = "privatebid:bid:".padEnd(32, '\0');
    // Format the value as a 32-byte big-endian hex representation
    const valHex = bidValue.toString(16).padStart(64, '0');
    
    // Hash the domain, salt, and value together
    const hasher = sha256.create();
    hasher.update(domain);
    hasher.update(salt);
    hasher.update(valHex);
    return hasher.hex();
  }

  // Generate a random 32-byte (64 char) hex salt
  public static generateSalt(): string {
    const chars = '0123456789abcdef';
    let salt = '';
    for (let i = 0; i < 64; i++) {
      salt += chars[Math.floor(Math.random() * chars.length)];
    }
    return salt;
  }

  // --- Core Wallet Operations ---
  public static async connectMidnightWallet(): Promise<string> {
    // In a real Midnight integration:
    // const connector = window.midnight?.laceConnector;
    // const wallet = await connector.enable();
    // const publicAddress = await wallet.getPublicAddress();
    // return publicAddress;
    
    // Simulating wallet connector latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if we already have a wallet address, otherwise generate a persistent one
    let savedAddr = localStorage.getItem('midnight_wallet_address');
    if (!savedAddr) {
      savedAddr = 'mn' + this.generateSalt();
      localStorage.setItem('midnight_wallet_address', savedAddr);
    }
    return savedAddr;
  }

  // --- Getters ---
  public static getAuctions(): PublicLedgerState[] {
    const state = this.loadState();
    return Object.keys(state).map(id => ({
      ...state[id],
      id // Attach key as property
    })) as any[];
  }

  public static getAuction(auctionId: string): PublicLedgerState | null {
    const state = this.loadState();
    const auction = state[auctionId];
    if (!auction) return null;
    return {
      ...auction,
      id: auctionId
    } as any;
  }

  public static getPrivateBidData(auctionId: string): BidderPrivateData | null {
    const bids = this.loadUserPrivateBids();
    return bids[auctionId] || null;
  }

  // --- Contract Deployment (createAuction) ---
  public static async deployAuctionContract(
    title: string,
    description: string,
    estimatedValue: number,
    deadline: number,
    auctionType: AuctionType,
    category: string,
    currency: string = '$',
    onProgress?: (step: number, log: string) => void
  ): Promise<string> {
    // Phase 1: Compile Compact code & generate circuit constraints
    onProgress?.(1, 'Compiling smart contract: privatebid.compact...');
    await new Promise(r => setTimeout(r, 600));
    onProgress?.(1, 'Generated ZK Prover/Verifier keys for Deploy circuits.');

    // Phase 2: Call Midnight Node to fetch deployment parameters
    onProgress?.(2, 'Contacting Midnight network indexer & node...');
    await new Promise(r => setTimeout(r, 600));

    // Phase 3: Create deploying transaction & generate proof of initial state
    onProgress?.(3, 'Generating ZK proof for constructor parameters...');
    await new Promise(r => setTimeout(r, 800));
    onProgress?.(3, 'Prover constraint check passed. Constructor constraints verified.');

    // Phase 4: Request Lace wallet signature
    onProgress?.(4, 'Requesting authorization signature from Midnight wallet...');
    await new Promise(r => setTimeout(r, 800));

    // Phase 5: Submit deployment tx to Midnight Node
    onProgress?.(5, 'Submitting deploy transaction to Midnight Node...');
    await new Promise(r => setTimeout(r, 700));

    // Phase 6: Block confirmation
    onProgress?.(6, 'Deployment transaction confirmed on-chain in block.');

    const walletAddr = localStorage.getItem('midnight_wallet_address') || 'mn' + this.generateSalt();
    const auctionId = 'pb_auction_' + Date.now().toString(36);
    const contractAddr = 'mn' + this.generateSalt();

    const newAuction: PublicLedgerState = {
      address: contractAddr,
      owner: walletAddr,
      status: 'OPEN',
      deadline: deadline,
      auctionType: auctionType,
      bidCount: 0,
      isWinnerDetermined: false,
      winningBidder: null,
      winningBidValue: null,
      commitments: {}
    };

    // Store metadata locally (in real life, title, desc etc are in indexer or metadata server)
    localStorage.setItem(`pb_meta_${auctionId}`, JSON.stringify({
      title,
      description,
      estimatedValue,
      category,
      currency
    }));

    const state = this.loadState();
    state[auctionId] = newAuction;
    this.saveState(state);

    return auctionId;
  }

  // --- Bid Submission (submitBid) ---
  public static async submitBidTransaction(
    auctionId: string,
    bidValue: number,
    onProgress?: (step: number, log: string) => void
  ): Promise<{ txHash: string; bidderPk: string; commitment: string }> {
    const walletAddr = localStorage.getItem('midnight_wallet_address');
    if (!walletAddr) throw new Error("Wallet not connected");

    const auction = this.getAuction(auctionId);
    if (!auction) throw new Error("Auction not found");
    if (auction.status !== 'OPEN') throw new Error("Auction is no longer accepting bids");

    // Phase 1: Off-chain commitment hashing
    onProgress?.(1, 'Computing cryptographic commitment off-chain...');
    const salt = this.generateSalt();
    const commitment = this.calculateCommitment(bidValue, salt);
    await new Promise(r => setTimeout(r, 600));
    onProgress?.(1, `Commitment generated: ${commitment.substring(0, 16)}...`);

    // Phase 2: Resolve public keys
    onProgress?.(2, 'Deriving bidder public key in circuit context...');
    await new Promise(r => setTimeout(r, 600));

    // Phase 3: ZK Proof Generation (Proving that bidder knows private key without disclosing it)
    onProgress?.(3, 'Generating ZK proof for submitBid circuit...');
    await new Promise(r => setTimeout(r, 900));
    onProgress?.(3, 'Proof parameters derived. Identity validated in ZK context.');

    // Phase 4: Sign with wallet
    onProgress?.(4, 'Requesting signature for transaction submission...');
    await new Promise(r => setTimeout(r, 800));

    // Phase 5: Submit transaction
    onProgress?.(5, 'Submitting transaction payload to Midnight Network...');
    await new Promise(r => setTimeout(r, 700));

    // Phase 6: Block confirmation
    onProgress?.(6, 'Transaction processed and confirmed in block.');

    // Save user's private data locally (never sent to ledger!)
    this.saveUserPrivateBid(auctionId, {
      bidValue,
      salt,
      commitment
    });

    // Update public ledger
    const state = this.loadState();
    const updatedAuction = state[auctionId];
    if (updatedAuction) {
      updatedAuction.commitments[walletAddr] = commitment;
      updatedAuction.bidCount = Object.keys(updatedAuction.commitments).length;
      this.saveState(state);
    }

    const txHash = '0x_tx_' + this.generateSalt();
    return { txHash, bidderPk: walletAddr, commitment };
  }

  // --- Close Auction (closeAuction) ---
  public static async closeAuctionTransaction(auctionId: string): Promise<void> {
    const auction = this.getAuction(auctionId);
    if (!auction) throw new Error("Auction not found");
    
    // Simulate transaction latency
    await new Promise(r => setTimeout(r, 1000));
    
    const state = this.loadState();
    if (state[auctionId]) {
      state[auctionId].status = 'CLOSED';
      this.saveState(state);
    }
  }

  // --- Reveal Bids & Determine Winner (revealBid) ---
  // A bidder reveals their private bid to the contract.
  // The circuit verifies that the private value matches their ledger commitment.
  // If verified, it compares with the current winner and updates if better.
  public static async revealBidTransaction(
    auctionId: string,
    bidderPk: string,
    onProgress?: (step: number, log: string) => void
  ): Promise<{ isWinner: boolean; value: number }> {
    const auction = this.getAuction(auctionId);
    if (!auction) throw new Error("Auction not found");
    if (auction.status !== 'CLOSED') throw new Error("Auction is not closed yet");

    // Fetch local private data
    const privateData = this.getPrivateBidData(auctionId);
    if (!privateData) {
      throw new Error("No private bid data found locally for this auction.");
    }

    // Phase 1: Retrieve stored commitment from ledger
    onProgress?.(1, 'Verifying submission status on the public ledger...');
    await new Promise(r => setTimeout(r, 600));

    // Phase 2: Prepare witnesses locally
    onProgress?.(2, 'Loading private witnesses (bidValue & salt) into ZK Prover...');
    await new Promise(r => setTimeout(r, 600));

    // Phase 3: ZK Proof generation
    onProgress?.(3, 'Generating ZK proof for commitment verification & numerical comparison...');
    await new Promise(r => setTimeout(r, 1000));
    
    // Verify the commitment matches inside the ZK circuit
    const computed = this.calculateCommitment(privateData.bidValue, privateData.salt);
    const ledgerCommitment = auction.commitments[bidderPk];
    
    if (computed !== ledgerCommitment) {
      onProgress?.(3, 'ZK ERROR: Commitment mismatch! Proof generation aborted.');
      throw new Error("Commitment mismatch. Plaintext values do not match submitted hash.");
    }
    onProgress?.(3, 'ZK Proof generated successfully: Commitment verified. Plaintext matches hash.');

    // Compare with current winner inside ZK circuit
    let isNewWinner = false;
    const state = this.loadState();
    const liveAuction = state[auctionId];

    if (liveAuction) {
      if (!liveAuction.isWinnerDetermined) {
        isNewWinner = true;
      } else {
        const currentWinningVal = liveAuction.winningBidValue!;
        if (liveAuction.auctionType === 'LOWEST_VALID_BID') {
          isNewWinner = privateData.bidValue < currentWinningVal;
        } else {
          isNewWinner = privateData.bidValue > currentWinningVal;
        }
      }
    }

    // Phase 4: Sign transaction with wallet
    onProgress?.(4, 'Requesting authorization signature from Midnight wallet...');
    await new Promise(r => setTimeout(r, 700));

    // Phase 5: Submit transaction.
    // NOTE: In the real contract, if they did not win, they wouldn't want to submit the transaction,
    // keeping their bid 100% private. In our simulator, we handle this perfectly!
    if (isNewWinner) {
      onProgress?.(5, 'Updating winning state on ledger (disclosing new winner)...');
      await new Promise(r => setTimeout(r, 700));
      
      if (liveAuction) {
        liveAuction.isWinnerDetermined = true;
        liveAuction.winningBidder = bidderPk;
        liveAuction.winningBidValue = privateData.bidValue;
        this.saveState(state);
      }
    } else {
      onProgress?.(5, 'Bid is not the winning bid. Transaction skipped to preserve privacy.');
      await new Promise(r => setTimeout(r, 700));
    }

    // Phase 6: Block confirmation
    onProgress?.(6, 'Verification process completed.');
    await new Promise(r => setTimeout(r, 500));

    return { isWinner: isNewWinner, value: privateData.bidValue };
  }

  // --- Finalize Auction (finalizeAuction) ---
  public static async finalizeAuctionTransaction(auctionId: string): Promise<void> {
    const auction = this.getAuction(auctionId);
    if (!auction) throw new Error("Auction not found");
    
    await new Promise(r => setTimeout(r, 1000));
    
    const state = this.loadState();
    if (state[auctionId]) {
      state[auctionId].status = 'RESULT_AVAILABLE';
      this.saveState(state);
    }
  }

  // --- Cancel Auction (cancelAuction) ---
  public static async cancelAuctionTransaction(auctionId: string): Promise<void> {
    const auction = this.getAuction(auctionId);
    if (!auction) throw new Error("Auction not found");
    
    await new Promise(r => setTimeout(r, 1000));
    
    const state = this.loadState();
    if (state[auctionId]) {
      state[auctionId].status = 'CANCELLED';
      this.saveState(state);
    }
  }

  // Get project metadata
  public static getAuctionMeta(auctionId: string): {
    title: string;
    description: string;
    estimatedValue: number;
    category: string;
    currency: string;
  } {
    // Return standard demo metadata if custom doesn't exist
    if (auctionId === 'pb_auction_nh33') {
      return {
        title: 'NH 108 Highway Expansion: Package 04',
        description: 'Construction contract for road widening, structural repairs, and drainage rehabilitation on NH 108 National Highway corridor.',
        estimatedValue: 10000000,
        category: 'Infrastructure',
        currency: '$'
      };
    } else if (auctionId === 'pb_auction_drainage') {
      return {
        title: 'Urban Drainage Rehabilitation',
        description: 'Stormwater system overhaul, channel cleaning, and reinforcement of concrete pipelines in municipal wards.',
        estimatedValue: 6500000,
        category: 'Procurement',
        currency: '$'
      };
    } else if (auctionId === 'pb_auction_bridge') {
      return {
        title: 'Bridge Maintenance Package',
        description: 'Structural inspection, suspension cable retensioning, anti-corrosive painting, and expansion joint replacement.',
        estimatedValue: 4200000,
        category: 'Infrastructure',
        currency: '$'
      };
    }

    const raw = localStorage.getItem(`pb_meta_${auctionId}`);
    if (raw) return JSON.parse(raw);

    return {
      title: 'Infrastructure Procurement Project',
      description: 'Public infrastructure contracting procurement auction.',
      estimatedValue: 5000000,
      category: 'Procurement',
      currency: '$'
    };
  }
}
