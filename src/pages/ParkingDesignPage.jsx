import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import 'tailwindcss/tailwind.css';

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

    // Color map for layout values
    const layoutColorMap = {
        0: "#eeeeee", // Empty (blocked)
        1: "#9e9e9e", // Driveway
        2: "#2e7d32", // Horizontal stall
        7: "#b39ddb", // Exit gate (light purple)
        8: "#4527a0", // Entrance gate (dark purple)
        9: "#b03a3a", // Blocked
    };

    // Legend for layout preview
    function LayoutLegendBar() {
        return (
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[0], border: "1px solid #ccc" }} />
                    <span className="text-sm">Empty</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[9], border: "1px solid #ccc" }} />
                    <span className="text-sm">Blocked</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[1], border: "1px solid #ccc" }} />
                    <span className="text-sm">Driveway</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[2], border: "1px solid #ccc" }} />
                    <span className="text-sm">Stall</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[8], border: "1px solid #ccc" }} />
                    <span className="text-sm">Entrance</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[7], border: "1px solid #ccc" }} />
                    <span className="text-sm">Exit</span>
                </div>
            </div>
        );
    }

    // Entrance/exit state
    // Default positions: entrance middle of first row, exit middle of last row
    function getDefaultEntrances(laneType, rows, cols) {
        if (laneType === "one-way") {
            const mid = Math.floor(cols / 2);
            return {
                entrance: [0, mid],
                exitGate: [0, mid],
            };
        } else {
            const mid = Math.floor(cols / 2);
            return {
                entrance: [0, mid],
                exitGate: [rows - 1, mid],
            };
        }
    }

    const [entrance, setEntrance] = useState(getDefaultEntrances(criteria.laneType, size.rows, size.cols).entrance);
    const [exitGate, setExitGate] = useState(getDefaultEntrances(criteria.laneType, size.rows, size.cols).exitGate);
    const [selectMode, setSelectMode] = useState(null);
    const [loading, setLoading] = useState(false);

    // Reset entrance/exit when laneType or size changes
    useEffect(() => {
        const { entrance, exitGate } = getDefaultEntrances(criteria.laneType, size.rows, size.cols);
        setEntrance(entrance);
        setExitGate(exitGate);
        setSelectMode(null);
    }, [criteria.laneType, size.rows, size.cols]);

    // Sync exit with entrance in one-way mode
    useEffect(() => {
        if (criteria.laneType === "one-way") {
            setExitGate(entrance);
        }
    }, [entrance, criteria.laneType]);

    // Merge step 2 and 3: Generate on the fly, no step state after 1
    useEffect(() => {
        setResultGrid(grid);
    }, [size, blocked, criteria]);

    // Handle generate layout
    const handleGenerateLayout = async () => {
        setLoading(true);
        try {
            const body = {
                rows: size.rows,
                cols: size.cols,
                blocked: blocked.map(cell => [cell.r, cell.c]),
                entrance,
                exit_gate: exitGate,
                one_way: criteria.laneType === "one-way"
            };
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

    // UI for entrance/exit selection buttons
    function EntranceExitButtons() {
        if (criteria.laneType === "one-way") {
            return (
                <button
                    className={`px-3 py-1 rounded border ${selectMode === "entrance" ? "bg-purple-800 text-white border-purple-800" : "bg-gray-100 border-gray-300"}`}
                    onClick={() => setSelectMode(selectMode === "entrance" ? null : "entrance")}
                    type="button"
                >
                    Set Entrance/Exit
                </button>
            );
        }
        return (
            <div className="flex gap-2">
                <button
                    className={`px-3 py-1 rounded border ${selectMode === "entrance" ? "bg-purple-800 text-white border-purple-800" : "bg-gray-100 border-gray-300"}`}
                    onClick={() => setSelectMode(selectMode === "entrance" ? null : "entrance")}
                    type="button"
                >
                    Set Entrance
                </button>
                <button
                    className={`px-3 py-1 rounded border ${selectMode === "exit" ? "bg-purple-400 text-white border-purple-400" : "bg-gray-100 border-gray-300"}`}
                    onClick={() => setSelectMode(selectMode === "exit" ? null : "exit")}
                    type="button"
                >
                    Set Exit
                </button>
            </div>
        );
    }

    // Cell rendering logic for step 2 grid
    function getCellType(r, c) {
        if (entrance[0] === r && entrance[1] === c) {
            return 8; // Entrance (priority)
        }
        if (criteria.laneType === "two-way" && exitGate[0] === r && exitGate[1] === c) {
            return 7; // Exit
        }
        if (grid[r][c] === BLOCKED) {
            return 9; // Blocked
        }
        return 0; // Empty
    }

    // Title for cell
    function getCellTitle(r, c) {
        if (entrance[0] === r && entrance[1] === c) return "Entrance";
        if (criteria.laneType === "two-way" && exitGate[0] === r && exitGate[1] === c) return "Exit";
        if (grid[r][c] === BLOCKED) return "Blocked";
        return "Empty";
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
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
                                <EntranceExitButtons />
                            </div>
                            {selectMode && (
                                <div className="text-sm text-purple-700 mt-2">
                                    Click vào ô để chọn {criteria.laneType === "one-way" ? "Entrance/Exit" : selectMode === "entrance" ? "Entrance" : "Exit"}
                                </div>
                            )}
                            <div className="mt-4 font-mono text-sm">
                                Entrance: [{entrance[0]}, {entrance[1]}] <br />
                                Exit: [{exitGate[0]}, {exitGate[1]}]
                            </div>
                            <div
                                className="grid mt-4"
                                style={{
                                    gridTemplateColumns: `repeat(${size.cols}, 24px)`,
                                    gridAutoRows: "24px",
                                    gap: "2px",
                                }}
                            >
                                {grid.map((row, r) =>
                                    row.map((cell, c) => {
                                        const cellType = getCellType(r, c);
                                        return (
                                            <div
                                                key={`${r}-${c}`}
                                                className={`rounded border cursor-pointer flex items-center justify-center`}
                                                style={{
                                                    background: layoutColorMap[cellType],
                                                    width: 24,
                                                    height: 24,
                                                    color: cellType === 8 || cellType === 7 ? layoutColorMap[9] : undefined,
                                                    borderWidth: (entrance[0] === r && entrance[1] === c) || (criteria.laneType === "two-way" && exitGate[0] === r && exitGate[1] === c) ? 2 : 1,
                                                    borderColor: (entrance[0] === r && entrance[1] === c)
                                                        ? "#4527a0"
                                                        : (criteria.laneType === "two-way" && exitGate[0] === r && exitGate[1] === c)
                                                        ? "#b39ddb"
                                                        : "#ccc"
                                                }}
                                                onClick={() => {
                                                    if (selectMode === "entrance") {
                                                        setEntrance([r, c]);
                                                        if (criteria.laneType === "one-way") {
                                                            setExitGate([r, c]);
                                                        }
                                                        setSelectMode(null);
                                                    } else if (selectMode === "exit" && criteria.laneType === "two-way") {
                                                        setExitGate([r, c]);
                                                        setSelectMode(null);
                                                    }
                                                }}
                                                title={getCellTitle(r, c)}
                                            />
                                        );
                                    })
                                )}
                            </div>
                            <LayoutLegendBar />
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
                                                    background: layoutColorMap[cell] || "#b03a3a",
                                                    width: criteria.cellSize,
                                                    height: criteria.cellSize,
                                                    color: cell === 8 || cell === 7 ? layoutColorMap[9] : undefined
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
