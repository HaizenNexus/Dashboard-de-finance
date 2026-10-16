import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './App.css';

function App() {
  const currentMonthKey = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const [activeMonth, setActiveMonth] = useState(currentMonthKey);
  
  const [db, setDb] = useState(() => {
    const saved = localStorage.getItem('finance_db');
    return saved ? JSON.parse(saved) : {
      [currentMonthKey]: { budget: 0, expenses: [] }
    };
  });

  const [itemName, setItemName] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [itemType, setItemType] = useState('essencial');
  const [calcValue, setCalcValue] = useState('');

  useEffect(() => {
    localStorage.setItem('finance_db', JSON.stringify(db));
  }, [db]);

  const currentData = db[activeMonth] || { budget: 0, expenses: [] };

  const handleSetBudget = (e) => {
    e.preventDefault();
    const newBudget = parseFloat(e.target.budget.value) || 0;
    setDb({
      ...db,
      [activeMonth]: { ...currentData, budget: newBudget }
    });
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const value = parseFloat(itemValue);
    if (itemName && value) {
      const newExpenses = [...currentData.expenses, { id: Date.now(), name: itemName, value, type: itemType }];
      setDb({
        ...db,
        [activeMonth]: { ...currentData, expenses: newExpenses }
      });
      setItemName('');
      setItemValue('');
      setItemType('essencial');
    }
  };

  const deleteItem = (id) => {
    const newExpenses = currentData.expenses.filter(item => item.id !== id);
    setDb({
      ...db,
      [activeMonth]: { ...currentData, expenses: newExpenses }
    });
  };

  const resetAllData = () => {
    if (window.confirm("Tem certeza que deseja apagar TODOS os dados de todos os meses?")) {
      localStorage.clear();
      setDb({ [currentMonthKey]: { budget: 0, expenses: [] } });
    }
  };

  const totalSpent = currentData.expenses.reduce((acc, curr) => acc + curr.value, 0);
  const essentialSpent = currentData.expenses.filter(i => i.type === 'essencial').reduce((acc, curr) => acc + curr.value, 0);
  const leisureSpent = currentData.expenses.filter(i => i.type === 'lazer').reduce((acc, curr) => acc + curr.value, 0);
  const available = currentData.budget - totalSpent;
  const potentialSavings = totalSpent - essentialSpent;

  const data = [
    { name: 'Essenciais', value: essentialSpent, color: '#28a745' },
    { name: 'Lazer/Desejos', value: leisureSpent, color: '#ffc107' },
  ];

  const getFinancialAdvice = () => {
    if (currentData.budget === 0) return "Defina seu orçamento para receber dicas.";
    const essentialPct = (essentialSpent / currentData.budget) * 100;
    const leisurePct = (leisureSpent / currentData.budget) * 100;
    if (available < 0) return "⚠️ Alerta: Você gastou mais do que ganha!";
    if (essentialPct > 50) return "💡 Dica: Gastos essenciais acima de 50%. Tente reduzir custos fixos.";
    if (leisurePct > 30) return "💡 Dica: Lazer acima de 30%. Considere poupar mais.";
    return "✅ Finanças equilibradas!";
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h1 className="logo">💰 FinanceAI</h1>
        
        <div className="card month-selector">
          <h3>📅 Período</h3>
          <select value={activeMonth} onChange={(e) => setActiveMonth(e.target.value)}>
            {Object.keys(db).map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
            {(!db[currentMonthKey]) && <option value={currentMonthKey}>{currentMonthKey}</option>}
          </select>
        </div>

        <div className="advice-card">
          <h3>Assistente Financeiro</h3>
          <p>{getFinancialAdvice()}</p>
        </div>

        <div className="card config-card">
          <h3>Configuração</h3>
          <form onSubmit={handleSetBudget}>
            <label>Orçamento Mensal</label>
            <input type="number" name="budget" placeholder="R$ 0,00" defaultValue={currentData.budget} />
            <button type="submit">Atualizar</button>
          </form>
        </div>

        <div className="card calc-card">
          <h3>Calculadora Rápida</h3>
          <div className="calc-group">
            <input 
              type="number" 
              placeholder="Valor..." 
              value={calcValue} 
              onChange={(e) => setCalcValue(e.target.value)}
            />
            <button onClick={() => {
              if(!calcValue) return;
              const newExp = [...currentData.expenses, { id: Date.now(), name: 'Cálculo Rápido', value: parseFloat(calcValue), type: 'lazer' }];
              setDb({...db, [activeMonth]: {...currentData, expenses: newExp}});
              setCalcValue('');
            }}>
              Adicionar
            </button>
          </div>
        </div>

        <button onClick={resetAllData} className="btn-reset">Resetar Todo o Sistema</button>
      </div>

      <div className="main-content">
        <div className="stats-grid">
          <div className="stat-card">
            <span>Orçamento {activeMonth}</span>
            <strong>R$ {currentData.budget.toFixed(2)}</strong>
          </div>
          <div className="stat-card">
            <span>Gasto Total</span>
            <strong>R$ {totalSpent.toFixed(2)}</strong>
          </div>
          <div className={`stat-card ${available < 0 ? 'negative' : ''}`}>
            <span>Saldo Final</span>
            <strong>R$ {available.toFixed(2)}</strong>
          </div>
        </div>

        <div className="insight-banner">
          <p>🚀 <strong>Insight:</strong> Se não tivesse gasto com "besteiras", você teria <strong>R$ {(available + potentialSavings).toFixed(2)}</strong>.</p>
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
              <input type="text" placeholder="O que você comprou?" value={itemName} onChange={(e) => setItemName(e.target.value)} />
              <input type="number" placeholder="Valor (R$)" value={itemValue} onChange={(e) => setItemValue(e.target.value)} />
              <select value={itemType} onChange={(e) => setItemType(e.target.value)}>
                <option value="essencial">Essencial</option>
                <option value="lazer">Lazer/Desejo</option>
              </select>
              <button type="submit">Adicionar</button>
            </form>
          </div>
        </div>

        <div className="card history-card">
          <h3>Histórico de {activeMonth}</h3>
          <ul className="expense-table">
            <thead className="table-head">
              <tr><th>Item</th><th>Tipo</th><th>Valor</th><th>Ação</th></tr>
            </thead>
            <tbody>
              {currentData.expenses.map(item => (
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
