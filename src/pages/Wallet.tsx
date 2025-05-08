
import { useState } from "react";
import TopNavigation from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWallet } from "@/context/WalletContext";
import { DollarSign, CreditCard, ArrowDownCircle, ArrowUpCircle, AlertCircle } from "lucide-react";

const Wallet = () => {
  const { balance, transactions, deposit, withdraw, loading } = useWallet();
  const [depositAmount, setDepositAmount] = useState(50);
  const [withdrawAmount, setWithdrawAmount] = useState(20);

  const handleDeposit = async () => {
    if (depositAmount <= 0) return;
    await deposit(depositAmount);
  };

  const handleWithdraw = async () => {
    if (withdrawAmount <= 0 || withdrawAmount > balance) return;
    await withdraw(withdrawAmount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownCircle className="w-4 h-4 text-green-500" />;
      case 'withdraw':
        return <ArrowUpCircle className="w-4 h-4 text-amber-500" />;
      case 'win':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'loss':
        return <DollarSign className="w-4 h-4 text-red-500" />;
      case 'fee':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigation />
      
      <main className="flex-1 pt-20 pb-10 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Wallet</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-pool-gold" />
                    Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-pool-gold mb-6">${balance.toFixed(2)}</div>
                  
                  <div className="space-y-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-pool-gold hover:bg-pool-gold-dark text-black font-bold">
                          <CreditCard className="w-4 h-4 mr-2" /> Deposit Funds
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass border-white/10">
                        <DialogHeader>
                          <DialogTitle>Deposit Funds</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <label className="block text-sm font-medium mb-2">Amount to Deposit</label>
                          <div className="flex items-center space-x-4 mb-4">
                            <Button 
                              onClick={() => setDepositAmount(Math.max(10, depositAmount - 10))}
                              variant="outline"
                              className="border-white/20"
                              disabled={depositAmount <= 10}
                            >-</Button>
                            <Input 
                              type="number" 
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(parseInt(e.target.value) || 10)}
                              className="glass border-white/20 text-center"
                              min="10"
                            />
                            <Button 
                              onClick={() => setDepositAmount(depositAmount + 10)}
                              variant="outline"
                              className="border-white/20"
                            >+</Button>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <Button 
                              variant="outline" 
                              className="border-white/20"
                              onClick={() => setDepositAmount(50)}
                            >$50</Button>
                            <Button 
                              variant="outline" 
                              className="border-white/20"
                              onClick={() => setDepositAmount(100)}
                            >$100</Button>
                            <Button 
                              variant="outline" 
                              className="border-white/20"
                              onClick={() => setDepositAmount(200)}
                            >$200</Button>
                          </div>
                          
                          <div className="glass p-3 rounded-lg text-sm mb-4">
                            <div className="flex items-start mb-2">
                              <AlertCircle className="w-4 h-4 text-blue-400 mr-2 mt-0.5" />
                              <div>
                                <p>A 10% platform fee will be applied to your deposit.</p>
                              </div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-2 pt-2 border-t border-white/10">
                              <span>Deposit amount:</span>
                              <span>${depositAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>Fee (10%):</span>
                              <span>${(depositAmount * 0.1).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-medium mt-1 pt-1 border-t border-white/10">
                              <span>Added to wallet:</span>
                              <span>${(depositAmount * 0.9).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={handleDeposit}
                          className="w-full bg-pool-gold hover:bg-pool-gold-dark text-black"
                          disabled={loading || depositAmount <= 0}
                        >
                          {loading ? "Processing..." : "Deposit Now"}
                        </Button>
                        <p className="text-xs text-center text-gray-400 mt-2">
                          This is a demo app, no real payment will be processed.
                        </p>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full border-white/20">
                          <ArrowUpCircle className="w-4 h-4 mr-2" /> Withdraw Funds
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass border-white/10">
                        <DialogHeader>
                          <DialogTitle>Withdraw Funds</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <label className="block text-sm font-medium mb-2">Amount to Withdraw</label>
                          <div className="flex items-center space-x-4 mb-4">
                            <Button 
                              onClick={() => setWithdrawAmount(Math.max(10, withdrawAmount - 10))}
                              variant="outline"
                              className="border-white/20"
                              disabled={withdrawAmount <= 10}
                            >-</Button>
                            <Input 
                              type="number" 
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(parseInt(e.target.value) || 0)}
                              className="glass border-white/20 text-center"
                              min="10"
                              max={balance}
                            />
                            <Button 
                              onClick={() => setWithdrawAmount(Math.min(withdrawAmount + 10, balance))}
                              variant="outline"
                              className="border-white/20"
                              disabled={withdrawAmount >= balance}
                            >+</Button>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            className="border-white/20 w-full mb-4"
                            onClick={() => setWithdrawAmount(balance)}
                          >
                            Withdraw All (${balance.toFixed(2)})
                          </Button>
                          
                          <div className="glass p-3 rounded-lg text-sm mb-4">
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>Available balance:</span>
                              <span>${balance.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-medium mt-1 pt-1 border-t border-white/10">
                              <span>Amount to withdraw:</span>
                              <span>${withdrawAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={handleWithdraw}
                          className="w-full bg-pool-gold hover:bg-pool-gold-dark text-black"
                          disabled={loading || withdrawAmount <= 0 || withdrawAmount > balance}
                        >
                          {loading ? "Processing..." : "Withdraw Now"}
                        </Button>
                        <p className="text-xs text-center text-gray-400 mt-2">
                          This is a demo app, no real withdrawal will be processed.
                        </p>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass border-white/10 mt-6">
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Add or manage your payment methods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="glass p-3 rounded-lg mb-3 flex items-center justify-between border border-white/10">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white mr-3">
                        V
                      </div>
                      <div>
                        <div className="text-sm font-medium">Visa •••• 4242</div>
                        <div className="text-xs text-gray-400">Expires 12/25</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Edit
                    </Button>
                  </div>
                  
                  <Button variant="outline" className="w-full border-white/20">
                    Add New Payment Method
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card className="glass border-white/10 h-full">
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>View your recent transactions and account activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid grid-cols-4 mb-6">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="deposits">Deposits</TabsTrigger>
                      <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                      <TabsTrigger value="games">Games</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all">
                      {transactions.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-400">No transactions yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {transactions.map(transaction => (
                            <div key={transaction.id} className="glass p-3 rounded-lg flex items-center justify-between border border-white/10">
                              <div className="flex items-center">
                                <div className="w-8 h-8 glass rounded-full flex items-center justify-center mr-3">
                                  {getTransactionIcon(transaction.type)}
                                </div>
                                <div>
                                  <div className="text-sm font-medium">{transaction.description}</div>
                                  <div className="text-xs text-gray-400">{formatDate(transaction.timestamp)}</div>
                                </div>
                              </div>
                              <div className={`font-medium ${
                                transaction.type === 'deposit' || transaction.type === 'win' 
                                  ? 'text-green-500' 
                                  : transaction.type === 'fee'
                                  ? 'text-blue-400'
                                  : 'text-amber-500'
                              }`}>
                                {transaction.type === 'deposit' || transaction.type === 'win' ? '+ ' : '- '}
                                ${transaction.amount.toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="deposits">
                      {transactions.filter(t => t.type === 'deposit').length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-400">No deposit transactions</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {transactions
                            .filter(t => t.type === 'deposit')
                            .map(transaction => (
                              <div key={transaction.id} className="glass p-3 rounded-lg flex items-center justify-between border border-white/10">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 glass rounded-full flex items-center justify-center mr-3">
                                    {getTransactionIcon(transaction.type)}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">{transaction.description}</div>
                                    <div className="text-xs text-gray-400">{formatDate(transaction.timestamp)}</div>
                                  </div>
                                </div>
                                <div className="font-medium text-green-500">
                                  + ${transaction.amount.toFixed(2)}
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="withdrawals">
                      {transactions.filter(t => t.type === 'withdraw').length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-400">No withdrawal transactions</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {transactions
                            .filter(t => t.type === 'withdraw')
                            .map(transaction => (
                              <div key={transaction.id} className="glass p-3 rounded-lg flex items-center justify-between border border-white/10">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 glass rounded-full flex items-center justify-center mr-3">
                                    {getTransactionIcon(transaction.type)}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">{transaction.description}</div>
                                    <div className="text-xs text-gray-400">{formatDate(transaction.timestamp)}</div>
                                  </div>
                                </div>
                                <div className="font-medium text-amber-500">
                                  - ${transaction.amount.toFixed(2)}
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="games">
                      {transactions.filter(t => t.type === 'win' || t.type === 'loss').length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-400">No game transactions</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {transactions
                            .filter(t => t.type === 'win' || t.type === 'loss')
                            .map(transaction => (
                              <div key={transaction.id} className="glass p-3 rounded-lg flex items-center justify-between border border-white/10">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 glass rounded-full flex items-center justify-center mr-3">
                                    {getTransactionIcon(transaction.type)}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">{transaction.description}</div>
                                    <div className="text-xs text-gray-400">{formatDate(transaction.timestamp)}</div>
                                  </div>
                                </div>
                                <div className={`font-medium ${transaction.type === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                                  {transaction.type === 'win' ? '+ ' : '- '}
                                  ${transaction.amount.toFixed(2)}
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Wallet;
