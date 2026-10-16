import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './App.css';

function App() {
  const [budget, setBudget] = useState(() => {
    return parseFloat(localStorage.getItem('budget')) || 0;
  });
  const [expenses, setExpenses] = useState(() => {
    return JSON.parse(localStorage.getItem('expenses')) || [];
  });
  const [itemName, setItemName] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [itemType, setItemType] = useState('essencial');
  const [calcValue, setCalcValue] = useState('');

  useEffect(() => {
    localStorage.setItem('budget', budget);
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleSetBudget = (e) => {
    e.preventDefault();
    setBudget(parseFloat(e.target.budget.value) || 0);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const value = parseFloat(itemValue);
    if (itemName && value) {
      setExpenses([...expenses, { id: Date.now(), name: itemName, value, type: itemType }]);
      setItemName('');
      setItemValue('');
      setItemType('essencial');
    }
  };

  const deleteItem = (id) => {
    setExpenses(expenses.filter(item => item.id !== id));
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.value, 0);
  const essentialSpent = expenses.filter(i => i.type === 'essencial').reduce((acc, curr) => acc + curr.value, 0);
  const leisureSpent = expenses.filter(i => i.type === 'lazer').reduce((acc, curr) => acc + curr.value, 0);
  const available = budget - totalSpent;
  const potentialSavings = totalSpent - essentialSpent;

  const data = [
    { name: 'Essenciais', value: essentialSpent, color: '#28a745' },
    { name: 'Lazer/Desejos', value: leisureSpent, color: '#ffc107' },
  ];

  const getFinancialAdvice = () => {
    if (budget === 0) return "Defina seu orçamento para receber dicas.";
    const essentialPct = (essentialSpent / budget) * 100;
    const leisurePct = (leisureSpent / budget) * 100;

    if (available < 0) return "⚠️ Alerta: Você gastou mais do que ganha! Hora de cortar os 'Lazer/Desejos'.";
    if (essentialPct > 50) return "💡 Dica: Seus gastos essenciais estão acima de 50%. Tente reduzir custos fixos.";
    if (leisurePct > 30) return "💡 Dica: Você está gastando muito com lazer (mais de 30%). Considere poupar mais.";
    return "✅ Suas finanças estão equilibradas. Continue assim!";
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h1 className="logo">💰 FinanceAI</h1>
        <div className="advice-card">
          <h3>Assistente Financeiro</h3>
          <p>{getFinancialAdvice()}</p>
        </div>
        <div className="card config-card">
          <h3>Configuração</h3>
          <form onSubmit={handleSetBudget}>
            <label>Orçamento Mensal</label>
            <input type="number" name="budget" placeholder="R$ 0,00" defaultValue={budget} />
            <button type="submit">Atualizar</button>
          </form>
        </div>
        <div className="card calc-card">
          <h3>Calculadora Rápida</h3>
          <div className="calc-group">
            <input 
              type="number" 
              placeholder="Valor para somar..." 
              value={calcValue} 
              onChange={(e) => setCalcValue(e.target.value)}
            />
            <button onClick={() => setExpenses([...expenses, { id: Date.now(), name: 'Cálculo Rápido', value: parseFloat(calcValue), type: 'lazer' }])}>
              Adicionar como Gasto
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="stats-grid">
          <div className="stat-card">
            <span>Orçamento</span>
            <strong>R$ {budget.toFixed(2)}</strong>
          </div>
          <div className="stat-card">
            <span>Gasto Total</span>
            <strong>R$ {totalSpent.toFixed(2)}</strong>
          </div>
          <div className={`stat-card ${available < 0 ? 'negative' : ''}`}>
            <span>Disponível</span>
            <strong>R$ {available.toFixed(2)}</strong>
          </div>
        </div>

        <div className="insight-banner">
          <p>🚀 <strong>Insight:</strong> Se você não tivesse gasto com "besteiras" (lazer), você teria agora <strong>R$ {(available + potentialSavings).toFixed(2)}</strong>.</p>
        </div>

        <div className="content-grid">
          <div className="card chart-card">
            <h3>Distribuição de Gastos</h3>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="legend">
              <span><i style={{backgroundColor: '#28a745'}}></i> Essenciais</span>
              <span><i style={{backgroundColor: '#ffc107'}}></i> Lazer</span>
            </div>
          </div>

          <div className="card form-card">
            <h3>Novo Gasto</h3>
            <form onSubmit={handleAddItem} className="form-group">
              <input 
                type="text" 
                placeholder="O que você comprou?" 
                value={itemName} 
                onChange={(e) => setItemName(e.target.value)} 
              />
              <input 
                type="number" 
                placeholder="Valor (R$)" 
                value={itemValue} 
                onChange={(e) => setItemValue(e.target.value)} 
              />
              <select value={itemType} onChange={(e) => setItemType(e.target.value)}>
                <option value="essencial">Essencial (Eu preciso disso)</option>
                <option value="lazer">Lazer/Desejo (Eu quero isso)</option>
              </select>
              <button type="submit">Adicionar ao Dashboard</button>
            </form>
          </div>
        </div>

        <div className="card history-card">
          <h3>Histórico Detalhado</h3>
          <ul className="expense-table">
            <thead className="table-head">
              <tr>
                <th>Item</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(item => (
                <li key={item.id}>
                  <span className="item-name">{item.name}</span>
                  <span className={`badge ${item.type}`}>{item.type}</span>
                  <span className="item-value">R$ {item.value.toFixed(2)}</span>
                  <button onClick={() => deleteItem(item.id)} className="btn-delete">x</button>
                </li>
              ))}
            </tbody>
          </ul>
        </div>

        <footer className="footer">
          Desenvolvido por - Pedro Henrique
        </footer>
      </div>
    </div>
  );
}

export default App;

