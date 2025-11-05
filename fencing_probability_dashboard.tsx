import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Label } from 'recharts';

const FencingDashboard = () => {
  const [winPercent1, setWinPercent1] = useState(55);
  const [winPercent2, setWinPercent2] = useState(55);
  const [winPercent3, setWinPercent3] = useState(55);
  const N = 15;
  const numBouts = 8;

  // Function: probability that Heads wins first in a race to N
  const raceToNHeads = (N, p) => {
    const q = 1 - p;
    let sum = 0;
    for (let k = 0; k < N; k++) {
      const binomial = factorial(N + k - 1) / (factorial(k) * factorial(N - 1));
      sum += binomial * Math.pow(p, N) * Math.pow(q, k);
    }
    return sum;
  };

  const factorial = (n) => {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

  // Graph 1: Single bout probability vs p
  const graph1Data = useMemo(() => {
    const data = [];
    for (let pVal = 0.45; pVal <= 0.99; pVal += 0.01) {
      data.push({
        p: pVal,
        prob: raceToNHeads(N, pVal)
      });
    }
    return data;
  }, []);

  // Graph 2: Winning 8 consecutive bouts
  const graph2Data = useMemo(() => {
    const data = [];
    for (let pVal = 0.45; pVal <= 0.99; pVal += 0.01) {
      const probSingle = raceToNHeads(N, pVal);
      data.push({
        p: pVal,
        prob: Math.pow(probSingle, numBouts)
      });
    }
    return data;
  }, []);

  // Graph 2 labels at multiples of 0.05
  const graph2Labels = useMemo(() => {
    const labels = [];
    for (let pVal = 0.45; pVal <= 0.95; pVal += 0.05) {
      const probSingle = raceToNHeads(N, pVal);
      labels.push({
        p: pVal,
        prob: Math.pow(probSingle, numBouts)
      });
    }
    return labels;
  }, []);

  // Graph 3: Consecutive bouts won
  const graph3Data = useMemo(() => {
    const p = winPercent3 / 100;
    const probWinBout = raceToNHeads(N, p);
    const data = [];
    for (let bout = 1; bout <= 8; bout++) {
      data.push({
        bout: bout,
        prob: Math.pow(probWinBout, bout)
      });
    }
    return data;
  }, [winPercent3]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow">
          <p className="text-sm">{`${payload[0].name}: ${payload[0].value.toFixed(4)}`}</p>
        </div>
      );
    }
    return null;
  };

  const SliderControl = ({ value, onChange, label }) => (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-300">
      <label className="block text-base font-semibold mb-3">
        {label}: {value}%
      </label>
      <input
        type="range"
        min="45"
        max="99"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #DA6016 0%, #DA6016 ${((value - 45) / (99 - 45)) * 100}%, #e5e7eb ${((value - 45) / (99 - 45)) * 100}%, #e5e7eb 100%)`
        }}
      />
      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span>45%</span>
        <span>99%</span>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Fencing Bout Probability Dashboard</h1>

      {/* Graph 1 */}
      <div className="mb-12 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-center">
          Bout to {N} Touch Likelihood to Bout Winrate
        </h2>
        <SliderControl 
          value={winPercent1} 
          onChange={setWinPercent1}
          label="Win Percentage per Touch"
        />
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={graph1Data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis 
              dataKey="p" 
              type="number" 
              domain={[0.45, 0.99]}
              tickFormatter={(val) => val.toFixed(2)}
              stroke="#000"
            >
              <Label value="Probability of Winning Touch" offset={-10} position="insideBottom" style={{ fill: '#000' }} />
            </XAxis>
            <YAxis stroke="#000">
              <Label value="Probability of Winning Bout" angle={-90} position="insideLeft" style={{ fill: '#000', textAnchor: 'middle' }} />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="prob" 
              stroke="#DA6016" 
              strokeWidth={3}
              dot={false}
              name="P(Win Bout)"
            />
            {/* Highlight current slider position */}
            <Line 
              data={[
                { p: winPercent1 / 100, prob: 0 },
                { p: winPercent1 / 100, prob: raceToNHeads(N, winPercent1 / 100) }
              ]}
              type="monotone"
              dataKey="prob"
              stroke="#000"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#DA6016', r: 5 }}
              name="Current"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="text-center mt-2 font-semibold" style={{ color: '#7A2E00' }}>
          At {winPercent1}%: P(Win Bout) = {raceToNHeads(N, winPercent1 / 100).toFixed(3)}
        </div>
      </div>

      {/* Graph 2 */}
      <div className="mb-12 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-center">
          Bout to {N}: Touch Likelihood to Winning {numBouts} in a Row
        </h2>
        <SliderControl 
          value={winPercent2} 
          onChange={setWinPercent2}
          label="Win Percentage per Touch"
        />
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={graph2Data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis 
              dataKey="p" 
              type="number" 
              domain={[0.45, 0.99]}
              tickFormatter={(val) => val.toFixed(2)}
              stroke="#000"
            >
              <Label value="Probability of Winning Touch" offset={-10} position="insideBottom" style={{ fill: '#000' }} />
            </XAxis>
            <YAxis stroke="#000">
              <Label value={`Probability of Winning ${numBouts} Consecutive Bouts`} angle={-90} position="insideLeft" style={{ fill: '#000', textAnchor: 'middle' }} />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="prob" 
              stroke="#DA6016" 
              strokeWidth={3}
              dot={false}
              name="P(Win 8)"
            />
            {/* Highlight current slider position */}
            <Line 
              data={[
                { p: winPercent2 / 100, prob: 0 },
                { p: winPercent2 / 100, prob: Math.pow(raceToNHeads(N, winPercent2 / 100), numBouts) }
              ]}
              type="monotone"
              dataKey="prob"
              stroke="#000"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#DA6016', r: 5 }}
              name="Current"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="text-center mt-4">
          {graph2Labels.map((label) => (
            <span key={label.p} className="inline-block mx-2 text-sm" style={{ color: '#7A2E00' }}>
              {label.p.toFixed(2)}: {label.prob.toFixed(3)}
            </span>
          ))}
        </div>
        <div className="text-center mt-2 font-semibold" style={{ color: '#7A2E00' }}>
          At {winPercent2}%: P(Win {numBouts} Bouts) = {Math.pow(raceToNHeads(N, winPercent2 / 100), numBouts).toFixed(3)}
        </div>
      </div>

      {/* Graph 3 */}
      <div className="mb-12 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-center">
          Probability of Advancing with {winPercent3}% Single Light Chance per ERF
        </h2>
        <SliderControl 
          value={winPercent3} 
          onChange={setWinPercent3}
          label="Win Percentage per Touch"
        />
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis 
              dataKey="bout" 
              type="number" 
              domain={[1, 8]}
              stroke="#000"
            >
              <Label value="Number of Consecutive Bouts Won" offset={-10} position="insideBottom" style={{ fill: '#000' }} />
            </XAxis>
            <YAxis domain={[0, 1]} stroke="#000">
              <Label value="Probability of Making It to Next Round" angle={-90} position="insideLeft" style={{ fill: '#000', textAnchor: 'middle' }} />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Scatter 
              data={graph3Data} 
              fill="#DA6016" 
              line={{ stroke: '#DA6016', strokeWidth: 3 }}
              lineType="joint"
              name="P(Advance)"
            />
          </ScatterChart>
        </ResponsiveContainer>
        <div className="text-center mt-4">
          {graph3Data.map((point) => (
            <span key={point.bout} className="inline-block mx-3 text-sm" style={{ color: '#7A2E00' }}>
              {point.bout}: {point.prob.toFixed(3)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FencingDashboard;