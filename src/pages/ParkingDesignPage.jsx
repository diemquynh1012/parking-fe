import React, { useState } from 'react';
// // import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BLOCKED = -1;
const EMPTY = 0;

function LegendBar() {
    return (
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
            <div className="flex items-center space-x-2">
                <span className="inline-block w-5 h-5 rounded" style={{ background: "#b03a3a", border: "1px solid #ccc" }} />
                <span className="text-sm">Blocked</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="inline-block w-5 h-5 rounded" style={{ background: "#eeeeee", border: "1px solid #ccc" }} />
                <span className="text-sm">Empty</span>
            </div>
        </div>
    );
}

export default function ParkingDesignPage() {
    const [step, setStep] = useState(1);
    const [size, setSize] = useState({ rows: 10, cols: 10 });
    const [blocked, setBlocked] = useState([]);
    const [criteria, setCriteria] = useState({
        laneType: 'one-way',
        floors: 1,
        cellSize: 32,
    });
    const [resultGrid, setResultGrid] = useState([]);

    const handleSizeChange = e => {
        const { name, value } = e.target;
        setSize(s => ({ ...s, [name]: Number(value) }));
        setBlocked([]);
    };

    const grid = Array.from({ length: size.rows }, (_, r) =>
        Array.from({ length: size.cols }, (_, c) =>
            blocked.some(b => b.r === r && b.c === c) ? BLOCKED : EMPTY
        )
    );
    const toggleBlocked = (r, c) => {
        setBlocked(b =>
            b.some(cell => cell.r === r && cell.c === c)
                ? b.filter(cell => !(cell.r === r && cell.c === c))
                : [...b, { r, c }]
        );
    };

    const handleCriteriaChange = e => {
        const { name, value } = e.target;
        setCriteria(c => ({ ...c, [name]: value }));
    };

    // Merge step 2 and 3: Generate on the fly, no step state after 1
    React.useEffect(() => {
        setResultGrid(grid);
    }, [size, blocked, criteria]);

    // Color map for layout values
    const layoutColorMap = {
        0: "#b03a3a", // Empty (blocked)
        1: "#9e9e9e", // Driveway
        2: "#2e7d32", // Horizontal stall
        7: "#6a1b9a", // Exit gate
        8: "#6a1b9a", // Entrance gate
        9: "#b03a3a", // Blocked
    };

    // Legend for layout preview
    function LayoutLegendBar() {
        return (
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-5 h-5 rounded" style={{ background: "#b03a3a", border: "1px solid #ccc" }} />
                    <span className="text-sm">Blocked/Empty</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-5 h-5 rounded" style={{ background: "#9e9e9e", border: "1px solid #ccc" }} />
                    <span className="text-sm">Driveway</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-5 h-5 rounded" style={{ background: "#2e7d32", border: "1px solid #ccc" }} />
                    <span className="text-sm">Stall</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-5 h-5 rounded" style={{ background: "#6a1b9a", border: "1px solid #ccc" }} />
                    <span className="text-sm">Entrance/Exit</span>
                </div>
            </div>
        );
    }

    // Entrance/exit state (for demo, default to center left/right)
    const [entrance, setEntrance] = useState([Math.floor(size.rows / 2), 0]);
    const [exitGate, setExitGate] = useState([Math.floor(size.rows / 2), size.cols - 1]);
    const [loading, setLoading] = useState(false);

    // Handle generate layout
    const handleGenerateLayout = async () => {
        setLoading(true);
        try {
            // console.log(body)
            const body = {
                rows: size.rows,
                cols: size.cols,
                blocked: blocked.map(cell => [cell.r, cell.c]),
                entrance,
                exit_gate: exitGate,
                one_way: criteria.laneType === "one-way"
            };
            console.log("Request body:", body);
            const res = await fetch("http://160.191.49.99:8000/optimize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.layout) {
                setResultGrid(data.layout);
            } else {
                alert("Failed to generate layout.");
            }
        } catch (e) {
            console.error("Error generating layout:", e);
            alert("Error generating layout.", e);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* <Header /> */}
            <Navbar />
            <div className="flex flex-1 w-full">
                <div className="w-[320px] bg-white shadow p-4 flex flex-col gap-4">
                    <h2 className="font-bold text-lg mb-2">Parking Design Wizard</h2>
                    {step === 1 ? (
                        <>
                            <label>
                                Rows:
                                <input type="number" name="rows" min={1} max={30} value={size.rows} onChange={handleSizeChange} className="border ml-2 w-16" />
                            </label>
                            <label>
                                Columns:
                                <input type="number" name="cols" min={1} max={30} value={size.cols} onChange={handleSizeChange} className="border ml-2 w-16" />
                            </label>
                            <div className="mb-2 mt-4">Click cells to mark as blocked (red):</div>
                            <div
                                className="grid"
                                style={{
                                    gridTemplateColumns: `repeat(${size.cols}, 24px)`,
                                    gridAutoRows: "24px",
                                    gap: "2px",
                                }}
                            >
                                {grid.map((row, r) =>
                                    row.map((cell, c) => (
                                        <div
                                            key={`${r}-${c}`}
                                            className="rounded border cursor-pointer"
                                            style={{
                                                background: cell === BLOCKED ? "#b03a3a" : "#eeeeee",
                                                width: 24,
                                                height: 24,
                                            }}
                                            onClick={() => toggleBlocked(r, c)}
                                            title={cell === BLOCKED ? "Blocked" : "Empty"}
                                        />
                                    ))
                                )}
                            </div>
                            <LegendBar />
                            <button className="bg-blue-600 text-white px-4 py-2 rounded mt-4" onClick={() => setStep(2)}>
                                Next: Advanced Criteria
                            </button>
                        </>
                    ) : (
                        <>
                            <label>
                                Lane Type:
                                <select name="laneType" value={criteria.laneType} onChange={handleCriteriaChange} className="border ml-2">
                                    <option value="one-way">One Way</option>
                                    <option value="two-way">Two Way</option>
                                </select>
                            </label>
                            <label>
                                Number of Floors:
                                <input type="number" name="floors" min={1} max={10} value={criteria.floors} onChange={handleCriteriaChange} className="border ml-2 w-16" />
                            </label>
                            <label>
                                Cell Size (px):
                                <input type="number" name="cellSize" min={16} max={64} value={criteria.cellSize} onChange={handleCriteriaChange} className="border ml-2 w-16" />
                            </label>
                            <div className="mt-4">
                                <label>
                                    Entrance (row,col):&nbsp;
                                    <input
                                        type="number"
                                        min={0}
                                        max={size.rows - 1}
                                        value={entrance[0]}
                                        onChange={e => setEntrance([Number(e.target.value), entrance[1]])}
                                        className="border w-12"
                                    />
                                    ,
                                    <input
                                        type="number"
                                        min={0}
                                        max={size.cols - 1}
                                        value={entrance[1]}
                                        onChange={e => setEntrance([entrance[0], Number(e.target.value)])}
                                        className="border w-12 ml-1"
                                    />
                                </label>
                                <br />
                                <label>
                                    Exit (row,col):&nbsp;
                                    <input
                                        type="number"
                                        min={0}
                                        max={size.rows - 1}
                                        value={exitGate[0]}
                                        onChange={e => setExitGate([Number(e.target.value), exitGate[1]])}
                                        className="border w-12"
                                    />
                                    ,
                                    <input
                                        type="number"
                                        min={0}
                                        max={size.cols - 1}
                                        value={exitGate[1]}
                                        onChange={e => setExitGate([exitGate[0], Number(e.target.value)])}
                                        className="border w-12 ml-1"
                                    />
                                </label>
                            </div>
                            <button
                                className="bg-green-600 text-white px-4 py-2 rounded mt-6"
                                onClick={handleGenerateLayout}
                                disabled={loading}
                            >
                                {loading ? "Generating..." : "Generate Layout"}
                            </button>
                            <button className="text-gray-500 mt-2" onClick={() => setStep(1)}>
                                Back
                            </button>
                        </>
                    )}
                </div>
                {/* Right panel: Preview and Generate */}
                <div className="flex-1 flex flex-col items-center py-8">
                    {step === 1 ? (
                        <>
                            <div className="font-bold mb-2">Blocked Cells Preview</div>
                            <div
                                className="grid"
                                style={{
                                    gridTemplateColumns: `repeat(${size.cols}, 24px)`,
                                    gridAutoRows: "24px",
                                    gap: "2px",
                                }}
                            >
                                {grid.map((row, r) =>
                                    row.map((cell, c) => (
                                        <div
                                            key={`${r}-${c}`}
                                            className="rounded border"
                                            style={{
                                                background: cell === BLOCKED ? "#b03a3a" : "#eeeeee",
                                                width: 24,
                                                height: 24,
                                            }}
                                        />
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="font-bold mb-2">Generated Parking Layout Preview</div>
                            <div
                                className="grid"
                                style={{
                                    gridTemplateColumns: `repeat(${size.cols}, ${criteria.cellSize}px)`,
                                    gridAutoRows: `${criteria.cellSize}px`,
                                    gap: "2px",
                                }}
                            >
                                {resultGrid.length > 0 ? (
                                    resultGrid.map((row, r) =>
                                        row.map((cell, c) => (
                                            <div
                                                key={`${r}-${c}`}
                                                className="rounded border flex items-center justify-center text-xs font-bold"
                                                style={{
                                                    background: layoutColorMap[cell] || "#eeeeee",
                                                    width: criteria.cellSize,
                                                    height: criteria.cellSize,
                                                    color: cell === 7 || cell === 8 ? "#fff" : undefined
                                                }}
                                            >
                                                {/* Optionally show label */}
                                                {/* {cell} */}
                                            </div>
                                        ))
                                    )
                                ) : (
                                    <div className="text-gray-400 mt-8">No layout generated yet.</div>
                                )}
                            </div>
                            <LayoutLegendBar />
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}


