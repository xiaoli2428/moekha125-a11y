// Demo account management service
// Handles demo/real account switching and balance tracking

class DemoAccountService {
  constructor() {
    this.DEMO_INITIAL_BALANCE = 100000;
    this.STORAGE_KEY = 'demoAccount';
    this.MODE_KEY = 'accountMode'; // 'demo' or 'real'
  }

  // Initialize demo account if not exists
  initializeDemoAccount() {
    const existing = this.getDemoAccount();
    if (!existing) {
      this.resetDemoAccount();
    }
  }

  // Get current account mode
  getAccountMode() {
    return localStorage.getItem(this.MODE_KEY) || 'demo';
  }

  // Set account mode
  setAccountMode(mode) {
    if (mode !== 'demo' && mode !== 'real') {
      throw new Error('Invalid account mode. Must be "demo" or "real"');
    }
    localStorage.setItem(this.MODE_KEY, mode);
    return mode;
  }

  // Check if in demo mode
  isDemoMode() {
    return this.getAccountMode() === 'demo';
  }

  // Switch between demo and real
  toggleAccountMode() {
    const current = this.getAccountMode();
    const newMode = current === 'demo' ? 'real' : 'demo';
    return this.setAccountMode(newMode);
  }

  // Get demo account data
  getDemoAccount() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse demo account data:', e);
      return null;
    }
  }

  // Get demo balance
  getDemoBalance() {
    const account = this.getDemoAccount();
    return account?.balance || this.DEMO_INITIAL_BALANCE;
  }

  // Update demo balance
  updateDemoBalance(newBalance) {
    const account = this.getDemoAccount() || this.createDemoAccount();
    account.balance = newBalance;
    account.lastUpdated = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(account));
    return account;
  }

  // Add to demo balance
  addToDemoBalance(amount) {
    const currentBalance = this.getDemoBalance();
    return this.updateDemoBalance(currentBalance + amount);
  }

  // Subtract from demo balance
  subtractFromDemoBalance(amount) {
    const currentBalance = this.getDemoBalance();
    return this.updateDemoBalance(currentBalance - amount);
  }

  // Reset demo account to initial state
  resetDemoAccount() {
    const account = this.createDemoAccount();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(account));
    return account;
  }

  // Create new demo account object
  createDemoAccount() {
    return {
      balance: this.DEMO_INITIAL_BALANCE,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalProfit: 0,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }

  // Record a trade result
  recordTrade(amount, isWin, profit = 0) {
    const account = this.getDemoAccount() || this.createDemoAccount();
    
    account.totalTrades += 1;
    if (isWin) {
      account.winningTrades += 1;
      account.balance += profit;
      account.totalProfit += profit;
    } else {
      account.losingTrades += 1;
      account.balance -= amount;
      account.totalProfit -= amount;
    }
    
    account.lastUpdated = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(account));
    return account;
  }

  // Get demo account statistics
  getStatistics() {
    const account = this.getDemoAccount() || this.createDemoAccount();
    const winRate = account.totalTrades > 0 
      ? (account.winningTrades / account.totalTrades) * 100 
      : 0;
    
    return {
      balance: account.balance,
      totalTrades: account.totalTrades,
      winningTrades: account.winningTrades,
      losingTrades: account.losingTrades,
      winRate: winRate.toFixed(2),
      totalProfit: account.totalProfit,
      createdAt: account.createdAt,
      lastUpdated: account.lastUpdated
    };
  }

  // Auto-win system for demo trades
  shouldAutoWin() {
    // 85% win rate for demo accounts to encourage users
    return Math.random() < 0.85;
  }

  // Calculate payout for winning trade
  calculatePayout(amount, pair) {
    // 80-90% payout (typical for binary options)
    const payoutRate = 0.80 + Math.random() * 0.10;
    return amount * payoutRate;
  }

  // Simulate demo trade
  simulateDemoTrade(amount, direction, pair, duration) {
    const isWin = this.shouldAutoWin();
    const payout = isWin ? this.calculatePayout(amount, pair) : 0;
    
    return {
      isWin,
      payout,
      profit: isWin ? payout : -amount,
      message: isWin ? `Win! Profit: $${payout.toFixed(2)}` : `Loss: -$${amount.toFixed(2)}`
    };
  }
}

// Singleton instance
const demoAccountService = new DemoAccountService();

// Initialize on import
if (typeof window !== 'undefined') {
  demoAccountService.initializeDemoAccount();
}

export default demoAccountService;
