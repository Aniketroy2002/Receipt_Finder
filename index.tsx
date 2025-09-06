/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

// Define the structure of a transaction
interface Transaction {
    id: string;
    date: string;
    numTyres: number;
    purchasePrice: number;
    salePrice: number;
    kmRun: number;
    generatorCost: number;
    totalPurchase: number;
    totalSale: number;
    totalLabour: number;
    totalFuel: number;
    profitLoss: number;
}

// Helper to format numbers as currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(value);
};

const App = () => {
    // Input state
    const [numTyres, setNumTyres] = useState<string>('');
    const [purchasePrice, setPurchasePrice] = useState<string>('');
    const [salePrice, setSalePrice] = useState<string>('');
    const [kmRun, setKmRun] = useState<string>('');
    const [generatorCost, setGeneratorCost] = useState<string>('');

    // Saved transactions state
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Load transactions from localStorage on initial render
    useEffect(() => {
        try {
            const savedTransactions = localStorage.getItem('pnl-transactions');
            if (savedTransactions) {
                setTransactions(JSON.parse(savedTransactions));
            }
        } catch (error) {
            console.error("Failed to load transactions from localStorage", error);
        }
    }, []);

    // Save transactions to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('pnl-transactions', JSON.stringify(transactions));
        } catch (error) {
            console.error("Failed to save transactions to localStorage", error);
        }
    }, [transactions]);

    // Derived calculations using useMemo for performance
    const calculations = useMemo(() => {
        const tyres = parseInt(numTyres, 10) || 0;
        const purchase = parseFloat(purchasePrice) || 0;
        const sale = parseFloat(salePrice) || 0;
        const km = parseFloat(kmRun) || 0;
        const genCost = parseFloat(generatorCost) || 0;

        const totalPurchase = tyres * purchase;
        const totalSale = tyres * sale;
        const totalLabour = tyres * 25;
        const totalFuel = km * 6.666;
        const profitLoss = (totalSale - totalPurchase) - (totalLabour + totalFuel + genCost);

        return {
            totalPurchase,
            totalSale,
            totalLabour,
            totalFuel,
            profitLoss,
        };
    }, [numTyres, purchasePrice, salePrice, kmRun, generatorCost]);

    const handleSaveTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        const newTransaction: Transaction = {
            id: new Date().toISOString(),
            date: new Date().toLocaleDateString('en-IN'),
            numTyres: parseInt(numTyres, 10) || 0,
            purchasePrice: parseFloat(purchasePrice) || 0,
            salePrice: parseFloat(salePrice) || 0,
            kmRun: parseFloat(kmRun) || 0,
            generatorCost: parseFloat(generatorCost) || 0,
            ...calculations,
        };

        if(newTransaction.numTyres > 0) {
            setTransactions(prev => [newTransaction, ...prev]);
            // Reset form
            setNumTyres('');
            setPurchasePrice('');
            setSalePrice('');
            setKmRun('');
            setGeneratorCost('');
        } else {
            alert('Number of tyres must be greater than 0 to save.');
        }
    };

    const profitLossClass = calculations.profitLoss >= 0 ? 'profit' : 'loss';

    return (
        <>
            <header>
                <h1>Profit & Loss Calculator</h1>
            </header>
            <main className="app-container">
                <section className="calculator-section">
                    <div className="card">
                        <h2>New Calculation</h2>
                        <form onSubmit={handleSaveTransaction}>
                            <div className="form-group">
                                <label htmlFor="numTyres">Number of Tyres</label>
                                <input type="number" id="numTyres" value={numTyres} onChange={(e) => setNumTyres(e.target.value)} placeholder="e.g., 10" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="purchasePrice">Purchase Price per Tyre</label>
                                <input type="number" step="0.01" id="purchasePrice" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="e.g., 4500.50" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="salePrice">Sale Price per Tyre</label>
                                <input type="number" step="0.01" id="salePrice" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="e.g., 5200.75" required />
                            </div>
                             <div className="form-group">
                                <label htmlFor="kmRun">KM Run</label>
                                <input type="number" step="0.01" id="kmRun" value={kmRun} onChange={(e) => setKmRun(e.target.value)} placeholder="e.g., 150.5" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="generatorCost">Generator Cost (Optional)</label>
                                <input type="number" step="0.01" id="generatorCost" value={generatorCost} onChange={(e) => setGeneratorCost(e.target.value)} placeholder="e.g., 300" />
                            </div>
                            <button type="submit" className="save-btn">Save Transaction</button>
                        </form>
                    </div>

                    <div className="card results-card">
                         <h2>Current Results</h2>
                         <div className="result-item">
                            <p>Total Purchase</p>
                            <span>{formatCurrency(calculations.totalPurchase)}</span>
                         </div>
                         <div className="result-item">
                            <p>Total Sale</p>
                            <span>{formatCurrency(calculations.totalSale)}</span>
                         </div>
                         <div className="result-item">
                            <p>Total Labour</p>
                            <span>{formatCurrency(calculations.totalLabour)}</span>
                         </div>
                         <div className="result-item">
                            <p>Total Fuel</p>
                            <span>{formatCurrency(calculations.totalFuel)}</span>
                         </div>
                         <div className="result-item profit-loss-total">
                            <p>Profit / Loss</p>
                            <span className={profitLossClass}>{formatCurrency(calculations.profitLoss)}</span>
                         </div>
                    </div>
                </section>

                <section className="card history-section">
                    <h2>Transaction History</h2>
                    <div className="history-table-container">
                        {transactions.length > 0 ? (
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Tyres</th>
                                        <th>P/L</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(t => (
                                        <tr key={t.id}>
                                            <td>{t.date}</td>
                                            <td>{t.numTyres}</td>
                                            <td className={t.profitLoss >= 0 ? 'profit' : 'loss'}>
                                                {formatCurrency(t.profitLoss)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                             <p className="empty-state">No transactions saved yet.</p>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
