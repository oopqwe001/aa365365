import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { 
  getDocument, 
  getCollection, 
  setDocument, 
  updateDocument, 
  findUserByEmail,
  readLocalDB,
  writeLocalDB
} from './server/db';
import { User, Transaction, AdminConfig, Purchase, LotteryGame } from './types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper: random number generator for standard lottery draws
  const generateRandomNumbers = (count: number, max: number): number[] => {
    const nums: number[] = [];
    while (nums.length < count) {
      const r = Math.floor(Math.random() * max) + 1;
      if (!nums.includes(r)) nums.push(r);
    }
    return nums.sort((a, b) => a - b);
  };

  // 1. Get User Profile Update
  app.get('/api/user', async (req, res) => {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'UID is required' });
    
    try {
      const user = await getDocument('users', id);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 2. Register
  app.post('/api/register', async (req, res) => {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.json({ success: false, message: 'このメールアドレスは既に登録されています。' });
      }

      const uid = `user_${Date.now()}`;
      const displayId = Math.floor(10000 + Math.random() * 90000).toString();
      const newUser: User = {
        id: uid,
        displayId: displayId,
        username,
        email,
        isLoggedIn: true,
        balance: 0,
        role: email === 'oopqwe001@gmail.com' ? 'admin' : 'user',
        bankInfo: { bankName: '', branchName: '', accountNumber: '', accountName: '' },
        purchases: []
      };

      await setDocument('users', uid, { ...newUser, password });
      res.json({ success: true, message: '登録成功', user: newUser });
    } catch (error) {
      console.error("Register API error:", error);
      res.status(500).json({ success: false, message: '注册失败，请发生通信错误重试。' });
    }
  });

  // 3. Login
  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    try {
      // Admin bypass config
      if (password === '8888' && email === 'oopqwe001@gmail.com') {
        const adminId = 'admin_oopqwe001';
        const adminUserSnap = await getDocument('users', adminId);
        let adminUser: User;
        
        if (adminUserSnap) {
          adminUser = { ...adminUserSnap, isLoggedIn: true };
        } else {
          adminUser = { 
            id: adminId, 
            username: '管理员', 
            email: 'oopqwe001@gmail.com', 
            balance: 1000000, 
            role: 'admin',
            isLoggedIn: true,
            bankInfo: { bankName: '', branchName: '', accountNumber: '', accountName: '' },
            purchases: []
          };
          await setDocument('users', adminId, { ...adminUser, password: '8888' });
        }
        return res.json({ success: true, message: '管理员登录成功', user: adminUser });
      }

      const user = await findUserByEmail(email);
      if (!user) {
        return res.json({ success: false, message: 'ユーザーが見つかりません。' });
      }

      if (user.password === password) {
        const loggedUser = { ...user, isLoggedIn: true };
        delete loggedUser.password; // strip password
        
        if (!loggedUser.displayId) {
          loggedUser.displayId = Math.floor(10000 + Math.random() * 90000).toString();
          await updateDocument('users', loggedUser.id, { displayId: loggedUser.displayId });
        }

        res.json({ success: true, message: 'ログイン成功', user: loggedUser });
      } else {
        res.json({ success: false, message: 'パスワードが正しくありません。' });
      }
    } catch (e) {
      console.error("Login API error:", e);
      res.status(500).json({ success: false, message: '登录失败，请发生通信错误重试。' });
    }
  });

  // 4. Config management
  app.get('/api/config', async (req, res) => {
    try {
      const config = await getDocument('config', 'global');
      res.json(config);
    } catch (e) {
      res.status(500).json({ error: 'Failed to find configuration' });
    }
  });

  app.post('/api/config', async (req, res) => {
    try {
      await setDocument('config', 'global', req.body.config);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to update configuration' });
    }
  });

  // 5. User balance & details patches
  app.patch('/api/user/:id', async (req, res) => {
    try {
      await updateDocument('users', req.params.id, req.body.data);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  app.post('/api/user/:id/balance', async (req, res) => {
    try {
      await updateDocument('users', req.params.id, { balance: req.body.balance });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to update user balance' });
    }
  });

  // 6. Transactions
  app.get('/api/transactions', async (req, res) => {
    try {
      const txs = await getCollection('transactions');
      res.json(txs);
    } catch (e) {
      res.status(500).json({ error: 'Failed to get transactions' });
    }
  });

  app.post('/api/transactions', async (req, res) => {
    const { tx } = req.body;
    try {
      await setDocument('transactions', tx.id, tx);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  });

  app.patch('/api/transactions/:id', async (req, res) => {
    try {
      await updateDocument('transactions', req.params.id, req.body.data);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to patch transaction' });
    }
  });

  // Process transaction approve/reject
  app.post('/api/transactions/status', async (req, res) => {
    const { txId, status } = req.body;
    try {
      const tx = await getDocument('transactions', txId);
      if (!tx || tx.status !== 'pending') {
        return res.json({ success: false, message: 'Transaction not pending or not found' });
      }

      await updateDocument('transactions', txId, { status });

      if (status === 'approved') {
        if (tx.type === 'deposit') {
          const user = await getDocument('users', tx.userId);
          if (user) {
            await updateDocument('users', tx.userId, { balance: user.balance + tx.amount });
          }
        }
      } else if (status === 'rejected') {
        if (tx.type === 'withdraw') {
          const user = await getDocument('users', tx.userId);
          if (user) {
            await updateDocument('users', tx.userId, { balance: user.balance + tx.amount });
          }
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update transaction status' });
    }
  });

  // 7. Purchase logic
  app.post('/api/purchase', async (req, res) => {
    const { userId, game, selections } = req.body;
    try {
      const user = await getDocument('users', userId);
      if (!user) return res.status(404).json({ error: 'User Not Found' });

      const validSelections = selections.filter((s: any) => s.numbers.length > 0);
      const totalCost = validSelections.length * game.price;

      if (user.balance < totalCost) {
        return res.json({ success: false, message: '残高が不足しています。' });
      }

      const newPurchase: Purchase = {
        id: 'P' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        userId: user.id,
        gameId: game.id,
        numbers: validSelections.map((s: any) => s.numbers.join(',')),
        timestamp: Date.now(),
        isProcessed: false,
        status: 'pending',
        winAmount: 0
      };

      const updatedPurchases = [...(user.purchases || []), newPurchase];
      const newBalance = user.balance - totalCost;

      await updateDocument('users', userId, {
        balance: newBalance,
        purchases: updatedPurchases
      });

      res.json({ 
        success: true, 
        message: '購入完了', 
        newUser: { ...user, balance: newBalance, purchases: updatedPurchases } 
      });
    } catch (e) {
      console.error("Purchase processing error:", e);
      res.status(500).json({ success: false, message: '購入に失敗しました' });
    }
  });

  // 8. Execute draw on server side
  app.post('/api/draw', async (req, res) => {
    const { date, games }: { date: string, games: LotteryGame[] } = req.body;
    try {
      const config: AdminConfig = await getDocument('config', 'global');
      const users: User[] = await getCollection('users');

      for (const game of games) {
        let drawResult = config.winningNumbers[game.id]?.[date];
        
        if (!drawResult) {
          drawResult = generateRandomNumbers(game.pickCount, game.maxNumber);
          if (!config.winningNumbers[game.id]) config.winningNumbers[game.id] = {};
          config.winningNumbers[game.id][date] = drawResult;
        }

        for (const user of users) {
          let userChanged = false;
          if (!user.purchases) user.purchases = [];

          for (const p of user.purchases) {
            const pDateStr = new Date(p.timestamp).toLocaleDateString('sv-SE', {timeZone: 'Asia/Tokyo'});
            
            if (p.gameId === game.id && !p.isProcessed && pDateStr < date) {
              let totalPrize = 0;
              let winningRanks: string[] = [];
              let hasWon = false;

              p.numbers.forEach(pickedNumsStr => {
                const pickedNums = pickedNumsStr.split(',').map(Number);
                const matchCount = pickedNums.filter(n => drawResult.includes(n)).length;
                let prize = 0;
                let rank = "";
                
                const prizeSettings = config.prizeSettings?.[game.id] || { rank1: 10000000, rank2: 100000, rank3: 1000 };
                
                if (matchCount === game.pickCount) {
                  prize = prizeSettings.rank1;
                  rank = "rank_1";
                } else if (matchCount === game.pickCount - 1) {
                  prize = prizeSettings.rank2;
                  rank = "rank_2";
                } else if (matchCount === game.pickCount - 2) {
                  prize = prizeSettings.rank3;
                  rank = "rank_3";
                } else if (matchCount === game.pickCount - 3 && prizeSettings.rank4) {
                  prize = prizeSettings.rank4;
                  rank = "rank_4";
                } else if (matchCount === game.pickCount - 4 && prizeSettings.rank5) {
                  prize = prizeSettings.rank5;
                  rank = "rank_5";
                } else if (matchCount === game.pickCount - 5 && prizeSettings.rank6) {
                  prize = prizeSettings.rank6;
                  rank = "rank_6";
                }
                
                if (prize > 0) {
                  totalPrize += prize;
                  if (!winningRanks.includes(rank)) winningRanks.push(rank);
                  hasWon = true;
                }
              });

              if (hasWon) {
                p.status = 'won';
                p.winAmount = totalPrize;
                p.rank = winningRanks.join(', ');
                user.balance += totalPrize;
              } else {
                p.status = 'lost';
                p.winAmount = 0;
              }
              
              p.isProcessed = true;
              p.drawDate = date;
              userChanged = true;
            }
          }
          
          if (userChanged) {
            await updateDocument('users', user.id, { 
              balance: user.balance,
              purchases: user.purchases
            });
          }
        }
      }

      await setDocument('config', 'global', config);
      res.json(config);
    } catch (e) {
      console.error("Execute draw error:", e);
      res.status(500).json({ error: 'Failed to execute draw' });
    }
  });


  // Integrated Vite Dev Middleware or Static File Serving for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is booted up and running beautifully on http://localhost:${PORT}`);
  });
}

startServer();
